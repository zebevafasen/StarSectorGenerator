import { BIOMES } from './biomeData';
import { createRNG, stringToSeed } from './rng';
import { pickWeighted } from './weightedPicker';
import generatorConfig from '../data/generator_config.json';

const REGION_SIZE = generatorConfig.DEFAULTS.REGION_SIZE || 10;

/**
 * Deterministically gets the biome for a given sector coordinate.
 * Regions are roughly 10x10 blocks of sectors.
 */
export const getBiomeForSector = (sq, sr, globalSeed) => {
  const rq = Math.floor(sq / REGION_SIZE);
  const rr = Math.floor(sr / REGION_SIZE);
  
  // Use a hash of the region coordinates and global seed to pick the biome
  const regionSeed = stringToSeed(`${globalSeed}_region_${rq}_${rr}`);
  const rng = createRNG(regionSeed);
  
  const biomeList = Object.values(BIOMES);
  const pickedBiome = pickWeighted(biomeList, b => b.weight || 1, rng());
  
  return pickedBiome;
};

/**
 * Returns descriptive info about the region.
 */
export const getRegionMetadata = (sq, sr) => {
  const rq = Math.floor(sq / REGION_SIZE);
  const rr = Math.floor(sr / REGION_SIZE);
  
  // Create a pseudo-random region name if we want to get fancy, 
  // or just return the coordinates.
  return {
    rq,
    rr,
    name: `Region [${rq}, ${rr}]`,
    id: `${rq}_${rr}`
  };
};
