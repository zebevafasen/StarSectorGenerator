import STAR_CLASSES from '../data/stars.json';
import { HEX_SIZE } from '../constants';

export const getHexId = (q, r) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(q)}${pad(r)}`;
};

export const getInspectorStarSize = (type) => {
  const star = STAR_CLASSES.find(s => s.type === type);
  return star?.size?.inspector || 10;
};

export const getMapStarRadius = (type) => {
  const base = HEX_SIZE / 3;
  const star = STAR_CLASSES.find(s => s.type === type);
  return base * (star?.size?.map || 0.75);
};