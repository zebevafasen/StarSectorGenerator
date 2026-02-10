import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SIDEBAR_WIDTH } from '../../constants';

export default function SidebarToggle({ side, isOpen, onToggle }) {
  const isLeft = side === 'left';
  const Icon = isOpen 
    ? (isLeft ? ChevronLeft : ChevronRight) 
    : (isLeft ? ChevronRight : ChevronLeft);
  
  // Position shifts based on whether the sidebar is open
  const style = isLeft 
    ? { left: isOpen ? `${SIDEBAR_WIDTH}px` : '0px' }
    : { right: isOpen ? `${SIDEBAR_WIDTH}px` : '0px' };

  const borderClass = isLeft ? 'border-y border-r rounded-r-lg' : 'border-y border-l rounded-l-lg';

  return (
    <button
      onClick={() => onToggle(!isOpen)}
      style={style}
      className={`absolute top-6 z-40 p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300 shadow-xl ${borderClass}`}
      title={isOpen ? `Collapse ${isLeft ? 'Sidebar' : 'Inspector'}` : `Expand ${isLeft ? 'Sidebar' : 'Inspector'}`}
    >
      <Icon size={20} />
    </button>
  );
}
