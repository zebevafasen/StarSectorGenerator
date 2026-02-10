import { useState, useCallback } from 'react';

export function useTooltip() {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });

  const handleTooltipEnter = useCallback((event, content) => {
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      content
    });
  }, []);

  const handleTooltipMove = useCallback((event) => {
    setTooltip((prev) => ({
      ...prev,
      show: true,
      x: event.clientX,
      y: event.clientY
    }));
  }, []);

  const handleTooltipLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    tooltip,
    handleTooltipEnter,
    handleTooltipMove,
    handleTooltipLeave
  };
}
