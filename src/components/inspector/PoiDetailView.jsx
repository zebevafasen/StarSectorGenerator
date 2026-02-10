import React from 'react';
import { Info, MapPin, Activity, ShieldAlert, Milestone } from 'lucide-react';
import PoiIcon from '../PoiIcon';
import { DetailHeader, DetailHero, SectionToggleButton, SectionBody, InfoItem } from './InspectorUi';
import { useAccordion } from '../../hooks/useAccordion';
import { getHexId } from '../../utils/helpers';

const getRiskColorClass = (risk) => {
  const r = risk?.toLowerCase();
  if (r === 'high') return 'text-red-400';
  if (r === 'medium') return 'text-orange-400';
  if (r === 'low') return 'text-green-400';
  return 'text-slate-400';
};

export default function PoiDetailView({ object, onBack, onJump }) {
  const { data: poi } = object;
  const { expanded, toggle } = useAccordion({ details: true });

  const isJumpGate = (poi.type === 'Jump-Gate' || poi.type === 'Jump Gate');
  const canJump = isJumpGate && poi.state === 'Active' && poi.destination;

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

      {(poi.risk || poi.state) && (
        <div className="grid grid-cols-2 gap-2">
          {poi.risk && (
            <InfoItem 
              icon={<ShieldAlert />} 
              label="Risk Level" 
              value={poi.risk} 
              colorClass={getRiskColorClass(poi.risk)}
            />
          )}
          {poi.state && (
            <InfoItem 
              icon={<Activity />} 
              label="Current State" 
              value={poi.state} 
              colorClass="text-purple-400"
            />
          )}
        </div>
      )}

      {canJump && (
        <div className="p-3 bg-indigo-900/30 border border-indigo-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Milestone size={12} /> Target Vector Locked
          </div>
          <div className="text-sm text-white font-mono mb-3">
            Sector [{poi.destination.q}, {poi.destination.r}]
          </div>
          <button
            onClick={() => onJump(poi.destination)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Milestone size={16} /> Initiate Jump
          </button>
        </div>
      )}

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
