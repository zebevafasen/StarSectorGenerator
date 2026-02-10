import { useState, useCallback, useEffect } from 'react';
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
  useEffect(() => {
    if (!initialSettings || Object.keys(initialSettings).length === 0) return;

    // We use functional updates or simple checks to avoid unnecessary triggers
    setPendingGridSize(prev => {
      const next = initialSettings.pendingGridSize;
      return (next && (next.width !== prev.width || next.height !== prev.height)) ? next : prev;
    });
    
    setDensityMode(prev => initialSettings.densityMode !== undefined && initialSettings.densityMode !== prev ? initialSettings.densityMode : prev);
    setDensityPreset(prev => initialSettings.densityPreset !== undefined && initialSettings.densityPreset !== prev ? initialSettings.densityPreset : prev);
    setManualCount(prev => initialSettings.manualCount !== undefined && initialSettings.manualCount !== prev ? initialSettings.manualCount : prev);
    
    setRangeLimits(prev => {
      const next = initialSettings.rangeLimits;
      return (next && (next.min !== prev.min || next.max !== prev.max)) ? next : prev;
    });

    setDistributionMode(prev => initialSettings.distributionMode !== undefined && initialSettings.distributionMode !== prev ? initialSettings.distributionMode : prev);
    setSeed(prev => initialSettings.seed !== undefined && initialSettings.seed !== prev ? initialSettings.seed : prev);
    setAutoGenerateSeed(prev => initialSettings.autoGenerateSeed !== undefined && initialSettings.autoGenerateSeed !== prev ? initialSettings.autoGenerateSeed : prev);
  }, [initialSettings]);

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
