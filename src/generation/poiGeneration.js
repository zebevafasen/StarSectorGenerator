import poiData from '../data/poi.json';
import { pickWeighted } from '../utils/weightedPicker';

/**
 * Generates a Point of Interest from the weighted POI pool.
 * @param {Function} rng - Random number generator.
 * @param {number} q - Hex q coordinate.
 * @param {number} r - Hex r coordinate.
 * @returns {Object} POI object.
 */
export const generatePOIAtCoordinate = (rng, q, r) => {
  const picked = pickWeighted(poiData, p => p.weight, rng());
  
  return {
    ...picked,
    isPOI: true,
    location: { q, r }
  };
};
