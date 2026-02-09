import React from 'react';

const StarIcon = ({ colors, radius, outerRadius, x = 0, y = 0, uid }) => {
  const gradientId = `star-grad-${uid}`;
  const main = colors?.main ?? colors?.core;
  const detail = colors?.detail ?? colors?.mid ?? main;
  const glow = colors?.glow ?? colors?.halo ?? detail;

  return (
    <>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
          <stop offset="0%" stopColor={detail} />
          <stop offset="100%" stopColor={main} />
        </radialGradient>
      </defs>
      <circle 
        cx={x} cy={y}
        r={outerRadius} 
        fill={glow}
        className="pointer-events-none"
        style={{ filter: 'blur(3px)', opacity: 0.5 }}
      />
      <circle 
        cx={x} cy={y}
        r={radius} 
        fill={`url(#${gradientId})`} 
        className="shadow-lg pointer-events-none"
      />
    </>
  );
};

export default StarIcon;
