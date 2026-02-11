import starData from '../data/stars.json';
import { normalizeStarColor } from './colorSemantics';
import { createWeightedPicker } from './weightedPicker';

const DEFAULT_STAR_TYPE = 'G';
const NORMALIZED_STAR_DATA = starData.map((star) => ({
  ...star,
  color: normalizeStarColor(star?.color)
}));
const STAR_BY_TYPE = new Map(NORMALIZED_STAR_DATA.map((star) => [star.type, star]));

export const getStarByType = (type) =>
  STAR_BY_TYPE.get(type) || STAR_BY_TYPE.get(DEFAULT_STAR_TYPE) || NORMALIZED_STAR_DATA[0] || null;

export const createWeightedStarPicker = (customWeights = null) => {
  return createWeightedPicker(NORMALIZED_STAR_DATA, (star) => {
    if (customWeights && customWeights[star.type]) {
      return customWeights[star.type];
    }
    return star.data?.freq;
  });
};
