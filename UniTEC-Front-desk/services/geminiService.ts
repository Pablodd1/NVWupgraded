
// geminiService.ts handles interactions with the Google GenAI SDK
import { GoogleGenAI, LiveServerMessage, Modality, GenerateContentResponse } from "@google/genai";
import { getSystemInstruction, TOOLS } from "../constants";
import { decodeAudioData, decode, encode, pcmToWavBlob } from "../utils/audioUtils";
import { Language, VoiceName } from "../types";
import { trackUsage } from "./usageService";
import firebaseConfig from "../firebase-applet-config.json";

// Helper for stateless reset
export const resetChatSession = () => {
  // Stateless implementation doesn't require reset, but keeping for compatibility
};

// Retry helper with exponential backoff for network resilience
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`Gemini API call failed. Retrying in ${delay}ms...`, error);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Text-to-speech using Gemini 2.5 Flash TTS model.
 * Explicitly exported to fix the AdminDashboard error.
 */
export async function playGeminiTTS(text: string, voiceName: string = 'Kore') {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || firebaseConfig.apiKey;
  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  const response = await retryWithBackoff(() => ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName as any },
        },
      },
    },
  }));

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    return new Promise<void>((resolve) => {
      source.onended = () => {
        audioContext.close();
        resolve();
      };
    });
  }
}

/**
 * Sends a message to Gemini using the generateContentStream API.
 */
export async function* sendMessageToGemini(
  message: string,
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = [],
  emergencyMode: boolean = false,
  language: Language = 'en',
  onToolSuccess?: (toolName: string, result: any) => void,
  customGreeting?: string
) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || firebaseConfig.apiKey;
  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  let instructions = getSystemInstruction(language, customGreeting);
  if (emergencyMode) {
    instructions += "\n\n[SYSTEM OVERRIDE: EMERGENCY MODE ACTIVE]. Respond concisely. Prioritize safety protocols immediately.";
  }

  // Load dynamically from Firestore config
  let modelName = 'gemini-2.5-flash';
  let temperature = 0.7;
  try {
    const { getAppConfig } = await import('./firestoreService');
    const config = await getAppConfig();
    if (config) {
      if (config.modelName) modelName = config.modelName;
      if (config.temperature !== undefined) temperature = config.temperature;
    }
  } catch (e) {
    console.error("Failed to load AI parameters, falling back to defaults:", e);
  }

  const responseStream = await retryWithBackoff(() => ai.models.generateContentStream({
    model: modelName,
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: instructions,
      tools: [{ functionDeclarations: TOOLS }],
      temperature: temperature,
    },
  }));

  for await (const chunk of responseStream) {
    const c = chunk as GenerateContentResponse;
    if (c.usageMetadata) {
      const totalTokens = c.usageMetadata.totalTokenCount;
      trackUsage({
        totalTokens: totalTokens,
        chatTokens: totalTokens,
        apiCalls: 1
      });
    }

    const part = c.candidates?.[0]?.content?.parts?.find(p => p.functionCall);
    if (part && part.functionCall && part.functionCall.name) {
      if (onToolSuccess) {
        onToolSuccess(part.functionCall.name, part.functionCall.args);
      }
    }
    yield c;
  }
}

