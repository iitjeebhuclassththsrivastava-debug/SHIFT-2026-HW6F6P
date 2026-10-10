import React from 'react';
import { BatteryParams, RouteCandidate, WeatherData } from '../types/emove';
import { calculateUsableEnergyWh, calculateRouteBudgetWh } from '../services/energyCalculator';
import { X, Calculator, ShieldCheck, AlertCircle, Info, Sparkles } from 'lucide-react';

interface EnergyBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  battery: BatteryParams;
  route: RouteCandidate | null;
  weather: WeatherData;
}

export const EnergyBreakdownModal: React.FC<EnergyBreakdownModalProps> = ({
  isOpen,
  onClose,
  battery,
  route,
  weather,
}) => {
  if (!isOpen) return null;

  const usableWh = calculateUsableEnergyWh(battery);
  const routeBudgetWh = calculateRouteBudgetWh(usableWh, battery.safetyReservePct);
  const safetyReserveWh = usableWh - routeBudgetWh;

  const distKm = route ? route.distanceKm : 0;
  const climbM = route ? route.totalUphillMeters : 0;
  const weatherFactor = route ? route.weatherFactor : 1.0;
  const rollingWh = route ? route.rollingFlatEnergyWh : 0;
  const climbWh = route ? route.climbEnergyWh : 0;
  const totalWh = route ? route.estimatedEnergyWh : 0;
  const remainingWh = route ? route.remainingWh : 0;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Transparent Energy & Physics Breakdown
              </h2>
              <p className="text-[11px] text-slate-400">
                Step-by-step mathematical model with visible assumptions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Step 1: Battery Usable Wh */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px]">
                1. Usable Battery Energy
              </span>
              <span className="font-mono text-cyan-300 font-bold text-sm">
                {usableWh.toFixed(1)} Wh
              </span>
            </div>
            <div className="font-mono bg-slate-900/90 p-2 rounded text-[11px] text-slate-300 border border-slate-800">
              usableWh = ratedCapacityWh × (SOH / 100) × (SOC / 100)
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              = {battery.ratedCapacityWh} Wh × ({battery.soh} / 100) × ({battery.soc} / 100) = <strong className="text-cyan-300">{usableWh.toFixed(1)} Wh</strong>
            </div>
          </div>

          {/* Step 2: Safety Reserve Budget */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
                2. Configurable Safety Reserve Budget
              </span>
              <span className="font-mono text-amber-300 font-bold text-sm">
                {routeBudgetWh.toFixed(1)} Wh
              </span>
            </div>
            <div className="font-mono bg-slate-900/90 p-2 rounded text-[11px] text-slate-300 border border-slate-800">
              routeBudgetWh = usableWh × (1 − reserveFraction)
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              = {usableWh.toFixed(1)} Wh × (1 − {battery.safetyReservePct / 100}) = <strong className="text-amber-300">{routeBudgetWh.toFixed(1)} Wh</strong>
              <span className="text-slate-500 block text-[10px] mt-0.5">
                (Reserves {safetyReserveWh.toFixed(1)} Wh as emergency buffer against headwind gusts and stop-start intersections)
              </span>
            </div>
          </div>

          {/* Step 3: Route Energy Formula */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
                3. Total Route Energy Expenditure
              </span>
              <span className="font-mono text-emerald-300 font-bold text-sm">
                {totalWh.toFixed(1)} Wh
              </span>
            </div>
            <div className="font-mono bg-slate-900/90 p-2 rounded text-[11px] text-slate-300 border border-slate-800">
              routeEnergyWh = (distanceKm × baselineWhPerKm × conditionsFactor) + climbEnergyWh
            </div>

            {/* Subcomponents breakdown */}
            <div className="space-y-1.5 pt-1 text-slate-300">
              <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                <div>
                  <span className="font-medium text-slate-200">A. Flat Rolling & Aero Drag:</span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {distKm.toFixed(1)} km × {battery.baselineWhPerKm} Wh/km × {weatherFactor}
                  </div>
                </div>
                <span className="font-mono font-bold text-cyan-300">{rollingWh.toFixed(1)} Wh</span>
              </div>

              <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                <div>
                  <span className="font-medium text-slate-200">B. Elevation Climb Work:</span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {battery.riderBikeMassKg} kg × 9.81 × {climbM.toFixed(0)}m ÷ (3600 × {battery.drivetrainEfficiency})
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-300">+{climbWh.toFixed(1)} Wh</span>
              </div>
            </div>
          </div>

          {/* Explicit Model Assumptions & Anti-Overclaim Statement */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-slate-300">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Visible Engineering Assumptions & Limitations
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-300">No Regenerative Braking Credit: </strong>
                Downhill descent energy is deliberately not credited as stored energy because standard e-cycles utilize freewheel planetary hubs without verified bidirectional regen braking.
              </li>
              <li>
                <strong className="text-slate-300">Conditions Factor: </strong>
                Derived from vector headwind component relative to route azimuth and sub-20°C ambient temperatures. This is a physics baseline drag model, not an experimentally certified empirical factor for every specific motor model.
              </li>
              <li>
                <strong className="text-slate-300">Drivetrain Efficiency (η = {(battery.drivetrainEfficiency * 100).toFixed(0)}%): </strong>
                Lumped parameter combining BLDC motor copper/iron losses, PWM inverter, and chain mechanical losses.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
