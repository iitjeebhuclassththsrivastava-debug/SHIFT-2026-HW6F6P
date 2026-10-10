import React, { useState } from 'react';
import { RouteCandidate } from '../types/emove';
import { Mountain, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface ElevationProfileProps {
  route: RouteCandidate | null;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({ route }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!route || !route.elevationProfile || route.elevationProfile.length === 0) {
    return (
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
        Select a candidate route to view its elevation profile.
      </div>
    );
  }

  const profile = route.elevationProfile;
  const elevations = profile.map((p) => p.elevationM);
  const minElev = Math.floor(Math.min(...elevations) - 2);
  const maxElev = Math.ceil(Math.max(...elevations) + 4);
  const totalDist = profile[profile.length - 1]?.distanceKm || route.distanceKm;

  // SVG Chart dimensions
  const width = 500;
  const height = 130;
  const paddingX = 40;
  const paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Scale coordinates to SVG points
  const points = profile.map((pt, i) => {
    const x = paddingX + (pt.distanceKm / (totalDist || 1)) * chartW;
    const y =
      height -
      paddingY -
      ((pt.elevationM - minElev) / (maxElev - minElev || 1)) * chartH;
    return { x, y, pt, index: i };
  });

  const pathD = points.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Fill area under curve
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-950/80 border border-amber-800/60 text-amber-400">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              Terrain Elevation Profile
              <span className="text-[10px] font-normal text-slate-400">({route.name})</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Copernicus GLO-90 Digital Elevation Model • 90m Resolution
            </p>
          </div>
        </div>

        {/* Climb & Descent Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-amber-300">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{route.totalUphillMeters}m</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-{route.totalDownhillMeters}m</span>
          </div>
        </div>
      </div>

      {/* SVG Elevation Chart */}
      <div className="relative w-full overflow-hidden bg-slate-950/70 rounded-lg p-1 border border-slate-800/60">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-28 overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#1e293b"
            strokeDasharray="2,2"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#334155"
          />

          {/* Y Axis min & max labels */}
          <text
            x={paddingX - 6}
            y={paddingY + 4}
            fill="#64748b"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            {maxElev}m
          </text>
          <text
            x={paddingX - 6}
            y={height - paddingY}
            fill="#64748b"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            {minElev}m
          </text>

          {/* Elevation Area & Line */}
          <path d={areaD} fill="url(#elevationGrad)" />
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" />

          {/* Data Points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 5 : 2.5}
              fill={hoverIndex === i ? '#ffffff' : '#f59e0b'}
              stroke="#0f172a"
              strokeWidth="1.5"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}

          {/* Distance Labels on X Axis */}
          <text
            x={paddingX}
            y={height - 4}
            fill="#64748b"
            fontSize="9"
            textAnchor="start"
            fontFamily="monospace"
          >
            0 km
          </text>
          <text
            x={width - paddingX}
            y={height - 4}
            fill="#64748b"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            {totalDist.toFixed(1)} km
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-500/70 text-slate-100 text-[11px] px-2.5 py-1 rounded shadow-lg pointer-events-none flex items-center gap-2 font-mono"
          >
            <span>Dist: {hoveredPoint.pt.distanceKm.toFixed(2)} km</span>
            <span className="text-amber-400 font-bold">
              Alt: {hoveredPoint.pt.elevationM} m
            </span>
          </div>
        )}
      </div>

      {/* Accuracy Disclosure Footer */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Calculated via sampled Copernicus DEM points (+Δh gravity sum)</span>
        </div>
        <span className="text-slate-500 font-mono">No AI satellite inference</span>
      </div>
    </div>
  );
};
