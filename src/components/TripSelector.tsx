import React from 'react';
import { Coordinates } from '../types/emove';
import { VARANASI_LOCATIONS } from '../data/presetScenarios';
import { MapPin, Navigation, ArrowDownUp, RefreshCw } from 'lucide-react';

interface TripSelectorProps {
  origin: Coordinates;
  destination: Coordinates;
  onChangeOrigin: (coord: Coordinates) => void;
  onChangeDestination: (coord: Coordinates) => void;
  onSwap: () => void;
  isLoadingRoutes: boolean;
  onRecalculate: () => void;
}

export const TripSelector: React.FC<TripSelectorProps> = ({
  origin,
  destination,
  onChangeOrigin,
  onChangeDestination,
  onSwap,
  isLoadingRoutes,
  onRecalculate,
}) => {
  const locationsList = Object.entries(VARANASI_LOCATIONS);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
        <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>Trip Route Waypoints</span>
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">Varanasi Corridor</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        {/* Origin Selector */}
        <div className="flex-1 w-full">
          <label className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            Start Location (Origin)
          </label>
          <div className="relative">
            <select
              value={
                locationsList.find(
                  ([_, loc]) =>
                    Math.abs(loc.lat - origin.lat) < 0.001 &&
                    Math.abs(loc.lng - origin.lng) < 0.001
                )?.[0] || 'custom'
              }
              onChange={(e) => {
                const key = e.target.value;
                if (VARANASI_LOCATIONS[key]) {
                  onChangeOrigin(VARANASI_LOCATIONS[key]);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {locationsList.map(([key, loc]) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-200">
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="pt-4 shrink-0">
          <button
            type="button"
            onClick={onSwap}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Swap Origin and Destination"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Selector */}
        <div className="flex-1 w-full">
          <label className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Destination
          </label>
          <div className="relative">
            <select
              value={
                locationsList.find(
                  ([_, loc]) =>
                    Math.abs(loc.lat - destination.lat) < 0.001 &&
                    Math.abs(loc.lng - destination.lng) < 0.001
                )?.[0] || 'custom'
              }
              onChange={(e) => {
                const key = e.target.value;
                if (VARANASI_LOCATIONS[key]) {
                  onChangeDestination(VARANASI_LOCATIONS[key]);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {locationsList.map(([key, loc]) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-200">
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recalculate button */}
        <div className="pt-4 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRecalculate}
            disabled={isLoadingRoutes}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRoutes ? 'animate-spin' : ''}`} />
            <span>{isLoadingRoutes ? 'Calculating...' : 'Recalculate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
