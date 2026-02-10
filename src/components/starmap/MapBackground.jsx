import React from 'react';

export default function MapBackground({ viewState }) {
  return (
    <div className="absolute inset-0 opacity-5 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #475569 1px, transparent 0)',
        backgroundSize: '40px 40px',
        transform: `translate(${viewState.x % 40}px, ${viewState.y % 40}px)`
      }}
    />
  );
}