/**
 * Generates embeddings for the given text using Gemini Embedding 2.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || firebaseConfig.apiKey;
    const ai = new GoogleGenAI({ apiKey: apiKey as string });
    const result = await retryWithBackoff(() => ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: [text],
    }));
    
    if (result.embeddings && result.embeddings.length > 0 && result.embeddings[0].values) {
      // Track API call usage
      trackUsage({ apiCalls: 1 });
      return result.embeddings[0].values;
    }
    return null;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

// --- Live API (Voice & Vision) Service ---

export interface LiveSessionCallbacks {
  onOpen: () => void;
  onMessage: (text: string | null, audioBuffer: AudioBuffer | null, isInterrupted: boolean) => void;
  onAudioData: (data: Uint8Array) => void; 
  onError: (error: Error) => void;
  onClose: () => void;
  onToolCall: (toolName: string) => void;
  onToolSuccess?: (toolName: string, result: any) => void;
}

export const connectLiveSession = async (
    callbacks: LiveSessionCallbacks, 
    emergencyMode: boolean = false, 
    language: Language = 'en',
    voiceName: VoiceName = 'Kore',
    customGreeting?: string
) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || firebaseConfig.apiKey;
  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  const startTime = Date.now();

  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  const analyser = outputAudioContext.createAnalyser();
  analyser.fftSize = 64; 
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.connect(outputAudioContext.destination);

  const visualizerInterval = setInterval(() => {
    analyser.getByteFrequencyData(dataArray);
    callbacks.onAudioData(new Uint8Array(dataArray));
  }, 50);

  let nextStartTime = 0;
  const sources = new Set<AudioBufferSourceNode>();
  const audioChunks: Uint8Array[] = [];
  
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      audio: true
    });
  } catch (err) {
    callbacks.onError(new Error("MIC_NOT_FOUND"));
    return null;
  }

  await inputAudioContext.resume();
  await outputAudioContext.resume();

  let instructions = getSystemInstruction(language, customGreeting);
  
  if (emergencyMode) {
    instructions += "\n\n[SYSTEM OVERRIDE: EMERGENCY MODE ACTIVE]. Respond concisely.";
  }

  const connectConfig: any = {
    model: 'gemini-2.0-flash-exp', // the typical Live API model, 2.5 flash native audio doesn't exist yet
    callbacks: {
      onopen: () => {
        callbacks.onOpen();
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            int16[i] = inputData[i] * 32768;
          }
          const pcmData = encode(new Uint8Array(int16.buffer));
          if (sessionController) {
              sessionController.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: pcmData } });
          }
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        const parts = message.serverContent?.modelTurn?.parts;
        const base64Audio = parts?.find(p => p.inlineData)?.inlineData?.data;

        // Handle transcriptions
        const modelTranscript = parts?.find(p => p.text)?.text;
        // User transcript is in serverContent.userContent if enabled
        const userTranscript = (message.serverContent as any)?.userContent?.parts?.find((p: any) => p.text)?.text;
        
        if (modelTranscript || userTranscript) {
          callbacks.onMessage(modelTranscript || userTranscript || null, null, false);
        }

        if (base64Audio) {
            const audioData = decode(base64Audio);
            audioChunks.push(audioData);
            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(audioData, outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(analyser); 
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            sources.add(source);
            source.onended = () => sources.delete(source);
        }

        if (message.serverContent?.interrupted) {
          for (const source of sources.values()) {
            try { source.stop(); } catch(e) {}
            sources.delete(source);
          }
          nextStartTime = 0;
        }

        if (message.toolCall && message.toolCall.functionCalls) {
          for (const fc of message.toolCall.functionCalls) {
            if (fc.name) {
                callbacks.onToolCall(fc.name);
                if (callbacks.onToolSuccess) {
                  callbacks.onToolSuccess(fc.name, { status: 'success', ...fc.args });
                }
                if (sessionController) {
                  sessionController.sendToolResponse({
                    functionResponses: [{
                      id: fc.id || '',
                      name: fc.name || '',
                      response: { result: "ok" }
                    }]
                  });
                }
            }
          }
        }
        callbacks.onMessage(null, null, !!message.serverContent?.interrupted);
      },
      onerror: (e: any) => {
        console.error("Live API Error:", e);
        callbacks.onError(new Error("CONNECTION_ERROR"));
      },
      onclose: () => {
        const durationMin = (Date.now() - startTime) / 60000;
        trackUsage({ minutesUsed: durationMin, apiCalls: 1 });
        callbacks.onClose();
        clearInterval(visualizerInterval);
      }
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName as any } }
      },
      systemInstruction: instructions,
      tools: [{ functionDeclarations: TOOLS }],
      outputAudioTranscription: {},
    }
  };

  let sessionController: any = null;
  const connectPromise = ai.live.connect(connectConfig);
  const sessionPromise = Promise.race([
      connectPromise,
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error("LIVE_API_TIMEOUT - The API key might be suspended or invalid.")), 8000))
  ]);
  
  sessionPromise.then(s => {
      sessionController = s;
  }).catch(e => {
      console.error("Live API Connection Failed:", e);
      callbacks.onError(e);
  });

  return {
    disconnect: async () => {
      clearInterval(visualizerInterval);
      if (sessionController) {
          try { sessionController.close(); } catch(e) {}
      }
      if (stream) stream.getTracks().forEach(t => t.stop());
      inputAudioContext.close();
      outputAudioContext.close();
    },
    getAudioBlob: () => pcmToWavBlob(audioChunks, 24000),
    stream
  };
};
