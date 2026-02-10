import namesData from '../data/names.json';
import planetSizes from '../data/planet_sizes.json';
import planetTagsData from '../data/planet_tags.json';
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
import { PLANET_GENERATION } from './generationConstants';

const { MAX_PLANETS, MAX_INHABITATED_PLANETS, POPULATION = {} } = systemGenerationConfig;

const createPlanetCountWeights = (maxPlanets, center = PLANET_GENERATION.CENTER_PEAK) => {
  const sigma = PLANET_GENERATION.SIGMA;
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

  const primaryStar = stars[0];
  if (!primaryStar || ['Black Hole', 'Neutron'].includes(primaryStar.type)) {
    return bodies;
  }

  const hasHabitable = bodies.some((body) => getPlanetByType(body.type)?.data?.habitable);
  if (hasHabitable) {
    return bodies;
  }

  const starInfo = getStarByType(primaryStar.type);
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

const assignInhabitationStatus = (bodies, seedBase) => {
  if (!bodies?.length) return [];

  const inhabitablePlanetIndices = bodies
    .map((body, index) => ({ body, index }))
    .filter(({ body }) => isInhabitableCandidate(body))
    .map(({ index }) => index);

  const result = bodies.map((body) => ({ ...body, isInhabited: false, isPrimaryInhabited: false }));

  if (inhabitablePlanetIndices.length === 0) return result;

  const shuffledHabitable = [...inhabitablePlanetIndices];
  for (let i = shuffledHabitable.length - 1; i > 0; i--) {
    const j = Math.floor(hashToUnit(`${seedBase}:inhabit_shuffle:${i}`) * (i + 1));
    [shuffledHabitable[i], shuffledHabitable[j]] = [shuffledHabitable[j], shuffledHabitable[i]];
  }

  const primaryIndex = shuffledHabitable.shift();
  result[primaryIndex].isInhabited = true;
  result[primaryIndex].isPrimaryInhabited = true;

  let inhabitedCount = 1;
  for (const planetIndex of shuffledHabitable) {
    if (inhabitedCount >= MAX_INHABITATED_PLANETS) break;
    const chance = (POPULATION.CHANCE ?? 0.3) / inhabitedCount;
    if (hashToUnit(`${seedBase}:inhabited_chance:${planetIndex}`) < chance) {
      result[planetIndex].isInhabited = true;
      inhabitedCount++;
    }
  }

  return result;
};

const assignPlanetTags = (bodies, seedBase) => {
  return bodies.map((body, index) => {
    const possibleTags = planetTagsData.filter((tag) => {
      const req = tag.requirements || {};
      
      if (req.inhabited !== undefined && req.inhabited !== body.isInhabited) return false;
      if (req.habitable !== undefined && req.habitable !== body.habitable) return false;
      if (req.type && !req.type.includes(body.type)) return false;
      
      return true;
    });

    if (possibleTags.length === 0) return { ...body, tags: [] };

    const tagSeed = `${seedBase}:body:${index}:tags`;
    const tagCountRoll = hashToUnit(`${tagSeed}:count`);
    const numTags = tagCountRoll < PLANET_GENERATION.TAG_COUNT_THRESHOLD ? 1 : 2;

    const selectedTags = [];
    let availableTags = [...possibleTags];
    
    for (let i = 0; i < numTags && availableTags.length > 0; i++) {
      const pickRoll = hashToUnit(`${tagSeed}:pick:${i}`);
      const pickIndex = Math.floor(pickRoll * availableTags.length);
      const pickedTag = availableTags.splice(pickIndex, 1)[0];
      selectedTags.push(pickedTag);

      if (pickedTag.incompatibleTags) {
        availableTags = availableTags.filter(t => !pickedTag.incompatibleTags.includes(t.name));
      }
    }

    return { ...body, tags: selectedTags };
  });
};

const enforceSystemLogic = (bodies) => {
  const primaryInhabited = bodies.find(b => b.isPrimaryInhabited);
  
  // Colony Rule: If the Primary world is a Colony, it is the ONLY inhabited world.
  if (primaryInhabited?.tags?.some(t => t.name === "Colony")) {
    return bodies.map(b => {
      if (b === primaryInhabited) return b;
      return { ...b, isInhabited: false, population: 0 };
    });
  }
  return bodies;
};

const applyNaming = (bodies, seedBase) => {
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

  return bodies.map((body) => {
    if (body.isInhabited && body.isPrimaryInhabited) {
      const suffixes = namesData.PRIMARY_PLANET_SUFFIXES || [];
      const suffix = suffixes[Math.floor(hashToUnit(`${seedBase}:primary_suffix`) * suffixes.length)] || 'Prime';
      return { ...body, name: suffix, namingStyle: 'suffix' };
    }

    let newName;
    let namingStyle;

    if (body.isInhabited) {
      if (secondaryNamePoolIndex < shuffledSecondaryNamesPool.length) {
        const chosenOption = shuffledSecondaryNamesPool[secondaryNamePoolIndex];
        newName = chosenOption.name;
        namingStyle = chosenOption.style;
        secondaryNamePoolIndex++;
      } else {
        newName = PLANET_GENERATION.DEFAULT_SECONDARY_NAME;
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
  if (!star || ['Black Hole', 'Neutron'].includes(star.type)) {
    return [];
  }

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

const calculatePopulation = (body, seedBase) => {
  if (!body.isInhabited) return 0;

  const sizeInfo = planetSizes.find((s) => s.name === body.size);
  const sizeFactor = sizeInfo?.populationFactor ?? 1.0;
  
  // Base population calculation: 1 Billion * sizeFactor * habitability
  // We use a base of 1 billion for a Medium, perfectly habitable world.
  const basePop = PLANET_GENERATION.BASE_POPULATION;
  let finalPop = basePop * sizeFactor * (body.habitabilityRate || 0.1);

  // Apply Tag Overrides and Modifiers
  const tags = body.tags || [];
  
  // 1. Check for Range Overrides (highest precedence)
  const rangeOverride = tags.find(t => t.populationRange);
  if (rangeOverride) {
    const { min, max } = rangeOverride.populationRange;
    const roll = hashToUnit(`${seedBase}:pop_roll`);
    finalPop = Math.floor(roll * (max - min + 1)) + min;
  } else {
    // 2. Apply Multipliers
    tags.forEach(tag => {
      if (tag.populationModifier) {
        finalPop *= tag.populationModifier;
      }
    });
    
    // Add some random variance (+/- 20%) if not overridden by a range
    const variance = PLANET_GENERATION.POPULATION_VARIANCE_BASE + (hashToUnit(`${seedBase}:pop_variance`) * PLANET_GENERATION.POPULATION_VARIANCE_RANGE);
    finalPop *= variance;
  }

  return Math.floor(finalPop);
};

/**
 * Processing Pipeline:
 * 1. Environment: Assigns basic habitability, atmosphere, and temperature.
 * 2. Inhabitation: Determines if planets are inhabited based on habitability.
 * 3. Tags: Assigns tags (e.g., "Colony", "Industrial") based on planet stats.
 * 4. Logic: Enforces rules like "Colony worlds are the only inhabited ones".
 * 5. Naming: Assigns names to bodies.
 * 6. Population: Calculates final population.
 */
export const processPlanetBodies = ({ bodies, stars, seedBase }) => {
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

  const withInhabitants = assignInhabitationStatus(bodiesWithEnvironment, seedBase);
  const withTags = assignPlanetTags(withInhabitants, seedBase);
  const logicApplied = enforceSystemLogic(withTags);
  const named = applyNaming(logicApplied, seedBase);

  return named.map((body, index) => ({
    ...body,
    population: calculatePopulation(body, `${seedBase}:body:${index}:pop`)
  }));
};
