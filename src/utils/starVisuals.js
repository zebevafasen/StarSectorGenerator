import { HEX_SIZE } from '../constants';
import { getStarByType } from './starData';

// Central mapping for star sizes to remove dependency on JSON values
const STAR_SIZE_MAP = {
  'O': { map: 1.0, inspector: 24, icon: 80 },
  'B': { map: 0.9, inspector: 22, icon: 80 },
  'A': { map: 0.8, inspector: 20, icon: 80 },
  'F': { map: 0.75, inspector: 19, icon: 80 },
  'G': { map: 0.6, inspector: 18, icon: 80 },
  'K': { map: 0.55, inspector: 17, icon: 80 },
  'M': { map: 0.5, inspector: 16, icon: 80 },
  'Neutron': { map: 0.6, inspector: 17, icon: 80 },
  'Black Hole': { map: 1.0, inspector: 24, icon: 80 }
};

const DEFAULT_SIZE = { map: 0.6, inspector: 18, icon: 80 };

export const getStarVisual = (starType) => {
  const starInfo = getStarByType(starType);
  const sizeConfig = STAR_SIZE_MAP[starType] || DEFAULT_SIZE;

  // Base radii derived from the central map
  const baseMapRadius = sizeConfig.map * (HEX_SIZE / 4);
  const baseInspectorRadius = sizeConfig.inspector;
  
  return {
    starInfo,
    colors: starInfo?.color,
    baseMapRadius,
    baseInspectorRadius,
    inspectorIconSize: sizeConfig.icon
  };
};
