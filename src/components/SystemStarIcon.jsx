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
    // Ensure the SVG box is large enough for the star + glow + blur
    // Glow is radius * 1.3, we add extra margin for the blur filter (3px)
    const margin = 8;
    const requiredSize = (finalRadius * 1.3 * 2) + margin;
    const center = requiredSize / 2;
    
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: requiredSize, height: requiredSize }}
      >
        <svg 
          width={requiredSize} 
          height={requiredSize} 
          viewBox={`0 0 ${requiredSize} ${requiredSize}`}
          className="overflow-visible"
        >
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
