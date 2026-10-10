import React from 'react';
import { ChargingStation } from '../types/emove';
import { Zap, MapPin, CheckCircle, AlertCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface ChargingStationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stations: ChargingStation[];
  selectedStationId: string | null;
  onSelectStation: (station: ChargingStation) => void;
  onDivertToStation: (station: ChargingStation) => void;
  usableWh: number;
  routeBudgetWh: number;
}

export const ChargingStationDrawer: React.FC<ChargingStationDrawerProps> = ({
  isOpen,
  onClose,
  stations,
  selectedStationId,
  onSelectStation,
  onDivertToStation,
  usableWh,
  routeBudgetWh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Reachable Charging Stations
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  Fallback Network
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Sorted by distance from rider's current origin
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

        {/* Honest Accuracy Notice */}
        <div className="px-4 py-2.5 bg-amber-950/30 border-b border-amber-900/40 text-amber-300/90 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Honest Status Disclaimer: </strong>
            These charging hubs represent documented micromobility charging points in the corridor.
            Because live OCPI/BMS telemetry is unlinked, availability is labeled as{' '}
            <strong className="underline decoration-amber-400">Unverified / Demo</strong>. Never assume a plug is vacant without prior confirmation.
          </div>
        </div>

        {/* Station List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {stations.map((st) => {
            const isSelected = selectedStationId === st.id;
            const isReachable = st.isReachableWithReserve ?? true;

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      {st.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{st.address}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                      isReachable
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                        : 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                    }`}
                  >
                    {isReachable ? 'Reachable' : 'Out of Reach'}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-800/60 text-center my-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Distance</span>
                    <strong className="font-mono text-slate-200">
                      {st.distanceFromStartKm ?? '--'} km
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Est. Energy</span>
                    <strong className="font-mono text-amber-300">
                      {st.energyNeededWh ?? '--'} Wh
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Power Rating</span>
                    <strong className="font-mono text-cyan-300">{st.powerKw} kW</strong>
                  </div>
                </div>

                {/* Plugs and status */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-400">
                    <span>Plugs:</span>
                    <span className="text-slate-300">{st.plugTypes.join(' • ')}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {st.statusLabel}
                  </span>
                </div>

                {/* Divert Button */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectStation(st)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    Highlight on Map
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDivertToStation(st);
                      onClose();
                    }}
                    disabled={!isReachable}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5 ${
                      isReachable
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Divert Trip to Station</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
