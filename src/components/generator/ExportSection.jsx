import React, { useRef } from 'react';
import { Download, Upload, Image as ImageIcon, Save } from 'lucide-react';
import { downloadJSON, importJSON, downloadSVGAsPNG } from '../../utils/exportUtils';

export default function ExportSection({ 
  systems, 
  gridSize, 
  generatorSettings, 
  onImport 
}) {
  const fileInputRef = useRef(null);

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
    const filename = `sector-map-${new Date().toISOString().slice(0, 10)}.png`;
    downloadSVGAsPNG('star-map-svg', filename);
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
