import React, { useState } from 'react';
import { BatteryParams } from '../types/emove';
import { calculateUsableEnergyWh, calculateRouteBudgetWh } from '../services/energyCalculator';
import { Battery, Zap, ShieldAlert, Scale, Settings2, HelpCircle } from 'lucide-react';

interface BatteryPanelProps {
  battery: BatteryParams;
  onChange: (updated: BatteryParams) => void;
  onOpenEnergyBreakdown?: () => void;
}

export const BatteryPanel: React.FC<BatteryPanelProps> = ({
  battery,
  onChange,
  onOpenEnergyBreakdown,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const usableWh = calculateUsableEnergyWh(battery);
  const routeBudgetWh = calculateRouteBudgetWh(usableWh, battery.safetyReservePct);
  const safetyReserveWh = usableWh - routeBudgetWh;

  // Percentage of rated capacity that is actually usable
  const usableFractionOfRated = (usableWh / battery.ratedCapacityWh) * 100;

  // Determine health color
  const getHealthColor = (soh: number) => {
    if (soh >= 85) return 'text-emerald-400';
    if (soh >= 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getSocColor = (soc: number) => {
    if (soc >= 50) return 'text-cyan-400';
    if (soc >= 25) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <Battery className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              Battery & Powertrain State
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                Physics Core
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Integrates degradation (SOH) with instantaneous charge (SOC)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors"
          title="Toggle physics parameters"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">{showAdvanced ? 'Hide Physics' : 'Tuning'}</span>
        </button>
      </div>

      {/* Main Battery Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {/* Usable Energy */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Usable Energy</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {usableWh.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">Wh</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {usableFractionOfRated.toFixed(0)}% of {battery.ratedCapacityWh} Wh rated pack
          </div>
        </div>

        {/* Route Budget (After Reserve) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Safe Route Budget</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {routeBudgetWh.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">Wh</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Reserves {battery.safetyReservePct}% ({safetyReserveWh.toFixed(1)} Wh) buffer
          </div>
        </div>
      </div>

      {/* Visual Energy Segment Bar */}
      <div className="mb-4 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70">
        <div className="flex justify-between text-[11px] mb-1 font-mono">
          <span className="text-slate-400">Total Rated ({battery.ratedCapacityWh} Wh)</span>
          <span className="text-cyan-400 font-medium">Budget: {routeBudgetWh.toFixed(1)} Wh</span>
        </div>

        {/* Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
          {/* Safe Route Budget */}
          <div
            style={{ width: `${(routeBudgetWh / battery.ratedCapacityWh) * 100}%` }}
            className="h-full bg-cyan-500 transition-all duration-300"
            title={`Safe Budget: ${routeBudgetWh.toFixed(1)} Wh`}
          />
          {/* Safety Reserve */}
          <div
            style={{ width: `${(safetyReserveWh / battery.ratedCapacityWh) * 100}%` }}
            className="h-full bg-amber-500/80 transition-all duration-300"
            title={`Safety Reserve (${battery.safetyReservePct}%): ${safetyReserveWh.toFixed(1)} Wh`}
          />
          {/* Uncharged / Degraded remainder */}
          <div className="flex-1 bg-slate-800" title="Discharged / Capacity Loss" />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"></span>
            <span>Allocated Budget</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>{battery.safetyReservePct}% Reserve</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-700 inline-block"></span>
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      {/* Core Sliders & Controls */}
      <div className="space-y-3">
        {/* SOC Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label className="text-slate-300 font-medium flex items-center gap-1">
              State of Charge (SOC)
              <span className={`font-mono font-bold ${getSocColor(battery.soc)}`}>
                {battery.soc}%
              </span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Real-time meter</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="1"
            value={battery.soc}
            onChange={(e) => onChange({ ...battery, soc: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
            <span>5% (Depleted)</span>
            <span>50%</span>
            <span>100% (Full)</span>
          </div>
        </div>

        {/* SOH Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label className="text-slate-300 font-medium flex items-center gap-1">
              State of Health (SOH)
              <span className={`font-mono font-bold ${getHealthColor(battery.soh)}`}>
                {battery.soh}%
              </span>
            </label>
            <span className="text-[11px] text-slate-500">Aging degradation</span>
          </div>
          <input
            type="range"
            min="40"
            max="100"
            step="1"
            value={battery.soh}
            onChange={(e) => onChange({ ...battery, soh: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
            <span>40% (Severely aged)</span>
            <span>80% (Mid-life)</span>
            <span>100% (Factory new)</span>
          </div>
        </div>

        {/* Safety Reserve Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label className="text-slate-300 font-medium flex items-center gap-1">
              Configurable Safety Reserve
              <span className="font-mono font-bold text-amber-400">
                {battery.safetyReservePct}%
              </span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Emergency buffer</span>
          </div>
          <input
            type="range"
            min="5"
            max="35"
            step="1"
            value={battery.safetyReservePct}
            onChange={(e) => onChange({ ...battery, safetyReservePct: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
            <span>5% (Aggressive)</span>
            <span>15% (Recommended)</span>
            <span>35% (Conservative)</span>
          </div>
        </div>

        {/* Mass & Rated Wh in 2 cols */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Rider + Bike Mass
            </label>
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-md px-2.5 py-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="number"
                min="50"
                max="180"
                value={battery.riderBikeMassKg}
                onChange={(e) => onChange({ ...battery, riderBikeMassKg: Number(e.target.value) || 100 })}
                className="w-full bg-transparent text-xs font-mono text-slate-100 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">kg</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Rated Capacity
            </label>
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-md px-2.5 py-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <input
                type="number"
                min="150"
                max="900"
                step="10"
                value={battery.ratedCapacityWh}
                onChange={(e) => onChange({ ...battery, ratedCapacityWh: Number(e.target.value) || 417 })}
                className="w-full bg-transparent text-xs font-mono text-slate-100 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">Wh</span>
            </div>
          </div>
        </div>

        {/* Advanced Physics Tuning (expandable) */}
        {showAdvanced && (
          <div className="p-3 bg-slate-950/90 border border-slate-800/80 rounded-lg space-y-2.5 text-xs animate-fadeIn">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span>Powertrain & Calibration Tuning</span>
              <span className="text-[10px] text-slate-500 font-mono">Transparent Physics</span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Baseline Flat Energy Rate</span>
                <span className="font-mono text-cyan-300">{battery.baselineWhPerKm} Wh/km</span>
              </div>
              <input
                type="range"
                min="6.0"
                max="16.0"
                step="0.5"
                value={battery.baselineWhPerKm}
                onChange={(e) => onChange({ ...battery, baselineWhPerKm: Number(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="text-[10px] text-slate-500">
                Rolling & aerodynamic resistance on flat asphalt (pedelec level 2)
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Drivetrain & Motor Efficiency (η)</span>
                <span className="font-mono text-emerald-300">{(battery.drivetrainEfficiency * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.65"
                max="0.92"
                step="0.01"
                value={battery.drivetrainEfficiency}
                onChange={(e) => onChange({ ...battery, drivetrainEfficiency: Number(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="text-[10px] text-slate-500">
                Combined motor, inverter, reduction gears, and chain transmission
              </div>
            </div>
          </div>
        )}

        {/* View Physics Formulas Button */}
        {onOpenEnergyBreakdown && (
          <button
            type="button"
            onClick={onOpenEnergyBreakdown}
            className="w-full py-2 px-3 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/40 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Inspect Transparent Physics Equation & Assumptions</span>
          </button>
        )}
      </div>
    </div>
  );
};
