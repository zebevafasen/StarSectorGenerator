import React, { useState } from 'react';
import { ArrowLeft, Users, Thermometer, Globe, Ruler, Activity, Info, Tag } from 'lucide-react';
import PlanetIcon from '../PlanetIcon';
import { getMainColor } from '../../utils/colorSemantics';
import { SectionToggleButton, SectionBody } from './InspectorUi';

export default function PlanetDetailView({ object, systemName, onBack }) {
  const { data: planet, tooltipData } = object;
  const accentColor = getMainColor(tooltipData.color);
  const [expanded, setExpanded] = useState({ classification: true, environment: true, tags: true });

  const tags = planet.tags || [];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header aligned with SelectionHeader style */}
      <div className="p-3 bg-slate-800/20 border border-slate-800 rounded-lg flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-1.5 hover:bg-slate-700 rounded-md text-blue-400 transition-colors"
          title="Back to System"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-white leading-tight truncate">{tooltipData.name}</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{systemName} System</p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at left, ${accentColor}, transparent 70%)` }}
        />
        <PlanetIcon type={planet.type} radius={32} />
        <div>
          <div className="text-lg font-bold" style={{ color: accentColor }}>{planet.type}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{planet.size} World</div>
        </div>
        
        {planet.isInhabited && (
          <div className="ml-auto p-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
            <Users size={16} />
          </div>
        )}
      </div>

      {/* Classification Section */}
      <div>
        <SectionToggleButton 
          icon={<Info size={12} />}
          label="Classification"
          isExpanded={expanded.classification}
          onToggle={() => setExpanded(prev => ({ ...prev, classification: !prev.classification }))}
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
          onToggle={() => setExpanded(prev => ({ ...prev, environment: !prev.environment }))}
        />
        {expanded.environment && (
          <SectionBody>
            <div className="p-2 grid grid-cols-2 gap-2">
              <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
                <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                  <Activity size={10} />
                  <span className="text-[9px] font-bold uppercase">Habitability</span>
                </div>
                <div className="text-xs font-medium text-slate-200">{tooltipData.habitabilityRate || '0%'}</div>
                <div className="text-[9px] text-slate-500">{tooltipData.habitability || 'Lethal'}</div>
              </div>

              <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
                <div className="flex items-center gap-1.5 text-orange-400 mb-1">
                  <Thermometer size={10} />
                  <span className="text-[9px] font-bold uppercase">Temperature</span>
                </div>
                <div className="text-xs font-medium text-slate-200">{planet.temperature}</div>
                <div className="text-[9px] text-slate-500 truncate">{tooltipData.temperatureDescription || 'Unknown'}</div>
              </div>

              <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
                <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                  <Globe size={10} />
                  <span className="text-[9px] font-bold uppercase">Atmosphere</span>
                </div>
                <div className="text-xs font-medium text-slate-200">{planet.atmosphere}</div>
                <div className="text-[9px] text-slate-500 truncate">{tooltipData.atmosphereDescription || 'Vacuum'}</div>
              </div>

              <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Ruler size={10} />
                  <span className="text-[9px] font-bold uppercase">Mass Class</span>
                </div>
                <div className="text-xs font-medium text-slate-200">{planet.size}</div>
                <div className="text-[9px] text-slate-500 italic">Standard Scale</div>
              </div>

              {planet.isInhabited && (
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-green-400 mb-1">
                    <Users size={10} />
                    <span className="text-[9px] font-bold uppercase">Population</span>
                  </div>
                  <div className="text-xs font-medium text-slate-200">
                    {planet.population?.toLocaleString() || 'Unknown'}
                  </div>
                  <div className="text-[9px] text-slate-500 italic">Total Residents</div>
                </div>
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
            onToggle={() => setExpanded(prev => ({ ...prev, tags: !prev.tags }))}
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
