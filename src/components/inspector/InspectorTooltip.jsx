import React from 'react';
import { createPortal } from 'react-dom';
import { getMainColor } from '../../utils/colorSemantics';

export default function InspectorTooltip({ tooltip }) {
  if (!tooltip.show || !tooltip.content) return null;

  const info = tooltip.content;
  const accentColor = getMainColor(info.color);

  const isStarTooltip = Boolean(info.isStar);
  const isPlanetTypeTooltip = Boolean(info.isPlanet);
  const isPlanetSizeTooltip = Boolean(info.isPlanetSize);
  const isStationTooltip = Boolean(info.isStation);

  const ageRange = info.ageRange && typeof info.ageRange === 'object'
    ? `${info.ageRange.min || '?'} - ${info.ageRange.max || '?'} ${info.ageRange.unit || ''}`
    : null;

  const tooltipTitle = isStarTooltip
    ? String(info.name || info.type || 'Unknown Star')
    : isPlanetTypeTooltip
      ? String(info.type || info.planetTypeName || 'Unknown Body')
      : isPlanetSizeTooltip
        ? String(info.name || 'Unknown Size')
        : isStationTooltip
          ? String(info.name || 'Unknown Station')
          : String(info.name || info.type || 'Unknown Item');

  return createPortal(
    <div
      className="fixed z-50 bg-slate-900/95 backdrop-blur-sm border border-slate-700 p-3 rounded-lg shadow-2xl pointer-events-none w-64 animate-in fade-in duration-150"
      style={{
        top: Math.min(tooltip.y + 16, window.innerHeight - 220),
        left: Math.min(tooltip.x + 16, window.innerWidth - 280),
        borderColor: accentColor
      }}
    >
      <div className="font-bold text-blue-300 mb-1 text-sm capitalize" style={{ color: accentColor }}>
        {tooltipTitle}
      </div>
      <div className="text-xs text-slate-300 space-y-1">
        {isStarTooltip && (
          <>
            <div><span className="font-bold" style={{ color: accentColor }}>Temp:</span> {info.temp || 'Unknown'}</div>
            <div><span className="font-bold" style={{ color: accentColor }}>Mass:</span> {info.mass || 'Unknown'}</div>
            <div><span className="font-bold" style={{ color: accentColor }}>Typical Age:</span> {info.typicalAge || 'Unknown'}</div>
            {ageRange && <div><span className="font-bold" style={{ color: accentColor }}>Age Range:</span> {ageRange}</div>}
          </>
        )}
        {(isPlanetTypeTooltip || isPlanetSizeTooltip || isStationTooltip || info.isPOI) && (
          <>
            <div className="text-slate-300">{typeof info.description === 'string' ? info.description : 'No description available.'}</div>
            {isPlanetTypeTooltip && info.habitability && (
              <div className="text-slate-300 pt-2 border-t border-slate-700/50 mt-2">
                <span className="font-bold" style={{ color: accentColor }}>Habitability:</span> {info.habitability} ({info.habitabilityRate})
              </div>
            )}
            {isPlanetTypeTooltip && info.atmosphere && (
              <div className="text-slate-300 pt-2 border-t border-slate-700/50 mt-2">
                <span className="font-bold" style={{ color: accentColor }}>Atmosphere:</span> {info.atmosphere}
                {info.atmosphereDescription ? ` - ${info.atmosphereDescription}` : ''}
              </div>
            )}
            {isPlanetTypeTooltip && info.temperature && (
              <div className="text-slate-300">
                <span className="font-bold" style={{ color: accentColor }}>Temperature:</span> {info.temperature}
                {info.temperatureRange ? ` (${info.temperatureRange.min} to ${info.temperatureRange.max} ${(info.temperatureRange.unit || '').replace('Â°C', '°C')})` : ''}
                {info.temperatureDescription ? ` - ${info.temperatureDescription}` : ''}
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
