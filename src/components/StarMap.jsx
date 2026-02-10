import React, { useMemo, useCallback, useRef } from 'react';
import HexagonShape from './HexagonShape';
import { usePanZoom } from '../hooks/usePanZoom';
import SidebarToggle from './starmap/SidebarToggle';
import MapBackground from './starmap/MapBackground';
import SectorNavigator from './starmap/SectorNavigator';

export default function StarMap({
  gridSize,
  systems,
  selectedCoords,
  setSelectedCoords,
  viewState,
  setViewState,
  showLeftSidebar,
  setShowLeftSidebar,
  showRightSidebar,
  setShowRightSidebar,
  sectorCoords,
  onNavigate
}) {
  const panZoomHandlers = usePanZoom(viewState, setViewState);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDownCapture = (e) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMapClick = (e) => {
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) < 5) {
      setSelectedCoords(null);
    }
  };

  const handleHexClick = useCallback((q, r) => {
    setSelectedCoords({ q, r });
  }, [setSelectedCoords]);

  const hexGrid = useMemo(() => {
    return Array.from({ length: gridSize.width }).map((_, q) => (
      Array.from({ length: gridSize.height }).map((_, r) => (
        <HexagonShape
          key={`${q},${r}`}
          q={q}
          r={r}
          hasSystem={!!systems[`${q},${r}`]}
          systemData={systems[`${q},${r}`]}
          isSelected={selectedCoords?.q === q && selectedCoords?.r === r}
          onClick={handleHexClick}
        />
      ))
    ));
  }, [gridSize, systems, selectedCoords, handleHexClick]);

  return (
    <div className="flex-1 relative bg-slate-950 overflow-hidden cursor-move">
      <SidebarToggle 
        side="left" 
        isOpen={showLeftSidebar} 
        onToggle={setShowLeftSidebar} 
      />
      
      <SidebarToggle 
        side="right" 
        isOpen={showRightSidebar} 
        onToggle={setShowRightSidebar} 
      />

      <SectorNavigator 
        onNavigate={onNavigate} 
        sectorCoords={sectorCoords} 
      />

      <MapBackground viewState={viewState} />

      <div
        className="w-full h-full"
        {...panZoomHandlers}
        onMouseDownCapture={handleMouseDownCapture}
        onClick={handleMapClick}
      >
        <svg width="100%" height="100%" id="star-map-svg">
          <g transform={`translate(${viewState.x}, ${viewState.y}) scale(${viewState.scale})`}>
            {hexGrid}
          </g>
        </svg>
      </div>
    </div>
  );
}
