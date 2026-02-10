import React, { useMemo, useState, useRef } from 'react';
import { HEX_SIZE, HEX_HEIGHT } from '../constants';
import HexagonShape from './HexagonShape';
import MapContainer from './starmap/MapContainer';

export default function GalaxyMap({
  universe,
  initialSectorCoords,
  onSectorSelect
}) {
  const [viewState, setViewState] = useState({ scale: 0.3, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [lastCenteredCoords, setLastCenteredCoords] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  const currentCoords = initialSectorCoords || { q: 0, r: 0 };
  const coordKey = `${currentCoords.q},${currentCoords.r}`;

  // Center camera on current sector when it changes (Render-time adjustment)
  if (lastCenteredCoords !== coordKey) {
    const sectorData = universe[coordKey];
    if (sectorData) {
      const stride = {
        x: sectorData.gridSize.width * 1.5 * HEX_SIZE,
        y: sectorData.gridSize.height * HEX_HEIGHT
      };
      const sectorCenterX = currentCoords.q * stride.x + stride.x / 2;
      const sectorCenterY = currentCoords.r * stride.y + stride.y / 2;

      setViewState(prev => ({
        ...prev,
        x: window.innerWidth / 2 - (sectorCenterX * prev.scale),
        y: window.innerHeight / 2 - (sectorCenterY * prev.scale)
      }));
      setLastCenteredCoords(coordKey);
    }
  }

  const exploredSectors = useMemo(() => Object.entries(universe), [universe]);

  // Find all active jump gate connections in the explored universe
  const jumpPaths = useMemo(() => {
    const paths = [];
    exploredSectors.forEach(([key, sectorData]) => {
      const [sq, sr] = key.split(',').map(Number);
      const { systems, gridSize } = sectorData;
      const stride = {
        x: gridSize.width * 1.5 * HEX_SIZE,
        y: gridSize.height * HEX_HEIGHT
      };

      Object.values(systems).forEach(sys => {
        if (sys.isPOI && (sys.type === 'Jump-Gate' || sys.type === 'Jump Gate') && sys.state === 'Active' && sys.destination) {
          const destKey = `${sys.destination.q},${sys.destination.r}`;
          // Only draw path if the destination is also explored (looks cleaner)
          if (universe[destKey]) {
            const destSector = universe[destKey];
            const destStride = {
              x: destSector.gridSize.width * 1.5 * HEX_SIZE,
              y: destSector.gridSize.height * HEX_HEIGHT
            };

            paths.push({
              id: `${key}-${destKey}-${sys.location.q}-${sys.location.r}`,
              start: {
                x: sq * stride.x + (HEX_SIZE * 1.5 * sys.location.q + HEX_SIZE),
                y: sr * stride.y + (HEX_HEIGHT * (sys.location.r + 0.5 * (sys.location.q % 2)) + HEX_HEIGHT / 2)
              },
              end: {
                x: sys.destination.q * destStride.x + destStride.x / 2,
                y: sys.destination.r * destStride.y + destStride.y / 2
              },
              color: sys.color || '#3f424a'
            });
          }
        }
      });
    });
    return paths;
  }, [exploredSectors, universe]);

  const handleMouseDownCapture = (e) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleSectorClick = (e, q, r) => {
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      onSectorSelect?.({ q, r });
    }
  };

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
    <MapContainer 
      viewState={viewState} 
      setViewState={setViewState}
      onMouseDownCapture={handleMouseDownCapture}
    >
      <g className="galaxy-view-content">
        {/* Draw Jump Paths First (Background) */}
        {jumpPaths.map(path => (
          <g key={path.id}>
            {/* Glow */}
            <line 
              x1={path.start.x} y1={path.start.y} 
              x2={path.end.x} y2={path.end.y} 
              stroke={path.color} 
              strokeWidth="10" 
              strokeLinecap="round" 
              opacity="0.05"
              style={{ filter: 'blur(8px)' }}
            />
            {/* Core Line */}
            <line 
              x1={path.start.x} y1={path.start.y} 
              x2={path.end.x} y2={path.end.y} 
              stroke={path.color} 
              strokeWidth="1.5" 
              strokeDasharray="5 5"
              opacity="0.3"
            >
              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="10s" repeatCount="indefinite" />
            </line>
          </g>
        ))}

        {exploredSectors.map(([key, sectorData]) => {
          const [sq, sr] = key.split(',').map(Number);
          const { systems, gridSize } = sectorData;
          const stride = {
            x: gridSize.width * 1.5 * HEX_SIZE,
            y: gridSize.height * HEX_HEIGHT
          };
          
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

              <path 
                d={getSectorGridPath(gridSize)} 
                fill="none" 
                stroke="#1e293b" 
                strokeWidth="0.5" 
                opacity="0.4"
                className="pointer-events-none"
              />
              
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
    </MapContainer>
  );
}
