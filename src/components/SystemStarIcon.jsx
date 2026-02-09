import React, { useId } from 'react';
import StarIcon from './StarIcon';
import { getStarVisual } from '../utils/starVisuals';

const SystemStarIcon = ({ starType, mode = 'map', uid, x = 0, y = 0, className = '' }) => {
  const {
    colors,
    mapRadius,
    mapOuterRadius,
    inspectorRadius,
    inspectorOuterRadius,
    inspectorIconSize
  } = getStarVisual(starType);

  const fallbackUid = useId().replace(/:/g, '');
  const safeUid = uid || `${mode}-${fallbackUid}`;

  if (mode === 'inspector') {
    const center = inspectorIconSize / 2;
    return (
      <div
        className={className}
        style={{ width: inspectorIconSize, height: inspectorIconSize, padding: '4px' }}
      >
        <svg width={inspectorIconSize} height={inspectorIconSize} viewBox={`0 0 ${inspectorIconSize} ${inspectorIconSize}`}>
          <StarIcon
            colors={colors}
            radius={inspectorRadius}
            outerRadius={inspectorOuterRadius}
            x={center}
            y={center}
            uid={safeUid}
          />
        </svg>
      </div>
    );
  }

  return (
    <StarIcon
      colors={colors}
      radius={mapRadius}
      outerRadius={mapOuterRadius}
      x={x}
      y={y}
      uid={safeUid}
    />
  );
};

export default SystemStarIcon;
