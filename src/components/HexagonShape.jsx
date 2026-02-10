import React, { memo } from 'react';
import { HEX_SIZE, HEX_HEIGHT } from '../constants';
import { getHexId } from '../utils/helpers';
import { getSystemStarLayout } from '../utils/starLayout';
import SystemStarIcon from './SystemStarIcon';

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

  const stars = systemData?.stars || (systemData?.star ? [systemData.star] : []);

  return (
    <g
      transform={`translate(${x + HEX_SIZE},${y + HEX_HEIGHT / 2})`}
      onClick={(e) => {
        e.stopPropagation();
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
        y={HEX_SIZE * 0.75}
        className="text-[7.5px] fill-slate-500 pointer-events-none select-none text-center"
        textAnchor="middle"
      >
        {getHexId(q, r)}
      </text>

      {hasSystem && systemData?.belts?.length > 0 && (
        <circle
          cx="0"
          cy="0"
          r={HEX_SIZE * 0.45}
          fill="none"
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          className="pointer-events-none opacity-70"
        />
      )}

      {hasSystem &&
        stars.map((star, index) => {
          const { xOffset, yOffset, scale } = getSystemStarLayout(stars.length, index);
          return (
            <g key={index} transform={`translate(${xOffset},${yOffset}) scale(${scale})`}>
              <SystemStarIcon starType={star.type} uid={`${q}-${r}-${index}`} />
            </g>
          );
        })}
    </g>
  );
};

export default memo(HexagonShape);
