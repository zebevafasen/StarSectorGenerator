import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const NAV_BUTTON_CLASS = "absolute p-2 bg-slate-900/80 border border-slate-700 rounded-full text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-slate-800 transition-all shadow-xl z-10 group";

export default function SectorNavigator({ onNavigate, sectorCoords }) {
  const handleNav = (dq, dr) => {
    onNavigate({
      q: (sectorCoords?.q || 0) + dq,
      r: (sectorCoords?.r || 0) + dr
    });
  };

  return (
    <>
      {/* North */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <button 
          onClick={() => handleNav(0, -1)}
          className={NAV_BUTTON_CLASS}
          title="Move North"
        >
          <ChevronUp size={24} />
        </button>
      </div>

      {/* South */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <button 
          onClick={() => handleNav(0, 1)}
          className={NAV_BUTTON_CLASS}
          title="Move South"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* West */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button 
          onClick={() => handleNav(-1, 0)}
          className={NAV_BUTTON_CLASS}
          title="Move West"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* East */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button 
          onClick={() => handleNav(1, 0)}
          className={NAV_BUTTON_CLASS}
          title="Move East"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </>
  );
}
