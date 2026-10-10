import React from 'react';
import { WeatherData, RouteCandidate } from '../types/emove';
import { CloudRain, Wind, Thermometer, Compass, Clock, RefreshCw } from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherData;
  activeRoute: RouteCandidate | null;
  onRefreshWeather?: () => void;
  isLoading?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  activeRoute,
  onRefreshWeather,
  isLoading,
}) => {
  // Convert wind degrees to cardinal direction
  const getWindCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round((deg % 360) / 45) % 8;
    return directions[idx];
  };

  const weatherFactor = activeRoute ? activeRoute.weatherFactor : 1.0;
  const factorPctDiff = Math.round((weatherFactor - 1.0) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              Live Weather & Drag Model
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  weather.isLive
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                    : 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                }`}
              >
                {weather.isLive ? 'LIVE' : 'DEMO FALLBACK'}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Open-Meteo Forecast API • Current Conditions
            </p>
          </div>
        </div>

        {onRefreshWeather && (
          <button
            type="button"
            onClick={onRefreshWeather}
            disabled={isLoading}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Refresh weather observation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Grid of Weather Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-2.5 text-center">
        {/* Temperature */}
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/70">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Thermometer className="w-3 h-3 text-cyan-400" />
            <span>Temp</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
            {weather.temperatureC.toFixed(1)}°C
          </div>
          <div className="text-[9px] text-slate-500">
            Feels {weather.apparentTempC.toFixed(0)}°C
          </div>
        </div>

        {/* Wind Speed & Direction */}
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/70">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>Wind</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
            {weather.windSpeedKmh.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            {getWindCardinal(weather.windDirectionDeg)} ({weather.windDirectionDeg}°)
          </div>
        </div>

        {/* Precipitation */}
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/70">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <CloudRain className="w-3 h-3 text-cyan-400" />
            <span>Rain</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
            {weather.precipitationMm.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">mm</span>
          </div>
          <div className="text-[9px] text-slate-500">
            {weather.precipitationMm > 0 ? 'Wet asphalt' : 'Dry asphalt'}
          </div>
        </div>
      </div>

      {/* Conditions Factor Impact on Route Energy */}
      <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Conditions Factor
          </span>
          <span className="font-mono font-bold text-cyan-300">
            ×{weatherFactor.toFixed(2)}
            {factorPctDiff !== 0 && (
              <span className={`text-[10px] ml-1 ${factorPctDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                ({factorPctDiff > 0 ? `+${factorPctDiff}% drag` : `${factorPctDiff}% tailwind`})
              </span>
            )}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Dynamically scales aerodynamic drag from route-relative headwind vector ({getWindCardinal(weather.windDirectionDeg)})
          and battery thermal impedance.
        </p>
      </div>

      {/* Timestamp & Source Attribution */}
      <div className="mt-2 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Observed: {weather.timestamp}</span>
        </div>
        <span className="truncate max-w-[190px]" title={weather.source}>
          {weather.source}
        </span>
      </div>
    </div>
  );
};
