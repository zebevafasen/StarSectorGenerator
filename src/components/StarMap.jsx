import React, { useMemo, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HexagonShape from './HexagonShape';
import { usePanZoom } from '../hooks/usePanZoom';

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
  setShowRightSidebar
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

      {/* Sidebar Toggles */}
      <button
        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
        className={`absolute top-6 z-30 p-2 bg-slate-900 border-y border-r border-slate-800 rounded-r-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-md ${showLeftSidebar ? '-left-[1px]' : 'left-0'}`}
        title={showLeftSidebar ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {showLeftSidebar ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      <button
        onClick={() => setShowRightSidebar(!showRightSidebar)}
        className={`absolute top-6 z-30 p-2 bg-slate-900 border-y border-l border-slate-800 rounded-l-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-md ${showRightSidebar ? '-right-[1px]' : 'right-0'}`}
        title={showRightSidebar ? "Collapse Inspector" : "Expand Inspector"}
      >
        {showRightSidebar ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #475569 1px, transparent 0)',
          backgroundSize: '40px 40px',
          transform: `translate(${viewState.x % 40}px, ${viewState.y % 40}px)`
        }}
      />

      {/* SVG Container */}
      <div
        className="w-full h-full"
        {...panZoomHandlers}
        onMouseDownCapture={handleMouseDownCapture}
        onClick={handleMapClick}
      >
        <svg
          width="100%"
          height="100%"
        >

          <g transform={`translate(${viewState.x}, ${viewState.y}) scale(${viewState.scale})`}>
            {hexGrid}
          </g>
        </svg>
      </div>
    </div>
  );
}
