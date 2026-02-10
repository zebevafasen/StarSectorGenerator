import namesData from '../data/names.json';
import planetSizes from '../data/planet_sizes.json';
import systemGenerationConfig from '../data/system_generation_config.json';
import {
  getAtmosphereByName,
  getTemperatureByName,
  pickAtmosphereName,
  pickTemperatureName
} from '../utils/environmentData';
import { getPlanetByType } from '../utils/planetUtils';
import { getStarByType } from '../utils/starData';
import { hashToUnit } from '../utils/rng';
import { pickWeighted } from '../utils/weightedPicker';

const { MAX_PLANETS, MAX_INHABITATED_PLANETS, POPULATION = {} } = systemGenerationConfig;
const DEFAULT_SECONDARY_PLANET_FALLBACK_NAME = 'Outpost';

const createPlanetCountWeights = (maxPlanets, center = 3) => {
  const sigma = 1.6;
  return Array.from({ length: maxPlanets + 1 }, (_, count) => {
    const exponent = -((count - center) ** 2) / (2 * sigma * sigma);
    return Math.exp(exponent) + 0.02;
  });
};

const PLANET_COUNT_WEIGHTS = createPlanetCountWeights(MAX_PLANETS);

const getRandomPlanetSize = (seed, planetType) => {
  const planetData = getPlanetByType(planetType);
  const sizeModifiers = planetData?.data?.sizeModifier || {};

  const sizeConfigs = planetSizes.map((size) => ({
    ...size,
    weight: (size.weight || 0) * (sizeModifiers[size.name] ?? 1)
  }));

  const picked = pickWeighted(sizeConfigs, (s) => s.weight, hashToUnit(seed));
  return picked?.name || 'Medium';
};

const ensureHabitablePlanetWhenPossible = (bodies, stars, seedBase) => {
  if (!bodies?.length) {
    return bodies;
  }

  const hasHabitable = bodies.some((body) => getPlanetByType(body.type)?.data?.habitable);
  if (hasHabitable) {
    return bodies;
  }

  const primaryStar = stars[0];
  const starInfo = primaryStar ? getStarByType(primaryStar.type) : null;
  const possiblePlanetTypes = starInfo?.data?.planetTypeWeights || {};

  const habitableTypes = Object.keys(possiblePlanetTypes).filter((type) => {
    const planetInfo = getPlanetByType(type);
    return planetInfo?.data?.habitable && possiblePlanetTypes[type] > 0;
  });

  if (habitableTypes.length === 0) {
    return bodies;
  }

  const bodyIndexToChange = Math.floor(hashToUnit(`${seedBase}:habitable_fix`) * bodies.length);
  const newType = habitableTypes[Math.floor(hashToUnit(`${seedBase}:habitable_fix_type`) * habitableTypes.length)];
  const nextBodies = [...bodies];
  nextBodies[bodyIndexToChange] = { ...nextBodies[bodyIndexToChange], type: newType };
  return nextBodies;
};

const isInhabitableCandidate = (body) =>
  body?.habitable === true && Number(body?.habitabilityRate ?? 0) > 0;

