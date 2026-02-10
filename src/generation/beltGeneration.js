import systemConfig from '../data/system_generation_config.json';
import { hashToUnit } from '../utils/rng';

const { BELTS = {} } = systemConfig;
const DEFAULT_BELT_CHANCE = 0.35;

export const generateBelts = ({ seedBase, systemName, beltsData }) => {
  if (beltsData.length === 0) {
    return [];
  }

  if (hashToUnit(`${seedBase}:has_belt`) >= (BELTS.chance ?? DEFAULT_BELT_CHANCE)) {
    return [];
  }

  const beltType = beltsData[Math.floor(hashToUnit(`${seedBase}:belt_type`) * beltsData.length)];
  if (!beltType) {
    return [];
  }

  return [{ name: `${systemName} ${beltType.split(' ')[0]}`, type: beltType }];
};
