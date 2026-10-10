import React, { useState } from 'react';
import {
  DUBLIN_BENCHMARK_RIDES,
  computeValidationMetrics,
  parseAndValidateRideCsv,
} from '../services/validationService';
import { CalibrationRide } from '../types/emove';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  Database,
  Info,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface DataCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  riderMassKg: number;
  baselineWhPerKm: number;
}

export const DataCalibrationModal: React.FC<DataCalibrationModalProps> = ({
  isOpen,
  onClose,
  riderMassKg,
  baselineWhPerKm,
}) => {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'import'>('benchmark');
  const [rides, setRides] = useState<CalibrationRide[]>(DUBLIN_BENCHMARK_RIDES);
  const [csvText, setCsvText] = useState<string>('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const metrics = computeValidationMetrics(rides);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const result = parseAndValidateRideCsv(content, riderMassKg, baselineWhPerKm);
      if (result.errors.length > 0) {
        setParseErrors(result.errors);
        setImportSuccess(false);
      } else {
        setRides(result.rides);
        setParseErrors([]);
        setImportSuccess(true);
        setActiveTab('benchmark');
      }
    };
    reader.readAsText(file);
  };

  const handleSampleCsvLoad = () => {
    const sample = `trip_id,date,distance_km,elevation_gain_m,avg_speed_kmh,measured_wh
IITBHU-LIMBDI-01,2026-10-08,3.80,14.0,17.2,34.8
BHU-VT-LOOP-02,2026-10-09,5.20,18.0,18.0,48.5
IITBHU-CANTT-03,2026-10-10,8.40,42.0,19.0,86.2`;
    setCsvText(sample);
    const result = parseAndValidateRideCsv(sample, riderMassKg, baselineWhPerKm);
    setRides(result.rides);
    setParseErrors([]);
    setImportSuccess(true);
    setActiveTab('benchmark');
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Empirical Validation & Calibration Data
              </h2>
              <p className="text-[11px] text-slate-400">
                Inspect public Dublin benchmark, evaluate errors, or import custom CSV ride logs
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4">
          <button
            type="button"
            onClick={() => setActiveTab('benchmark')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'benchmark'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            DualEMobility Benchmark & Validation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Import Custom Ride CSV
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'benchmark' ? (
            <>
              {/* Mandatory Honest Accuracy Statement */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200/90 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Important Geographic & Hardware Limitation</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  The DualEMobility dataset contains real-world e-micromobility telemetry recorded in Dublin, Ireland
                  (cool maritime climate, asphalt European cycle tracks).{' '}
                  <strong className="text-amber-300">
                    This data does NOT validate this prototype for Indian roads, Varanasi traffic congestion, or our specific local bike powertrain.
                  </strong>{' '}
                  Battery metrics are therefore labeled as <span className="underline">uncalibrated physics baseline</span>.
                </p>
                <div className="text-[10px] text-amber-400/80 pt-1 flex items-center justify-between">
                  <span>License: Creative Commons Attribution 4.0 (CC BY 4.0)</span>
                  <a
                    href="https://github.com/SFIEssential/DualEMobilityData-datasets"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-amber-200 flex items-center gap-1"
                  >
                    GitHub Repository <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Validation Summary Metrics */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Mean Absolute Error</span>
                  <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                    {metrics.meanAbsoluteErrorWh} <span className="text-xs font-normal text-slate-400">Wh</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({metrics.meanAbsoluteErrorPct}% relative error)
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Underestimation Rate</span>
                  <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                    {metrics.underestimationRatePct}%
                  </div>
                  <span className="text-[10px] text-slate-500">
                    of rides drew &gt; predicted
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Max Underestimation</span>
                  <div className="text-lg font-bold font-mono text-rose-300 mt-0.5">
                    {metrics.maxUnderestimationWh} <span className="text-xs font-normal text-slate-400">Wh</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Highest single-trip deficit
                  </span>
                </div>
              </div>

              {/* Uncertainty Guidance Banner */}
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300">Why a 15% Safety Reserve is Required: </strong>
                  Because the baseline physics equation underestimates actual energy consumption in{' '}
                  <strong className="font-mono text-amber-300">{metrics.underestimationRatePct}%</strong> of trips
                  due to real-world factors like stop-and-go acceleration and gusty headwinds, the system mandates
                  a conservative safety reserve before declaring any route feasible.
                </div>
              </div>

              {/* Rides Table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center justify-between">
                  <span>Held-Out Full Rides ({rides.length} trips)</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    No intra-ride sample splitting (avoids data leakage)
                  </span>
                </h4>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-2.5">Trip ID</th>
                        <th className="py-2 px-2">Dist (km)</th>
                        <th className="py-2 px-2">Climb (m)</th>
                        <th className="py-2 px-2">Measured Wh</th>
                        <th className="py-2 px-2">Physics Wh</th>
                        <th className="py-2 px-2 text-right">Error (Wh)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {rides.map((r) => (
                        <tr key={r.rideId} className="hover:bg-slate-800/30">
                          <td className="py-2 px-2.5 text-slate-200 font-sans font-medium">
                            {r.rideId}
                          </td>
                          <td className="py-2 px-2 text-slate-300">{r.distanceKm}</td>
                          <td className="py-2 px-2 text-amber-300">+{r.elevationGainM}</td>
                          <td className="py-2 px-2 text-emerald-300 font-bold">{r.measuredWh}</td>
                          <td className="py-2 px-2 text-cyan-300">{r.physicsBaselineWh}</td>
                          <td className={`py-2 px-2 text-right font-bold ${r.errorWh < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {r.errorWh > 0 ? `+${r.errorWh}` : r.errorWh} ({r.errorPct}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* CSV Import Interface */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    Expected CSV Column Format for Local Bike Telemetry
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Upload completed ride measurements recorded with external data loggers (e.g. Arduino, ESP32, shunt resistor, or mobile GPS app).
                  </p>
                  <pre className="bg-slate-900 p-2.5 rounded text-[10px] text-cyan-300 font-mono overflow-x-auto border border-slate-800">
                    trip_id,date,distance_km,elevation_gain_m,avg_speed_kmh,measured_wh
                  </pre>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Or raw time-series: <code className="text-slate-400">timestamp, latitude, longitude, speed_kmh, voltage_v, current_a, measured_wh, soc_pct, assist_mode, temp_c</code>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                    <span className="text-xs font-semibold text-slate-200">
                      Select CSV File from Computer
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      .csv files up to 5 MB
                    </span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSampleCsvLoad}
                    className="p-3 border border-slate-800 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-slate-300 text-xs font-medium flex flex-col items-center justify-center gap-1 transition-colors"
                  >
                    <span>Load Simulated IIT (BHU) Campus Ride Logs</span>
                    <span className="text-[10px] text-amber-400">
                      (Test with 3 Campus & Varanasi road samples)
                    </span>
                  </button>
                </div>

                {parseErrors.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 space-y-1">
                    <strong className="text-xs">CSV Validation Errors:</strong>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5">
                      {parseErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Successfully loaded and validated {rides.length} rides! Switch to Benchmark tab to view errors.
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="text-[10px] text-slate-500">
            No bike BMS claimed to be directly interfaced
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
