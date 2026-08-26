import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stepTelemetry, resetTelemetry, addNotification } from '../../store/store.js';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Radio, 
  Truck, 
  Fuel, 
  ShieldCheck,
  AlertCircle,
  TrendingDown,
  X
} from 'lucide-react';

export default function LiveTrackingDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { data: telemetry, waypoints } = useSelector((state) => state.telemetry);
  const { selectedLoad } = useSelector((state) => state.loads);

  if (!isOpen || !telemetry) return null;

  const handleStep = () => {
    dispatch(stepTelemetry(1));
    if (telemetry.progressPercent >= 90) {
      dispatch(addNotification({
        title: 'Approaching Destination',
        description: 'Driver is within 15 KM of ICD Tughlakabad / Okhla depot.',
        type: 'TELEMETRY_ALERT'
      }));
    }
  };

  const handleReset = () => {
    dispatch(resetTelemetry());
    dispatch(addNotification({
      title: 'Telemetry Simulation Reset',
      description: 'Trip reset to starting depot at Mandideep, Bhopal.',
      type: 'INFO'
    }));
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0f172a]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-slide-left">
      
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-['Outfit',sans-serif] font-bold text-lg text-white">
                Live GPS Telemetry & Corridor Log
              </h2>
              <p className="text-xs text-slate-400 font-mono">Trip ID: TRP-98821 • NH46-NH44 Corridor</p>
            </div>
          </div>

          <button
            id="tracking-drawer-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Header Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {telemetry.status.replace('_', ' ')}
            </span>
            <span className="text-xs font-mono text-slate-300">
              ETA: <span className="text-amber-300 font-bold">{Math.floor(telemetry.etaMinutes / 60)}h {telemetry.etaMinutes % 60}m</span>
            </span>
          </div>

          <div>
            <h3 className="font-bold text-sm text-white">{telemetry.driverName}</h3>
            <p className="text-xs text-slate-400">{telemetry.vehicleReg} • {telemetry.vehicleType.replace('_', ' ')}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 font-mono">
            <span className="text-[10px] text-slate-500 block">CURRENT GPS FIX:</span>
            📍 {telemetry.currentLocation?.address}
          </div>

          {/* Telemetry Gauge Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block">SPEED</span>
              <span className="text-emerald-400 font-bold text-sm">{telemetry.speedKmH} km/h</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block">PROGRESS</span>
              <span className="text-amber-300 font-bold text-sm">{telemetry.progressPercent}%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block">FUEL LVL</span>
              <span className="text-teal-300 font-bold text-sm">{telemetry.fuelLevelPercent}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>{telemetry.completedDistanceKm} KM passed</span>
              <span>{telemetry.totalDistanceKm - telemetry.completedDistanceKm} KM remaining</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 transition-all duration-300"
                style={{ width: `${telemetry.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Milestone Waypoints Checklist */}
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Route Milestones & Checkpoints</span>
            <span className="text-[10px] font-mono text-slate-400 font-normal">8 Waypoints</span>
          </h4>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {waypoints.map((wp, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  wp.passed
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-200'
                    : 'bg-slate-900/60 border-white/5 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    wp.passed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {wp.passed ? '✓' : idx + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{wp.name}</span>
                    <span className="text-[10px] text-slate-400">{wp.city} • {wp.type}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-amber-300 font-bold block">{wp.kmFromStart} KM</span>
                  <span className="text-[10px] text-slate-400">{wp.passedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Simulator Controller */}
      <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-2">
          <button
            id="tracking-step-gps-btn"
            onClick={handleStep}
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Play className="w-4 h-4" />
            <span>Simulate GPS Move (+25 KM)</span>
          </button>

          <button
            id="tracking-reset-gps-btn"
            onClick={handleReset}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all active:scale-95"
            title="Reset to origin"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Driver telemetry is streamed via WebSockets and automatically updates load status when arriving at depot.
        </p>
      </div>

    </div>
  );
}
