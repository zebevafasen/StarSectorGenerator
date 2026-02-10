import React from 'react';
import { clampInt } from '../../utils/helpers';
import generatorConfig from '../../data/generator_config.json';

const { LIMITS } = generatorConfig;

export default function DensitySection({
  densityMode, setDensityMode,
  densityPreset, setDensityPreset,
  manualCount, setManualCount,
  rangeLimits, setRangeLimits,
  pendingGridSize,
  presets
}) {
  const totalHexes = pendingGridSize.width * pendingGridSize.height;

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stellar Density</h3>

      <div className="flex bg-slate-800 p-1 rounded-lg">
        {['preset', 'manual', 'range'].map((mode) => (
          <button
            key={mode}
            onClick={() => setDensityMode(mode)}
            className={`flex-1 py-1 text-xs font-medium rounded capitalize transition-all ${densityMode === mode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {mode}
          </button>
        ))}
      </div>

      {densityMode === 'preset' && (
        <div className="space-y-2">
          <select
            value={densityPreset}
            onChange={(e) => setDensityPreset(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-md px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            {presets.map(preset => (
              <option key={preset.value} value={preset.value}>{preset.label}</option>
            ))}
          </select>
        </div>
      )}

      {densityMode === 'manual' && (
        <div className="space-y-2">
          <input
            type="range"
            min={LIMITS.MANUAL_COUNT.MIN}
            max={totalHexes}
            value={manualCount}
            onChange={(e) => setManualCount(parseInt(e.target.value))}
            className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{LIMITS.MANUAL_COUNT.MIN}</span>
            <span className="text-white font-mono">{manualCount}</span>
            <span>Max</span>
          </div>
        </div>
      )}

      {densityMode === 'range' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-8">Min</span>
            <input
              type="number" min={LIMITS.MANUAL_COUNT.MIN}
              value={rangeLimits.min}
              onChange={(e) => setRangeLimits(prev => ({
                ...prev,
                min: clampInt(e.target.value, LIMITS.MANUAL_COUNT.MIN, totalHexes, prev.min)
              }))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-8">Max</span>
            <input
              type="number" min={LIMITS.MANUAL_COUNT.MIN}
              value={rangeLimits.max}
              onChange={(e) => setRangeLimits(prev => ({
                ...prev,
                max: clampInt(e.target.value, LIMITS.MANUAL_COUNT.MIN, totalHexes, prev.max)
              }))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      )}
    </section>
  );
}
