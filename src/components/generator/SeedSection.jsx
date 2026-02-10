import React from 'react';
import { Dices } from 'lucide-react';

export default function SeedSection({ seed, setSeed, autoGenerateSeed, setAutoGenerateSeed }) {
  const randomizeSeed = () => setSeed(Math.random().toString(36).substring(7).toUpperCase());

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seed</h3>
      <div className="flex gap-1">
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none font-mono uppercase text-slate-200"
        />
        <button
          onClick={randomizeSeed}
          className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors"
          title="Randomize Seed"
        >
          <Dices size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="auto-seed"
          checked={autoGenerateSeed}
          onChange={(e) => setAutoGenerateSeed(e.target.checked)}
          className="accent-blue-600 w-3.5 h-3.5 bg-slate-800 border-slate-700 rounded cursor-pointer"
        />
        <label htmlFor="auto-seed" className="text-xs text-slate-400 cursor-pointer select-none">
          Randomize on Generate
        </label>
      </div>
    </section>
  );
}
