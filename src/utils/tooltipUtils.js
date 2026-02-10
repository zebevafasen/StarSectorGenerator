import planetSizesData from '../data/planet_sizes.json';
import { getStarVisual } from './starVisuals';
import { getPlanetByType } from './planetUtils';
import { getAtmosphereByName, getTemperatureByName } from './environmentData';

/**
 * Prepares data for the Star tooltip.
 */
export const getStarTooltipData = (star) => {
  const { starInfo } = getStarVisual(star.type);
  return {
    ...starInfo,
    ...starInfo?.class,
    name: star.name,
    type: star.type,
    age: star.age,
    ageUnit: star.ageUnit,
    isStar: true
  };
};

/**
 * Prepares data for the Planet tooltip.
 */
export const getPlanetTooltipData = (planet, systemName) => {
  const planetData = getPlanetByType(planet.type) || {};
  const planetTypeInfo = planetData.type || {};
  const planetStats = planetData.data || {};
  const atmosphere = getAtmosphereByName(planet.atmosphere);
  const temperature = getTemperatureByName(planet.temperature);
  
  const displayedHabitabilityRate = typeof planet.habitabilityRate === 'number'
    ? planet.habitabilityRate
    : planetStats.habitabilityRate;

  return {
    ...planetData,
    name: `${systemName} ${planet.name}`,
    type: planet.type,
    size: planet.size,
    atmosphere: planet.atmosphere,
    atmosphereDescription: atmosphere?.description,
    temperature: planet.temperature,
    temperatureDescription: temperature?.description,
    temperatureRange: temperature?.data?.temperatureRange,
    planetTypeName: planetTypeInfo.name || planet.type,
    description: planetTypeInfo.description,
    habitability: planet.habitable === true ? 'Habitable' : planet.habitable === false ? 'Non-habitable' : planetStats.habitable === true ? 'Habitable' : planetStats.habitable === false ? 'Non-habitable' : null,
    habitabilityRate: typeof displayedHabitabilityRate === 'number' ? `${Math.round(displayedHabitabilityRate * 100)}%` : null,
    isPlanet: true
  };
};

/**
 * Prepares data for the Station tooltip.
 */
export const getStationTooltipData = (station) => {
  return {
    name: station.name,
    type: station.type,
    description: station.description,
    isStation: true,
    color: station.color
  };
};

/**
 * Prepares data for the Planet Size tooltip.
 */
export const getPlanetSizeTooltipData = (sizeName) => {
  const sizeInfo = planetSizesData.find((size) => size.name === sizeName);
  return {
    name: sizeName,
    description: sizeInfo?.description,
    isPlanetSize: true
  };
};

/**
 * Prepares data for the POI tooltip.
 */
export const getPoiTooltipData = (poi) => {
  return {
    name: poi.name,
    type: poi.type,
    description: poi.description,
    color: poi.color,
    isPOI: true
  };
};
