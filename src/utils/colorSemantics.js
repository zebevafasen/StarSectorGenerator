const DEFAULT_ACCENT = '#334155';

export const normalizePlanetColor = (color = {}) => {
  const main = color.main ?? color.base ?? DEFAULT_ACCENT;
  const detail = color.detail ?? color.secondary ?? main;
  const glow = color.glow ?? color.atmosphere ?? 'transparent';

  return {
    main,
    detail,
    glow,
    // Legacy aliases for existing rendering paths.
    base: main,
    secondary: detail,
    atmosphere: glow
  };
};

export const normalizeStarColor = (color = {}) => {
  const main = color.main ?? color.core ?? DEFAULT_ACCENT;
  const detail = color.detail ?? color.mid ?? main;
  const glow = color.glow ?? color.halo ?? detail;

  return {
    main,
    detail,
    glow,
    // Legacy aliases for existing rendering paths.
    core: main,
    mid: detail,
    halo: glow
  };
};

export const getMainColor = (color = {}) =>
  color.main ?? color.base ?? color.core ?? color.secondary ?? color.mid ?? color.halo ?? DEFAULT_ACCENT;
