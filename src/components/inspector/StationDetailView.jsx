import { Satellite, Users, Shield, Info, Tag } from 'lucide-react';
import { SectionToggleButton, SectionBody, DetailHeader, DetailHero, InfoItem } from './InspectorUi';
import { useAccordion } from '../../hooks/useAccordion';

export default function StationDetailView({ object, systemName, onBack }) {
  const { data: station } = object;
  const { expanded, toggle } = useAccordion({ classification: true, features: true });

  const traits = station.traits || [];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <DetailHeader 
        title={station.name} 
        subtitle={`${systemName} System`} 
        onBack={onBack} 
      />

      <DetailHero 
        icon={
          <div 
            className="p-3 rounded-lg text-white shrink-0"
            style={{ backgroundColor: station.color || '#1e3a8a' }}
          >
            <Satellite size={24} />
          </div>
        }
        title={station.type}
        subtitle={station.allegiance}
        color={station.color}
      />

      {/* Classification Section */}
      <div>
        <SectionToggleButton 
          icon={<Info size={12} />}
          label="Operational Profile"
          isExpanded={expanded.classification}
          onToggle={() => toggle('classification')}
        />
        {expanded.classification && (
          <SectionBody>
            <div className="p-2 space-y-3">
              <div className="text-xs text-slate-300 leading-relaxed italic border-b border-slate-800/50 pb-2 mb-2">
                {station.description || "No operational data available for this facility."}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <InfoItem 
                  icon={<Users />} 
                  label="Personnel" 
                  value={station.population?.toLocaleString()} 
                  subValue="Active Crew"
                  colorClass="text-green-400"
                />
                <InfoItem 
                  icon={<Shield />} 
                  label="Allegiance" 
                  value={station.allegiance} 
                  subValue="Governing Body"
                  colorClass="text-blue-400"
                />
              </div>
            </div>
          </SectionBody>
        )}
      </div>

      {/* Traits Section */}
      {traits.length > 0 && (
        <div>
          <SectionToggleButton 
            icon={<Tag size={12} />}
            label={`Station Traits (${traits.length})`}
            isExpanded={expanded.features}
            onToggle={() => toggle('features')}
          />
          {expanded.features && (
            <SectionBody>
              <div className="p-2 space-y-3">
                {traits.map((trait, i) => (
                  <div key={i} className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">{trait.name}</div>
                    <div className="text-[11px] text-slate-300 leading-normal">{trait.description}</div>
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
