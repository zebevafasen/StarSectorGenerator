import React, { useId } from 'react';
import StarIcon from './StarIcon';
import { getStarVisual } from '../utils/starVisuals';

const SystemStarIcon = ({ 
  starType, 
  mode = 'map', 
  uid, 
  x = 0, 
  y = 0, 
  className = '',
  radius: explicitRadius,
  scale = 1
}) => {
  const {
    colors,
    baseMapRadius,
    baseInspectorRadius,
    inspectorIconSize
  } = getStarVisual(starType);

  const fallbackUid = useId().replace(/:/g, '');
  const safeUid = uid || `${mode}-${fallbackUid}`;

  // Determine final radius
  let finalRadius = explicitRadius;
  if (finalRadius === undefined) {
    finalRadius = mode === 'inspector' ? baseInspectorRadius : baseMapRadius;
  }
  
  // Apply scale multiplier
  finalRadius *= scale;

  if (mode === 'inspector') {
    const iconSize = explicitRadius ? (explicitRadius * 2.5) : inspectorIconSize;
    const center = iconSize / 2;
    
    return (
      <div
        className={className}
        style={{ width: iconSize, height: iconSize, padding: '4px' }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${iconSize} ${iconSize}`}>
          <StarIcon
            colors={colors}
            radius={finalRadius}
            outerRadius={finalRadius * 1.3}
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
      radius={finalRadius}
      outerRadius={finalRadius * 1.3}
      x={x}
      y={y}
      uid={safeUid}
    />
  );
};

export default SystemStarIcon;
