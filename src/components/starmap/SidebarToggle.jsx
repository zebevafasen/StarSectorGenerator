import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SidebarToggle({ side, isOpen, onToggle }) {
  const isLeft = side === 'left';
  const Icon = isOpen 
    ? (isLeft ? ChevronLeft : ChevronRight) 
    : (isLeft ? ChevronRight : ChevronLeft);
  
  const positionClass = isLeft 
    ? (isOpen ? '-left-[1px]' : 'left-0')
    : (isOpen ? '-right-[1px]' : 'right-0');

  const borderClass = isLeft ? 'border-y border-r rounded-r-lg' : 'border-y border-l rounded-l-lg';

  return (
    <button
      onClick={() => onToggle(!isOpen)}
      className={`absolute top-6 z-30 p-2 bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-md ${positionClass} ${borderClass}`}
      title={isOpen ? `Collapse ${isLeft ? 'Sidebar' : 'Inspector'}` : `Expand ${isLeft ? 'Sidebar' : 'Inspector'}`}
    >
      <Icon size={20} />
    </button>
  );
}
