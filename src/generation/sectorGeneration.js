import generatorConfig from '../data/generator_config.json';
import systemConfig from '../data/system_generation_config.json';
import { createRNG, stringToSeed } from '../utils/rng';
import { createWeightedStarPicker } from '../utils/starData';
import { generateSystemAtCoordinate } from './systemGeneration';
import { generatePOIAtCoordinate, getJumpGateLink } from './poiGeneration';
import { SYSTEM_GENERATION } from './generationConstants';
import { getBiomeForSector } from '../utils/biomeUtils';

const { DENSITY_PRESETS } = generatorConfig;
const { CORE_SYSTEM_SETTINGS } = systemConfig;

/**
 * Phase One: Macro-Placement
 * Deterministically calculates the "Landing Site" for early explorers.
 */
export const calculateIdealCoreHex = (sq, sr, width, height, seed) => {
  const midQ = Math.floor(width / 2);
  const midR = Math.floor(height / 2);

  // Drift Logic: Drift towards expansion front
  const driftQ = Math.sign(sq) * Math.min(Math.abs(sq), 3) * (width * 0.1);
  const driftR = Math.sign(sr) * Math.min(Math.abs(sr), 3) * (height * 0.1);

  // Phase One Variance: Add jitter based on the seed so it's not a perfect pattern
  const jitterRng = createRNG(stringToSeed(`${seed}_core_jitter_${sq}_${sr}`));
  const jitterQ = Math.floor(jitterRng() * 5) - 2; // -2 to +2
  const jitterR = Math.floor(jitterRng() * 5) - 2; // -2 to +2

  const targetQ = Math.max(0, Math.min(width - 1, Math.round(midQ + driftQ + jitterQ)));
  const targetR = Math.max(0, Math.min(height - 1, Math.round(midR + driftR + jitterR)));

  return { q: targetQ, r: targetR };
};

