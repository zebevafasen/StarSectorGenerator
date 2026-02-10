import { useState, useCallback } from 'react';
import { generateSector } from '../generation/sectorGeneration';
import generatorConfig from '../data/generator_config.json';

const { DEFAULTS } = generatorConfig;

export const DEFAULT_GENERATOR_SETTINGS = {
  pendingGridSize: DEFAULTS.GRID_SIZE,
  densityMode: 'preset',
  densityPreset: 'standard',
  manualCount: DEFAULTS.MANUAL_COUNT,
  rangeLimits: DEFAULTS.RANGE,
  distributionMode: 'uniform',
  seed: '',
  autoGenerateSeed: false,
  sectorCoords: { q: 0, r: 0 }
};

export function useSectorGenerator(onGenerate, initialSettings = {}) {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_GENERATOR_SETTINGS,
    ...initialSettings,
    seed: initialSettings.seed || Math.random().toString(36).substring(7).toUpperCase()
  }));

  // Sync with initialSettings ONLY when they change from an external source (like Import)
  const [prevInitialSettings, setPrevInitialSettings] = useState(initialSettings);

  if (initialSettings !== prevInitialSettings && initialSettings !== settings) {
    setSettings(prev => ({
      ...prev,
      ...initialSettings,
      pendingGridSize: initialSettings.pendingGridSize || prev.pendingGridSize,
      rangeLimits: initialSettings.rangeLimits || prev.rangeLimits,
      sectorCoords: initialSettings.sectorCoords || prev.sectorCoords
    }));
    setPrevInitialSettings(initialSettings);
  }

  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const hasChange = Object.entries(updates).some(([key, value]) => prev[key] !== value);
      if (!hasChange) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  const generate = useCallback(() => {
    let currentSeed = settings.seed;
    if (settings.autoGenerateSeed) {
      currentSeed = Math.random().toString(36).substring(7).toUpperCase();
      // We update the seed in state but use the new seed immediately for generation
      updateSettings({ seed: currentSeed });
    }

    const newSystems = generateSector({
      ...settings,
      gridSize: settings.pendingGridSize,
      seed: currentSeed,
      sectorQ: settings.sectorCoords.q,
      sectorR: settings.sectorCoords.r
    });

    onGenerate(newSystems, settings.pendingGridSize);
  }, [settings, onGenerate, updateSettings]);

  return {
    // Expose individual properties for backward compatibility (or convenience)
    pendingGridSize: settings.pendingGridSize,
    setPendingGridSize: (val) => updateSettings({ pendingGridSize: typeof val === 'function' ? val(settings.pendingGridSize) : val }),
    
    densityMode: settings.densityMode,
    setDensityMode: (val) => updateSettings({ densityMode: val }),
    
    densityPreset: settings.densityPreset,
    setDensityPreset: (val) => updateSettings({ densityPreset: val }),
    
    manualCount: settings.manualCount,
    setManualCount: (val) => updateSettings({ manualCount: typeof val === 'function' ? val(settings.manualCount) : val }),
    
    rangeLimits: settings.rangeLimits,
    setRangeLimits: (val) => updateSettings({ rangeLimits: typeof val === 'function' ? val(settings.rangeLimits) : val }),
    
    distributionMode: settings.distributionMode,
    setDistributionMode: (val) => updateSettings({ distributionMode: val }),
    
    seed: settings.seed,
    setSeed: (val) => updateSettings({ seed: typeof val === 'function' ? val(settings.seed) : val }),
    
    autoGenerateSeed: settings.autoGenerateSeed,
    setAutoGenerateSeed: (val) => updateSettings({ autoGenerateSeed: typeof val === 'function' ? val(settings.autoGenerateSeed) : val }),
    
    generate,
    settings,
    updateSettings
  };
}
