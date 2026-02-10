import { useState, useRef } from 'react';

export function usePanZoom(viewState, setViewState) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const onWheel = (e) => {
    e.preventDefault();
    
    const zoomSpeed = 0.0015;
    const scaleChange = -e.deltaY * zoomSpeed;
    const newScale = Math.min(Math.max(0.1, viewState.scale + scaleChange), 3);
    
    if (newScale === viewState.scale) return;

    // Calculate mouse position relative to the container
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate where the mouse is in "world space" before zooming
    const worldX = (mouseX - viewState.x) / viewState.scale;
    const worldY = (mouseY - viewState.y) / viewState.scale;

    // Adjust x and y so the same world-space coordinate stays under the mouse after scaling
    setViewState({
      scale: newScale,
      x: mouseX - worldX * newScale,
      y: mouseY - worldY * newScale
    });
  };

  const onMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - viewState.x,
      y: e.clientY - viewState.y
    };
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setViewState(prev => ({
      ...prev,
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    }));
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  return {
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: onMouseUp
  };
}