const assignInhabitedPlanets = (bodies, seedBase, systemName) => {
  if (!bodies?.length) {
    return bodies;
  }

  const inhabitablePlanetIndices = bodies
    .map((body, index) => ({ body, index }))
    .filter(({ body }) => isInhabitableCandidate(body))
    .map(({ index }) => index);

  if (inhabitablePlanetIndices.length === 0) {
    return bodies;
  }

  const result = bodies.map((body) => ({ ...body, isInhabited: false }));
  const shuffledHabitable = [...inhabitablePlanetIndices];
  for (let i = shuffledHabitable.length - 1; i > 0; i--) {
    const j = Math.floor(hashToUnit(`${seedBase}:inhabit_shuffle:${i}`) * (i + 1));
    [shuffledHabitable[i], shuffledHabitable[j]] = [shuffledHabitable[j], shuffledHabitable[i]];
  }

  let inhabitedCount = 0;
  let primaryInhabitedPlanetIndex = -1;

  if (shuffledHabitable.length > 0) {
    primaryInhabitedPlanetIndex = shuffledHabitable.shift();
    const primaryPlanet = result[primaryInhabitedPlanetIndex];
    const suffixes = namesData.PRIMARY_PLANET_SUFFIXES || [];
    const suffix = suffixes[Math.floor(hashToUnit(`${seedBase}:primary_suffix`) * suffixes.length)] || 'Prime';

    primaryPlanet.name = suffix;
    primaryPlanet.isInhabited = true;
    primaryPlanet.namingStyle = 'suffix';
    inhabitedCount++;
  }

  const secondaryInhabitedIndices = new Set();
  for (const planetIndex of shuffledHabitable) {
    if (inhabitedCount >= MAX_INHABITATED_PLANETS) {
      break;
    }

    const chance = (POPULATION.CHANCE ?? 0.3) / inhabitedCount;
    if (hashToUnit(`${seedBase}:inhabited_chance:${planetIndex}`) < chance) {
      result[planetIndex].isInhabited = true;
      secondaryInhabitedIndices.add(planetIndex);
      inhabitedCount++;
    }
  }

  const useGreekAlphabet = hashToUnit(`${seedBase}:naming_scheme`) < 0.5;
  const namingList = useGreekAlphabet ? namesData.GREEK_ALPHABET : namesData.ROMAN_NUMERALS;

  const availableSecondaryNamesPool = [
    ...(namesData.SECONDARY_PLANET_PREFIXES || []).map((name) => ({ name, style: 'prefix' })),
    ...(namesData.SECONDARY_PLANET_SUFFIXES || []).map((name) => ({ name, style: 'suffix' }))
  ];

  const shuffledSecondaryNamesPool = [...availableSecondaryNamesPool].sort(
    (a, b) =>
      hashToUnit(`${seedBase}:secondary_pool_shuffle:${a.name}`) -
      hashToUnit(`${seedBase}:secondary_pool_shuffle:${b.name}`)
  );

  let secondaryNamePoolIndex = 0;
  let uninhabitedSequentialCounter = 0;

  return result.map((body, index) => {
    if (index === primaryInhabitedPlanetIndex) {
      return body;
    }

    let newName;
    let namingStyle;

    if (secondaryInhabitedIndices.has(index)) {
      if (secondaryNamePoolIndex < shuffledSecondaryNamesPool.length) {
        const chosenOption = shuffledSecondaryNamesPool[secondaryNamePoolIndex];
        newName = chosenOption.name;
        namingStyle = chosenOption.style;
        secondaryNamePoolIndex++;
      } else {
        console.warn(
          `Ran out of unique secondary planet names for system ${systemName}. Falling back to generic "${DEFAULT_SECONDARY_PLANET_FALLBACK_NAME}".`
        );
        newName = DEFAULT_SECONDARY_PLANET_FALLBACK_NAME;
        namingStyle = 'suffix';
      }
    } else {
      uninhabitedSequentialCounter++;
      newName = namingList[uninhabitedSequentialCounter - 1] || String(uninhabitedSequentialCounter);
      namingStyle = 'suffix';
    }

    return { ...body, name: newName, namingStyle };
  });
};

export const generatePlanetBodiesForStar = (star, rng, maxPlanets = MAX_PLANETS) => {
  const weights = star.data?.planetTypeWeights;
  if (!weights) {
    return [];
  }

  const planetTypes = Object.keys(weights).map(type => ({ type, weight: weights[type] }));
  
  let planetCount = 0;
  const maxPlanetCount = Math.max(0, Math.min(maxPlanets, PLANET_COUNT_WEIGHTS.length - 1));
  const countWeights = PLANET_COUNT_WEIGHTS.slice(0, maxPlanetCount + 1).map((w, i) => ({ index: i, weight: w }));
  
  planetCount = pickWeighted(countWeights, c => c.weight, rng()).index;

  const bodies = [];
  for (let i = 0; i < planetCount; i++) {
    const picked = pickWeighted(planetTypes, p => p.weight, rng());
    bodies.push({
      name: '',
      type: picked.type
    });
  }

  return bodies;
};

export const processPlanetBodies = ({ bodies, stars, seedBase, systemName }) => {
  let nextBodies = bodies;
  nextBodies = ensureHabitablePlanetWhenPossible(nextBodies, stars, seedBase);
  const bodiesWithEnvironment = nextBodies?.map((body, index) => {
    const planetInfo = getPlanetByType(body.type);
    const planetStats = planetInfo?.data || {};
    const atmosphereName = pickAtmosphereName(
      `${seedBase}:body:${index}:atmosphere`,
      planetStats.atmosphereWeight || {},
      planetStats.atmospheres || []
    );
    const temperatureName = pickTemperatureName(
      `${seedBase}:body:${index}:temperature`,
      planetStats.temperatureWeight || {},
      planetStats.temperatures || []
    );

    const atmosphere = getAtmosphereByName(atmosphereName);
    const temperature = getTemperatureByName(temperatureName);
    const baseRate = Number(planetStats.habitabilityRate ?? 0);
    const atmosphereRate = Number(atmosphere?.data?.habitabilityRate ?? 1);
    const temperatureRate = Number(temperature?.data?.habitabilityRate ?? 1);
    const habitabilityRate = Math.max(0, Math.min(1, baseRate * atmosphereRate * temperatureRate));

    return {
      ...body,
      size: getRandomPlanetSize(`${seedBase}:body:${index}:size`, body.type),
      atmosphere: atmosphereName || null,
      temperature: temperatureName || null,
      habitabilityRate,
      habitable:
        Boolean(planetStats.habitable) &&
        Boolean(atmosphere?.data?.habitable ?? true) &&
        Boolean(temperature?.data?.habitable ?? true)
    };
  });

  return assignInhabitedPlanets(bodiesWithEnvironment, seedBase, systemName);
};
