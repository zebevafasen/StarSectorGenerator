import React from 'react';
import { Info, MapPin } from 'lucide-react';
import PoiIcon from '../PoiIcon';
import { DetailHeader, DetailHero, SectionToggleButton, SectionBody } from './InspectorUi';
import { useAccordion } from '../../hooks/useAccordion';
import { getHexId } from '../../utils/helpers';

export default function PoiDetailView({ object, onBack }) {
  const { data: poi } = object;
  const { expanded, toggle } = useAccordion({ details: true });

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <DetailHeader 
        title={poi.name} 
        subtitle="Deep Space POI" 
        onBack={onBack} 
      />

      <DetailHero 
        icon={<PoiIcon type={poi.type} color={poi.color} size={32} inSvg={false} />}
        title={poi.type}
        subtitle="Uncharted Anomaly"
        color={poi.color}
      />

      <div>
        <SectionToggleButton 
          icon={<Info size={12} />}
          label="Observation Log"
          isExpanded={expanded.details}
          onToggle={() => toggle('details')}
        />
        {expanded.details && (
          <SectionBody>
            <div className="p-3 space-y-3">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{poi.description}"
              </p>
              
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase pt-2 border-t border-slate-800">
                <MapPin size={12} />
                <span>Coordinate: {getHexId(poi.location.q, poi.location.r)}</span>
              </div>
            </div>
          </SectionBody>
        )}
      </div>
    </div>
  );
}
