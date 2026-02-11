import React, { useRef } from 'react';
import { usePanZoom } from '../../hooks/usePanZoom';
import MapBackground from './MapBackground';

/**
 * MapContainer provides common pan/zoom and background logic for all map views.
 */
export default function MapContainer({ 
  viewState, 
  setViewState, 
  children, 
  onBackgroundClick,
  onMouseDownCapture,
  biome,
  className = "" 
}) {
  const panZoomHandlers = usePanZoom(viewState, setViewState);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDownCapture = (e) => {
    // Call external capture if provided
    onMouseDownCapture?.(e);
    // Local capture for background clicks
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleContainerClick = (e) => {
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Only trigger click if it wasn't a drag/pan
    if (Math.sqrt(dx * dx + dy * dy) < 5) {
      onBackgroundClick?.();
    }
  };

  return (
    <div 
      className={`flex-1 relative bg-slate-950 overflow-hidden cursor-move w-full h-full ${className}`}
      {...panZoomHandlers}
      onMouseDownCapture={handleMouseDownCapture}
      onClick={handleContainerClick}
    >
      <MapBackground viewState={viewState} biome={biome} />
      
      <svg width="100%" height="100%" id="star-map-svg">
        <g transform={`translate(${viewState.x}, ${viewState.y}) scale(${viewState.scale})`}>
          {children}
        </g>
      </svg>
    </div>
  );
}
