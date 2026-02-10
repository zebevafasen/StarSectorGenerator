import poiData from '../data/poi.json';
import poiTypes from '../data/poi_types.json';
import { pickWeighted } from '../utils/weightedPicker';
import { createRNG, stringToSeed } from '../utils/rng';

/**
 * Filtered POI data to remove Jump Gates from the random pool, 
 * as they are now managed by the stable network logic.
 */
const RANDOM_POI_POOL = poiData.filter(poi => 
  poi.type !== 'Jump-Gate' && poi.type !== 'Jump Gate'
);

const JUMP_CONFIG = poiTypes.find(t => t.name === 'Jump Gate')?.data || {
  maxPerSector: 1,
  minSectorDistanceFromOtherJumpGates: 5,
  maxSectorDistanceFromOtherJumpGates: 20,
  nearbySectorSuppressionRadius: 3
};

/**
 * Deterministically calculates where a gate at a specific sector leads.
 */
export const calculateGateDestination = (rng, sq, sr) => {
  const min = JUMP_CONFIG.minSectorDistanceFromOtherJumpGates;
  const max = JUMP_CONFIG.maxSectorDistanceFromOtherJumpGates;
  
  const dist = Math.floor(rng() * (max - min + 1)) + min;
  const angle = rng() * Math.PI * 2;
  
  const dq = Math.round(Math.cos(angle) * dist);
  const dr = Math.round(Math.sin(angle) * dist);
  
  // Ensure we don't jump to exactly the same sector
  const finalDq = dq === 0 && dr === 0 ? min : dq;

  return {
    q: sq + finalDq,
    r: sr + dr
  };
};

/**
 * Priority-based check to see if a sector is allowed to be an origin of a Jump-Gate link.
 * Respects the suppression radius.
 */
const isGateOrigin = (universeSeed, sq, sr) => {
  const radius = JUMP_CONFIG.nearbySectorSuppressionRadius;
  
  const getPriority = (q, r) => {
    const rng = createRNG(stringToSeed(`${universeSeed}_gate_prio_${q}_${r}`));
    const roll = rng();
    // 5.0% base chance to be an origin candidate (Increased from 1.5%)
    return roll < 0.05 ? roll : -1;
  };

  const myPriority = getPriority(sq, sr);
  if (myPriority === -1) return false;

  // Check neighbors within suppression radius
  for (let dq = -radius; dq <= radius; dq++) {
    for (let dr = -radius; dr <= radius; dr++) {
      if (dq === 0 && dr === 0) continue;
      if (getPriority(sq + dq, sr + dr) > myPriority) return false;
    }
  }
  
  return true;
};

/**
 * Returns the Jump-Gate link for a given sector, if one exists.
 * Ensures 1:1 bi-directional mapping.
 */
export const getJumpGateLink = (universeSeed, sq, sr) => {
  // 1. Check if this sector is an Origin
  if (isGateOrigin(universeSeed, sq, sr)) {
    const rng = createRNG(stringToSeed(`${universeSeed}_gate_dest_${sq}_${sr}`));
    return {
      destination: calculateGateDestination(rng, sq, sr),
      isOrigin: true
    };
  }

  // 2. Check if this sector is a Target of any potential origin in range
  const maxRange = JUMP_CONFIG.maxSectorDistanceFromOtherJumpGates;
  for (let dq = -maxRange; dq <= maxRange; dq++) {
    for (let dr = -maxRange; dr <= maxRange; dr++) {
      if (dq === 0 && dr === 0) continue;
      
      const nq = sq + dq;
      const nr = sr + dr;
      
      if (isGateOrigin(universeSeed, nq, nr)) {
        const rng = createRNG(stringToSeed(`${universeSeed}_gate_dest_${nq}_${nr}`));
        const dest = calculateGateDestination(rng, nq, nr);
        
        if (dest.q === sq && dest.r === sr) {
          return {
            destination: { q: nq, r: nr },
            isOrigin: false
          };
        }
      }
    }
  }

  return null;
};

export const generatePOIAtCoordinate = (rng, q, r, sectorQ = 0, sectorR = 0) => {
  const pickedRaw = pickWeighted(RANDOM_POI_POOL, p => p.weight, rng());
  const picked = { ...pickedRaw };
  const typeDef = poiTypes.find(t => t.name === picked.type) || {};

  const result = {
    ...picked,
    color: picked.color || typeDef.color || '#94a3b8',
    isPOI: true,
    location: { q, r },
    globalLocation: { sectorQ, sectorR }
  };

  return result;
};