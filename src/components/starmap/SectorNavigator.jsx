import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { HEX_SIZE, HEX_HEIGHT } from '../../constants';

const TabPolygon = ({ points, onClick, children, title, iconPos }) => (
  <g 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="cursor-pointer group"
  >
    <title>{title}</title>
    {/* Glow effect */}
    <polygon
      points={points}
      className="fill-blue-500/0 stroke-blue-500/0 transition-all duration-300 group-hover:fill-blue-500/10 group-hover:stroke-blue-500/30"
      transform="scale(1.1)"
      style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
    />
    {/* Main Shape */}
    <polygon
      points={points}
      className="fill-slate-900/95 stroke-slate-700 stroke-[1.5px] transition-all duration-200 group-hover:stroke-blue-400 group-active:fill-blue-900/20"
    />
    <g transform={`translate(${iconPos.x}, ${iconPos.y})`}>
      {children}
    </g>
  </g>
);

export default function SectorNavigator({ onNavigate, sectorCoords, gridSize }) {
  if (!gridSize) return null;

  const handleNav = (dq, dr) => {
    onNavigate({
      q: (sectorCoords?.q || 0) + dq,
      r: (sectorCoords?.r || 0) + dr
    });
  };

  const gridWidth = gridSize.width * 1.5 * HEX_SIZE;
  const gridHeight = gridSize.height * HEX_HEIGHT;
  
  const midX = gridWidth / 2 + HEX_SIZE / 2;
  const midY = gridHeight / 2;

  const tabW = 80;
  const tabH = 35;
  const iconSize = 24;

  return (
    <g className="sector-navigator select-none">
      {/* North */}
      <TabPolygon 
        title="Move North"
        onClick={() => handleNav(0, -1)}
        points={`${midX-tabW/2},-2 ${midX+tabW/2},-2 ${midX+tabW/3},-${tabH} ${midX-tabW/3},-${tabH}`}
        iconPos={{ x: midX - iconSize/2, y: -tabH + 5 }}
      >
        <ChevronUp size={iconSize} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </TabPolygon>

      {/* South */}
      <TabPolygon 
        title="Move South"
        onClick={() => handleNav(0, 1)}
        points={`${midX-tabW/2},${gridHeight+2} ${midX+tabW/2},${gridHeight+2} ${midX+tabW/3},${gridHeight+tabH} ${midX-tabW/3},${gridHeight+tabH}`}
        iconPos={{ x: midX - iconSize/2, y: gridHeight + 5 }}
      >
        <ChevronDown size={iconSize} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </TabPolygon>

      {/* West */}
      <TabPolygon 
        title="Move West"
        onClick={() => handleNav(-1, 0)}
        points={`-2,${midY-tabW/2} -2,${midY+tabW/2} -${tabH},${midY+tabW/3} -${tabH},${midY-tabW/3}`}
        iconPos={{ x: -tabH + 5, y: midY - iconSize/2 }}
      >
        <ChevronLeft size={iconSize} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </TabPolygon>

      {/* East */}
      <TabPolygon 
        title="Move East"
        onClick={() => handleNav(1, 0)}
        points={`${gridWidth+HEX_SIZE+2},${midY-tabW/2} ${gridWidth+HEX_SIZE+2},${midY+tabW/2} ${gridWidth+HEX_SIZE+tabH},${midY+tabW/3} ${gridWidth+HEX_SIZE+tabH},${midY-tabW/3}`}
        iconPos={{ x: gridWidth + HEX_SIZE + 5, y: midY - iconSize/2 }}
      >
        <ChevronRight size={iconSize} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </TabPolygon>
    </g>
  );
}
