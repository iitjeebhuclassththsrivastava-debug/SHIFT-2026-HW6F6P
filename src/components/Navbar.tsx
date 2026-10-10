import React from 'react';
import { PRESET_SCENARIOS } from '../data/presetScenarios';
import {
  Bike,
  Zap,
  Database,
  BookOpen,
  MapPin,
  HelpCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  onOpenStations: () => void;
  onOpenCalibration: () => void;
  onOpenGuide: () => void;
  onOpenEnergyBreakdown: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScenarioId,
  onSelectScenario,
  onOpenStations,
  onOpenCalibration,
  onOpenGuide,
  onOpenEnergyBreakdown,
}) => {
  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      {/* Top micro-bar for Hackathon & Institutional Context */}
      <div className="bg-slate-900/60 border-b border-slate-850 px-4 py-1 text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-amber-400" />
            SHIFT Hackathon
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">IIT (BHU) Varanasi</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 font-mono hidden sm:inline">Smart E-Micromobility & Energy Track</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-mono hidden md:inline">25.2605° N, 82.9868° E (IIT BHU Campus)</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[9px] font-mono">
            Prototype Build
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Theme */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-teal-500 to-cyan-500 p-[1.5px] shadow-lg shadow-cyan-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bike className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  E-Move
                  <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    IIT (BHU) Edition
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Battery-aware route recommendation • Terrain elevation • Weather drag • Campus charging hubs
              </p>
            </div>
          </div>
        </div>

        {/* Demo Presets & Navigation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Scenario Selector with IIT BHU Cases */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs shadow-inner">
            <span className="text-[10px] uppercase font-bold text-amber-400/90 px-1.5 hidden sm:inline">
              Pitch Demos:
            </span>
            {PRESET_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => onSelectScenario(sc.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  activeScenarioId === sc.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={sc.description}
              >
                {idx === 0 ? '1. Campus Commute' : idx === 1 ? '2. Sarnath Fallback' : '3. Cantt Flyover'}
              </button>
            ))}
          </div>

          {/* Action Modals */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenStations}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-900/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="View Reachable Campus & Varanasi EV Charging Hubs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Campus EV Hubs</span>
            </button>

            <button
              type="button"
              onClick={onOpenCalibration}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-900/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Inspect Empirical Validation & CSV Telemetry Importer"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Validation</span>
            </button>

            <button
              type="button"
              onClick={onOpenGuide}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="SHIFT Hackathon Jury Presentation Script & Windows Setup Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>3-Min Pitch Guide</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
