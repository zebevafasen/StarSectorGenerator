import poiData from '../data/poi.json';
import poiTypes from '../data/poi_types.json';
import { pickWeighted } from '../utils/weightedPicker';

/**
 * Generates a Point of Interest from the weighted POI pool.
 * @param {Function} rng - Random number generator.
 * @param {number} q - Hex q coordinate.
 * @param {number} r - Hex r coordinate.
 * @returns {Object} POI object.
 */
export const generatePOIAtCoordinate = (rng, q, r) => {
  const pickedRaw = pickWeighted(poiData, p => p.weight, rng());
  const picked = { ...pickedRaw };
  
  // Find the type definition for default color inheritance
  const typeDef = poiTypes.find(t => t.name === picked.type) || {};

  const result = {
    ...picked,
    color: picked.color || typeDef.color || '#94a3b8',
    isPOI: true,
    location: { q, r }
  };

  // Dynamic naming for Jump-Gates based on state
  if ((result.type === 'Jump-Gate' || result.type === 'Jump Gate') && result.state) {
    result.name = `${result.state} Jump-Gate`;
  }

  return result;
};
