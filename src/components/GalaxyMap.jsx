import React, { useMemo, useState, useEffect, useRef } from 'react';
import { HEX_SIZE, HEX_HEIGHT, GALAXY_CHUNK_BUFFER } from '../constants';
import { generateSector } from '../generation/sectorGeneration';
import HexagonShape from './HexagonShape';
import { usePanZoom } from '../hooks/usePanZoom';
import MapBackground from './starmap/MapBackground';

export default function GalaxyMap({
  seed,
  gridSize,
  generatorSettings,
  initialSectorCoords,
  onSectorSelect
}) {
  // Start centered on the initial sector
  const [viewState, setViewState] = useState({ scale: 0.5, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const panZoomHandlers = usePanZoom(viewState, setViewState);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Cache generated sectors to prevent re-running generation on every frame
  // Key: "q,r" -> Value: systemData
  const [sectorCache, setSectorCache] = useState({});

  // Dimensions of a single sector in pixels
  const sectorPixelWidth = useMemo(() => (gridSize.width * 1.5 * HEX_SIZE) + (HEX_SIZE * 0.5), [gridSize]); // Slight adjustment for hex overlap logic?
  // Actually, standard spacing is 1.5 * size per column. 
  // Width = (cols * 1.5 * size) + (0.5 * size) to close the last hex edge? 
  // Let's stick to the tile stride: 
  const sectorStrideX = gridSize.width * 1.5 * HEX_SIZE;
  const sectorStrideY = gridSize.height * HEX_HEIGHT;

  // Calculate visible sectors based on viewState
  const visibleSectors = useMemo(() => {
    // Invert the transform to find the "world" coordinates of the viewport
    const viewportLeft = -viewState.x / viewState.scale;
    const viewportTop = -viewState.y / viewState.scale;
    const viewportRight = (window.innerWidth - viewState.x) / viewState.scale;
    const viewportBottom = (window.innerHeight - viewState.y) / viewState.scale;

    const startQ = Math.floor(viewportLeft / sectorStrideX) - GALAXY_CHUNK_BUFFER;
    const endQ = Math.floor(viewportRight / sectorStrideX) + GALAXY_CHUNK_BUFFER;
    const startR = Math.floor(viewportTop / sectorStrideY) - GALAXY_CHUNK_BUFFER;
    const endR = Math.floor(viewportBottom / sectorStrideY) + GALAXY_CHUNK_BUFFER;

    const sectors = [];
    for (let q = startQ; q <= endQ; q++) {
      for (let r = startR; r <= endR; r++) {
        sectors.push({ q, r });
      }
    }
    return sectors;
  }, [viewState, sectorStrideX, sectorStrideY]);

  // Generate missing sectors
  useEffect(() => {
    let newCache = {};
    let hasNew = false;

    visibleSectors.forEach(({ q, r }) => {
      const key = `${q},${r}`;
      if (!sectorCache[key]) {
        // Generate on the fly!
        const systems = generateSector({
          ...generatorSettings,
          seed,
          sectorQ: q,
          sectorR: r,
          gridSize // Ensure consistent grid size
        });
        newCache[key] = systems;
        hasNew = true;
      }
    });

    if (hasNew) {
      setSectorCache(prev => ({ ...prev, ...newCache }));
    }
  }, [visibleSectors, sectorCache, seed, generatorSettings, gridSize]);

  const handleMouseDownCapture = (e) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMapClick = (e) => {
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Only trigger click if it wasn't a drag
    if (Math.sqrt(dx * dx + dy * dy) < 5) {
      // Find which sector and hex was clicked? 
      // For now, just allow panning. 
      // If we want to jump to a sector, we'd need to inverse map the mouse.
    }
  };

  return (
    <div className="flex-1 relative bg-slate-950 overflow-hidden cursor-move w-full h-full">
      <MapBackground viewState={viewState} />
      
      <div
        className="w-full h-full"
        {...panZoomHandlers}
        onMouseDownCapture={handleMouseDownCapture}
        onClick={handleMapClick}
      >
        <svg width="100%" height="100%">
          <g transform={`translate(${viewState.x}, ${viewState.y}) scale(${viewState.scale})`}>
            {visibleSectors.map(({ q: sq, r: sr }) => {
              const systems = sectorCache[`${sq},${sr}`];
              if (!systems) return null;

              const sectorOffsetX = sq * sectorStrideX;
              const sectorOffsetY = sr * sectorStrideY;

              return (
                <g key={`${sq},${sr}`} transform={`translate(${sectorOffsetX}, ${sectorOffsetY})`}>
                  {/* Debug Border 
                  <rect width={sectorStrideX} height={sectorStrideY} fill="none" stroke="red" strokeWidth="2" opacity="0.2" />
                  */}
                  
                  {Array.from({ length: gridSize.width }).map((_, q) => (
                    Array.from({ length: gridSize.height }).map((_, r) => {
                      const sys = systems[`${q},${r}`];
                      return (
                        <HexagonShape
                          key={`${q},${r}`}
                          q={q}
                          r={r}
                          hasSystem={!!sys}
                          systemData={sys}
                          isSelected={false}
                          onClick={() => {}} // Disable interaction in galaxy view for now
                        />
                      );
                    })
                  ))}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
