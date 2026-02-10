import React from 'react';
import { 
  Sparkles, 
  Waves, 
  Skull, 
  Zap, 
  Target, 
  HelpCircle,
  Gem,
  Factory,
  Compass,
  Milestone
} from 'lucide-react';

const TYPE_ICONS = {
  'Nebula': Waves,
  'Anomaly': Sparkles,
  'Wreckage': Skull,
  'Danger': Zap,
  'Relic': Target,
  'Resource': Gem,
  'Outpost': Factory,
  'Mystery': HelpCircle,
  'Navigation': Compass,
  'Jump Gate': Milestone,
  'Jump-Gate': Milestone,
  'Hazard': Zap
};

const PoiIcon = ({ type, color, size = 16, inSvg = false }) => {
  const IconComponent = TYPE_ICONS[type] || HelpCircle;
  
  if (inSvg) {
    const r = size * 0.4;
    // Simple diamond path: Top -> Right -> Bottom -> Left -> Close
    const diamondPath = `M 0 ${-r} L ${r} 0 L 0 ${r} L ${-r} 0 Z`;
    
    return (
      <g className="poi-icon">
        {/* Outer Glow */}
        <path
          d={diamondPath}
          fill={color}
          opacity="0.15"
          transform="scale(1.6)"
          style={{ filter: 'blur(1px)' }}
        />
        
        {/* Main Diamond Stroke */}
        <path
          d={diamondPath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        
        {/* Inner subtle fill */}
        <path
          d={diamondPath}
          fill={color}
          opacity="0.1"
        />

        {/* Core Dot */}
        <circle r="1" fill={color} />
      </g>
    );
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div 
        className="absolute inset-0 rounded-full blur-md opacity-40" 
        style={{ backgroundColor: color }}
      />
      <IconComponent 
        size={size} 
        color={color} 
        strokeWidth={2.5}
        className="relative z-10 drop-shadow-sm"
      />
    </div>
  );
};

export default PoiIcon;
