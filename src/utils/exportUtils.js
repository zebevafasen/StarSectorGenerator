export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const downloadSVGAsPNG = (svgId, filename, scale = 1) => {
  const svgElement = document.getElementById(svgId);
  if (!svgElement) {
    console.error(`SVG element with id "${svgId}" not found`);
    return;
  }

  // Clone the SVG to modify it for export without affecting the UI
  const clone = svgElement.cloneNode(true);
  const bbox = svgElement.getBoundingClientRect();
  const width = bbox.width;
  const height = bbox.height;

  // Set explicit dimensions and viewBox to ensure correct scaling in the canvas
  clone.setAttribute('width', width * scale);
  clone.setAttribute('height', height * scale);
  clone.setAttribute('viewBox', `0 0 ${width} ${height}`);

  // Inline critical styles because the canvas-to-SVG process won't have access to external CSS
  // We'll target the most common elements in our map
  const styles = `
    svg { background-color: #020617; font-family: ui-sans-serif, system-ui, sans-serif; }
    .fill-slate-900\\/80 { fill: rgba(15, 23, 42, 0.8) !important; }
    .stroke-slate-700 { stroke: #334155 !important; }
    .fill-blue-500\\/20 { fill: rgba(59, 130, 246, 0.2) !important; }
    .stroke-blue-400 { stroke: #60a5fa !important; }
    .stroke-1 { stroke-width: 1px !important; }
    .stroke-\\[3px\\] { stroke-width: 3px !important; }
  `;
  
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = styles;
  clone.prepend(styleEl);

  // Directly apply font-size to text elements to ensure they don't blow up
  const textElements = clone.querySelectorAll('text');
  textElements.forEach(text => {
    text.style.fontSize = '7.5px';
    text.style.fill = '#64748b';
    text.style.pointerEvents = 'none';
    text.style.userSelect = 'none';
    text.style.textAnchor = 'middle';
  });

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  canvas.width = width * scale;
  canvas.height = height * scale;

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    // Fill background (double-tap to ensure no transparency)
    ctx.fillStyle = '#020617'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the scaled SVG
    ctx.drawImage(img, 0, 0);
    
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  img.src = url;
};
