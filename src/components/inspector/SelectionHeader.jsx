import React from 'react';
import { X, Crown } from 'lucide-react';

export default function SelectionHeader({ selectedCoords, selectedSystem, onClear }) {
  if (!selectedCoords) return null;

  const isCore = selectedSystem?.isCore;

  return (
    <div className="p-3 border-b border-slate-800 bg-slate-900">
      <div className="flex items-start justify-between gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white leading-tight truncate">
              {selectedSystem ? (selectedSystem.name || (selectedSystem.isPOI ? 'Point of Interest' : 'Deep Space')) : 'Deep Space'}
            </h2>
            {isCore && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[9px] font-black text-amber-400 uppercase tracking-tighter shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                <Crown size={10} fill="currentColor" /> Core System
              </span>
            )}
          </div>
          <p className="text-blue-400 text-xs font-mono truncate">
            {selectedSystem?.globalLocation && <span>S:[{selectedSystem.globalLocation.sectorQ}-{selectedSystem.globalLocation.sectorR}] &middot; </span>}
            C:[{String(selectedCoords.q).padStart(2, '0')}-{String(selectedCoords.r).padStart(2, '0')}]
          </p>
        </div>
        <button
          onClick={onClear}
          className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
