import { useState, useCallback } from 'react';
import generatorConfig from '../data/generator_config.json';
import namesData from '../data/names.json';
import starData from '../data/stars.json';
import { createRNG, stringToSeed } from '../utils/rng';

const { DENSITY_PRESETS, GENERATION_WEIGHTS } = generatorConfig;
const { GREEK_ALPHABET, ROMAN_NUMERALS, SYSTEM_NAME_SUFFIXES, NAME_PREFIXES, NAME_SUFFIXES, STAR_NAME_SUFFIXES } = namesData;

// Helper to calculate target count based on density settings
const calculateTargetCount = (mode, preset, manual, limits, totalHexes, rng) => {
  if (mode === 'preset') {
    const p = DENSITY_PRESETS.find(x => x.value === preset);
    return Math.floor(totalHexes * (p ? p.rate : 0.30));
  } else if (mode === 'manual') {
    return Math.min(Math.max(0, manual), totalHexes);
  } else if (mode === 'range') {
    const min = Math.min(limits.min, totalHexes);
    const max = Math.min(Math.max(limits.max, min), totalHexes);
    return Math.floor(rng() * (max - min + 1)) + min;
  }
  return 0;
};

const PLANET_TYPES = ['Barren', 'Desert', 'Oceanic', 'Terran', 'Jungle', 'Ice', 'Lava', 'Gas Giant', 'Ice Giant'];

const generateSystemSkeleton = (q, r, rng) => {
  const system = {
    star: {},
    bodies: [],
    station: null
  };

  const planetCount = Math.floor(rng() * 7);
  for (let i = 0; i < planetCount; i++) {
    system.bodies.push({
      name: '',
      type: PLANET_TYPES[Math.floor(rng() * PLANET_TYPES.length)]
    });
  }

  if (rng() < 0.15) system.station = "Orbital Station";
  return system;
};

