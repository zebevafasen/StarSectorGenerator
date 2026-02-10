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
  autoGenerateSeed: false
};

export function useSectorGenerator(onGenerate, initialSettings = {}) {
  const [pendingGridSize, setPendingGridSize] = useState(initialSettings.pendingGridSize || DEFAULT_GENERATOR_SETTINGS.pendingGridSize);
  const [densityMode, setDensityMode] = useState(initialSettings.densityMode || DEFAULT_GENERATOR_SETTINGS.densityMode);
  const [densityPreset, setDensityPreset] = useState(initialSettings.densityPreset || DEFAULT_GENERATOR_SETTINGS.densityPreset);
  const [manualCount, setManualCount] = useState(initialSettings.manualCount ?? DEFAULT_GENERATOR_SETTINGS.manualCount);
  const [rangeLimits, setRangeLimits] = useState(initialSettings.rangeLimits || DEFAULT_GENERATOR_SETTINGS.rangeLimits);
  const [distributionMode, setDistributionMode] = useState(initialSettings.distributionMode || DEFAULT_GENERATOR_SETTINGS.distributionMode);
  const [seed, setSeed] = useState(() => initialSettings.seed || Math.random().toString(36).substring(7).toUpperCase());
  const [autoGenerateSeed, setAutoGenerateSeed] = useState(initialSettings.autoGenerateSeed ?? DEFAULT_GENERATOR_SETTINGS.autoGenerateSeed);

  // Sync with initialSettings ONLY when they change from an external source (like Import)
  const [prevInitialSettings, setPrevInitialSettings] = useState(initialSettings);

  if (initialSettings !== prevInitialSettings) {
    if (initialSettings.pendingGridSize) {
      const next = initialSettings.pendingGridSize;
      if (next.width !== pendingGridSize.width || next.height !== pendingGridSize.height) {
        setPendingGridSize(next);
      }
    }
    
    if (initialSettings.densityMode !== undefined && initialSettings.densityMode !== densityMode) {
      setDensityMode(initialSettings.densityMode);
    }
    
    if (initialSettings.densityPreset !== undefined && initialSettings.densityPreset !== densityPreset) {
      setDensityPreset(initialSettings.densityPreset);
    }
    
    if (initialSettings.manualCount !== undefined && initialSettings.manualCount !== manualCount) {
      setManualCount(initialSettings.manualCount);
    }
    
    if (initialSettings.rangeLimits) {
      const next = initialSettings.rangeLimits;
      if (next.min !== rangeLimits.min || next.max !== rangeLimits.max) {
        setRangeLimits(next);
      }
    }

    if (initialSettings.distributionMode !== undefined && initialSettings.distributionMode !== distributionMode) {
      setDistributionMode(initialSettings.distributionMode);
    }
    
    if (initialSettings.seed !== undefined && initialSettings.seed !== seed) {
      setSeed(initialSettings.seed);
    }
    
    if (initialSettings.autoGenerateSeed !== undefined && initialSettings.autoGenerateSeed !== autoGenerateSeed) {
      setAutoGenerateSeed(initialSettings.autoGenerateSeed);
    }

    setPrevInitialSettings(initialSettings);
  }

  const generate = useCallback(() => {
    let currentSeed = seed;
    if (autoGenerateSeed) {
      currentSeed = Math.random().toString(36).substring(7).toUpperCase();
      setSeed(currentSeed);
    }

    const newSystems = generateSector({
      seed: currentSeed,
      gridSize: pendingGridSize,
      densityMode,
      densityPreset,
      manualCount,
      rangeLimits,
      distributionMode,
      sectorQ: 0,
      sectorR: 0
    });

    onGenerate(newSystems, pendingGridSize);
  }, [seed, autoGenerateSeed, pendingGridSize, densityMode, densityPreset, manualCount, rangeLimits, distributionMode, onGenerate]);

  return {
    pendingGridSize,
    setPendingGridSize,
    densityMode,
    setDensityMode,
    densityPreset,
    setDensityPreset,
    manualCount,
    setManualCount,
    rangeLimits,
    setRangeLimits,
    distributionMode,
    setDistributionMode,
    seed,
    setSeed,
    autoGenerateSeed,
    setAutoGenerateSeed,
    generate
  };
}
