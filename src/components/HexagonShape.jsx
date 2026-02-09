import React, { memo } from 'react';
import { HEX_SIZE, HEX_HEIGHT } from '../constants';
import { getHexId } from '../utils/helpers';
import SystemStarIcon from './SystemStarIcon';

// Pre-calculate points since dimensions are constant
const h = HEX_HEIGHT / 2;
const s = HEX_SIZE;
const s2 = s / 2;

const HEX_POINTS = `
  ${s},0
  ${s2},${h}
  ${-s2},${h}
  ${-s},0
  ${-s2},${-h}
  ${s2},${-h}
`;

const HexagonShape = ({ q, r, hasSystem, isSelected, onClick, systemData }) => {
  const x = HEX_SIZE * 1.5 * q;
  const y = HEX_HEIGHT * (r + 0.5 * (q % 2));
  
  return (
    <g 
      transform={`translate(${x + HEX_SIZE},${y + HEX_HEIGHT/2})`} 
      onClick={(e) => {
        e.stopPropagation(); // Prevent drag start when clicking hex
        onClick(q, r);
      }}
      className="cursor-pointer group"
    >
      <polygon 
        points={HEX_POINTS} 
        className={`
          transition-all duration-200 stroke-1
          ${isSelected ? 'fill-blue-500/20 stroke-blue-400 stroke-[3px]' : 'fill-slate-900/80 stroke-slate-700'}
          ${!isSelected && 'hover:fill-slate-800 hover:stroke-slate-500'}
        `}
      />
      
      <text 
        y={-HEX_SIZE/2} 
        className="text-[8px] fill-slate-500 pointer-events-none select-none text-center" 
        textAnchor="middle"
      >
        {getHexId(q, r)}
      </text>

      {hasSystem && (() => {
        const stars = systemData?.stars || (systemData?.star ? [systemData.star] : []);
        
        if (stars.length <= 1) {
          return <SystemStarIcon starType={stars[0]?.type} uid={`${q}-${r}`} />;
        }

        return stars.map((star, index) => {
          let xOffset = 0;
          let yOffset = 0;
          let scale = 1;

          if (stars.length === 2) {
            scale = 0.6;
            const offset = HEX_SIZE * 0.25;
            xOffset = index === 0 ? -offset : offset;
            yOffset = index === 0 ? -offset : offset;
          } else {
            scale = 0.5;
            const offset = HEX_SIZE * 0.3;
            if (index === 0) {
              yOffset = -offset;
            } else if (index === 1) {
              xOffset = offset;
              yOffset = offset * 0.6;
            } else {
              xOffset = -offset;
              yOffset = offset * 0.6;
            }
          }

          return (
            <g key={index} transform={`translate(${xOffset},${yOffset}) scale(${scale})`}>
              <SystemStarIcon 
                starType={star.type} 
                uid={`${q}-${r}-${index}`} 
              />
            </g>
          );
        });
      })()}
    </g>
  );
};

export default memo(HexagonShape);
