import React, { useMemo, useState, useRef } from 'react';
import { HEX_SIZE, HEX_HEIGHT } from '../constants';
import HexagonShape from './HexagonShape';
import { usePanZoom } from '../hooks/usePanZoom';
import MapBackground from './starmap/MapBackground';

export default function GalaxyMap({
  universe,
  initialSectorCoords
}) {
  const [viewState, setViewState] = useState({ scale: 0.3, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const panZoomHandlers = usePanZoom(viewState, setViewState);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Calculate sector offsets based on their Q,R coordinates
  // We use a fixed stride for the galaxy view to keep things simple
  // Assumes sectors use standard 8x10 or similar even grid widths
  const getSectorStride = (gridSize) => ({
    x: gridSize.width * 1.5 * HEX_SIZE,
    y: gridSize.height * HEX_HEIGHT
  });

  const handleMouseDownCapture = (e) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMapClick = (e) => {
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) < 5) {
      // Future: Implement sector selection to jump back to Local View
    }
  };

  const exploredSectors = useMemo(() => Object.entries(universe), [universe]);

  return (
    <div className="flex-1 relative bg-slate-950 overflow-hidden cursor-move w-full h-full">
      <MapBackground viewState={viewState} />
      
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-slate-900/60 backdrop-blur-sm border border-slate-800 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-slate-400 font-bold shadow-2xl">
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
                <g key={key} transform={`translate(${sectorOffsetX}, ${sectorOffsetY})`}>
                  {/* Sector Boundary */}
                  <rect 
                    width={stride.x} 
                    height={stride.y} 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2" 
                    opacity="0.05" 
                    className="pointer-events-none"
                  />
                  
                  {/* Hexes in this sector */}
                  {Array.from({ length: gridSize.width }).map((_, q) => (
                    Array.from({ length: gridSize.height }).map((_, r) => {
                      const sys = systems[`${q},${r}`];
                      if (!sys) return null;
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
                    })
                  ))}

                  {/* Sector Coordinate Label */}
                  <text
                    x={stride.x / 2}
                    y={-10}
                    className="text-xs fill-slate-600 font-mono font-bold select-none pointer-events-none"
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