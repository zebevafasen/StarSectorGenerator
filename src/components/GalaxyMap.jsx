import React, { useMemo, useState } from 'react';
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
    <MapContainer viewState={viewState} setViewState={setViewState}>
      <g className="galaxy-view-content">
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
                onSectorSelect?.({ q: sq, r: sr });
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