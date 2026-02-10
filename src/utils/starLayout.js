import { HEX_SIZE } from '../constants';

export const getSystemStarLayout = (count, index) => {
  if (count <= 1) {
    return { xOffset: 0, yOffset: 0, scale: 1 };
  }

  if (count === 2) {
    const offset = HEX_SIZE * 0.15;
    return {
      xOffset: index === 0 ? -offset : offset,
      yOffset: index === 0 ? -offset : offset,
      scale: 0.6
    };
  }

  const offset = HEX_SIZE * 0.2;
  if (index === 0) {
    return { xOffset: 0, yOffset: -offset, scale: 0.5 };
  }

  if (index === 1) {
    return { xOffset: offset, yOffset: offset * 0.6, scale: 0.5 };
  }

  return { xOffset: -offset, yOffset: offset * 0.6, scale: 0.5 };
};
