import React, { useMemo, useCallback } from 'react';
import HexagonShape from './HexagonShape';
import SectorNavigator from './starmap/SectorNavigator';
import MapContainer from './starmap/MapContainer';

export default function StarMap({
  gridSize,
  systems,
  selectedCoords,
  setSelectedCoords,
  viewState,
  setViewState,
  sectorCoords,
  onNavigate
}) {
  const handleHexClick = useCallback((q, r) => {
    setSelectedCoords({ q, r });
  }, [setSelectedCoords]);

  const handleBackgroundClick = useCallback(() => {
    setSelectedCoords(null);
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
    <MapContainer 
      viewState={viewState} 
      setViewState={setViewState}
      onBackgroundClick={handleBackgroundClick}
    >
      {hexGrid}
      <SectorNavigator 
        onNavigate={onNavigate} 
        sectorCoords={sectorCoords} 
        gridSize={gridSize}
      />
    </MapContainer>
  );
}