import planets from '../data/planets.json';

/**
 * Retrieves planet configuration data by its type.
 * 
 * @param {string} type - The planet type (e.g., 'Terrestrial', 'Gas Giant').
 * @returns {Object|undefined} The planet configuration object or undefined if not found.
 */
export const getPlanetByType = (type) => {
  return planets[type];
};