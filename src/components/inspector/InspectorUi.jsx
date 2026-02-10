import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function SectionToggleButton({ icon, label, isExpanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-1.5 hover:bg-slate-800 transition-colors border-slate-800 bg-slate-900/50 ${isExpanded ? 'rounded-t-lg border-x border-t' : 'rounded-lg border'}`}
    >
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
        {icon} {label}
      </div>
      {isExpanded ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
    </button>
  );
}

export function SectionBody({ children }) {
  return (
    <div className="px-1 pb-1 border-x border-b border-slate-800 rounded-b-lg bg-slate-900/30 animate-in fade-in slide-in-from-top-1 duration-200">
      {children}
    </div>
  );
}

export function TooltipTag({ children, color, onTooltipEnter, onTooltipMove, onTooltipLeave, tooltipData }) {
  const fallbackColor = color || '#64748b';

  return (
    <span
      className="inline-block cursor-help transition-colors border-b border-dotted"
      style={{ color: fallbackColor, borderColor: fallbackColor }}
      onMouseEnter={(event) => onTooltipEnter(event, tooltipData)}
      onMouseMove={onTooltipMove}
      onMouseLeave={onTooltipLeave}
    >
      {children}
    </span>
  );
}

export function EntityCard({ leftIcon, title, subtitle }) {
  return (
    <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
      <div className="flex items-center gap-3">
        {leftIcon}
        <div>
          <div className="text-sm font-medium text-slate-300">{title}</div>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
