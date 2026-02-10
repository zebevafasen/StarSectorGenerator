import React, { useState } from 'react';
import { ArrowLeft, Thermometer, Database, History, Info, Star } from 'lucide-react';
import SystemStarIcon from '../SystemStarIcon';
import { getMainColor } from '../../utils/colorSemantics';
import { SectionToggleButton, SectionBody } from './InspectorUi';

export default function StarDetailView({ object, systemName, onBack }) {
  const { data: star, tooltipData } = object;
  const accentColor = getMainColor(tooltipData.color);
  const [expanded, setExpanded] = useState({ analysis: true, stats: true });

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
          <h2 className="text-base font-bold text-white leading-tight truncate">{star.name}</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{systemName} System</p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at left, ${accentColor}, transparent 70%)` }}
        />
        <SystemStarIcon starType={star.type} mode="inspector" radius={32} />
        <div>
          <div className="text-lg font-bold" style={{ color: accentColor }}>Class {star.type} Star</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{star.age} {star.ageUnit} Old</div>
        </div>
      </div>

      {/* Physical Analysis Section */}
      <div>
        <SectionToggleButton 
          icon={<Info size={12} />}
          label="Physical Analysis"
          isExpanded={expanded.analysis}
          onToggle={() => setExpanded(prev => ({ ...prev, analysis: !prev.analysis }))}
        />
        {expanded.analysis && (
          <SectionBody>
            <div className="p-2 space-y-3">
              <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-800/50">
                <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400">
                  <Thermometer size={16} />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Photosphere Temp</div>
                  <div className="text-xs font-medium text-slate-200">{tooltipData.temp}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-800/50">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                  <Database size={16} />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Relative Mass</div>
                  <div className="text-xs font-medium text-slate-200">{tooltipData.mass}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-800/50">
                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                  <History size={16} />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Stellar Lifespan</div>
                  <div className="text-xs font-medium text-slate-200">{tooltipData.typicalAge}</div>
                </div>
              </div>
            </div>
          </SectionBody>
        )}
      </div>
    </div>
  );
}