export const calculateTargetCount = (mode, preset, manual, limits, totalHexes, rng, distributionMode) => {
  // Phase Two: Fixed Density for Clustered mode
  if (distributionMode === 'clustered') {
    return Math.floor(totalHexes * (CORE_SYSTEM_SETTINGS?.CLUSTERED_DENSITY_RATE || 0.2));
  }

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

/**
 * Phase Two: Clustering Overhaul
 * Forces the Core Hex as the primary anchor.
 */
const getClusteredCoordinatesForCore = (width, height, rng, coreHex) => {
  const coords = [];
  for (let q = 0; q < width; q++) {
    for (let r = 0; r < height; r++) {
      coords.push({ q, r });
    }
  }

  const numCenters = Math.floor(rng() * 3) + 1; // 1-3 additional centers
  const centers = [{ ...coreHex, isCore: true }];
  
  const minCenterDist = Math.max(width, height) * 0.4;

  for (let i = 0; i < numCenters * 5; i++) {
    if (centers.length >= numCenters + 1) break;
    
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
      
      // Phase Two: Gravity Boost for Core Center
      const falloff = center.isCore ? 0.5 : 0.3; 
      const weight = Math.pow(falloff, dist);
      maxWeight = Math.max(maxWeight, weight);
    }
    return { coord, weight: maxWeight };
  });

  weightedCoords.sort((a, b) => (rng() * b.weight) - (rng() * a.weight));

  return {
    coords: weightedCoords.map(item => item.coord),
    centers
  };
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

  const biome = getBiomeForSector(sectorQ, sectorR, seed);

  const totalHexes = gridSize.width * gridSize.height;
  let targetCount = calculateTargetCount(densityMode, densityPreset, manualCount, rangeLimits, totalHexes, rng, distributionMode);

  // Apply biome density multiplier
  targetCount = Math.round(targetCount * (biome.densityMultiplier || 1.0));

  // Phase One: Calculate Core Hex
  const coreHex = calculateIdealCoreHex(sectorQ, sectorR, gridSize.width, gridSize.height, seed);

  // Phase Two: Use Core-based clustering if enabled
  let coords;
  let clusterCenters = [];

  if (distributionMode === 'clustered') {
    const result = getClusteredCoordinatesForCore(gridSize.width, gridSize.height, rng, coreHex);
    coords = result.coords;
    clusterCenters = result.centers;
  } else {
    coords = getShuffledCoordinates(gridSize.width, gridSize.height, rng);
  }

  const pickStar = createWeightedStarPicker(biome.starWeights);

  // Phase Three: Filtered picker for Core Systems (No Black Holes/Neutrons)
  const pickCoreStar = (r) => {
    let star = pickStar(r);
    let attempts = 0;
    // Keep rolling if we hit a banned type
    while ((star.type === 'Black Hole' || star.type === 'Neutron') && attempts < 10) {
      star = pickStar(r);
      attempts++;
    }
    return star;
  };

  const systemsByCoord = {};

  // Phase Two: System Guarantee for Core Hex
  systemsByCoord[`${coreHex.q},${coreHex.r}`] = {
    ...generateSystemAtCoordinate({
      q: coreHex.q,
      r: coreHex.r,
      rng,
      systemsByCoord,
      pickStar: pickCoreStar, // Use the safe picker
      sectorQ,
      sectorR,
      isCore: true // Pass the flag to trigger Phase Three bending
    }),
    isSystem: true,
    isCore: true // Preserve for UI
  };

  // 1. Check for Stable Network Gate
  const gateLink = getJumpGateLink(seed, sectorQ, sectorR);
  
  if (gateLink) {
    const networkSeed = stringToSeed(`${seed}_gate_loc_${sectorQ}_${sectorR}`);
    const netRng = createRNG(networkSeed);
    const coordIndex = Math.floor(netRng() * coords.length);
    const gateCoord = coords.splice(coordIndex, 1)[0];
    
    if (gateCoord && !systemsByCoord[`${gateCoord.q},${gateCoord.r}`]) {
      const dest = gateLink.destination;
      systemsByCoord[`${gateCoord.q},${gateCoord.r}`] = {
        name: `Active Jump-Gate`,
        type: 'Jump-Gate',
        description: `A massive, active structure connecting Sector [${sectorQ},${sectorR}] to [${dest.q},${dest.r}]. It hums with immense power, its internal rings spinning in a blur of light.`,
        color: '#2563eb',
        risk: 'High',
        state: 'Active',
        isPOI: true,
        location: gateCoord,
        globalLocation: { sectorQ, sectorR },
        destination: dest
      };
    }
  }

  // 2. Generate standard systems
  const systemCoords = coords.slice(0, targetCount);
  const emptyCoords = coords.slice(targetCount);

  systemCoords.forEach(({ q, r }) => {
    if (systemsByCoord[`${q},${r}`]) return;
    
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

  // 3. Generate standard POIs
  emptyCoords.forEach(({ q, r }) => {
    if (systemsByCoord[`${q},${r}`]) return;

    let spawnChance = SYSTEM_GENERATION.POI_CHANCE * 0.3; // Base reduced chance

    // If in clustered mode, check distance from the cluster centers
    if (distributionMode === 'clustered') {
      const distances = clusterCenters.map(center => {
        const dq = q - center.q;
        const dr = r - center.r;
        return Math.sqrt(dq * dq + dr * dr);
      });

      const minDist = Math.min(...distances);

      // 1. Hard-avoid being right on top of systems
      if (minDist < 2.2) return;

      // 2. "Between Clusters" Logic
      let betweenBias = 1.0;
      
      if (clusterCenters.length > 1) {
        // Find the two closest centers
        const sortedDistances = [...distances].sort((a, b) => a - b);
        const d1 = sortedDistances[0];
        const d2 = sortedDistances[1];

        // If the hex is roughly between two centers, boost the chance.
        const diff = Math.abs(d1 - d2);
        if (diff < 3 && d1 > 3 && d1 < 8) {
          betweenBias = 4.0; // Significant boost for being in the "lane" between clusters
        }
      } else {
        // Only one cluster? Just favor the "outskirts"
        if (minDist >= 4 && minDist <= 7) {
          betweenBias = 2.0;
        }
      }

      spawnChance = (SYSTEM_GENERATION.POI_CHANCE * 0.3) * betweenBias;
    }

    if (rng() < spawnChance) {
      systemsByCoord[`${q},${r}`] = generatePOIAtCoordinate(rng, q, r, sectorQ, sectorR);
    }
  });

  return {
    systems: systemsByCoord,
    biome
  };
};