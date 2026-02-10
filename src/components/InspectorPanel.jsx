import React, { memo, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Map as MapIcon, Star, Info, X, Disc, Satellite, Hexagon, ChevronDown, ChevronRight, Users, Stone } from 'lucide-react';
import PlanetIcon from './PlanetIcon';
import SystemStarIcon from './SystemStarIcon';
import { getHexId } from '../utils/helpers';
import planetSizesData from '../data/planet_sizes.json';
import namesData from '../data/names.json';
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

function StarSection({ expanded, onToggle, selectedSystem, onTooltipEnter, onTooltipMove, onTooltipLeave }) {
  return (
    <div>
      <SectionToggleButton
        icon={<Star size={12} />}
        label={`Stars (${selectedSystem.stars?.length || 1})`}
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <div className="px-1 pb-1 border-x border-b border-slate-800 rounded-b-lg bg-slate-900/30 animate-in fade-in slide-in-from-top-1 duration-200">
          {(selectedSystem.stars || [selectedSystem.star]).map((star, index) => {
            const { starInfo } = getStarVisual(star.type);
            const starAccentColor = getMainColor(starInfo?.color);
            
            const tooltipData = {
              ...starInfo,
              ...starInfo?.class,
              name: star.name,
              type: star.type,
              age: star.age,
              ageUnit: star.ageUnit,
              isStar: true
            };

            return (
          <div key={index} className={`bg-slate-800/50 p-0.5 rounded border border-slate-700/50 flex items-center gap-3 group hover:border-blue-500/30 transition-colors ${index > 0 ? 'mt-1' : ''}`}>
            <SystemStarIcon
              starType={star.type}
              mode="inspector"
              uid={`inspector-${index}`}
              className="flex items-center justify-center shrink-0"
            />
            <div>
              <div className="text-base font-bold text-blue-300">{star.name}</div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block text-[10px] font-bold uppercase cursor-help border-b border-dotted transition-colors"
                  style={{ color: starAccentColor, borderColor: starAccentColor }}
                  onMouseEnter={(e) => onTooltipEnter(e, tooltipData)}
                  onMouseMove={onTooltipMove}
                  onMouseLeave={onTooltipLeave}
                >
                  {star.type === 'Black Hole' ? 'Black Hole' :
                    star.type === 'Neutron' ? 'Neutron Star' :
                      `Class ${star.type || 'Unknown'} Star`} 
                </span>
                &middot; {star.age && (
                  <span className="text-[10px] text-slate-400 font-bold uppercase">  
                    Age: {star.age} {star.ageUnit || 'Billion Years'}
                  </span>
                )}
              </div>
            </div>
          </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlanetsSection({ expanded, onToggle, selectedSystem, onTooltipEnter, onTooltipMove, onTooltipLeave }) {
  const sortedBodies = useMemo(() => {
    if (!selectedSystem?.bodies?.length) {
      return [];
    }
    return [...selectedSystem.bodies].sort((a, b) => {
      const aIsPrimary = namesData.PRIMARY_PLANET_SUFFIXES.includes(a.name);
      const bIsPrimary = namesData.PRIMARY_PLANET_SUFFIXES.includes(b.name);

      if (aIsPrimary) return -1;
      if (bIsPrimary) return 1;

      if (a.isInhabited && !b.isInhabited) return -1;
      if (!a.isInhabited && b.isInhabited) return 1;

      return 0; // Keep original order for planets within the same group
    });
  }, [selectedSystem]);
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
              {sortedBodies.map((body, i) => {
                const planetData = getPlanetByType(body.type) || {};
                const typeColor = getMainColor(planetData.color);
                const planetTypeInfo = planetData.type || {};
                const planetStats = planetData.data || {};
                
                const tooltipData = {
                  ...planetData,
                  name: `${selectedSystem.baseName || selectedSystem.name} ${body.name}`,
                  type: body.type,
                  size: body.size,
                  planetTypeName: planetTypeInfo.name || body.type,
                  description: planetTypeInfo.description,
                  habitability: planetStats.habitable === 'true'
                    ? 'Habitable'
                    : planetStats.habitable === 'false'
                      ? 'Non-habitable'
                      : null,
                  habitabilityRate: typeof planetStats.habitabilityRate === 'number'
                    ? `${Math.round(planetStats.habitabilityRate * 100)}%`
                    : null,
                  isPlanet: true
                };

                return (
                  <div key={i} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <PlanetIcon type={body.type} radius={12} className="shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                          {body.isInhabited && <Users size={12} className="text-green-400 shrink-0" title="Inhabited" />}
                          <span>
                            {body.namingStyle === 'prefix'
                              ? `${body.name} ${selectedSystem.baseName || selectedSystem.name}`
                              : `${selectedSystem.baseName || selectedSystem.name} ${body.name}`
                            }
                          </span>
                        </div>
                        <div className="text-[10px] uppercase font-bold">
                          <span
                            className="inline-block cursor-help transition-colors border-b border-dotted"
                            style={{ color: typeColor || '#64748b', borderColor: typeColor || '#64748b' }}
                            onMouseEnter={(e) => onTooltipEnter(e, tooltipData)}
                            onMouseMove={onTooltipMove}
                            onMouseLeave={onTooltipLeave}
                          >
                            {body.type}
                          </span>
                          <span className="text-slate-400"> &middot; </span>
                          <span
                            className="inline-block text-slate-400 cursor-help transition-colors border-b border-dotted border-slate-400"
                            onMouseEnter={(e) => {
                              const sizeInfo = planetSizesData.find(s => s.name === body.size);
                              onTooltipEnter(e, {
                                name: body.size,
                                description: sizeInfo?.description,
                                isPlanetSize: true
                              });
                            }}
                            onMouseMove={onTooltipMove}
                            onMouseLeave={onTooltipLeave}
                          >{body.size}</span>
                        </div>
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

function StationsSection({ expanded, onToggle, selectedSystem, onTooltipEnter, onTooltipMove, onTooltipLeave }) {
  const stations = selectedSystem?.stations || [];
  const stationCount = stations.length;

  return (
    <div>
      <SectionToggleButton
        icon={<Satellite size={12} />}
        label={`Stations (${stationCount})`}
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <div className="px-1 pb-1 border-x border-b border-slate-800 rounded-b-lg bg-slate-900/30 animate-in fade-in slide-in-from-top-1 duration-200">
          {stationCount > 0 ? (
            <div className="space-y-2">
              {stations.map((station, i) => {
                const tooltipData = {
                  name: station.name,
                  type: station.type,
                  description: station.description,
                  isStation: true
                };
                return (
                  <div key={i} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-900/50 rounded text-blue-300 shrink-0">
                        <Satellite size={14} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-blue-200">{station.name}</div>
                        <span
                          className="inline-block text-[10px] text-blue-400 uppercase cursor-help border-b border-dotted border-blue-400/50"
                          onMouseEnter={(e) => onTooltipEnter(e, tooltipData)}
                          onMouseMove={onTooltipMove}
                          onMouseLeave={onTooltipLeave}
                        >{station.type}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic text-center py-2">
              No stations detected.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BeltsAndFieldsSection({ expanded, onToggle, selectedSystem }) {
  const belts = Array.isArray(selectedSystem?.belts) ? selectedSystem.belts : [];
  const fields = Array.isArray(selectedSystem?.fields) ? selectedSystem.fields : [];
  const itemCount = belts.length + fields.length;

  return (
    <div>
      <SectionToggleButton
        icon={<Stone size={12} />}
        label={`Belts and Fields (${itemCount})`}
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <div className="px-1 pb-1 border-x border-b border-slate-800 rounded-b-lg bg-slate-900/30 animate-in fade-in slide-in-from-top-1 duration-200">
          {itemCount > 0 ? (
            <div className="space-y-2">
              {belts.map((belt, i) => (
                <div key={`belt-${i}`} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-700 rounded text-slate-400 shrink-0">
                      <Stone size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-300">{belt.name}</div>
                      <div className="text-[10px] text-slate-400">{belt.type}</div>
                    </div>
                  </div>
                </div>
              ))}
              {fields.map((field, i) => (
                <div key={`field-${i}`} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-700 rounded text-slate-400 shrink-0">
                      <Stone size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-300">{field.name || 'Unnamed Field'}</div>
                      <div className="text-[10px] text-slate-400">{field.type || 'Field'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic text-center py-2">
              No belts or fields detected.
            </div>
          )}
        </div>
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
              <span>S:[{selectedSystem.globalLocation.sectorQ}-{selectedSystem.globalLocation.sectorR}] &middot; </span>
            )}
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

function Tooltip({ tooltip }) {
  if (!tooltip.show || !tooltip.content) return null;

  const info = tooltip.content;
  if (!info) return null; // Safety check

  const color = info.color;
  let accentColor = getMainColor(color);
  
  if (!accentColor || typeof accentColor !== 'string') {
    accentColor = '#93c5fd';
  }

  // Use OR to be more permissive if data is partial
  const isStarTooltip = Boolean(info.isStar);
  const isPlanetTypeTooltip = Boolean(info.isPlanet); // Renamed to avoid conflict with planet size
  const isPlanetSizeTooltip = Boolean(info.isPlanetSize);
  const isStationTooltip = Boolean(info.isStation);

  const ageRange = (info.ageRange && typeof info.ageRange === 'object')
    ? `${info.ageRange.min || '?'} - ${info.ageRange.max || '?'} ${info.ageRange.unit || ''}`
    : null;

  // Determine tooltip title based on the type of information
  const tooltipTitle = isStarTooltip ? String(info.name || info.type || 'Unknown Star') :
                       isPlanetTypeTooltip ? String(info.type || info.planetTypeName || 'Unknown Body') :
                       isPlanetSizeTooltip ? String(info.name || 'Unknown Size') :
                       isStationTooltip ? String(info.name || 'Unknown Station') :
                       String(info.name || info.type || 'Unknown Item');

  return createPortal(
    <div
      className="fixed z-50 bg-slate-900/95 backdrop-blur-sm border border-slate-700 p-3 rounded-lg shadow-2xl pointer-events-none w-64 animate-in fade-in duration-150"
      style={{
        top: Math.min(tooltip.y + 16, window.innerHeight - 220),
        left: Math.min(tooltip.x + 16, window.innerWidth - 280),
        borderColor: accentColor
      }}
    >
      <div className="font-bold text-blue-300 mb-1 text-sm capitalize" style={{ color: accentColor }}>
        {tooltipTitle}
      </div>
      <div className="text-xs text-slate-300 space-y-1">
        {isStarTooltip && (
          <>
            <div><span className="font-bold" style={{ color: accentColor }}>Temp:</span> {info.temp || 'Unknown'}</div>
            <div><span className="font-bold" style={{ color: accentColor }}>Mass:</span> {info.mass || 'Unknown'}</div>
            <div><span className="font-bold" style={{ color: accentColor }}>Typical Age:</span> {info.typicalAge || 'Unknown'}</div>
            {ageRange && <div><span className="font-bold" style={{ color: accentColor }}>Age Range:</span> {ageRange}</div>}
          </>
        )}
        {(isPlanetTypeTooltip || isPlanetSizeTooltip || isStationTooltip) && (
          <>
            <div className="text-slate-300">
              {typeof info.description === 'string' ? info.description : 'No description available.'}
            </div>
            {isPlanetTypeTooltip && info.habitability && (
              <div className="text-slate-300 pt-2 border-t border-slate-700/50 mt-2">
                <span className="font-bold" style={{ color: accentColor }}>Habitability:</span> {info.habitability} ({info.habitabilityRate})
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

function InspectorPanel({ gridSize, systems, selectedCoords, setSelectedCoords }) {
  const selectedSystem = selectedCoords ? systems[`${selectedCoords.q},${selectedCoords.r}`] : null;
  const [expanded, setExpanded] = useState({ stars: true, planets: true, stations: true, beltsAndFields: true });
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });

  const handleTooltipEnter = (event, content) => {
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      content
    });
  };

  const handleTooltipMove = (event) => {
    setTooltip((prev) => ({
      ...prev,
      show: true,
      x: event.clientX,
      y: event.clientY
    }));
  };

  const handleTooltipLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  return (
    <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 shadow-xl z-20">
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <MapIcon size={16} />
            <span>{gridSize.width} x {gridSize.height} ({gridSize.width * gridSize.height} Hexes)</span>
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
                  onTooltipEnter={handleTooltipEnter}
                  onTooltipMove={handleTooltipMove}
                  onTooltipLeave={handleTooltipLeave}
                />

                <PlanetsSection
                  expanded={expanded.planets}
                  onToggle={() => setExpanded((prev) => ({ ...prev, planets: !prev.planets }))}
                  selectedSystem={selectedSystem}
                  onTooltipEnter={handleTooltipEnter}
                  onTooltipMove={handleTooltipMove}
                  onTooltipLeave={handleTooltipLeave}
                />

                <StationsSection
                  expanded={expanded.stations}
                  onToggle={() => setExpanded((prev) => ({ ...prev, stations: !prev.stations }))}
                  selectedSystem={selectedSystem}
                  onTooltipEnter={handleTooltipEnter}
                  onTooltipMove={handleTooltipMove}
                  onTooltipLeave={handleTooltipLeave}
                />



                <BeltsAndFieldsSection
                  expanded={expanded.beltsAndFields}
                  onToggle={() => setExpanded((prev) => ({ ...prev, beltsAndFields: !prev.beltsAndFields }))}
                  selectedSystem={selectedSystem}
                />
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
