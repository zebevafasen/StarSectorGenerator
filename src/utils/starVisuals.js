import { HEX_SIZE } from '../constants';
import { getStarByType } from './starData';

export const getStarVisual = (starType) => {
  const starInfo = getStarByType(starType);

  const mapRadius = (starInfo?.data?.size?.map ?? 1) * (HEX_SIZE / 4);
  const inspectorRadius = starInfo?.data?.size?.inspector ?? 16;
  const inspectorIconSize = starInfo?.data?.size?.iconSize ?? 48;

  return {
    starInfo,
    colors: starInfo?.color,
    mapRadius,
    mapOuterRadius: mapRadius * 1.2,
    inspectorRadius,
    inspectorOuterRadius: inspectorRadius * 1.2,
    inspectorIconSize
  };
};
