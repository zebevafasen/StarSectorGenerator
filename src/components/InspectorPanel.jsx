import React, { memo } from 'react';
import { Map as MapIcon, Star, Info, Hexagon } from 'lucide-react';
import { getHexId } from '../utils/helpers';
import SelectionHeader from './inspector/SelectionHeader';
import InspectorTooltip from './inspector/InspectorTooltip';
import PlanetDetailView from './inspector/PlanetDetailView';
import StarDetailView from './inspector/StarDetailView';
import StationDetailView from './inspector/StationDetailView';
import PoiDetailView from './inspector/PoiDetailView';
import { useTooltip } from '../hooks/useTooltip';
import { useAccordion } from '../hooks/useAccordion';
import { getPoiTooltipData } from '../utils/tooltipUtils';
import {
  StarSection,
  PlanetsSection,
  StationsSection,
  BeltsAndFieldsSection
} from './inspector/InspectorSections';

function InspectorPanel({ gridSize, systems, selectedCoords, setSelectedCoords, focusedObject, setFocusedObject, onJump, sectorCoords, style }) {
  const selectedSystem = selectedCoords ? systems[`${selectedCoords.q},${selectedCoords.r}`] : null;

  // Handle POI selection automatically when a POI hex is clicked
  React.useEffect(() => {
    if (selectedSystem?.isPOI && !focusedObject) {
      const tooltipData = getPoiTooltipData(selectedSystem);
      setFocusedObject({ type: 'poi', data: selectedSystem, tooltipData });
    }
  }, [selectedSystem, focusedObject, setFocusedObject]);

  const { expanded, toggle } = useAccordion({ stars: true, planets: true, stations: true, beltsAndFields: true });
  const { tooltip, handleTooltipEnter, handleTooltipMove, handleTooltipLeave } = useTooltip();

  const handleBackToSystem = () => {
    if (selectedSystem?.isPOI) {
      setSelectedCoords(null);
    }
    setFocusedObject(null);
  };

  return (
    <aside 
      className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 shadow-xl z-20"
      style={style}
    >
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <MapIcon size={16} />
            <span>
              Sector [{sectorCoords?.q ?? 0}, {sectorCoords?.r ?? 0}] 
              <span className="text-slate-600 px-1">&middot;</span>
              {gridSize?.width}x{gridSize?.height}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={16} />
            <span>{Object.keys(systems).length} Objects</span>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-slate-800 bg-slate-800/30">
        <h2 className="text-sm font-bold text-blue-400 uppercase flex items-center gap-2">
          <Info size={16} /> Inspector
        </h2>
      </div>

      {!focusedObject && (
        <SelectionHeader
          selectedCoords={selectedCoords}
          selectedSystem={selectedSystem}
          onClear={() => setSelectedCoords(null)}
        />
      )}

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {selectedCoords ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {focusedObject ? (
              focusedObject.type === 'planet' ? (
                <PlanetDetailView 
                  object={focusedObject} 
                  systemName={selectedSystem.baseName || selectedSystem.name}
                  onBack={handleBackToSystem} 
                />
              ) : focusedObject.type === 'star' ? (
                <StarDetailView 
                  object={focusedObject} 
                  systemName={selectedSystem.baseName || selectedSystem.name}
                  onBack={handleBackToSystem} 
                />
              ) : focusedObject.type === 'station' ? (
                <StationDetailView 
                  object={focusedObject} 
                  systemName={selectedSystem.baseName || selectedSystem.name}
                  onBack={handleBackToSystem} 
                />
              ) : focusedObject.type === 'poi' ? (
                <PoiDetailView 
                  object={focusedObject} 
                  onBack={handleBackToSystem}
                  onJump={onJump}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 opacity-50">
                  <p>Detail view coming soon for {focusedObject.type}</p>
                  <button onClick={handleBackToSystem} className="mt-4 text-blue-400 hover:text-blue-300 underline">Back to System</button>
                </div>
              )
            ) : selectedSystem?.isSystem ? (
              <div className="space-y-4">
                <StarSection
                  expanded={expanded.stars}
                  onToggle={() => toggle('stars')}
                  selectedSystem={selectedSystem}
                  onTooltipEnter={handleTooltipEnter}
                  onTooltipMove={handleTooltipMove}
                  onTooltipLeave={handleTooltipLeave}
                  onFocus={setFocusedObject}
                />

                <PlanetsSection
                  expanded={expanded.planets}
                  onToggle={() => toggle('planets')}
                  selectedSystem={selectedSystem}
                  onTooltipEnter={handleTooltipEnter}
                  onTooltipMove={handleTooltipMove}
                  onTooltipLeave={handleTooltipLeave}
                  onFocus={setFocusedObject}
                />

                <StationsSection
                  expanded={expanded.stations}
                  onToggle={() => toggle('stations')}
                  selectedSystem={selectedSystem}
                  onTooltipEnter={handleTooltipEnter}
                  onTooltipMove={handleTooltipMove}
                  onTooltipLeave={handleTooltipLeave}
                  onFocus={setFocusedObject}
                />

                <BeltsAndFieldsSection
                  expanded={expanded.beltsAndFields}
                  onToggle={() => toggle('beltsAndFields')}
                  selectedSystem={selectedSystem}
                />
              </div>
            ) : selectedSystem?.isPOI ? (
              <div className="flex items-center justify-center h-32 text-slate-500 animate-pulse">
                Analyzing anomaly...
              </div>
            ) : selectedCoords ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-4">
                  <Hexagon size={40} className="text-slate-700" />
                </div>
                <p className="text-xs text-slate-500 mt-2">Sector {getHexId(selectedCoords.q, selectedCoords.r)} is empty.</p>
              </div>
            ) : null}
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
