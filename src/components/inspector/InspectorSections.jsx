import React, { useMemo } from 'react';
import { Star, Disc, Satellite, Users, Stone } from 'lucide-react';
import PlanetIcon from '../PlanetIcon';
import SystemStarIcon from '../SystemStarIcon';
import planetSizesData from '../../data/planet_sizes.json';
import namesData from '../../data/names.json';
import { getStarVisual } from '../../utils/starVisuals';
import { getMainColor } from '../../utils/colorSemantics';
import { getAtmosphereByName, getTemperatureByName } from '../../utils/environmentData';
import { getPlanetByType } from '../../utils/planetUtils';
import { SectionToggleButton, SectionBody, TooltipTag, EntityCard } from './InspectorUi';

export function StarSection({ expanded, onToggle, selectedSystem, onTooltipEnter, onTooltipMove, onTooltipLeave }) {
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
                    <TooltipTag
                      color={starAccentColor}
                      onTooltipEnter={onTooltipEnter}
                      onTooltipMove={onTooltipMove}
                      onTooltipLeave={onTooltipLeave}
                      tooltipData={tooltipData}
                    >
                      {star.type === 'Black Hole' ? 'Black Hole' : star.type === 'Neutron' ? 'Neutron Star' : `Class ${star.type || 'Unknown'} Star`}
                    </TooltipTag>
                    &middot; {star.age && <span className="text-[10px] text-slate-400 font-bold uppercase">Age: {star.age} {star.ageUnit || 'Billion Years'}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </SectionBody>
      )}
    </div>
  );
}

export function PlanetsSection({ expanded, onToggle, selectedSystem, onTooltipEnter, onTooltipMove, onTooltipLeave }) {
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
      return 0;
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
        <SectionBody>
          {selectedSystem.bodies.length > 0 ? (
            <div className="space-y-2">
              {sortedBodies.map((body, index) => {
                const planetData = getPlanetByType(body.type) || {};
                const typeColor = getMainColor(planetData.color);
                const planetTypeInfo = planetData.type || {};
                const planetStats = planetData.data || {};
                const atmosphere = getAtmosphereByName(body.atmosphere);
                const temperature = getTemperatureByName(body.temperature);
                const displayedHabitabilityRate = typeof body.habitabilityRate === 'number'
                  ? body.habitabilityRate
                  : planetStats.habitabilityRate;

                const tooltipData = {
                  ...planetData,
                  name: `${selectedSystem.baseName || selectedSystem.name} ${body.name}`,
                  type: body.type,
                  size: body.size,
                  atmosphere: body.atmosphere,
                  atmosphereDescription: atmosphere?.description,
                  temperature: body.temperature,
                  temperatureDescription: temperature?.description,
                  temperatureRange: temperature?.data?.temperatureRange,
                  planetTypeName: planetTypeInfo.name || body.type,
                  description: planetTypeInfo.description,
                  habitability: body.habitable === true ? 'Habitable' : body.habitable === false ? 'Non-habitable' : planetStats.habitable === true ? 'Habitable' : planetStats.habitable === false ? 'Non-habitable' : null,
                  habitabilityRate: typeof displayedHabitabilityRate === 'number' ? `${Math.round(displayedHabitabilityRate * 100)}%` : null,
                  isPlanet: true
                };

                const nameLabel =
                  body.namingStyle === 'prefix'
                    ? `${body.name} ${selectedSystem.baseName || selectedSystem.name}`
                    : `${selectedSystem.baseName || selectedSystem.name} ${body.name}`;

                return (
                  <EntityCard
                    key={index}
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
                          tooltipData={{
                            name: body.size,
                            description: planetSizesData.find((size) => size.name === body.size)?.description,
                            isPlanetSize: true
                          }}
                        >
                          {body.size}
                        </TooltipTag>
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

export function StationsSection({ expanded, onToggle, selectedSystem, onTooltipEnter, onTooltipMove, onTooltipLeave }) {
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
              {stations.map((station, index) => (
                <EntityCard
                  key={index}
                  leftIcon={
                    <div className="p-1.5 bg-blue-900/50 rounded text-blue-300 shrink-0">
                      <Satellite size={14} />
                    </div>
                  }
                  title={<span className="font-bold text-blue-200">{station.name}</span>}
                  subtitle={
                    <span className="text-[10px] text-blue-400 uppercase">
                      <TooltipTag
                        color="#60a5fa"
                        onTooltipEnter={onTooltipEnter}
                        onTooltipMove={onTooltipMove}
                        onTooltipLeave={onTooltipLeave}
                        tooltipData={{
                          name: station.name,
                          type: station.type,
                          description: station.description,
                          isStation: true
                        }}
                      >
                        {station.type}
                      </TooltipTag>
                    </span>
                  }
                />
              ))}
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
