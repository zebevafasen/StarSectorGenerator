import poiData from '../data/poi.json';
import poiTypes from '../data/poi_types.json';
import { pickWeighted } from '../utils/weightedPicker';
import { createRNG, stringToSeed } from '../utils/rng';
import { SYSTEM_GENERATION } from './generationConstants';

/**
 * Deterministically calculates where a gate at a specific sector leads.
 */
export const calculateGateDestination = (rng, sq, sr) => {
  const dist = Math.floor(rng() * 4) + 2;
  const angle = rng() * Math.PI * 2;
  const dq = Math.round(Math.cos(angle) * dist);
  const dr = Math.round(Math.sin(angle) * dist);
  const finalDq = dq === 0 && dr === 0 ? 1 : dq;

  return {
    q: sq + finalDq,
    r: sr + dr
  };
};

/**
 * Scans neighbors to see if any point TO the current sector.
 * Returns the origin of the first found inbound gate.
 */
export const getNetworkInboundGate = (universeSeed, sq, sr) => {
  // Scan range matches the jump distance (2-5)
  const scanRange = 6; 
  
  for (let dq = -scanRange; dq <= scanRange; dq++) {
    for (let dr = -scanRange; dr <= scanRange; dr++) {
      if (dq === 0 && dr === 0) continue;
      
      const nq = sq + dq;
      const nr = sr + dr;
      
      // Simulate the RNG for this neighbor
      const neighborSeed = stringToSeed(`${universeSeed}_${nq}_${nr}`);
      const nRng = createRNG(neighborSeed);
      
      // Skip ahead to where POIs are usually generated in sectorGeneration
      // This is a bit tight with sectorGeneration.js logic, but necessary for consistency.
      // 1. Skip system target count roll
      nRng(); 
      // 2. Skip coordinate shuffle rolls (approximate or match exactly)
      // Actually, a cleaner way: use a specific sub-seed for the "Sector Network Potential"
      const networkSeed = stringToSeed(`${universeSeed}_net_${nq}_${nr}`);
      const netRng = createRNG(networkSeed);
      
      // If this neighbor has a gate and it leads to US
      if (netRng() < 0.05) { // 5% chance of a sector having a network gate
        const dest = calculateGateDestination(netRng, nq, nr);
        if (dest.q === sq && dest.r === sr) {
          return { q: nq, r: nr };
        }
      }
    }
  }
  return null;
};

export const generatePOIAtCoordinate = (rng, q, r, sectorQ = 0, sectorR = 0, universeSeed = "") => {
  const pickedRaw = pickWeighted(poiData, p => p.weight, rng());
  const picked = { ...pickedRaw };
  const typeDef = poiTypes.find(t => t.name === picked.type) || {};

  const result = {
    ...picked,
    color: picked.color || typeDef.color || '#94a3b8',
    isPOI: true,
    location: { q, r },
    globalLocation: { sectorQ, sectorR }
  };

  if ((result.type === 'Jump-Gate' || result.type === 'Jump Gate') && result.state) {
    result.name = `${result.state} Jump-Gate`;
    const baseDescription = typeDef.description || result.description;
    const stateInfo = result.state === 'Active' 
      ? "It hums with immense power, its internal rings spinning in a blur of light." 
      : "It remains silent and dark, waiting for a key or command to reawaken.";
    
    result.description = `${baseDescription} ${stateInfo}`;

    if (result.state === 'Active') {
      // Use the stable network RNG if available, or fallback
      const networkSeed = stringToSeed(`${universeSeed}_net_${sectorQ}_${sectorR}`);
      const netRng = createRNG(networkSeed);
      
      // Consume the presence roll
      netRng(); 
      
      const dest = calculateGateDestination(netRng, sectorQ, sectorR);
      result.destination = dest;
    }
  }

  return result;
};