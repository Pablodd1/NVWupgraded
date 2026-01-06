import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToothSelectionMapProps {
  selectedTeeth: number[];
  onToggleTooth: (id: number) => void;
}

export const ToothSelectionMap: React.FC<ToothSelectionMapProps> = ({ selectedTeeth, onToggleTooth }) => {
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i); 

  const SMILE_ZONE_UPPER = [6, 7, 8, 9, 10, 11];
  const SMILE_ZONE_LOWER = [22, 23, 24, 25, 26, 27];
  const SMILE_ZONE = [...SMILE_ZONE_UPPER, ...SMILE_ZONE_LOWER];

  const handleSelectSmileZone = () => {
    const allSelected = SMILE_ZONE.every(id => selectedTeeth.includes(id));
    if (allSelected) {
      SMILE_ZONE.forEach(id => {
        if (selectedTeeth.includes(id)) onToggleTooth(id);
      });
    } else {
      SMILE_ZONE.forEach(id => {
        if (!selectedTeeth.includes(id)) onToggleTooth(id);
      });
    }
  };

  const renderTooth = (id: number) => {
    const isSelected = selectedTeeth.includes(id);
    const isSmileZone = SMILE_ZONE.includes(id);
    
    let widthClass = "w-6 sm:w-7";
    const isMolar = [1,2,3,14,15,16,17,18,19,30,31,32].includes(id);
    const isPremolar = [4,5,12,13,20,21,28,29].includes(id);

    if (isMolar) widthClass = "w-7 sm:w-9";
    if (isPremolar) widthClass = "w-6 sm:w-8";

    return (
      <button
        key={id}
        onClick={() => onToggleTooth(id)}
        className={`
          flex flex-col items-center justify-center transition-all duration-300
          ${widthClass} h-10 sm:h-12 rounded-lg border-2 relative flex-shrink-0
          ${isSelected 
            ? 'bg-slate-800 border-slate-900 shadow-lg text-white z-10 scale-105 enamel-glaze micro-texture' 
            : isSmileZone
              ? 'bg-amber-50/30 border-amber-200/40 text-slate-400 hover:border-amber-300 hover:bg-amber-50/50'
              : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300 hover:bg-slate-50'
          }
        `}
        title={`Tooth #${id}`}
      >
        <span className={`text-[10px] sm:text-[11px] font-bold font-mono z-10 pointer-events-none ${isSelected ? 'text-white' : isSmileZone ? 'text-amber-700/60' : 'text-slate-400'}`}>{id}</span>
        {isSmileZone && !isSelected && (
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-60"></div>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white p-4 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm select-none w-full">
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Clinical Arch Map
          </h3>
          <p className="text-[9px] text-slate-400/70 font-bold uppercase tracking-widest mt-1">Universal Designation</p>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={handleSelectSmileZone}
            className="text-[10px] text-amber-700 hover:text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1.5 px-3 py-2 bg-amber-50 rounded-full border border-amber-100 transition-all active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3" /> Smile Zone
          </button>
          <button 
            onClick={() => selectedTeeth.length > 0 && selectedTeeth.forEach(t => onToggleTooth(t))} 
            className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider transition-colors"
            disabled={selectedTeeth.length === 0}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 items-center overflow-x-auto custom-scrollbar pb-4">
        {/* Upper Arch */}
        <div className="flex flex-col items-center gap-3 min-w-max">
          <span className="text-[9px] text-slate-300 uppercase tracking-[0.4em] font-black">Maxilla</span>
          <div className="flex justify-center gap-1 sm:gap-1.5">
             <div className="flex gap-1 sm:gap-1.5 items-end">
               {upperTeeth.slice(0, 8).map(renderTooth)}
             </div>
             <div className="w-4 sm:w-6 flex items-center justify-center opacity-5">
               <div className="h-full w-[2px] bg-slate-900 rounded-full"></div>
             </div>
             <div className="flex gap-1 sm:gap-1.5 items-end">
               {upperTeeth.slice(8, 16).map(renderTooth)}
             </div>
          </div>
        </div>

        {/* Lower Arch */}
        <div className="flex flex-col items-center gap-3 min-w-max">
          <div className="flex justify-center gap-1 sm:gap-1.5">
             <div className="flex gap-1 sm:gap-1.5 items-start">
               {lowerTeeth.slice(0, 8).map(renderTooth)} 
             </div>
             <div className="w-4 sm:w-6 flex items-center justify-center opacity-5">
               <div className="h-full w-[2px] bg-slate-900 rounded-full"></div>
             </div>
             <div className="flex gap-1 sm:gap-1.5 items-start">
               {lowerTeeth.slice(8, 16).map(renderTooth)}
             </div>
          </div>
          <span className="text-[9px] text-slate-300 uppercase tracking-[0.4em] font-black">Mandible</span>
        </div>
      </div>
      
      <div className="mt-8 p-3 bg-slate-50/50 rounded-xl text-center border border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
          {selectedTeeth.length === 0 
            ? "Full Scan Target" 
            : `Active Targets: ${selectedTeeth.sort((a,b) => a-b).join(', ')}`
          }
        </p>
      </div>
    </div>
  );
};