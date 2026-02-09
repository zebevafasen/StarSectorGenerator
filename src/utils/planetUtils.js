import planets from '../data/planets.json';
import { normalizePlanetColor } from './colorSemantics';

const PLANETS_BY_TYPE = Object.fromEntries(
  Object.entries(planets).map(([type, config]) => [
    type,
    {
      ...config,
      color: normalizePlanetColor(config?.color)
    }
  ])
);

/**
 * Retrieves planet configuration data by its type.
 * 
 * @param {string} type - The planet type (e.g., 'Terrestrial', 'Gas Giant').
 * @returns {Object|undefined} The planet configuration object or undefined if not found.
 */
export const getPlanetByType = (type) => {
  return PLANETS_BY_TYPE[type];
};
