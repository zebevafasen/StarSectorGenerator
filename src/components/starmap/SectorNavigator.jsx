import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { HEX_SIZE, HEX_HEIGHT } from '../../constants';

// Angular "Tab" style for the buttons
const TabPolygon = ({ points, onClick, children, title }) => (
  <g 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="cursor-pointer group"
  >
    <title>{title}</title>
    <polygon
      points={points}
      className="fill-slate-900/90 stroke-slate-700 stroke-1 transition-all group-hover:fill-blue-900/40 group-hover:stroke-blue-500 group-active:scale-95"
    />
    {children}
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

  const iconSize = 20;

  return (
    <g className="sector-navigator select-none">
      {/* North */}
      <TabPolygon 
        title="Move North"
        onClick={() => handleNav(0, -1)}
        points={`${midX-30},0 ${midX+30},0 ${midX+20},25 ${midX-20},25`}
      >
        <g transform={`translate(${midX - iconSize/2}, 2)`}>
          <ChevronUp size={iconSize} className="text-slate-500 group-hover:text-blue-400" />
        </g>
      </TabPolygon>

      {/* South */}
      <TabPolygon 
        title="Move South"
        onClick={() => handleNav(0, 1)}
        points={`${midX-20},${gridHeight-5} ${midX+20},${gridHeight-5} ${midX+30},${gridHeight+20} ${midX-30},${gridHeight+20}`}
      >
        <g transform={`translate(${midX - iconSize/2}, ${gridHeight - 3})`}>
          <ChevronDown size={iconSize} className="text-slate-500 group-hover:text-blue-400" />
        </g>
      </TabPolygon>

      {/* West */}
      <TabPolygon 
        title="Move West"
        onClick={() => handleNav(-1, 0)}
        points={`0,${midY-30} 25,${midY-20} 25,${midY+20} 0,${midY+30}`}
      >
        <g transform={`translate(2, ${midY - iconSize/2})`}>
          <ChevronLeft size={iconSize} className="text-slate-500 group-hover:text-blue-400" />
        </g>
      </TabPolygon>

      {/* East */}
      <TabPolygon 
        title="Move East"
        onClick={() => handleNav(1, 0)}
        points={`${gridWidth+10},${midY-20} ${gridWidth+35},${midY-30} ${gridWidth+35},${midY+30} ${gridWidth+10},${midY+20}`}
      >
        <g transform={`translate(${gridWidth + 12}, ${midY - iconSize/2})`}>
          <ChevronRight size={iconSize} className="text-slate-500 group-hover:text-blue-400" />
        </g>
      </TabPolygon>
    </g>
  );
}
