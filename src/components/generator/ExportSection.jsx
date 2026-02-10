import React, { useRef, useState } from 'react';
import { Download, Upload, Image as ImageIcon, Save } from 'lucide-react';
import { downloadJSON, importJSON, downloadSVGAsPNG } from '../../utils/exportUtils';

const RESOLUTIONS = [
  { label: 'SD (1x)', scale: 1 },
  { label: 'HD (2x)', scale: 2 },
  { label: 'UHD (4x)', scale: 4 }
];

export default function ExportSection({ 
  systems, 
  gridSize, 
  generatorSettings, 
  onImport 
}) {
  const fileInputRef = useRef(null);
  const [exportScale, setExportScale] = useState(2); // Default to HD

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      gridSize,
      generatorSettings,
      systems
    };
    const filename = `sector-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(data, filename);
  };

  const handleExportImage = () => {
    const res = RESOLUTIONS.find(r => r.scale === exportScale) || RESOLUTIONS[1];
    const filename = `sector-map-${res.label.split(' ')[0]}-${new Date().toISOString().slice(0, 10)}.png`;
    downloadSVGAsPNG('star-map-svg', filename, exportScale);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importJSON(file);
      if (data.systems && data.gridSize) {
        onImport(data);
      } else {
        alert('Invalid sector file format.');
      }
    } catch (error) {
      console.error('Failed to import sector:', error);
      alert('Failed to read file.');
    } finally {
      e.target.value = ''; // Reset input
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data & Export</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 hover:text-white transition-colors"
          title="Save Sector to JSON"
        >
          <Save size={14} /> Save JSON
        </button>

        <button
          onClick={handleImportClick}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 hover:text-white transition-colors"
          title="Load Sector from JSON"
        >
          <Upload size={14} /> Load JSON
        </button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      <div className="space-y-2">
        <label className="text-xs text-slate-400 block">Export Resolution</label>
        <div className="flex bg-slate-800 p-1 rounded-lg">
          {RESOLUTIONS.map((res) => (
            <button
              key={res.scale}
              onClick={() => setExportScale(res.scale)}
              className={`flex-1 py-1 text-[10px] font-medium rounded transition-all ${exportScale === res.scale ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {res.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleExportImage}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 hover:text-white transition-colors"
        title="Export Map as PNG"
      >
        <ImageIcon size={14} /> Export Map Image
      </button>
    </section>
  );
}
