import React, { useMemo } from 'react';
import { Star, Disc, Satellite, Users, Stone } from 'lucide-react';
import PlanetIcon from '../PlanetIcon';
import SystemStarIcon from '../SystemStarIcon';
import { getMainColor } from '../../utils/colorSemantics';
import { sortSystemBodies } from '../../utils/planetUtils';
import { SectionToggleButton, SectionBody, TooltipTag, EntityCard } from './InspectorUi';
import { 
  getStarTooltipData, 
  getPlanetTooltipData, 
  getStationTooltipData, 
  getPlanetSizeTooltipData 
} from '../../utils/tooltipUtils';

export function StarSection({ 
  expanded, 
  onToggle, 
  selectedSystem, 
  onTooltipEnter, 
  onTooltipMove, 
  onTooltipLeave,
  onFocus
}) {
  const stars = selectedSystem.stars || [selectedSystem.star];

  return (
    <div>
      <SectionToggleButton
        icon={<Star size={12} />}
        label={`Stars (${stars.length})`}
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <SectionBody>
          {stars.map((star, index) => {
            const tooltipData = getStarTooltipData(star);
            const accentColor = getMainColor(tooltipData.color);

            return (
              <EntityCard
                key={index}
                onClick={() => onFocus?.({ type: 'star', data: star, tooltipData })}
                leftIcon={
                  <SystemStarIcon
                    starType={star.type}
                    mode="inspector"
                    uid={`inspector-${index}`}
                    className="flex items-center justify-center shrink-0"
                  />
                }
                title={<div className="text-base font-bold text-blue-300">{star.name}</div>}
                subtitle={
                  <div className="flex items-center gap-2">
                    <TooltipTag
                      color={accentColor}
                      onTooltipEnter={onTooltipEnter}
                      onTooltipMove={onTooltipMove}
                      onTooltipLeave={onTooltipLeave}
                      tooltipData={tooltipData}
                    >
                      {star.type === 'Black Hole' ? 'Black Hole' : star.type === 'Neutron' ? 'Neutron Star' : `Class ${star.type || 'Unknown'} Star`}
                    </TooltipTag>
                    &middot; {star.age && <span className="text-[10px] text-slate-400 font-bold uppercase">Age: {star.age} {star.ageUnit || 'Billion Years'}</span>}
                  </div>
                }
              />
            );
          })}
        </SectionBody>
      )}
    </div>
  );
}

