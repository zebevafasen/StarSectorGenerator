import React from 'react';

export default function MapBackground({ viewState, biome }) {
  const nebulaColor = biome?.colors?.nebula || 'transparent';
  const dotColor = biome?.colors?.primary || '#475569';

  return (
    <>
      <div className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          transform: `translate(${viewState.x % 40}px, ${viewState.y % 40}px)`
        }}
      />
      {/* Ambient Biome Glow */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${nebulaColor} 0%, transparent 80%)`,
        }}
      />
    </>
  );
}
