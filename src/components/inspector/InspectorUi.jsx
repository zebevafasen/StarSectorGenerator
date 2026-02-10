import React from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';

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

export function EntityCard({ leftIcon, title, subtitle, onClick }) {
  const isClickable = Boolean(onClick);

  return (
    <div 
      onClick={onClick}
      className={`bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center justify-between group transition-colors ${isClickable ? 'cursor-pointer hover:border-blue-500/50 hover:bg-slate-800' : 'hover:border-blue-500/30'}`}
    >
      <div className="flex items-center gap-3">
        {leftIcon}
        <div>
          <div className="text-sm font-medium text-slate-300">{title}</div>
          {subtitle}
        </div>
      </div>
      {isClickable && <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />}
    </div>
  );
}

export function DetailHeader({ title, subtitle, onBack }) {
  return (
    <div className="p-3 bg-slate-800/20 border border-slate-800 rounded-lg flex items-center gap-3">
      <button 
        onClick={onBack}
        className="p-1.5 hover:bg-slate-700 rounded-md text-blue-400 transition-colors"
        title="Back to System"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-white leading-tight truncate">{title}</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );
}

export function DetailHero({ icon, title, subtitle, color, badge }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle at left, ${color}, transparent 70%)` }}
      />
      {icon}
      <div>
        <div className="text-lg font-bold" style={{ color: color }}>{title}</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</div>
      </div>
      {badge && <div className="ml-auto">{badge}</div>}
    </div>
  );
}

export function InfoItem({ icon, label, value, subValue, colorClass }) {
  return (
    <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
      <div className={`flex items-center gap-1.5 ${colorClass} mb-1`}>
        {React.cloneElement(icon, { size: 10 })}
        <span className="text-[9px] font-bold uppercase">{label}</span>
      </div>
      <div className="text-xs font-medium text-slate-200">{value}</div>
      {subValue && <div className="text-[9px] text-slate-500 truncate">{subValue}</div>}
    </div>
  );
}

export function InspectorSection({ 
  icon, 
  title, 
  count, 
  expanded, 
  onToggle, 
  children, 
  emptyMessage = "No items detected." 
}) {
  const hasItems = count > 0;
  
  return (
    <div>
      <SectionToggleButton
        icon={icon}
        label={`${title} (${count})`}
        isExpanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <SectionBody>
          {hasItems ? (
            <div className="space-y-2">
              {children}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic text-center py-2">{emptyMessage}</div>
          )}
        </SectionBody>
      )}
    </div>
  );
}

