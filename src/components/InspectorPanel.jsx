import React, { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Map as MapIcon, Star, Info, X, Disc, Activity, Circle, Hexagon, ChevronDown, ChevronRight } from 'lucide-react';
import StarIcon from './StarIcon';
import { getHexId } from '../utils/helpers';
import { getStarByType } from '../utils/starData';

function InspectorPanel({ gridSize, systems, selectedCoords, setSelectedCoords }) {
  const selectedSystem = selectedCoords ? systems[`${selectedCoords.q},${selectedCoords.r}`] : null;
  const [expanded, setExpanded] = useState({ stars: true, planets: true });
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0 });

  const displayStarInfo = getStarByType(selectedSystem?.star?.type);
  const iconSize = displayStarInfo?.data?.size?.iconSize || 48;
  const inspectorStarSize = displayStarInfo?.data?.size?.inspector || 16;

  return (
    <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 shadow-xl z-20">
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <MapIcon size={16} />
            <span>{gridSize.width} x {gridSize.height}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={16} />
            <span>{Object.keys(systems).length} Systems</span>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-slate-800 bg-slate-800/30">
        <h2 className="text-sm font-bold text-blue-400 uppercase flex items-center gap-2">
          <Info size={16} /> Inspector
        </h2>
      </div>

      {selectedCoords && (
        <div className="p-3 border-b border-slate-800 bg-slate-900">
          <div className="flex items-start justify-between gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white leading-tight truncate">
                {selectedSystem ? selectedSystem.name : "Deep Space"}
              </h2>
              <p className="text-blue-400 text-xs font-mono truncate mt-0.5">
                {selectedSystem?.globalLocation && (
                  <span>S:[{selectedSystem.globalLocation.sectorQ},{selectedSystem.globalLocation.sectorR}] - </span>
                )}
                C: [{String(selectedCoords.q).padStart(2, '0')},{String(selectedCoords.r).padStart(2, '0')}]
              </p>
            </div>
            <button
              onClick={() => setSelectedCoords(null)}
              className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {selectedCoords ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {selectedSystem ? (
              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, stars: !prev.stars }))}
                    className={`w-full flex items-center justify-between p-1.5 hover:bg-slate-800 transition-colors border-slate-800 bg-slate-900/50 ${expanded.stars ? 'rounded-t-lg border-x border-t' : 'rounded-lg border'}`}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Star size={12} /> Stars (1)
                    </div>
                    {expanded.stars ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
                  </button>
                  
                  {expanded.stars && (
                    <div className="px-1 pb-1 border-x border-b border-slate-800 rounded-b-lg bg-slate-900/30 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="bg-slate-800/50 p-0.5 rounded border border-slate-700/50 flex items-center gap-3 group hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center justify-center shrink-0" style={{ width: iconSize, height: iconSize, padding: '4px' }}>
                          <svg width={iconSize} height={iconSize} viewBox="0 0 50 50">
                            <StarIcon
                              colors={displayStarInfo?.color}
                              radius={inspectorStarSize}
                              outerRadius={inspectorStarSize * 1.2}
                              x={25}
                              y={25}
                              uid="inspector"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-base font-bold text-blue-300">{selectedSystem.star.name}</div>
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-[10px] text-slate-400 font-bold uppercase cursor-help border-b border-dotted border-slate-600 hover:text-blue-400 hover:border-blue-400 transition-colors"
                              onMouseEnter={() => setTooltip(prev => ({ ...prev, show: true }))}
                              onMouseMove={(e) => setTooltip({ show: true, x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                            >
                              {selectedSystem.star.type === 'Black Hole' ? 'Black Hole' :
                               selectedSystem.star.type === 'Neutron' ? 'Neutron Star' :
                               `Class ${selectedSystem.star.type || 'Unknown'} Star`}
                            </span>
                            {selectedSystem.star.age && (
                              <span className="text-[10px] text-slate-500 font-bold uppercase">
                                Age: {selectedSystem.star.age} {selectedSystem.star.ageUnit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, planets: !prev.planets }))}
                    className={`w-full flex items-center justify-between p-1.5 hover:bg-slate-800 transition-colors border-slate-800 bg-slate-900/50 ${expanded.planets ? 'rounded-t-lg border-x border-t' : 'rounded-lg border'}`}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Disc size={12} /> Planets ({selectedSystem.bodies.length})
                    </div>
                    {expanded.planets ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
                  </button>
                  
                  {expanded.planets && (
                    <div className="px-1 pb-1 border-x border-b border-slate-800 rounded-b-lg bg-slate-900/30 animate-in fade-in slide-in-from-top-1 duration-200">
                      {selectedSystem.bodies.length > 0 ? (
                        <div className="space-y-2">
                          {selectedSystem.bodies.map((body, i) => (
                            <div key={i} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-slate-300">{selectedSystem.name} {body.name}</div>
                                  <div className="text-[10px] text-slate-500 uppercase">{body.type}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 italic text-center py-2">
                          No planetary bodies detected.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Activity size={12} /> Installations
                  </h3>
                  {selectedSystem.station ? (
                    <div className="bg-blue-950/20 border border-blue-900/50 p-2 rounded-lg flex items-center gap-3">
                      <div className="p-1.5 bg-blue-900/50 rounded text-blue-300">
                        <Circle size={14} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-blue-200">{selectedSystem.station}</div>
                        <div className="text-[10px] text-blue-400">Status: Nominal</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600">No signals detected.</div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-4">
                  <Hexagon size={40} className="text-slate-700" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Sector {getHexId(selectedCoords.q, selectedCoords.r)} is empty.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
            <Info size={48} className="mb-4 text-slate-700" />
            <p className="text-sm">Select a hex to inspect</p>
          </div>
        )}
      </div>

      {/* Tooltip Portal */}
      {tooltip.show && displayStarInfo && createPortal(
        <div 
          className="fixed z-50 bg-slate-900/95 backdrop-blur-sm border border-slate-700 p-3 rounded-lg shadow-2xl pointer-events-none w-64 animate-in fade-in duration-150"
          style={{ 
            top: Math.min(tooltip.y + 16, window.innerHeight - 220), 
            left: Math.min(tooltip.x + 16, window.innerWidth - 280) 
          }}
        >
          <div className="font-bold text-blue-300 mb-1 text-sm">
            {displayStarInfo.class.name}
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <div>Temp: {displayStarInfo.class.temp}</div>
            <div>Mass: {displayStarInfo.class.mass}</div>
            <div>Typical Age: {displayStarInfo.class.typicalAge}</div>
            <div className="text-slate-400 pt-2">{displayStarInfo.class.description}</div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}

export default memo(InspectorPanel);
