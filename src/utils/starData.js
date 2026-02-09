import starData from '../data/stars.json';
import { normalizeStarColor } from './colorSemantics';

const DEFAULT_STAR_TYPE = 'G';
const NORMALIZED_STAR_DATA = starData.map((star) => ({
  ...star,
  color: normalizeStarColor(star?.color)
}));
const STAR_BY_TYPE = new Map(NORMALIZED_STAR_DATA.map((star) => [star.type, star]));

export const getStarByType = (type) =>
  STAR_BY_TYPE.get(type) || STAR_BY_TYPE.get(DEFAULT_STAR_TYPE) || NORMALIZED_STAR_DATA[0] || null;

export const createWeightedStarPicker = () => {
  const weightedStars = NORMALIZED_STAR_DATA
    .map((star) => ({ star, freq: star.data?.freq || 0 }))
    .filter(({ freq }) => freq > 0);

  const totalFreq = weightedStars.reduce((sum, { freq }) => sum + freq, 0);

  return (rng) => {
    if (totalFreq <= 0 || weightedStars.length === 0) {
      return getStarByType(DEFAULT_STAR_TYPE);
    }

    let roll = rng() * totalFreq;
    for (const { star, freq } of weightedStars) {
      roll -= freq;
      if (roll <= 0) return star;
    }

    return weightedStars[weightedStars.length - 1].star;
  };
};
