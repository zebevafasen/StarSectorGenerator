import React, { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Map as MapIcon, Star, Info, X, Disc, Activity, Circle, Hexagon, ChevronDown, ChevronRight } from 'lucide-react';
import PlanetIcon from './PlanetIcon';
import SystemStarIcon from './SystemStarIcon';
import { getHexId } from '../utils/helpers';
import { getStarVisual } from '../utils/starVisuals';
import { getMainColor } from '../utils/colorSemantics';
import { getPlanetByType } from '../utils/planetUtils';

function SectionToggleButton({ icon, label, isExpanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-1.5 hover:bg-slate-800 transition-colors border-slate-800 bg-slate-900/50 ${isExpanded ? 'rounded-t-lg border-x border-t' : 'rounded-lg border'}`}
    >
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
        {icon} {label}
      </div>
      {isExpanded ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
    </button>
  );
}

function StarSection({ expanded, onToggle, selectedSystem, displayStarInfo, setTooltip }) {
  return (
    <div>
      <SectionToggleButton
        icon={<Star size={12} />}
        label="Stars (1)"
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <div className="px-1 pb-1 border-x border-b border-slate-800 rounded-b-lg bg-slate-900/30 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="bg-slate-800/50 p-0.5 rounded border border-slate-700/50 flex items-center gap-3 group hover:border-blue-500/30 transition-colors">
            <SystemStarIcon
              starType={selectedSystem.star.type}
              mode="inspector"
              uid="inspector"
              className="flex items-center justify-center shrink-0"
            />
            <div>
              <div className="text-base font-bold text-blue-300">{selectedSystem.star.name}</div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] text-slate-400 font-bold uppercase cursor-help border-b border-dotted border-slate-600 hover:text-blue-400 hover:border-blue-400 transition-colors"
                  onMouseEnter={() => setTooltip((prev) => ({ ...prev, show: true, content: displayStarInfo }))}
                  onMouseMove={(e) => setTooltip((prev) => ({ ...prev, show: true, x: e.clientX, y: e.clientY }))}
                  onMouseLeave={() => setTooltip((prev) => ({ ...prev, show: false }))}
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
  );
}

function PlanetsSection({ expanded, onToggle, selectedSystem, setTooltip }) {
  return (
    <div>
      <SectionToggleButton
        icon={<Disc size={12} />}
        label={`Planets (${selectedSystem.bodies.length})`}
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <div className="px-1 pb-1 border-x border-b border-slate-800 rounded-b-lg bg-slate-900/30 animate-in fade-in slide-in-from-top-1 duration-200">
          {selectedSystem.bodies.length > 0 ? (
            <div className="space-y-2">
              {selectedSystem.bodies.map((body, i) => {
                const planetData = getPlanetByType(body.type);
                const typeColor = getMainColor(planetData?.color);

                return (
                  <div key={i} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <PlanetIcon type={body.type} radius={12} className="shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-300">{selectedSystem.baseName} {body.name}</div>
                        <div
                          className="text-[10px] uppercase cursor-help transition-colors font-bold"
                          style={{ color: typeColor || '#64748b' }}
                          onMouseEnter={() => setTooltip((prev) => ({ ...prev, show: true, content: planetData }))}
                          onMouseMove={(e) => setTooltip((prev) => ({ ...prev, show: true, x: e.clientX, y: e.clientY }))}
                          onMouseLeave={() => setTooltip((prev) => ({ ...prev, show: false }))}
                        >{body.type}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic text-center py-2">
              No planetary bodies detected.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InstallationsSection({ selectedSystem }) {
  return (
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
  );
}

function SelectionHeader({ selectedCoords, selectedSystem, onClear }) {
  if (!selectedCoords) return null;

  return (
    <div className="p-3 border-b border-slate-800 bg-slate-900">
      <div className="flex items-start justify-between gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white leading-tight truncate">
            {selectedSystem ? selectedSystem.name : 'Deep Space'}
          </h2>
          <p className="text-blue-400 text-xs font-mono truncate mt-0.5">
            {selectedSystem?.globalLocation && (
              <span>S:[{selectedSystem.globalLocation.sectorQ},{selectedSystem.globalLocation.sectorR}] - </span>
            )}
            C: [{String(selectedCoords.q).padStart(2, '0')},{String(selectedCoords.r).padStart(2, '0')}]
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

function Tooltip({ tooltip }) {
  if (!tooltip.show || !tooltip.content) return null;

  const { content } = tooltip;
  const info = content.class || content.type || {};
  const color = content.color || {};
  const accentColor = getMainColor(color);

  return createPortal(
    <div
      className="fixed z-50 bg-slate-900/95 backdrop-blur-sm border border-slate-700 p-3 rounded-lg shadow-2xl pointer-events-none w-64 animate-in fade-in duration-150"
      style={{
        top: Math.min(tooltip.y + 16, window.innerHeight - 220),
        left: Math.min(tooltip.x + 16, window.innerWidth - 280),
        borderColor: accentColor
      }}
    >
      <div className="font-bold text-blue-300 mb-1 text-sm" style={{ color: accentColor }}>
        {info.name}
      </div>
      <div className="text-xs text-slate-300 space-y-1">
        <div className="text-slate-300 pt-2">{info.description}</div>
      </div>
    </div>,
    document.body
  );
}

function InspectorPanel({ gridSize, systems, selectedCoords, setSelectedCoords }) {
  const selectedSystem = selectedCoords ? systems[`${selectedCoords.q},${selectedCoords.r}`] : null;
  const [expanded, setExpanded] = useState({ stars: true, planets: true });
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });

  const { starInfo: displayStarInfo } = getStarVisual(selectedSystem?.star?.type);

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

      <SelectionHeader
        selectedCoords={selectedCoords}
        selectedSystem={selectedSystem}
        onClear={() => setSelectedCoords(null)}
      />

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {selectedCoords ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {selectedSystem ? (
              <div className="space-y-4">
                <StarSection
                  expanded={expanded.stars}
                  onToggle={() => setExpanded((prev) => ({ ...prev, stars: !prev.stars }))}
                  selectedSystem={selectedSystem}
                  displayStarInfo={displayStarInfo}
                  setTooltip={setTooltip}
                />

                <PlanetsSection
                  expanded={expanded.planets}
                  onToggle={() => setExpanded((prev) => ({ ...prev, planets: !prev.planets }))}
                  selectedSystem={selectedSystem}
                  setTooltip={setTooltip}
                />

                <InstallationsSection selectedSystem={selectedSystem} />
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

      <Tooltip tooltip={tooltip} />
    </aside>
  );
}

export default memo(InspectorPanel);
