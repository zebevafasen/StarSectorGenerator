import atmosphereData from '../data/atmosphere.json';
import temperatureData from '../data/temperature.json';
import { hashToUnit } from './rng';

const ATMOSPHERE_BY_NAME = new Map(atmosphereData.map((item) => [item.name, item]));
const TEMPERATURE_BY_NAME = new Map(temperatureData.map((item) => [item.name, item]));

export const getAtmosphereByName = (name) => ATMOSPHERE_BY_NAME.get(name) || null;
export const getTemperatureByName = (name) => TEMPERATURE_BY_NAME.get(name) || null;

const pickWeightedName = (seed, weightMap = {}, allowedNames = [], allNames = []) => {
  const candidates = Array.isArray(allowedNames) && allowedNames.length > 0
    ? allowedNames.filter((name) => allNames.includes(name))
    : allNames;

  if (!candidates.length) {
    return null;
  }

  const weightedEntries = candidates
    .map((name) => [name, Number(weightMap[name] ?? 0)])
    .filter(([, weight]) => weight > 0);

  if (weightedEntries.length === 0) {
    return candidates[Math.floor(hashToUnit(seed) * candidates.length)] || null;
  }

  const totalWeight = weightedEntries.reduce((sum, [, weight]) => sum + Number(weight), 0);
  let value = hashToUnit(seed) * totalWeight;

  for (const [name, weight] of weightedEntries) {
    value -= Number(weight);
    if (value <= 0) {
      return name;
    }
  }

  return weightedEntries[weightedEntries.length - 1][0];
};

export const pickAtmosphereName = (seed, atmosphereWeight = {}, allowedAtmospheres = []) => {
  const allAtmosphereNames = atmosphereData.map((item) => item.name);
  return pickWeightedName(seed, atmosphereWeight, allowedAtmospheres, allAtmosphereNames);
};

export const pickTemperatureName = (seed, temperatureWeight = {}, allowedTemperatures = []) => {
  const allTemperatureNames = temperatureData.map((item) => item.name);
  return pickWeightedName(seed, temperatureWeight, allowedTemperatures, allTemperatureNames);
};
