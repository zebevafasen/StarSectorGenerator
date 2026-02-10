import { useState, useCallback } from 'react';

/**
 * Hook to manage multiple named accordion/collapsible sections.
 * 
 * @param {Object} initialStates - Initial expanded state for each section (e.g. { stars: true }).
 * @returns {Object} { expanded, toggle, setExpanded }
 */
export function useAccordion(initialStates = {}) {
  const [expanded, setExpanded] = useState(initialStates);

  const toggle = useCallback((section) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  return { expanded, toggle, setExpanded };
}
