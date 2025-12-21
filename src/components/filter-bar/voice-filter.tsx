import { FaMicrophone } from "react-icons/fa";
import { useUIStore } from "@/store/uiStore";

/**
 * Voice Filter Component - Integrated
 * Toggles the AI Voice Search panel visibility globally.
 */
export const VoiceFilter = () => {
  const { showVoiceSearch, toggleVoiceSearch } = useUIStore();

  return (
    <div className="group flex items-center justify-center relative">
      <button
        onClick={toggleVoiceSearch}
        className={`flex items-center justify-center w-[50px] h-[50px] rounded-full shadow-lg transition-all duration-300 ease-in-out transform active:scale-90 ${showVoiceSearch
            ? "bg-primary text-white ring-4 ring-primary/20 scale-110"
            : "bg-white text-gray-600 hover:bg-gray-50 hover:text-primary"
          }`}
        aria-label="Toggle Voice Search"
      >
        <FaMicrophone size={20} className={showVoiceSearch ? "animate-pulse" : ""} />
      </button>

      {/* Visual indicator for active state */}
      {showVoiceSearch && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      )}
    </div>
  );
};