export function PlanetsSection({ 
  expanded, 
  onToggle, 
  selectedSystem, 
  onTooltipEnter, 
  onTooltipMove, 
  onTooltipLeave,
  onFocus
}) {
  const systemName = selectedSystem.baseName || selectedSystem.name;
  const sortedBodies = useMemo(() => sortSystemBodies(selectedSystem.bodies), [selectedSystem.bodies]);

  return (
    <div>
      <SectionToggleButton
        icon={<Disc size={12} />}
        label={`Planets (${selectedSystem.bodies.length})`}
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <SectionBody>
          {selectedSystem.bodies.length > 0 ? (
            <div className="space-y-2">
              {sortedBodies.map((body, index) => {
                const tooltipData = getPlanetTooltipData(body, systemName);
                const typeColor = getMainColor(tooltipData.color);

                const nameLabel =
                  body.namingStyle === 'prefix'
                    ? `${body.name} ${systemName}`
                    : `${systemName} ${body.name}`;

                return (
                  <EntityCard
                    key={index}
                    onClick={() => onFocus?.({ type: 'planet', data: body, tooltipData })}
                    leftIcon={<PlanetIcon type={body.type} radius={12} className="shrink-0" />}
                    title={
                      <div className="flex items-center gap-1.5">
                        {body.isInhabited && <Users size={12} className="text-green-400 shrink-0" title="Inhabited" />}
                        <span>{nameLabel}</span>
                      </div>
                    }
                    subtitle={
                      <div className="text-[10px] uppercase font-bold">
                        <TooltipTag
                          color={typeColor}
                          onTooltipEnter={onTooltipEnter}
                          onTooltipMove={onTooltipMove}
                          onTooltipLeave={onTooltipLeave}
                          tooltipData={tooltipData}
                        >
                          {body.type}
                        </TooltipTag>
                        <span className="text-slate-400"> &middot; </span>
                        <TooltipTag
                          color="#94a3b8"
                          onTooltipEnter={onTooltipEnter}
                          onTooltipMove={onTooltipMove}
                          onTooltipLeave={onTooltipLeave}
                          tooltipData={getPlanetSizeTooltipData(body.size)}
                        >
                          {body.size}
                        </TooltipTag>
                        {body.isInhabited && body.population !== undefined && (
                          <>
                            <span className="text-slate-400"> &middot; </span>
                            <span className="text-green-500/80">Pop: {
                              body.population >= 1000000000 
                                ? `${(body.population / 1000000000).toFixed(1)}B` 
                                : body.population >= 1000000 
                                  ? `${(body.population / 1000000).toFixed(1)}M` 
                                  : body.population.toLocaleString()
                            }</span>
                          </>
                        )}
                      </div>
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic text-center py-2">No planetary bodies detected.</div>
          )}
        </SectionBody>
      )}
    </div>
  );
}

export function StationsSection({ 
  expanded, 
  onToggle, 
  selectedSystem, 
  onTooltipEnter, 
  onTooltipMove, 
  onTooltipLeave,
  onFocus
}) {
  const stations = selectedSystem?.stations || [];

  return (
    <div>
      <SectionToggleButton
        icon={<Satellite size={12} />}
        label={`Stations (${stations.length})`}
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <SectionBody>
          {stations.length > 0 ? (
            <div className="space-y-2">
              {stations.map((station, index) => {
                const tooltipData = getStationTooltipData(station);
                return (
                  <EntityCard
                    key={index}
                    onClick={() => onFocus?.({ type: 'station', data: station, tooltipData })}
                    leftIcon={
                      <div 
                        className="p-1.5 rounded text-white shrink-0"
                        style={{ backgroundColor: station.color || '#1e3a8a' }}
                      >
                        <Satellite size={14} />
                      </div>
                    }
                    title={<span className="font-bold text-blue-200">{station.name}</span>}
                    subtitle={
                      <span className="text-[10px] text-blue-400 uppercase">
                        <TooltipTag
                          color={station.color || "#60a5fa"}
                          onTooltipEnter={onTooltipEnter}
                          onTooltipMove={onTooltipMove}
                          onTooltipLeave={onTooltipLeave}
                          tooltipData={tooltipData}
                        >
                          {station.type}
                        </TooltipTag>
                      </span>
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic text-center py-2">No stations detected.</div>
          )}
        </SectionBody>
      )}
    </div>
  );
}

export function BeltsAndFieldsSection({ expanded, onToggle, selectedSystem }) {
  const belts = Array.isArray(selectedSystem?.belts) ? selectedSystem.belts : [];
  const fields = Array.isArray(selectedSystem?.fields) ? selectedSystem.fields : [];
  const items = [
    ...belts.map((belt, index) => ({ key: `belt-${index}`, name: belt.name, type: belt.type })),
    ...fields.map((field, index) => ({ key: `field-${index}`, name: field.name || 'Unnamed Field', type: field.type || 'Field' }))
  ];

  return (
    <div>
      <SectionToggleButton
        icon={<Stone size={12} />}
        label={`Belts and Fields (${items.length})`}
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <SectionBody>
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <EntityCard
                  key={item.key}
                  leftIcon={
                    <div className="p-1.5 bg-slate-700 rounded text-slate-400 shrink-0">
                      <Stone size={14} />
                    </div>
                  }
                  title={<span className="font-bold">{item.name}</span>}
                  subtitle={<div className="text-[10px] text-slate-400">{item.type}</div>}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic text-center py-2">No belts or fields detected.</div>
          )}
        </SectionBody>
      )}
    </div>
  );
}
