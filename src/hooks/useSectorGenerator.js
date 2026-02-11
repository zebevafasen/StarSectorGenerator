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

  // Render-time adjustment: Only sync if initialSettings actually changes values
  const [prevInitialSettingsStr, setPrevInitialSettingsStr] = useState(() => JSON.stringify(initialSettings));
  const currentInitialSettingsStr = JSON.stringify(initialSettings);

  if (currentInitialSettingsStr !== prevInitialSettingsStr) {
    setSettings(prev => ({
      ...prev,
      ...initialSettings,
      pendingGridSize: initialSettings.pendingGridSize || prev.pendingGridSize,
      rangeLimits: initialSettings.rangeLimits || prev.rangeLimits,
      sectorCoords: initialSettings.sectorCoords || prev.sectorCoords
    }));
    setPrevInitialSettingsStr(currentInitialSettingsStr);
  }

  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const generate = useCallback(() => {
    let currentSeed = settings.seed;
    if (settings.autoGenerateSeed) {
      currentSeed = Math.random().toString(36).substring(7).toUpperCase();
    }

    const { systems: newSystems, biome } = generateSector({
      ...settings,
      gridSize: settings.pendingGridSize,
      seed: currentSeed,
      sectorQ: 0,
      sectorR: 0
    });

    // Update local state with the new seed and reset coords
    setSettings(prev => ({
      ...prev,
      seed: currentSeed,
      sectorCoords: { q: 0, r: 0 }
    }));

    onGenerate(newSystems, settings.pendingGridSize, { q: 0, r: 0 }, true, biome);
  }, [settings, onGenerate]);

  const regenerate = useCallback((targetCoords) => {
    const coords = targetCoords || settings.sectorCoords;
    const { systems: newSystems, biome } = generateSector({
      ...settings,
      gridSize: settings.pendingGridSize,
      seed: settings.seed,
      sectorQ: coords.q,
      sectorR: coords.r
    });

    onGenerate(newSystems, settings.pendingGridSize, coords, false, biome);
  }, [settings, onGenerate]);

  return {
    setPendingGridSize: (val) => setSettings(prev => ({ ...prev, pendingGridSize: typeof val === 'function' ? val(prev.pendingGridSize) : val })),
    setDensityMode: (val) => setSettings(prev => ({ ...prev, densityMode: val })),
    setDensityPreset: (val) => setSettings(prev => ({ ...prev, densityPreset: val })),
    setManualCount: (val) => setSettings(prev => ({ ...prev, manualCount: typeof val === 'function' ? val(prev.manualCount) : val })),
    setRangeLimits: (val) => setSettings(prev => ({ ...prev, rangeLimits: typeof val === 'function' ? val(prev.rangeLimits) : val })),
    setDistributionMode: (val) => setSettings(prev => ({ ...prev, distributionMode: val })),
    setSeed: (val) => setSettings(prev => ({ ...prev, seed: typeof val === 'function' ? val(prev.seed) : val })),
    setAutoGenerateSeed: (val) => setSettings(prev => ({ ...prev, autoGenerateSeed: typeof val === 'function' ? val(prev.autoGenerateSeed) : val })),
    
    generate,
    regenerate,
    settings,
    updateSettings
  };
}
