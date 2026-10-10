import React from 'react';
import { RouteCandidate, ChargingStation } from '../types/emove';
import { CheckCircle2, XCircle, ArrowUpRight, Zap, Battery, MapPin, AlertTriangle, Compass, Layers } from 'lucide-react';

interface RouteComparisonProps {
  routes: RouteCandidate[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  usableWh: number;
  routeBudgetWh: number;
  safetyReservePct: number;
  onOpenChargingStations: () => void;
  nearestReachableStation?: ChargingStation;
}

export const RouteComparison: React.FC<RouteComparisonProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  usableWh,
  routeBudgetWh,
  safetyReservePct,
  onOpenChargingStations,
  nearestReachableStation,
}) => {
  const hasFeasibleRoute = routes.some((r) => r.isFeasible);
  const recommendedRoute = routes.find((r) => r.isRecommended);

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            Candidate Bike Routes
          </h3>
          <p className="text-[11px] text-slate-400">
            Evaluating {routes.length} paths against {routeBudgetWh.toFixed(1)} Wh safe budget
          </p>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          OSRM Bicycle Profile
        </span>
      </div>

      {/* INFEASIBLE CRITICAL WARNING BANNER IF NO ROUTE IS FEASIBLE */}
      {!hasFeasibleRoute && routes.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/80 text-rose-200 shadow-lg space-y-2.5 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wide">
                No Direct Feasible Route Found
              </h4>
              <p className="text-xs text-rose-300 leading-relaxed">
                All candidate paths require more energy than your safe route budget ({routeBudgetWh.toFixed(1)} Wh)
                considering {safetyReservePct}% safety reserve, elevation climb, and ambient headwinds.
              </p>
            </div>
          </div>

          {/* Action to divert to charging station */}
          {nearestReachableStation && (
            <div className="pt-2 border-t border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-rose-900/40 -mx-3.5 -mb-3.5 p-3 rounded-b-xl">
              <div className="text-xs">
                <span className="text-slate-300">Reachable fallback: </span>
                <strong className="text-amber-300">{nearestReachableStation.name}</strong>
                <span className="text-slate-400 text-[11px] block sm:inline sm:ml-1">
                  ({nearestReachableStation.distanceFromStartKm} km away • uses {nearestReachableStation.energyNeededWh} Wh)
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenChargingStations}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>View Reachable Charging Stations</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Candidate Route Cards */}
      <div className="space-y-2.5">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isRecommended = route.isRecommended;
          const isFeasible = route.isFeasible;
          const energyMarginWh = routeBudgetWh - route.estimatedEnergyWh;

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Title + Recommendation / Feasibility Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                      {route.name}
                    </h4>
                    {isRecommended && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/80 flex items-center gap-1 shadow-sm">
                        <span>★ Recommended</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {route.description}
                  </p>
                </div>

                {/* Feasibility Indicator */}
                <div className="shrink-0 flex items-center">
                  {isFeasible ? (
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Feasible</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Infeasible</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/70 text-center">
                {/* Distance */}
                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/50">
                  <div className="text-[10px] text-slate-400">Distance</div>
                  <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                    {route.distanceKm.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">km</span>
                  </div>
                </div>

                {/* Elevation Gain */}
                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/50">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                    <ArrowUpRight className="w-2.5 h-2.5 text-amber-400" />
                    <span>Climb</span>
                  </div>
                  <div className="text-xs font-bold font-mono text-amber-300 mt-0.5">
                    +{route.totalUphillMeters.toFixed(0)} <span className="text-[9px] font-normal text-slate-400">m</span>
                  </div>
                </div>

                {/* Estimated Energy */}
                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/50">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Energy</span>
                  </div>
                  <div className={`text-xs font-bold font-mono mt-0.5 ${isFeasible ? 'text-cyan-300' : 'text-rose-400'}`}>
                    {route.estimatedEnergyWh.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">Wh</span>
                  </div>
                </div>

                {/* Remaining Energy at Destination */}
                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/50">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                    <Battery className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Remaining</span>
                  </div>
                  <div className={`text-xs font-bold font-mono mt-0.5 ${route.remainingWh > 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                    {route.remainingWh.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">Wh</span>
                  </div>
                </div>
              </div>

              {/* Energy Split Breakdown preview */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Rolling: <strong className="text-slate-300 font-mono">{route.rollingFlatEnergyWh} Wh</strong></span>
                  <span className="text-slate-600">·</span>
                  <span>Climb: <strong className="text-amber-300 font-mono">+{route.climbEnergyWh} Wh</strong></span>
                  {route.weatherFactor !== 1 && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-cyan-300">Weather: ×{route.weatherFactor}</span>
                    </>
                  )}
                </div>

                <div className="text-[10px] font-mono">
                  {isFeasible ? (
                    <span className="text-emerald-400">
                      +{energyMarginWh.toFixed(1)} Wh within budget
                    </span>
                  ) : (
                    <span className="text-rose-400 font-medium">
                      {(Math.abs(energyMarginWh)).toFixed(1)} Wh deficit
                    </span>
                  )}
                </div>
              </div>

              {/* Recommendation Note */}
              {isRecommended && (
                <div className="mt-2 text-[10px] text-cyan-300/90 bg-cyan-950/40 p-1.5 rounded border border-cyan-800/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                  <span>
                    Shortest feasible among returned candidates (Distance: {route.distanceKm.toFixed(1)} km, preserves reserve buffer).
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
