import { useEffect, useState } from "react";
import "regenerator-runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FaMicrophone } from "react-icons/fa";
import { useFilterStore } from "@/hooks/useFilterStore";
import { FaSpinner } from "react-icons/fa"; // Add spinner icon

export const VoiceFilter = () => {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state to track loading
  const { filters, setFilters } = useFilterStore();

  const startListening = async () => {
    try {
      resetTranscript();
      setError(null); // Reset any previous errors
      SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone: ", err);
      setError("Microphone access denied or failed");
    }
  };

  const stopListening = async () => {
    SpeechRecognition.stopListening();
    setIsRecording(false);
    setIsLoading(true); // Start loading when the user stops listening

    try {
      const res = await fetch("/api/process", {
        body: JSON.stringify({ text: transcript }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        setFilters(data); // Update filters with API response
      } else {
        throw new Error("Failed to process the voice input");
      }
    } catch (err) {
      console.error("Error processing voice input: ", err);
      setError("Failed to process the voice input. Please try again.");
    } finally {
      setIsLoading(false); // End loading state when response is received
    }
  };

  useEffect(() => {
    console.log({ transcript });
  }, [transcript]);

  return (
    <>
      {/* Full-screen Overlay */}
      {(isRecording || isLoading) && ( // Keep the overlay visible while recording or loading
        <div className="fixed inset-0 bg-black bg-opacity-70 z-29 flex items-center justify-center">
          <div className="p-6 rounded-xl shadow-lg w-11/12 sm:w-3/4 md:w-1/2 text-center">
            {isLoading ? ( // Show spinner while waiting for API response
              <>
                <h3 className="text-xl text-white font-bold mb-4">Searching...</h3>
                <FaSpinner className="animate-spin text-white" size={30} />
              </>
            ) : (
              <>
                <h3 className="text-xl text-white font-bold mb-4">Listening...</h3>
                <p className="text-lg text-white">{transcript || "Speak now, your words will appear here..."}</p>
              </>
            )}
            {error && <p className="text-red-600">{error}</p>}
          </div>
        </div>
      )}

      {/* Button to Start/Stop Recording (inline inside bottom navbar) */}
      <div className="group flex items-center justify-center">
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          className={`flex items-center justify-center w-[50px] h-[50px] bg-${
            listening ? "red-600" : "wine-primary"
          } text-white rounded-full shadow-lg transition-all duration-200 ease-in-out transform active:scale-95`}
          aria-label={listening ? "Stop voice search" : "Start voice search"}
        >
          <FaMicrophone size={20} />
        </button>
      </div>
    </>
  );
};
