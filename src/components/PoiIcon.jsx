import React from 'react';
import { 
  Sparkles, 
  Waves, 
  Skull, 
  Zap, 
  Target, 
  HelpCircle,
  Gem,
  Factory
} from 'lucide-react';

const TYPE_ICONS = {
  'Nebula': Waves,
  'Anomaly': Sparkles,
  'Wreckage': Skull,
  'Danger': Zap,
  'Relic': Target,
  'Resource': Gem,
  'Outpost': Factory,
  'Mystery': HelpCircle
};

const PoiIcon = ({ type, color, size = 16, inSvg = false }) => {
  const IconComponent = TYPE_ICONS[type] || HelpCircle;
  
  if (inSvg) {
    return (
      <g className="poi-icon">
        <circle
          r={size * 0.7}
          fill={color}
          opacity="0.2"
        />
        <circle
          r={size * 0.3}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <path 
          d="M-2,-2 L2,2 M2,-2 L-2,2" 
          stroke={color} 
          strokeWidth="1.5" 
          opacity="0.8"
        />
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
