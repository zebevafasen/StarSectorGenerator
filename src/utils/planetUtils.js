import planets from '../data/planets.json';
import { normalizePlanetColor } from './colorSemantics';

export const PLANETS_BY_TYPE = Object.fromEntries(
  Object.entries(planets).map(([type, config]) => [
    type,
    {
      ...config,
      color: normalizePlanetColor(config?.color)
    }
  ])
);

export const getPlanetByType = (type) => PLANETS_BY_TYPE[type] || null;

/**
 * Sorts system bodies by priority: Primary Inhabited > Inhabited (by pop) > Uninhabited.
 */
export const sortSystemBodies = (bodies) => {
  if (!bodies?.length) return [];
  
  return [...bodies].sort((a, b) => {
    // Primary always first
    if (a.isPrimaryInhabited && !b.isPrimaryInhabited) return -1;
    if (!a.isPrimaryInhabited && b.isPrimaryInhabited) return 1;
    
    // Inhabited before uninhabited
    if (a.isInhabited && !b.isInhabited) return -1;
    if (!a.isInhabited && b.isInhabited) return 1;

    // Among inhabited, sort by population
    if (a.isInhabited && b.isInhabited) {
      return (b.population || 0) - (a.population || 0);
    }

    return 0;
  });
};
