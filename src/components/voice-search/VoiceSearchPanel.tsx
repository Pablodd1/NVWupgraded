"use client";
import { useState } from "react";
import VoiceSearchButton from "./VoiceSearchButton";
import { processNaturalLanguage, type NLPResult } from "@/lib/ai-nlp";
import { FaLightbulb, FaCheck, FaTimes } from "react-icons/fa";

interface VoiceSearchPanelProps {
  onFiltersApplied: (nlpResult: NLPResult) => void;
  className?: string;
}

export default function VoiceSearchPanel({ 
  onFiltersApplied,
  className = ""
}: VoiceSearchPanelProps) {
  const [transcript, setTranscript] = useState("");
  const [nlpResult, setNlpResult] = useState<NLPResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranscriptReceived = async (newTranscript: string) => {
    setTranscript(newTranscript);
    setIsProcessing(true);

    // Simulate small delay for AI processing effect
    await new Promise(resolve => setTimeout(resolve, 500));

    // Process with NLP
    const result = processNaturalLanguage(newTranscript);
    setNlpResult(result);
    setIsProcessing(false);
  };

  const handleApplyFilters = () => {
    if (nlpResult) {
      onFiltersApplied(nlpResult);
      setTranscript("");
      setNlpResult(null);
    }
  };

  const handleClear = () => {
    setTranscript("");
    setNlpResult(null);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">🎤 AI Voice Search</h3>
          <span className="badge badge-sm badge-primary">Beta</span>
        </div>
        <VoiceSearchButton 
          onTranscriptReceived={handleTranscriptReceived}
        />
      </div>

      {/* Instructions */}
      {!transcript && !nlpResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaLightbulb className="text-blue-600 text-xl mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Try saying things like:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• "Show me red wines in Oakville with tours"</li>
                <li>• "Find affordable sparkling wines"</li>
                <li>• "I want pet friendly wineries with caves"</li>
                <li>• "Luxury Cabernet under $150 in Rutherford"</li>
                <li>• "Morning tastings with food pairings"</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <p className="text-gray-600">Processing your request with AI...</p>
          </div>
        </div>
      )}

      {/* Transcript */}
      {transcript && !isProcessing && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">You said:</p>
            <p className="text-gray-900 italic">"{transcript}"</p>
          </div>

          {/* NLP Results */}
          {nlpResult && (
            <div className="space-y-3">
              {/* Confidence Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">AI Confidence:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      nlpResult.confidence >= 0.7 
                        ? 'bg-green-500' 
                        : nlpResult.confidence >= 0.4 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${nlpResult.confidence * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold ${
                  nlpResult.confidence >= 0.7 
                    ? 'text-green-600' 
                    : nlpResult.confidence >= 0.4 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {(nlpResult.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Interpretation */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  AI Interpretation:
                </p>
                <p className="text-purple-800">{nlpResult.interpretation}</p>
              </div>

              {/* Extracted Filters */}
              <div className="grid grid-cols-1 gap-3">
                {nlpResult.filters.wineTypes && nlpResult.filters.wineTypes.length > 0 && (
                  <div className="flex items-start gap-2">
                    <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Wine Types:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {nlpResult.filters.wineTypes.map(type => (
                          <span key={type} className="badge badge-sm badge-primary">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {nlpResult.filters.ava && nlpResult.filters.ava.length > 0 && (
                  <div className="flex items-start gap-2">
                    <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Regions (AVAs):</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {nlpResult.filters.ava.map(ava => (
                          <span key={ava} className="badge badge-sm badge-secondary">
                            {ava}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {nlpResult.filters.features && nlpResult.filters.features.length > 0 && (
                  <div className="flex items-start gap-2">
                    <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Features:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {nlpResult.filters.features.map(feature => (
                          <span key={feature} className="badge badge-sm badge-accent">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {nlpResult.filters.priceRange && (
                  <div className="flex items-start gap-2">
                    <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Price Range:</p>
                      <span className="badge badge-sm badge-info mt-1">
                        {nlpResult.filters.priceRange.min && `$${nlpResult.filters.priceRange.min}+`}
                        {nlpResult.filters.priceRange.min && nlpResult.filters.priceRange.max && ' - '}
                        {nlpResult.filters.priceRange.max && `$${nlpResult.filters.priceRange.max}`}
                      </span>
                    </div>
                  </div>
                )}

                {nlpResult.filters.timePreference && nlpResult.filters.timePreference.length > 0 && (
                  <div className="flex items-start gap-2">
                    <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Time Preference:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {nlpResult.filters.timePreference.map(time => (
                          <span key={time} className="badge badge-sm badge-warning">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Low Confidence Suggestions */}
              {nlpResult.suggestions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    💡 Try being more specific:
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {nlpResult.suggestions.map((suggestion, idx) => (
                      <li key={idx}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleApplyFilters}
                  className="btn btn-primary flex-1"
                >
                  <FaCheck className="mr-2" />
                  Apply Filters
                </button>
                <button
                  onClick={handleClear}
                  className="btn btn-ghost"
                >
                  <FaTimes className="mr-2" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
