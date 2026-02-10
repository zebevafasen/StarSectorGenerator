import generatorConfig from '../data/generator_config.json';
import namesData from '../data/names.json';
import systemConfig from '../data/system_generation_config.json';
import { generatePlanetBodiesForStar } from './planetGeneration';
import { hashToUnit } from '../utils/rng';

const { GENERATION_WEIGHTS } = generatorConfig;
const { MULTI_STAR = {} } = systemConfig;
const {
  GREEK_ALPHABET,
  ROMAN_NUMERALS,
  SYSTEM_NAME_SUFFIXES,
  NAME_PREFIXES,
  NAME_SUFFIXES,
  STAR_NAME_SUFFIXES
} = namesData;
const DEFAULT_MULTI_STAR_TYPES = ['O', 'B', 'A', 'F', 'G', 'K', 'M', 'Neutron', 'Black Hole'];
const DEFAULT_BINARY_CHANCE = 0.15;
const DEFAULT_TRINARY_FROM_BINARY_CHANCE = 0.1;
const DEFAULT_AGE_UNIT = 'B Years';

const buildSystemNamePrefix = ({ q, r, rng, systemsByCoord }) => {
  const neighbors = [
    { q, r: r - 1 },
    { q, r: r + 1 },
    { q: q - 1, r },
    { q: q + 1, r },
    { q: q - 1, r: q % 2 ? r + 1 : r - 1 },
    { q: q + 1, r: q % 2 ? r + 1 : r - 1 }
  ];

  const neighborPrefixes = neighbors
    .map((neighbor) => systemsByCoord[`${neighbor.q},${neighbor.r}`])
    .filter((neighborSystem) => neighborSystem?.namePrefix)
    .map((neighborSystem) => neighborSystem.namePrefix);

  if (neighborPrefixes.length > 0 && rng() < GENERATION_WEIGHTS.prefixClustering) {
    return neighborPrefixes[Math.floor(rng() * neighborPrefixes.length)];
  }

  return NAME_PREFIXES[Math.floor(rng() * NAME_PREFIXES.length)];
};

const assignSystemNames = (system, rng, prefix) => {
  const nameSuffix = NAME_SUFFIXES[Math.floor(rng() * NAME_SUFFIXES.length)];
  system.namePrefix = prefix;
  system.baseName = `${prefix}${nameSuffix}`;
  system.name = system.baseName;

  const starSuffix = STAR_NAME_SUFFIXES[Math.floor(rng() * STAR_NAME_SUFFIXES.length)];
  system.star = { ...system.star, name: `${system.baseName} ${starSuffix}` };

  if (rng() < GENERATION_WEIGHTS.systemSuffix) {
    const suffix = SYSTEM_NAME_SUFFIXES[Math.floor(rng() * SYSTEM_NAME_SUFFIXES.length)];
    system.name = `${system.baseName} ${suffix}`;
  }
};

const assignPlanetSequenceNames = (system, rng) => {
  if (system.bodies.length === 0) {
    return;
  }

  const useGreek = rng() < GENERATION_WEIGHTS.planetGreekNaming;
  const suffixes = useGreek ? GREEK_ALPHABET : ROMAN_NUMERALS;

  system.bodies.forEach((body, index) => {
    if (index < suffixes.length) {
      body.name = suffixes[index];
    }
  });
};

const assignPrimaryStarAge = (system, selectedStar, rng) => {
  const ageRange = selectedStar.class?.ageRange;
  if (ageRange) {
    const age = rng() * (ageRange.max - ageRange.min) + ageRange.min;
    system.star.age = parseFloat(age.toFixed(2));
    system.star.ageUnit = ageRange.unit;
    return;
  }

  system.star.age = 0;
  system.star.ageUnit = 'Unknown';
};

export const generateSystemAtCoordinate = ({ q, r, rng, systemsByCoord, pickStar, sectorQ, sectorR, isCore = false }) => {
  const selectedStar = pickStar(rng);

  const system = {
    isCore,
    star: {
      type: selectedStar.type
    },
    bodies: generatePlanetBodiesForStar(selectedStar, rng, undefined, isCore)
  };

  assignPrimaryStarAge(system, selectedStar, rng);
  
  // Phase Three: Star Age Boost for Core Systems
  if (isCore && system.star.age !== undefined) {
    system.star.age = parseFloat((system.star.age * 1.5).toFixed(2));
  }

  const prefix = buildSystemNamePrefix({ q, r, rng, systemsByCoord });
  assignSystemNames(system, rng, prefix);
  assignPlanetSequenceNames(system, rng);

  system.globalLocation = { sectorQ, sectorR };
  system.localLocation = { q, r };

  return system;
};

export const appendCompanionStars = ({ stars, seedBase, baseStarName, baseStarAgeUnit }) => {
  if (stars.length === 0) {
    return stars;
  }

  const additionalTypes = MULTI_STAR.typePool || DEFAULT_MULTI_STAR_TYPES;
  const suffixIndices = MULTI_STAR.suffixIndices || [1, 2];
  const suffixes = suffixIndices.map((index, i) => namesData?.GREEK_LETTERS?.[index] || String.fromCharCode(66 + i));

  const nextStars = [...stars];
  if (hashToUnit(`${seedBase}:binary`) < (MULTI_STAR.binaryChance ?? DEFAULT_BINARY_CHANCE)) {
    const type2 = additionalTypes[Math.floor(hashToUnit(`${seedBase}:type2`) * additionalTypes.length)];
    const age2 = +(1 + hashToUnit(`${seedBase}:age2`) * 9).toFixed(2);

    nextStars.push({
      ...stars[0],
      name: `${baseStarName} ${suffixes[0]}`,
      type: type2,
      age: age2,
      ageUnit: baseStarAgeUnit || MULTI_STAR.defaultAgeUnit || DEFAULT_AGE_UNIT
    });

    if (hashToUnit(`${seedBase}:trinary`) < (MULTI_STAR.trinaryChanceWhenBinary ?? DEFAULT_TRINARY_FROM_BINARY_CHANCE)) {
      const type3 = additionalTypes[Math.floor(hashToUnit(`${seedBase}:type3`) * additionalTypes.length)];
      const age3 = +(1 + hashToUnit(`${seedBase}:age3`) * 9).toFixed(2);
      nextStars.push({
        ...stars[0],
        name: `${baseStarName} ${suffixes[1]}`,
        type: type3,
        age: age3,
        ageUnit: baseStarAgeUnit || MULTI_STAR.defaultAgeUnit || DEFAULT_AGE_UNIT
      });
    }
  }

  return nextStars;
};
