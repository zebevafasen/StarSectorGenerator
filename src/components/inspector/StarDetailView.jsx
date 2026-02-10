import React from 'react';
import { Thermometer, Database, History, Info } from 'lucide-react';
import SystemStarIcon from '../SystemStarIcon';
import { getMainColor } from '../../utils/colorSemantics';
import { SectionToggleButton, SectionBody, DetailHeader, DetailHero, InfoItem } from './InspectorUi';
import { useAccordion } from '../../hooks/useAccordion';

export default function StarDetailView({ object, systemName, onBack }) {
  const { data: star, tooltipData } = object;
  const accentColor = getMainColor(tooltipData.color);
  const { expanded, toggle } = useAccordion({ analysis: true, stats: true });

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <DetailHeader 
        title={star.name} 
        subtitle={`${systemName} System`} 
        onBack={onBack} 
      />

      <DetailHero 
        icon={<SystemStarIcon starType={star.type} mode="inspector" radius={36} />}
        title={`Class ${star.type} Star`}
        subtitle={`${star.age} ${star.ageUnit} Old`}
        color={accentColor}
      />

      {/* Physical Analysis Section */}
      <div>
        <SectionToggleButton 
          icon={<Info size={12} />}
          label="Physical Analysis"
          isExpanded={expanded.analysis}
          onToggle={() => toggle('analysis')}
        />
        {expanded.analysis && (
          <SectionBody>
            <div className="p-2 space-y-2">
              <InfoItem 
                icon={<Thermometer />} 
                label="Photosphere Temp" 
                value={tooltipData.temp} 
                colorClass="text-orange-400"
              />
              <InfoItem 
                icon={<Database />} 
                label="Relative Mass" 
                value={tooltipData.mass} 
                colorClass="text-blue-400"
              />
              <InfoItem 
                icon={<History />} 
                label="Stellar Lifespan" 
                value={tooltipData.typicalAge} 
                colorClass="text-purple-400"
              />
            </div>
          </SectionBody>
        )}
      </div>
    </div>
  );
}
