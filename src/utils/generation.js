import STAR_CLASSES from '../data/stars.json';
import PLANET_TYPES from '../data/planets.json';
import STATIONS from '../data/stations.json';
import nameData from '../data/names.json';
import systemRules from '../data/system_generation_config.json';

const { GREEK_ALPHABET, NAME_PREFIXES, NAME_SUFFIXES } = nameData;
const { MAX_PLANETS, PLANET_DISTANCE, POPULATION, STATION_CHANCE } = systemRules;

const generateName = (rng) => {
  const name = NAME_PREFIXES[Math.floor(rng() * NAME_PREFIXES.length)] + 
               NAME_SUFFIXES[Math.floor(rng() * NAME_SUFFIXES.length)];
  return name;
};

export const generateSystem = (q, r, rng) => {
  const rand = rng();
  let cumulative = 0;
  let starClass = STAR_CLASSES[STAR_CLASSES.length - 1];
  
  for (let sc of STAR_CLASSES) {
    cumulative += sc.freq;
    if (rand <= cumulative) {
      starClass = sc;
      break;
    }
  }

  const numBodies = Math.floor(rng() * MAX_PLANETS); 
  const bodies = [];
  for (let i = 0; i < numBodies; i++) {
    bodies.push({
      type: PLANET_TYPES[Math.floor(rng() * PLANET_TYPES.length)],
      distance: (i + 1) * PLANET_DISTANCE.BASE + rng() * PLANET_DISTANCE.VARIANCE,
      name: `${GREEK_ALPHABET[i] || (i+1)}`,
      population: rng() < POPULATION.CHANCE ? Math.floor(rng() * POPULATION.MAX) : 0
    });
  }

  const hasStation = rng() < STATION_CHANCE;
  const station = hasStation ? STATIONS[Math.floor(rng() * STATIONS.length)] : null;

  return {
    name: generateName(rng),
    star: starClass,
    bodies,
    station,
    coordinates: { q, r }
  };
};