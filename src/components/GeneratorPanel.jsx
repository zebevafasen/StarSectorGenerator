import React, { useEffect, useRef, memo } from 'react';
import { Settings, RefreshCw, Hexagon, Dices } from 'lucide-react';
import generatorConfig from '../data/generator_config.json';
import { useSectorGenerator } from '../hooks/useSectorGenerator';

const { SECTOR_TEMPLATES, DENSITY_PRESETS } = generatorConfig;

const clampInt = (value, min, max, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

function GeneratorPanel({ onGenerate, style }) {
  const {
    pendingGridSize, setPendingGridSize,
    densityMode, setDensityMode,
    densityPreset, setDensityPreset,
    manualCount, setManualCount,
    rangeLimits, setRangeLimits,
    seed, setSeed,
    autoGenerateSeed, setAutoGenerateSeed,
    generate
  } = useSectorGenerator(onGenerate);

  const widthInputRef = useRef(null);
  const isAprilFools = new Date().getMonth() === 3 && new Date().getDate() === 1;

  // Initial generation on mount
  useEffect(() => {
    generate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside 
      className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 shadow-xl z-20"
      style={style}
    >
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Hexagon className="w-6 h-6 text-white fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-blue-100">
            {isAprilFools ? "SEX-HECTOR" : "HEX-SECTOR"} <span className="text-blue-500">GEMINI</span>
          </h1>
        </div>
      </div>

      <div className="p-3 border-b border-slate-800 bg-slate-800/30">
        <h2 className="text-sm font-bold text-blue-400 uppercase flex items-center gap-2">
          <Settings size={16} /> Generator Settings
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Grid Size Section */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sector Geometry</h3>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Size Templates</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-md px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                setPendingGridSize({ width: w, height: h });
                setTimeout(() => widthInputRef.current?.select(), 0);
              }}
              defaultValue="8x10"
            >
              {SECTOR_TEMPLATES.map(template => (
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
                min="2" max="50"
                value={pendingGridSize.width}
                onChange={(e) => setPendingGridSize(prev => ({
                  ...prev,
                  width: clampInt(e.target.value, 2, 50, prev.width)
                }))}
                onFocus={(e) => e.target.select()}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Height</label>
              <input
                type="number"
                min="2" max="50"
                value={pendingGridSize.height}
                onChange={(e) => setPendingGridSize(prev => ({
                  ...prev,
                  height: clampInt(e.target.value, 2, 50, prev.height)
                }))}
                onFocus={(e) => e.target.select()}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-800" />

        {/* Density Section */}
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
                {DENSITY_PRESETS.map(preset => (
                  <option key={preset.value} value={preset.value}>{preset.label}</option>
                ))}
              </select>
            </div>
          )}

          {densityMode === 'manual' && (
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={pendingGridSize.width * pendingGridSize.height}
                value={manualCount}
                onChange={(e) => setManualCount(parseInt(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0</span>
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
                  type="number" min="0"
                  value={rangeLimits.min}
                  onChange={(e) => setRangeLimits(prev => ({
                    ...prev,
                    min: clampInt(e.target.value, 0, pendingGridSize.width * pendingGridSize.height, prev.min)
                  }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-8">Max</span>
                <input
                  type="number" min="0"
                  value={rangeLimits.max}
                  onChange={(e) => setRangeLimits(prev => ({
                    ...prev,
                    max: clampInt(e.target.value, 0, pendingGridSize.width * pendingGridSize.height, prev.max)
                  }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </section>

        <hr className="border-slate-800" />

        {/* Seed Section */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seed</h3>
          <div className="flex gap-1">
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none font-mono uppercase text-slate-200"
            />
            <button
              onClick={() => setSeed(Math.random().toString(36).substring(7).toUpperCase())}
              className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors"
              title="Randomize Seed"
            >
              <Dices size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-seed"
              checked={autoGenerateSeed}
              onChange={(e) => setAutoGenerateSeed(e.target.checked)}
              className="accent-blue-600 w-3.5 h-3.5 bg-slate-800 border-slate-700 rounded cursor-pointer"
            />
            <label htmlFor="auto-seed" className="text-xs text-slate-400 cursor-pointer select-none">
              Randomize on Generate
            </label>
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <button
          onClick={generate}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} /> Generate Sector
        </button>
      </div>
    </aside>
  );
}

export default memo(GeneratorPanel);
