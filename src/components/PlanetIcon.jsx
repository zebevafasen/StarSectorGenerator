import React, { useId } from 'react';
import { getPlanetByType } from '../utils/planetUtils';

const PlanetIcon = ({ type, radius = 12, className = "" }) => {
  const planetData = getPlanetByType(type);
  
  // Use React's deterministic id to avoid collisions without impure render-time randomness.
  const uniqueId = useId().replace(/:/g, '');

  if (!planetData) return <div className={`rounded-full bg-slate-700 ${className}`} style={{ width: radius * 2, height: radius * 2 }} />;

  const { main, detail, glow } = planetData.color;
  const size = radius * 2;
  const center = radius;

  const renderSurfaceFeatures = () => {
    switch (type) {
      case 'Gas Giant':
        return (
          <>
            <path d={`M0,${size * 0.3} Q${center},${size * 0.4} ${size},${size * 0.3} V${size * 0.45} Q${center},${size * 0.55} 0,${size * 0.45} Z`} fill={detail} opacity="0.5" />
            <path d={`M0,${size * 0.6} Q${center},${size * 0.7} ${size},${size * 0.6} V${size * 0.7} Q${center},${size * 0.8} 0,${size * 0.7} Z`} fill={detail} opacity="0.5" />
            <rect x="0" y={size * 0.48} width={size} height={size * 0.05} fill={detail} opacity="0.3" />
          </>
        );
      case 'Terrestrial':
        return (
          <>
            <path d={`M${size * 0.2},${size * 0.3} Q${size * 0.4},${size * 0.1} ${size * 0.6},${size * 0.3} T${size * 0.8},${size * 0.5} V${size} H0 V${size * 0.5} Z`} fill={detail} transform={`rotate(-15 ${center} ${center})`} opacity="0.8" />
            <circle cx={size * 0.7} cy={size * 0.3} r={radius * 0.2} fill={detail} opacity="0.8" />
          </>
        );
      case 'Oceanic':
        return (
          <>
             <path d={`M0,${size * 0.4} Q${center},${size * 0.3} ${size},${size * 0.4}`} stroke={detail} strokeWidth={radius * 0.1} fill="none" opacity="0.6" />
             <path d={`M0,${size * 0.6} Q${center},${size * 0.7} ${size},${size * 0.6}`} stroke={detail} strokeWidth={radius * 0.1} fill="none" opacity="0.6" />
          </>
        );
      case 'Barren':
        return (
          <>
            <circle cx={size * 0.3} cy={size * 0.4} r={radius * 0.25} fill={detail} opacity="0.6" />
            <circle cx={size * 0.7} cy={size * 0.7} r={radius * 0.15} fill={detail} opacity="0.6" />
            <circle cx={size * 0.5} cy={size * 0.2} r={radius * 0.1} fill={detail} opacity="0.6" />
          </>
        );
      case 'Desert':
        return (
          <>
            <path d={`M0,${size * 0.3} Q${center},${size * 0.4} ${size},${size * 0.3}`} stroke={detail} strokeWidth={radius * 0.15} fill="none" opacity="0.5" />
            <path d={`M0,${size * 0.5} Q${center},${size * 0.6} ${size},${size * 0.5}`} stroke={detail} strokeWidth={radius * 0.15} fill="none" opacity="0.5" />
            <path d={`M0,${size * 0.7} Q${center},${size * 0.8} ${size},${size * 0.7}`} stroke={detail} strokeWidth={radius * 0.15} fill="none" opacity="0.5" />
          </>
        );
      case 'Arctic':
        return (
          <>
            <path d={`M0,0 Q${center},${size * 0.35} ${size},0 Z`} fill="white" opacity="0.6" />
            <path d={`M0,${size} Q${center},${size * 0.65} ${size},${size} Z`} fill="white" opacity="0.6" />
          </>
        );
      case 'Volcanic':
        return (
          <>
            <path d={`M${center},${center} L${size * 0.2},${size * 0.8}`} stroke={detail} strokeWidth={radius * 0.1} strokeLinecap="round" />
            <path d={`M${center},${center} L${size * 0.8},${size * 0.3}`} stroke={detail} strokeWidth={radius * 0.1} strokeLinecap="round" />
            <path d={`M${center},${center} L${size * 0.7},${size * 0.8}`} stroke={detail} strokeWidth={radius * 0.1} strokeLinecap="round" />
            <circle cx={center} cy={center} r={radius * 0.15} fill="#FCA5A5" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <radialGradient id={`planet-grad-${uniqueId}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={main} stopOpacity="1" />
            <stop offset="100%" stopColor={detail} stopOpacity="1" />
          </radialGradient>
          <clipPath id={`planet-clip-${uniqueId}`}>
            <circle cx={center} cy={center} r={radius} />
          </clipPath>
          <filter id={`planet-glow-${uniqueId}`}>
            <feGaussianBlur stdDeviation={radius * 0.15} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`shadow-grad-${uniqueId}`} cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="80%" stopColor="black" stopOpacity="0.4" />
            <stop offset="100%" stopColor="black" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* Atmosphere Glow */}
        {glow && glow !== 'transparent' && (
          <circle 
            cx={center} 
            cy={center} 
            r={radius} 
            fill={glow} 
            opacity="0.4" 
            filter={`url(#planet-glow-${uniqueId})`} 
          />
        )}

        {/* Base Planet */}
        <circle cx={center} cy={center} r={radius} fill={`url(#planet-grad-${uniqueId})`} />

        {/* Surface Features (Clipped) */}
        <g clipPath={`url(#planet-clip-${uniqueId})`}>
          {renderSurfaceFeatures()}
        </g>

        {/* Shadow Overlay for 3D effect */}
        <circle 
          cx={center} 
          cy={center} 
          r={radius} 
          fill={`url(#shadow-grad-${uniqueId})`} 
          style={{ mixBlendMode: 'multiply' }} 
          pointerEvents="none"
        />
      </svg>
    </div>
  );
};

export default PlanetIcon;
