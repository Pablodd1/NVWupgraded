"use client";
import { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { toast } from "react-toastify";

interface VoiceSearchButtonProps {
  onTranscriptReceived: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceSearchButton({ 
  onTranscriptReceived, 
  disabled = false,
  className = ""
}: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("🎤 Listening... Speak your wine preferences!", {
          autoClose: 3000
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice transcript:", transcript);
        onTranscriptReceived(transcript);
        
        toast.success(`Got it: "${transcript}"`, {
          autoClose: 2000
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        const errorMessages: { [key: string]: string } = {
          'no-speech': 'No speech detected. Please try again.',
          'audio-capture': 'Microphone not found. Please check your device.',
          'not-allowed': 'Microphone access denied. Please enable it in your browser settings.',
          'network': 'Network error. Please check your connection.',
          'aborted': 'Speech recognition cancelled.',
        };
        
        const message = errorMessages[event.error] || `Error: ${event.error}`;
        toast.error(message);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn("Speech recognition not supported in this browser");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscriptReceived]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        toast.error("Failed to start voice input. Please try again.");
      }
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className={`btn btn-ghost btn-sm tooltip tooltip-bottom ${className}`}
        data-tip="Voice search not supported in this browser. Try Chrome or Edge."
      >
        <FaMicrophoneSlash className="text-gray-400" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleListening}
      disabled={disabled || isListening}
      className={`btn btn-sm ${
        isListening 
          ? 'btn-error animate-pulse' 
          : 'btn-ghost hover:btn-primary'
      } tooltip tooltip-bottom ${className}`}
      data-tip={
        isListening 
          ? "Listening... Click to stop" 
          : "Click to speak your wine preferences"
      }
    >
      {isListening ? (
        <>
          <FaMicrophone className="text-white animate-pulse" />
          <span className="ml-2 hidden sm:inline">Listening...</span>
        </>
      ) : (
        <>
          <FaMicrophone />
          <span className="ml-2 hidden sm:inline">Voice Search</span>
        </>
      )}
    </button>
  );
}
