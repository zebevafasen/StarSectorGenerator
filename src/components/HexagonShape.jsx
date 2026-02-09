import React, { memo } from 'react';
import { HEX_SIZE, HEX_HEIGHT } from '../constants';
import { getHexId } from '../utils/helpers';
import StarIcon from './StarIcon';
import starData from '../data/stars.json';

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

  const starType = systemData?.star?.type;
  const starInfo = starType ? starData.find(s => s.type === starType) : null;
  const displayStarInfo = starInfo || starData.find(s => s.type === 'G');
  const mapRadius = (displayStarInfo ? displayStarInfo.data.size.map : 1) * (HEX_SIZE / 4);
  
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

      {hasSystem && (
        <StarIcon 
          colors={displayStarInfo?.color} 
          radius={mapRadius} 
          outerRadius={mapRadius * 1.2}
          uid={`${q}-${r}`}
        />
      )}
    </g>
  );
};

export default memo(HexagonShape);