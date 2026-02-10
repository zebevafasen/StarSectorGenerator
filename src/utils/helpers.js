export const getHexId = (q, r) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(q)}${pad(r)}`;
};

export const clampInt = (value, min, max, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

