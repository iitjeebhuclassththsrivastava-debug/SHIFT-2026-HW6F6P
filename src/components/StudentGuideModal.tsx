import React from 'react';
import {
  Terminal,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  X,
  Monitor,
  Laptop,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface StudentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const StudentGuideModal: React.FC<StudentGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-600/60 text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                SHIFT Hackathon • IIT (BHU) Varanasi
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  Clean Mobility Track
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Local Windows VS Code guide + 3-minute jury presentation pitch script
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
          {/* Institutional / Academic Context Banner */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-amber-400 font-semibold">Campus Micromobility Context at IIT (BHU): </strong>
            IIT BHU spans over 1,300 acres with tens of thousands of e-cycles and e-rickshaws commuting between hostels (Limbdi, Rajputana, Morvi), departments, VT, Lanka gate, and Varanasi ghats. E-cycle batteries degrade rapidly under hot weather and high duty cycles. E-Move provides the first battery-aware route recommendation system built for this ecosystem.
          </div>

          {/* Section 1: Running in VS Code on Windows */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-cyan-300 text-xs">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>Step-by-Step for First-Year Students on Windows (VS Code)</span>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <li>
                <strong className="text-slate-100">Install Node.js: </strong>
                Download the LTS installer from <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">nodejs.org</code>. Ensure "Add to PATH" is checked.
              </li>
              <li>
                <strong className="text-slate-100">Open Folder in VS Code: </strong>
                Extract or clone this repository, launch VS Code, click <strong className="text-slate-200">File &gt; Open Folder...</strong>, and select the project directory.
              </li>
              <li>
                <strong className="text-slate-100">Open Integrated Terminal: </strong>
                Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200 font-mono">Ctrl + `</kbd> (backtick) or select <strong className="text-slate-200">Terminal &gt; New Terminal</strong>.
              </li>
              <li>
                <strong className="text-slate-100">Install Dependencies: </strong>
                Run:
                <pre className="bg-slate-900 p-2 rounded text-cyan-300 font-mono text-[11px] mt-1 border border-slate-800">
                  npm install
                </pre>
              </li>
              <li>
                <strong className="text-slate-100">Launch Local Dev Server: </strong>
                Run:
                <pre className="bg-slate-900 p-2 rounded text-cyan-300 font-mono text-[11px] mt-1 border border-slate-800">
                  npm run dev
                </pre>
                Click <code className="text-emerald-400 font-mono">http://localhost:3000</code> to view the applet.
              </li>
              <li>
                <strong className="text-slate-100">Zero Secret API Keys: </strong>
                OpenStreetMap tiles, Open-Meteo Weather & DEM Elevation, and OSRM routing are keyless client-side services; no secrets are ever exposed in code or commits.
              </li>
            </ol>
          </div>

          {/* Section 2: 3-Minute Hackathon Demo Script for SHIFT Jury */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-amber-300 text-xs">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>3-Minute SHIFT Hackathon Jury Pitch Script</span>
            </div>

            <div className="space-y-2.5 text-[11px]">
              {/* Minute 1 */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span>Minute 0:00–1:00: Problem & Battery Degradation (SOH)</span>
                  <span className="text-[10px] text-cyan-400 font-mono">The Real Problem</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  "Respected judges, on the IIT BHU campus, students ride e-cycles every day. But batteries degrade over time.
                  A 2-year-old pack at 70% State of Health with 50% State of Charge actually only holds 35% of its rated energy!
                  Standard Google Maps treats bicycles like infinite-energy vehicles. E-Move integrates battery health, elevation,
                  weather drag, and charging into one single system."
                </p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectScenario('scenario-feasible');
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[10px] font-medium border border-cyan-800/60"
                  >
                    Load Demo 1: IIT BHU Campus to Assi Ghat (Feasible)
                  </button>
                </div>
              </div>

              {/* Minute 2 */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span>Minute 1:00–2:00: Transparent Physics, Elevation & Weather</span>
                  <span className="text-[10px] text-amber-400 font-mono">Copernicus DEM & Wind</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  "We do not guess elevation with AI. We query the Copernicus GLO-90 DEM (90m resolution) to calculate real gravitational
                  climb energy (m·g·Δh / 3600·η). Open-Meteo gives us live Varanasi wind vectors to calculate headwind drag.
                  E-Move marks routes feasible only if they leave a 15% safety buffer, and recommends the shortest feasible candidate."
                </p>
              </div>

              {/* Minute 3 */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span>Minute 2:00–3:00: Safety Reserve Alarm & Campus Hub Divert</span>
                  <span className="text-[10px] text-rose-400 font-mono">Safety Guarantee</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  "Now watch when a student leaves Limbdi Hostel for Sarnath with an aged 66% SOH battery at 20% SOC.
                  The 14.2 km trip triggers a critical red deficit warning. Instead of letting the student get stranded,
                  E-Move identifies reachable hubs (like the Sigra Smart EV Hub or Lanka EV Point) and lets the rider re-route with one click!"
                </p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectScenario('scenario-infeasible');
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[10px] font-medium border border-rose-800/60"
                  >
                    Load Demo 2: Campus to Sarnath (Infeasible + Fallback Divert)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Honest Transparency Matrix */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Honest Transparency Matrix (What is Live vs Demo vs Hardware)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              {/* Live */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-900/40">
                <div className="font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>1. Live Data Sources</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10px]">
                  <li>OSRM Bike Routing Service</li>
                  <li>OpenStreetMap Tile Layers</li>
                  <li>Open-Meteo Weather API</li>
                  <li>Copernicus GLO-90 DEM Elevation (90m grid)</li>
                </ul>
              </div>

              {/* Demo */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-900/40">
                <div className="font-semibold text-amber-400 flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>2. Demo / Unverified Data</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10px]">
                  <li>EV Charging Station vacancy status (no OCPI link)</li>
                  <li>Downhill regenerative braking (safely uncredited)</li>
                </ul>
              </div>

              {/* Still Needed */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-900/40">
                <div className="font-semibold text-cyan-400 flex items-center gap-1 mb-1">
                  <Terminal className="w-3.5 h-3.5 shrink-0" />
                  <span>3. What Needs Actual Bike BMS</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10px]">
                  <li>Direct CAN-bus / Bluetooth BMS telemetry connection</li>
                  <li>Local empirical calibration on Varanasi road pavement</li>
                  <li>True cell voltage curve under Varanasi summer heat</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
