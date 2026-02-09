export const getHexId = (q, r) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(q)}${pad(r)}`;
};
