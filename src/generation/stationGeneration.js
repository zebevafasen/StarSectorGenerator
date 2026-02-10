import namesData from '../data/names.json';
import stationTraitsData from '../data/station_traits.json';
import systemConfig from '../data/system_generation_config.json';
import { hashToUnit } from '../utils/rng';
import { STATION_GENERATION } from './generationConstants';

const { MAX_STATIONS, STATIONS = {} } = systemConfig;
const DEFAULT_STATION_BASE_CHANCE = 0.8;
const DEFAULT_STATION_STEP_PENALTY = 0.25;

const assignStationTraits = (station, seed) => {
  const tagCountRoll = hashToUnit(`${seed}:trait_count`);
  const numTraits = tagCountRoll < STATION_GENERATION.TRAIT_COUNT_THRESHOLD ? 1 : 2; 

  const selectedTraits = [];
  const available = [...stationTraitsData];

  for (let i = 0; i < numTraits && available.length > 0; i++) {
    const pickIndex = Math.floor(hashToUnit(`${seed}:trait_pick:${i}`) * available.length);
    selectedTraits.push(available.splice(pickIndex, 1)[0]);
  }

  return selectedTraits;
};

const calculateStationPopulation = (station, traits, seed) => {
  const range = station.populationRange || { min: 10, max: 100 };
  const roll = hashToUnit(`${seed}:pop_roll`);
  let pop = Math.floor(roll * (range.max - range.min + 1)) + range.min;

  // Apply modifiers
  traits.forEach(trait => {
    if (trait.populationModifier) {
      pop *= trait.populationModifier;
    }
  });

  return Math.floor(pop);
};

const pickStationFromPool = (seed, pool) => {
  if (pool.length === 0) {
    return null;
  }

  const totalWeight = pool.reduce((sum, station) => sum + (station.data?.generationWeight || 0), 0);
  let value = hashToUnit(seed) * totalWeight;

  for (let i = 0; i < pool.length; i++) {
    const stationType = pool[i];
    value -= stationType.data?.generationWeight || 0;
    if (value <= 0) {
      pool.splice(i, 1);
      return { ...stationType };
    }
  }

  return { ...pool.pop() };
};

export const generateStations = ({ seedBase, hasInhabitedPlanet, stationsData }) => {
  if (!hasInhabitedPlanet || stationsData.length === 0) {
    return [];
  }

  const stations = [];
  const availableStationTypes = [...stationsData];

  const firstStation = pickStationFromPool(`${seedBase}:station_0`, availableStationTypes);
  if (firstStation) {
    stations.push(firstStation);
  }

  for (let i = 1; i < MAX_STATIONS; i++) {
    const chance = (STATIONS.baseChance ?? DEFAULT_STATION_BASE_CHANCE) - (i * (STATIONS.stepPenalty ?? DEFAULT_STATION_STEP_PENALTY));
    if (hashToUnit(`${seedBase}:has_station_${i}`) < chance) {
      const nextStation = pickStationFromPool(`${seedBase}:station_${i}`, availableStationTypes);
      if (nextStation) {
        stations.push(nextStation);
      }
    } else {
      break;
    }
  }

  return stations.map((station, index) => {
    const stationSeed = `${seedBase}:station_final:${index}`;
    const stationTypeKey = station.type.toUpperCase().replace(/ /g, '_');
    const prefixes = namesData[`${stationTypeKey}_PREFIXES`] || [];
    const suffixes = namesData[`${stationTypeKey}_SUFFIXES`] || [];

    let newName = station.name || STATION_GENERATION.DEFAULT_FALLBACK_NAME;
    if (prefixes.length > 0 && suffixes.length > 0) {
      const prefix = prefixes[Math.floor(hashToUnit(`${stationSeed}:name_prefix`) * prefixes.length)];
      const suffix = suffixes[Math.floor(hashToUnit(`${stationSeed}:name_suffix`) * suffixes.length)];
      newName = `${prefix} ${suffix}`;
    } else if (prefixes.length > 0) {
      newName = prefixes[Math.floor(hashToUnit(`${stationSeed}:name_prefix`) * prefixes.length)];
    } else if (suffixes.length > 0) {
      newName = suffixes[Math.floor(hashToUnit(`${stationSeed}:name_suffix`) * suffixes.length)];
    }

    const traits = assignStationTraits(station, stationSeed);
    const population = calculateStationPopulation(station, traits, stationSeed);
    const allegiance = STATION_GENERATION.ALLEGIANCES[Math.floor(hashToUnit(`${stationSeed}:allegiance`) * STATION_GENERATION.ALLEGIANCES.length)];

    return { 
      ...station, 
      name: newName,
      traits,
      population,
      allegiance
    };
  });
};