export function useSectorGenerator(onGenerate) {
  const [pendingGridSize, setPendingGridSize] = useState({ width: 8, height: 10 });
  const [densityMode, setDensityMode] = useState('preset');
  const [densityPreset, setDensityPreset] = useState('normal');
  const [manualCount, setManualCount] = useState(15);
  const [rangeLimits, setRangeLimits] = useState({ min: 5, max: 20 });
  const [seed, setSeed] = useState(() => Math.random().toString(36).substring(7).toUpperCase());
  const [autoGenerateSeed, setAutoGenerateSeed] = useState(false);

  const generateSector = useCallback((sectorQ, sectorR, config) => {
    const { 
      seed: rootSeed, 
      gridSize, 
      densityMode: mode, 
      densityPreset: preset, 
      manualCount: manual, 
      rangeLimits: limits 
    } = config;

    // Derive a unique seed for this sector based on the root seed and global coordinates
    const sectorSeedString = `${rootSeed}_${sectorQ}_${sectorR}`;
    const numericSeed = stringToSeed(sectorSeedString);
    const rng = createRNG(numericSeed);

    const totalHexes = gridSize.width * gridSize.height;
    const targetCount = calculateTargetCount(mode, preset, manual, limits, totalHexes, rng);

    const coords = [];
    for (let q = 0; q < gridSize.width; q++) {
      for (let r = 0; r < gridSize.height; r++) {
        coords.push({ q, r });
      }
    }

    for (let i = coords.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [coords[i], coords[j]] = [coords[j], coords[i]];
    }

    const newSystems = {};
    coords.slice(0, targetCount).forEach(({ q, r }) => {
      const system = generateSystemSkeleton(q, r, rng);

      // Fix/Regenerate Star Data using new stars.json structure
      // We perform a weighted random selection based on frequency
      const totalFreq = starData.reduce((sum, s) => sum + (s.data?.freq || 0), 0);
      let roll = rng() * totalFreq;
      let selectedStar = starData[starData.length - 1];
      for (const s of starData) {
        const freq = s.data?.freq || 0;
        roll -= freq;
        if (roll <= 0) {
          selectedStar = s;
          break;
        }
      }
      
      // Apply the correct data from the new JSON structure
      system.star.type = selectedStar.type;
      system.star.colors = selectedStar.color;
      system.star.desc = selectedStar.class?.name;

      // Black Holes and Neutron Stars should not have planets
      if (system.star.type === 'Black Hole' || system.star.type === 'Neutron') {
        system.bodies = [];
      }

      // Generate Age based on star type range
      const ageRange = selectedStar.class?.ageRange;
      if (ageRange) {
        const age = rng() * (ageRange.max - ageRange.min) + ageRange.min;
        system.star.age = parseFloat(age.toFixed(2));
        system.star.ageUnit = ageRange.unit;
      } else {
        system.star.age = 0;
        system.star.ageUnit = 'Unknown';
      }

      // Check neighbors for shared name prefix to create "clusters"
      const neighbors = [
        { q: q, r: r - 1 }, 
        { q: q, r: r + 1 },
        { q: q - 1, r: r }, 
        { q: q + 1, r: r },
        { q: q - 1, r: q % 2 ? r + 1 : r - 1 }, 
        { q: q + 1, r: q % 2 ? r + 1 : r - 1 }
      ];

      const neighborPrefixes = neighbors
        .map(n => newSystems[`${n.q},${n.r}`])
        .filter(s => s && s.namePrefix)
        .map(s => s.namePrefix);

      let prefix;
      if (neighborPrefixes.length > 0 && rng() < GENERATION_WEIGHTS.prefixClustering) {
        prefix = neighborPrefixes[Math.floor(rng() * neighborPrefixes.length)];
      } else {
        prefix = NAME_PREFIXES[Math.floor(rng() * NAME_PREFIXES.length)];
      }

      const nameSuffix = NAME_SUFFIXES[Math.floor(rng() * NAME_SUFFIXES.length)];
      system.namePrefix = prefix;
      system.name = prefix + nameSuffix;

      const starSuffix = STAR_NAME_SUFFIXES[Math.floor(rng() * STAR_NAME_SUFFIXES.length)];
      system.star = { ...system.star, name: `${system.name} ${starSuffix}` };

      if (rng() < GENERATION_WEIGHTS.systemSuffix) {
        const suffix = SYSTEM_NAME_SUFFIXES[Math.floor(rng() * SYSTEM_NAME_SUFFIXES.length)];
        system.name = `${system.name} ${suffix}`;
      }

      if (system.bodies && system.bodies.length > 0) {
        const useGreek = rng() < GENERATION_WEIGHTS.planetGreekNaming;
        const suffixes = useGreek ? GREEK_ALPHABET : ROMAN_NUMERALS;

        system.bodies.forEach((body, index) => {
          if (index < suffixes.length) {
            body.name = suffixes[index];
          }
        });
      }

      // Attach coordinate metadata for future multi-sector support
      system.globalLocation = { sectorQ, sectorR };
      system.localLocation = { q, r };

      newSystems[`${q},${r}`] = system;
    });

    return newSystems;
  }, []);

  const generate = useCallback(() => {
    let currentSeed = seed;
    if (autoGenerateSeed) {
      currentSeed = Math.random().toString(36).substring(7).toUpperCase();
      setSeed(currentSeed);
    }

    const config = {
      seed: currentSeed,
      gridSize: pendingGridSize,
      densityMode,
      densityPreset,
      manualCount,
      rangeLimits
    };

    // Generate the default sector at global coordinates (0,0)
    const newSystems = generateSector(0, 0, config);

    onGenerate(newSystems, pendingGridSize);
  }, [seed, autoGenerateSeed, pendingGridSize, densityMode, densityPreset, manualCount, rangeLimits, onGenerate, generateSector]);

  return {
    pendingGridSize, setPendingGridSize,
    densityMode, setDensityMode,
    densityPreset, setDensityPreset,
    manualCount, setManualCount,
    rangeLimits, setRangeLimits,
    seed, setSeed,
    autoGenerateSeed, setAutoGenerateSeed,
    generate,
    generateSector
  };
}