import generatorConfig from '../data/generator_config.json';
import { createRNG, stringToSeed } from '../utils/rng';
import { createWeightedStarPicker } from '../utils/starData';
import { generateSystemAtCoordinate } from './systemGeneration';
import { generatePOIAtCoordinate } from './poiGeneration';
import { SYSTEM_GENERATION } from './generationConstants';

const { DENSITY_PRESETS } = generatorConfig;

export const calculateTargetCount = (mode, preset, manual, limits, totalHexes, rng) => {
  if (mode === 'preset') {
    const presetData = DENSITY_PRESETS.find((item) => item.value === preset);
    return Math.floor(totalHexes * (presetData ? presetData.rate : 0.3));
  }

  if (mode === 'manual') {
    return Math.min(Math.max(0, manual), totalHexes);
  }

  if (mode === 'range') {
    const min = Math.min(limits.min, totalHexes);
    const max = Math.min(Math.max(limits.max, min), totalHexes);
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  return 0;
};

const getShuffledCoordinates = (width, height, rng) => {
  const coords = [];
  for (let q = 0; q < width; q++) {
    for (let r = 0; r < height; r++) {
      coords.push({ q, r });
    }
  }

  for (let i = coords.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [coords[i], coords[j]] = [coords[j], coords[i]];
  }

  return coords;
};

const getClusteredCoordinates = (width, height, rng) => {
  const coords = [];
  for (let q = 0; q < width; q++) {
    for (let r = 0; r < height; r++) {
      coords.push({ q, r });
    }
  }

  // Reduce centers slightly (2-4) to allow for bigger gaps
  const numCenters = Math.floor(rng() * 3) + 2;
  const centers = [];
  
  // Increase minimum distance significantly (50% of the map size)
  const minCenterDist = Math.max(width, height) * 0.5;

  for (let i = 0; i < numCenters * 5; i++) { // More attempts to find distant spots
    if (centers.length >= numCenters) break;
    
    const candidate = {
      q: Math.floor(rng() * width),
      r: Math.floor(rng() * height)
    };

    const tooClose = centers.some(c => {
      const dq = c.q - candidate.q;
      const dr = c.r - candidate.r;
      return Math.sqrt(dq * dq + dr * dr) < minCenterDist;
    });

    if (!tooClose) {
      centers.push(candidate);
    }
  }

  const weightedCoords = coords.map(coord => {
    let maxWeight = 0;
    for (const center of centers) {
      const dq = center.q - coord.q;
      const dr = center.r - coord.r;
      const dist = Math.sqrt(dq * dq + dr * dr);
      
      // Even sharper falloff (0.3^dist) makes the clusters extremely dense
      // and the space between them much "emptier"
      const weight = Math.pow(0.3, dist);
      maxWeight = Math.max(maxWeight, weight);
    }
    return { coord, weight: maxWeight };
  });

  // Weighted sort
  weightedCoords.sort((a, b) => (rng() * b.weight) - (rng() * a.weight));

  return weightedCoords.map(item => item.coord);
};

export const generateSector = ({
  seed,
  gridSize,
  densityMode,
  densityPreset,
  manualCount,
  rangeLimits,
  distributionMode = 'uniform',
  sectorQ = 0,
  sectorR = 0
}) => {
  const sectorSeedString = `${seed}_${sectorQ}_${sectorR}`;
  const numericSeed = stringToSeed(sectorSeedString);
  const rng = createRNG(numericSeed);

  const totalHexes = gridSize.width * gridSize.height;
  const targetCount = calculateTargetCount(densityMode, densityPreset, manualCount, rangeLimits, totalHexes, rng);

  const coords = distributionMode === 'clustered' 
    ? getClusteredCoordinates(gridSize.width, gridSize.height, rng)
    : getShuffledCoordinates(gridSize.width, gridSize.height, rng);

  const pickStar = createWeightedStarPicker();
  const systemsByCoord = {};

  const systemCoords = coords.slice(0, targetCount);
  const emptyCoords = coords.slice(targetCount);

  systemCoords.forEach(({ q, r }) => {
    systemsByCoord[`${q},${r}`] = {
      ...generateSystemAtCoordinate({
        q,
        r,
        rng,
        systemsByCoord,
        pickStar,
        sectorQ,
        sectorR
      }),
      isSystem: true
    };
  });

  emptyCoords.forEach(({ q, r }) => {
    if (rng() < SYSTEM_GENERATION.POI_CHANCE) {
      systemsByCoord[`${q},${r}`] = generatePOIAtCoordinate(rng, q, r, sectorQ, sectorR);
    }
  });

  return systemsByCoord;
};
