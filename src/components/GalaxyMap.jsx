import React, { useMemo, useState, useRef } from 'react';
import { HEX_SIZE, HEX_HEIGHT } from '../constants';
import HexagonShape from './HexagonShape';
import { usePanZoom } from '../hooks/usePanZoom';
import MapBackground from './starmap/MapBackground';

export default function GalaxyMap({
  universe,
  initialSectorCoords,
  onSectorSelect
}) {
  const [viewState, setViewState] = useState({ scale: 0.3, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const panZoomHandlers = usePanZoom(viewState, setViewState);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Calculate sector offsets based on their Q,R coordinates
  const getSectorStride = (gridSize) => ({
    x: gridSize.width * 1.5 * HEX_SIZE,
    y: gridSize.height * HEX_HEIGHT
  });

  const handleMouseDownCapture = (e) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleSectorClick = (e, q, r) => {
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Only select if it was a quick click, not a drag/pan
    if (distance < 5) {
      onSectorSelect?.({ q, r });
    }
  };

  const exploredSectors = useMemo(() => Object.entries(universe), [universe]);

  // Helper to build a single path for an entire sector's background hexes
  const getSectorGridPath = (gridSize) => {
    let path = "";
    const h = HEX_HEIGHT / 2;
    const s = HEX_SIZE;
    const s2 = s / 2;

    for (let q = 0; q < gridSize.width; q++) {
      for (let r = 0; r < gridSize.height; r++) {
        const x = HEX_SIZE * 1.5 * q + HEX_SIZE;
        const y = HEX_HEIGHT * (r + 0.5 * (q % 2)) + HEX_HEIGHT / 2;
        path += `M ${x+s} ${y} L ${x+s2} ${y+h} L ${x-s2} ${y+h} L ${x-s} ${y} L ${x-s2} ${y-h} L ${x+s2} ${y-h} Z `;
      }
    }
    return path;
  };

  return (
    <div className="flex-1 relative bg-slate-950 overflow-hidden cursor-move w-full h-full">
      <MapBackground viewState={viewState} />
      
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-slate-900/60 backdrop-blur-sm border border-slate-800 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-slate-400 font-bold shadow-2xl pointer-events-none">
        Explored Universe ({exploredSectors.length} Sectors)
      </div>

      <div
        className="w-full h-full"
        {...panZoomHandlers}
        onMouseDownCapture={handleMouseDownCapture}
        onClick={handleMapClick}
      >
        <svg width="100%" height="100%">
          <g transform={`translate(${viewState.x}, ${viewState.y}) scale(${viewState.scale})`}>
            {exploredSectors.map(([key, sectorData]) => {
              const [sq, sr] = key.split(',').map(Number);
              const { systems, gridSize } = sectorData;
              const stride = getSectorStride(gridSize);
              
              const sectorOffsetX = sq * stride.x;
              const sectorOffsetY = sr * stride.y;

              return (
                <g 
                  key={key} 
                  transform={`translate(${sectorOffsetX}, ${sectorOffsetY})`}
                  className="cursor-pointer group/sector"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectorClick(e, sq, sr);
                  }}
                >
                  {/* Sector Background / Hover Effect */}
                  <rect 
                    width={stride.x} 
                    height={stride.y} 
                    fill="#020617" 
                    fillOpacity="0.5"
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.1" 
                    className="transition-all group-hover/sector:fill-blue-500/5 group-hover/sector:opacity-30 group-hover/sector:stroke-blue-400 group-hover/sector:stroke-[3px]"
                  />

                  {/* Efficient background hex grid */}
                  <path 
                    d={getSectorGridPath(gridSize)} 
                    fill="none" 
                    stroke="#1e293b" 
                    strokeWidth="0.5" 
                    opacity="0.4"
                    className="pointer-events-none"
                  />
                  
                  {/* Only render actual systems and POIs as full HexagonShapes */}
                  {Object.entries(systems).map(([coordKey, sys]) => {
                    if (!sys) return null;
                    const [q, r] = coordKey.split(',').map(Number);
                    return (
                      <HexagonShape
                        key={`${q},${r}`}
                        q={q}
                        r={r}
                        hasSystem={true}
                        systemData={sys}
                        isSelected={false}
                        onClick={() => {}} 
                      />
                    );
                  })}

                  {/* Sector Coordinate Label */}
                  <text
                    x={stride.x / 2}
                    y={-10}
                    className="text-xs fill-slate-600 font-mono font-bold select-none pointer-events-none transition-colors group-hover/sector:fill-blue-400"
                    textAnchor="middle"
                  >
                    [{sq}, {sr}]
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
