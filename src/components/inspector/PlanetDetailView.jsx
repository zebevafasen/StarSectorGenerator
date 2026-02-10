import React from 'react';
import { Users, Thermometer, Globe, Ruler, Activity, Info, Tag } from 'lucide-react';
import PlanetIcon from '../PlanetIcon';
import { getMainColor } from '../../utils/colorSemantics';
import { SectionToggleButton, SectionBody, DetailHeader, DetailHero, InfoItem } from './InspectorUi';
import { useAccordion } from '../../hooks/useAccordion';

export default function PlanetDetailView({ object, systemName, onBack }) {
  const { data: planet, tooltipData } = object;
  const accentColor = getMainColor(tooltipData.color);
  const { expanded, toggle } = useAccordion({ classification: true, environment: true, tags: true });

  const tags = planet.tags || [];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <DetailHeader 
        title={tooltipData.name} 
        subtitle={`${systemName} System`} 
        onBack={onBack} 
      />

      <DetailHero 
        icon={<PlanetIcon type={planet.type} radius={32} />}
        title={planet.type}
        subtitle={`${planet.size} World`}
        color={accentColor}
        badge={planet.isInhabited && (
          <div className="p-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
            <Users size={16} />
          </div>
        )}
      />

      {/* Classification Section */}
      <div>
        <SectionToggleButton 
          icon={<Info size={12} />}
          label="Classification"
          isExpanded={expanded.classification}
          onToggle={() => toggle('classification')}
        />
        {expanded.classification && (
          <SectionBody>
            <div className="p-2 text-xs text-slate-300 leading-relaxed italic">
              {tooltipData.description || "No classification data available for this body."}
            </div>
          </SectionBody>
        )}
      </div>

      {/* Environment Section */}
      <div>
        <SectionToggleButton 
          icon={<Globe size={12} />}
          label="Environment"
          isExpanded={expanded.environment}
          onToggle={() => toggle('environment')}
        />
        {expanded.environment && (
          <SectionBody>
            <div className="p-2 grid grid-cols-2 gap-2">
              <InfoItem 
                icon={<Activity />} 
                label="Habitability" 
                value={tooltipData.habitabilityRate || '0%'} 
                subValue={tooltipData.habitability || 'Lethal'}
                colorClass="text-blue-400"
              />
              <InfoItem 
                icon={<Thermometer />} 
                label="Temperature" 
                value={planet.temperature} 
                subValue={tooltipData.temperatureDescription || 'Unknown'}
                colorClass="text-orange-400"
              />
              <InfoItem 
                icon={<Globe />} 
                label="Atmosphere" 
                value={planet.atmosphere} 
                subValue={tooltipData.atmosphereDescription || 'Vacuum'}
                colorClass="text-cyan-400"
              />
              <InfoItem 
                icon={<Ruler />} 
                label="Mass Class" 
                value={planet.size} 
                subValue="Standard Scale"
                colorClass="text-slate-400"
              />
              {planet.isInhabited && (
                <InfoItem 
                  icon={<Users />} 
                  label="Population" 
                  value={planet.population?.toLocaleString() || 'Unknown'} 
                  subValue="Total Residents"
                  colorClass="text-green-400"
                />
              )}
            </div>
          </SectionBody>
        )}
      </div>

      {/* Tags Section */}
      {tags.length > 0 && (
        <div>
          <SectionToggleButton 
            icon={<Tag size={12} />}
            label={`Planetary Tags (${tags.length})`}
            isExpanded={expanded.tags}
            onToggle={() => toggle('tags')}
          />
          {expanded.tags && (
            <SectionBody>
              <div className="p-2 space-y-3">
                {tags.map((tag, i) => (
                  <div key={i} className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">{tag.name}</div>
                    <div className="text-[11px] text-slate-300 leading-normal">{tag.description}</div>
                  </div>
                ))}
              </div>
            </SectionBody>
          )}
        </div>
      )}
    </div>
  );
}
