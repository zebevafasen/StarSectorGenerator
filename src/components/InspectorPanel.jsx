import React, { memo, useState } from 'react';
import { Map as MapIcon, Star, Info, Hexagon } from 'lucide-react';
import { getHexId } from '../utils/helpers';
import SelectionHeader from './inspector/SelectionHeader';
import InspectorTooltip from './inspector/InspectorTooltip';
import { useTooltip } from '../hooks/useTooltip';
import {
  StarSection,
  PlanetsSection,
  StationsSection,
  BeltsAndFieldsSection
} from './inspector/InspectorSections';

function InspectorPanel({ gridSize, systems, selectedCoords, setSelectedCoords }) {
  const selectedSystem = selectedCoords ? systems[`${selectedCoords.q},${selectedCoords.r}`] : null;
  const [expanded, setExpanded] = useState({ stars: true, planets: true, stations: true, beltsAndFields: true });
  const { tooltip, handleTooltipEnter, handleTooltipMove, handleTooltipLeave } = useTooltip();

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
                <p className="text-xs text-slate-500 mt-2">Sector {getHexId(selectedCoords.q, selectedCoords.r)} is empty.</p>
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

      <InspectorTooltip tooltip={tooltip} />
    </aside>
  );
}

export default memo(InspectorPanel);
