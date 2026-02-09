import React, { useState, useCallback, useMemo } from 'react';
import { HEX_SIZE, HEX_HEIGHT, SIDEBAR_WIDTH } from './constants';
import GeneratorPanel from './components/GeneratorPanel';
import InspectorPanel from './components/InspectorPanel';
import StarMap from './components/StarMap';

// --- Constants & Data Models ---

export default function App() {
  // Settings State
  const [gridSize, setGridSize] = useState({ width: 8, height: 10 });
  
  // Data State
  const [systems, setSystems] = useState({});
  const [selectedCoords, setSelectedCoords] = useState(null);
  
  // Viewport State
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });

  const resetView = useCallback((size = gridSize) => {
    // Center logic roughly approximates centering the grid
    const sidebarWidth = (showLeftSidebar ? SIDEBAR_WIDTH : 0) + (showRightSidebar ? SIDEBAR_WIDTH : 0);
    const centerX = (window.innerWidth - sidebarWidth) / 2;
    const centerY = window.innerHeight / 2;
    const gridPixelWidth = size.width * 1.5 * HEX_SIZE;
    const gridPixelHeight = size.height * HEX_HEIGHT;
    
    setViewState({ 
      scale: 1, 
      x: centerX - (gridPixelWidth / 2), 
      y: centerY - (gridPixelHeight / 2) 
    });
  }, [gridSize, showLeftSidebar, showRightSidebar]);

  // --- Generation Logic ---

  const handleSectorGenerated = useCallback((newSystems, newGridSize) => {
    setSystems(newSystems);
    setGridSize(newGridSize);
    setSelectedCoords(null);
    resetView(newGridSize);
  }, [resetView]);

  const generatorStyle = useMemo(() => ({ display: showLeftSidebar ? 'flex' : 'none' }), [showLeftSidebar]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
        
        {/* LEFT COLUMN: Generator Settings */}
        <GeneratorPanel
          onGenerate={handleSectorGenerated}
          style={generatorStyle}
        />

        {/* CENTER COLUMN: Map View */}
        <StarMap
          gridSize={gridSize}
          systems={systems}
          selectedCoords={selectedCoords}
          setSelectedCoords={setSelectedCoords}
          viewState={viewState}
          setViewState={setViewState}
          showLeftSidebar={showLeftSidebar}
          setShowLeftSidebar={setShowLeftSidebar}
          showRightSidebar={showRightSidebar}
          setShowRightSidebar={setShowRightSidebar}
        />

        {/* RIGHT COLUMN: Inspector */}
        {showRightSidebar && (
          <InspectorPanel
            gridSize={gridSize}
            systems={systems}
            selectedCoords={selectedCoords}
            setSelectedCoords={setSelectedCoords}
          />
        )}

    </div>
  );
}