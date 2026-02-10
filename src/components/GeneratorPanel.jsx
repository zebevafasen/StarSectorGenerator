import React, { useEffect, memo } from 'react';
import { Settings, RefreshCw, Hexagon } from 'lucide-react';
import generatorConfig from '../data/generator_config.json';
import { useSectorGenerator } from '../hooks/useSectorGenerator';
import GeometrySection from './generator/GeometrySection';
import DensitySection from './generator/DensitySection';
import SeedSection from './generator/SeedSection';
import ExportSection from './generator/ExportSection';

const { SECTOR_TEMPLATES, DENSITY_PRESETS } = generatorConfig;

function GeneratorPanel({ onGenerate, style, autoGenerateOnMount, initialSettings, onSettingsChange, systems, gridSize, onImport }) {
  const {
    pendingGridSize, setPendingGridSize,
    densityMode, setDensityMode,
    densityPreset, setDensityPreset,
    manualCount, setManualCount,
    rangeLimits, setRangeLimits,
    seed, setSeed,
    autoGenerateSeed, setAutoGenerateSeed,
    generate
  } = useSectorGenerator(onGenerate, initialSettings);

  const isAprilFools = new Date().getMonth() === 3 && new Date().getDate() === 1;

  useEffect(() => {
    if (!autoGenerateOnMount) return;
    generate();
  }, [autoGenerateOnMount, generate]);

  useEffect(() => {
    if (!onSettingsChange) return;
    onSettingsChange({
      pendingGridSize,
      densityMode,
      densityPreset,
      manualCount,
      rangeLimits,
      seed,
      autoGenerateSeed
    });
  }, [
    pendingGridSize,
    densityMode,
    densityPreset,
    manualCount,
    rangeLimits,
    seed,
    autoGenerateSeed,
    onSettingsChange
  ]);

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
        <GeometrySection 
          pendingGridSize={pendingGridSize} 
          setPendingGridSize={setPendingGridSize} 
          templates={SECTOR_TEMPLATES} 
        />

        <hr className="border-slate-800" />

        <DensitySection 
          densityMode={densityMode}
          setDensityMode={setDensityMode}
          densityPreset={densityPreset}
          setDensityPreset={setDensityPreset}
          manualCount={manualCount}
          setManualCount={setManualCount}
          rangeLimits={rangeLimits}
          setRangeLimits={setRangeLimits}
          pendingGridSize={pendingGridSize}
          presets={DENSITY_PRESETS}
        />

        <hr className="border-slate-800" />

        <SeedSection 
          seed={seed}
          setSeed={setSeed}
          autoGenerateSeed={autoGenerateSeed}
          setAutoGenerateSeed={setAutoGenerateSeed}
        />

        <hr className="border-slate-800" />

        <ExportSection 
          systems={systems} 
          gridSize={gridSize} 
          generatorSettings={{
            pendingGridSize,
            densityMode,
            densityPreset,
            manualCount,
            rangeLimits,
            seed,
            autoGenerateSeed
          }} 
          onImport={onImport} 
        />
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
