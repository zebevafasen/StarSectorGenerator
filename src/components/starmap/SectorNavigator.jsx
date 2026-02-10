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

  // Precise Grid Bounds Math
  // Width: Span from center to center is (W-1)*1.5*S. Add full width of hex (2*S).
  const actualWidth = (gridSize.width - 1) * 1.5 * HEX_SIZE + 2 * HEX_SIZE;
  // Height: Base height is H*H. Odd-q columns shift down by 0.5*H.
  const actualHeight = (gridSize.height + (gridSize.width > 1 ? 0.5 : 0)) * HEX_HEIGHT;
  
  const midX = actualWidth / 2;
  const midY = actualHeight / 2;

  const tabW = 80;
  const tabH = 30;
  const iconSize = 24;
  const gap = 20; // Increased gap from the grid edge

  return (
    <g className="sector-navigator select-none">
      {/* North */}
      <TabPolygon 
        title="Move North"
        onClick={() => handleNav(0, -1)}
        points={`${midX-tabW/2},-${gap} ${midX+tabW/2},-${gap} ${midX+tabW/3},-${tabH+gap} ${midX-tabW/3},-${tabH+gap}`}
        iconPos={{ x: midX - iconSize/2, y: -tabH - gap + 4 }}
      >
        <ChevronUp size={iconSize} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </TabPolygon>

      {/* South */}
      <TabPolygon 
        title="Move South"
        onClick={() => handleNav(0, 1)}
        points={`${midX-tabW/2},${actualHeight+gap} ${midX+tabW/2},${actualHeight+gap} ${midX+tabW/3},${actualHeight+tabH+gap} ${midX-tabW/3},${actualHeight+tabH+gap}`}
        iconPos={{ x: midX - iconSize/2, y: actualHeight + gap + 4 }}
      >
        <ChevronDown size={iconSize} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </TabPolygon>

      {/* West */}
      <TabPolygon 
        title="Move West"
        onClick={() => handleNav(-1, 0)}
        points={`-${gap},${midY-tabW/2} -${gap},${midY+tabW/2} -${tabH+gap},${midY+tabW/3} -${tabH+gap},${midY-tabW/3}`}
        iconPos={{ x: -tabH - gap + 4, y: midY - iconSize/2 }}
      >
        <ChevronLeft size={iconSize} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </TabPolygon>

      {/* East */}
      <TabPolygon 
        title="Move East"
        onClick={() => handleNav(1, 0)}
        points={`${actualWidth+gap},${midY-tabW/2} ${actualWidth+gap},${midY+tabW/2} ${actualWidth+tabH+gap},${midY+tabW/3} ${actualWidth+tabH+gap},${midY-tabW/3}`}
        iconPos={{ x: actualWidth + gap + 4, y: midY - iconSize/2 }}
      >
        <ChevronRight size={iconSize} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </TabPolygon>
    </g>
  );
}
