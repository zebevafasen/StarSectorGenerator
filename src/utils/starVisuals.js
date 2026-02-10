import { HEX_SIZE } from '../constants';
import { getStarByType } from './starData';

export const getStarVisual = (starType) => {
  const starInfo = getStarByType(starType);
  const sizeConfig = starInfo?.data?.size || {};

  // Base radii from data or sensible defaults
  const baseMapRadius = (sizeConfig.map ?? 1) * (HEX_SIZE / 4);
  const baseInspectorRadius = sizeConfig.inspector ?? 16;
  
  return {
    starInfo,
    colors: starInfo?.color,
    baseMapRadius,
    baseInspectorRadius,
    inspectorIconSize: sizeConfig.iconSize ?? 48
  };
};
