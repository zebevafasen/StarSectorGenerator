import { HEX_SIZE } from '../constants';
import { getStarByType } from './starData';

// Central mapping for star sizes to remove dependency on JSON values
const STAR_SIZE_MAP = {
  'O': { map: 1.0, inspector: 16, icon: 64 },
  'B': { map: 0.9, inspector: 16, icon: 64 },
  'A': { map: 0.8, inspector: 16, icon: 64 },
  'F': { map: 0.75, inspector: 16, icon: 64 },
  'G': { map: 0.6, inspector: 16, icon: 64 },
  'K': { map: 0.55, inspector: 16, icon: 64 },
  'M': { map: 0.5, inspector: 16, icon: 64 },
  'Neutron': { map: 0.6, inspector: 16, icon: 64 },
  'Black Hole': { map: 1.0, inspector: 16, icon: 64 }
};

const DEFAULT_SIZE = { map: 0.6, inspector: 16, icon: 64 };

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
