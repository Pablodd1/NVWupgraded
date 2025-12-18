import { useState } from "react";
import { FaMicrophone } from "react-icons/fa";

/**
 * Voice Filter Component - Placeholder
 * Voice search feature is planned for Phase 6 implementation
 * Currently displays as a disabled button with coming soon tooltip
 */
export const VoiceFilter = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="group flex items-center justify-center relative">
      {/* Coming Soon Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-16 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50">
          Voice Search - Coming Soon!
          <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* Voice Search Button (Disabled) */}
      <button
        onClick={() => {
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 2000);
        }}
        className="flex items-center justify-center w-[50px] h-[50px] bg-gray-400 text-white rounded-full shadow-lg transition-all duration-200 ease-in-out opacity-60 cursor-not-allowed"
        aria-label="Voice search - Coming soon"
        disabled
      >
        <FaMicrophone size={20} />
      </button>
    </div>
  );
};
