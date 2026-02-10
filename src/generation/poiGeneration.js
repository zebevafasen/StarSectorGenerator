import poiData from '../data/poi.json';
import poiTypes from '../data/poi_types.json';
import { pickWeighted } from '../utils/weightedPicker';
import { createRNG, stringToSeed } from '../utils/rng';

/**
 * Deterministically calculates where a gate at a specific sector leads.
 */
export const calculateGateDestination = (rng, sq, sr) => {
  // Use the provided rng to keep it deterministic
  const dist = Math.floor(rng() * 4) + 2; // 2-5 sectors
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
 * Returns an array of all inbound gate origins.
 */
export const getAllInboundGates = (universeSeed, sq, sr) => {
  const scanRange = 6; 
  const origins = [];
  
  for (let dq = -scanRange; dq <= scanRange; dq++) {
    for (let dr = -scanRange; dr <= scanRange; dr++) {
      if (dq === 0 && dr === 0) continue;
      
      const nq = sq + dq;
      const nr = sr + dr;
      
      const networkSeed = stringToSeed(`${universeSeed}_net_${nq}_${nr}`);
      const netRng = createRNG(networkSeed);
      
      // 10% chance per sector to have an outbound gate (Increased for better connectivity)
      if (netRng() < 0.10) { 
        const dest = calculateGateDestination(netRng, nq, nr);
        if (dest.q === sq && dest.r === sr) {
          origins.push({ q: nq, r: nr });
        }
      }
    }
  }
  return origins;
};

export const generatePOIAtCoordinate = (rng, q, r, sectorQ = 0, sectorR = 0) => {
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

  // Jump-Gate Logic
  if ((result.type === 'Jump-Gate' || result.type === 'Jump Gate') && result.state) {
    result.name = `${result.state} Jump-Gate`;
    const baseDescription = typeDef.description || result.description;
    const stateInfo = result.state === 'Active' 
      ? "It hums with immense power, its internal rings spinning in a blur of light." 
      : "It remains silent and dark, waiting for a key or command to reawaken.";
    
    result.description = `${baseDescription} ${stateInfo}`;

    // Standard POI jump gates (not part of the stable network) point to random nearby sectors
    if (result.state === 'Active' && !result.destination) {
      const dist = Math.floor(rng() * 3) + 1;
      result.destination = { q: sectorQ + dist, r: sectorR };
    }
  }

  return result;
};
