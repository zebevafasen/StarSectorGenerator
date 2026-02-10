import React, { useRef } from 'react';
import { clampInt } from '../../utils/helpers';
import generatorConfig from '../../data/generator_config.json';

const { LIMITS } = generatorConfig;

export default function GeometrySection({ pendingGridSize, setPendingGridSize, templates }) {
  const widthInputRef = useRef(null);
  const templateValue = `${pendingGridSize.width}x${pendingGridSize.height}`;
  const hasTemplateMatch = templates.some((template) => template.value === templateValue);

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sector Geometry</h3>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Size Templates</label>
        <select
          className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-md px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          value={hasTemplateMatch ? templateValue : 'custom'}
          onChange={(e) => {
            if (e.target.value === 'custom') return;
            const [w, h] = e.target.value.split('x').map(Number);
            setPendingGridSize({ width: w, height: h });
            setTimeout(() => widthInputRef.current?.select(), 0);
          }}
        >
          <option value="custom">Custom</option>
          {templates.map(template => (
            <option key={template.value} value={template.value}>{template.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Width</label>
          <input
            ref={widthInputRef}
            type="number"
            min={LIMITS.GRID.MIN} max={LIMITS.GRID.MAX}
            value={pendingGridSize.width}
            onChange={(e) => setPendingGridSize(prev => ({
              ...prev,
              width: clampInt(e.target.value, LIMITS.GRID.MIN, LIMITS.GRID.MAX, prev.width)
            }))}
            onFocus={(e) => e.target.select()}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Height</label>
          <input
            type="number"
            min={LIMITS.GRID.MIN} max={LIMITS.GRID.MAX}
            value={pendingGridSize.height}
            onChange={(e) => setPendingGridSize(prev => ({
              ...prev,
              height: clampInt(e.target.value, LIMITS.GRID.MIN, LIMITS.GRID.MAX, prev.height)
            }))}
            onFocus={(e) => e.target.select()}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
          />
        </div>
      </div>
    </section>
  );
}
