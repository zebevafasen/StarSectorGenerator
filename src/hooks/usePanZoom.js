import { useState, useRef } from 'react';

export function usePanZoom(viewState, setViewState) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const onWheel = (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.5, viewState.scale + scaleAmount), 3);
    setViewState(prev => ({ ...prev, scale: newScale }));
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
