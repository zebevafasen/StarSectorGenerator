import poiData from '../data/poi.json';
import poiTypes from '../data/poi_types.json';
import { pickWeighted } from '../utils/weightedPicker';

/**
 * Generates a Point of Interest from the weighted POI pool.
 * @param {Function} rng - Random number generator.
 * @param {number} q - Hex q coordinate.
 * @param {number} r - Hex r coordinate.
 * @param {number} sectorQ - Current sector Q coordinate.
 * @param {number} sectorR - Current sector R coordinate.
 * @returns {Object} POI object.
 */
export const generatePOIAtCoordinate = (rng, q, r, sectorQ = 0, sectorR = 0) => {
  const pickedRaw = pickWeighted(poiData, p => p.weight, rng());
  const picked = { ...pickedRaw };
  
  // Find the type definition for default color inheritance
  const typeDef = poiTypes.find(t => t.name === picked.type) || {};

  const result = {
    ...picked,
    color: picked.color || typeDef.color || '#94a3b8',
    isPOI: true,
    location: { q, r },
    globalLocation: { sectorQ, sectorR }
  };

  // Dynamic naming and description for Jump-Gates based on state
  if ((result.type === 'Jump-Gate' || result.type === 'Jump Gate') && result.state) {
    result.name = `${result.state} Jump-Gate`;
    
    // Use the base description from the type and add a state-specific suffix
    const baseDescription = typeDef.description || result.description;
    const stateInfo = result.state === 'Active' 
      ? "It hums with immense power, its internal rings spinning in a blur of light." 
      : "It remains silent and dark, waiting for a key or command to reawaken.";
    
    result.description = `${baseDescription} ${stateInfo}`;

    if (result.state === 'Active') {
      // Pick a more distant destination (2-5 sectors away)
      const dist = Math.floor(rng() * 4) + 2;
      const angle = rng() * Math.PI * 2;
      
      // Convert polar to axial-ish offsets
      const dq = Math.round(Math.cos(angle) * dist);
      const dr = Math.round(Math.sin(angle) * dist);
      
      // Ensure we don't jump to the same sector
      const finalDq = dq === 0 && dr === 0 ? 1 : dq;

      result.destination = {
        q: sectorQ + finalDq,
        r: sectorR + dr
      };
    }
  }

  return result;
};
