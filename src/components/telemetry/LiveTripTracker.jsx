import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  updateTelemetry, 
  toggleSimulation, 
  setSimulationSpeed, 
  addLog, 
  resetSimulation 
} from '../../store/slices/telemetrySlice.js';
import { updateLoadStatus } from '../../store/slices/loadsSlice.js';
import { telemetryService } from '../../services/api.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Navigation, 
  Gauge, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Radio, 
  Zap, 
  AlertCircle,
  Truck,
  BatteryCharging,
  Flame,
  ShieldCheck
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';
import confetti from 'canvas-confetti';

export default function LiveTripTracker() {
  const dispatch = useDispatch();
  const telemetry = useSelector((state) => state.telemetry || {});
  const selectedLoad = useSelector((state) => state.loads?.selectedLoad || state.loads?.items?.[0]);
  
  const timerRef = useRef(null);

  // Simulation tick loop
  useEffect(() => {
    if (telemetry?.isSimulating) {
      const intervalMs = Math.max(400, 1500 / (telemetry?.simulationSpeed || 1));
      
      timerRef.current = setInterval(async () => {
        try {
          const res = await telemetryService.stepSimulation(telemetry?.simulationSpeed || 1);
          if (res.data?.telemetry) {
            dispatch(updateTelemetry(res.data.telemetry));
            
            // If completed
            if (res.data.telemetry.progressPercent >= 100) {
              soundFx.bidAccepted();
              dispatch(toggleSimulation(false));
              dispatch(updateLoadStatus({
                loadId: telemetry?.activeLoadId || 'load_001',
                status: 'COMPLETED',
                currentProgressPercent: 100
              }));
              try {
                confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              } catch {}
            }
          }
        } catch (err) {
          console.error('Telemetry step error:', err);
        }
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [telemetry?.isSimulating, telemetry?.simulationSpeed, telemetry?.activeLoadId, dispatch]);

  const handleTogglePlay = () => {
    soundFx.radarPing();
    dispatch(toggleSimulation(!telemetry?.isSimulating));
    if (!telemetry?.isSimulating) {
      dispatch(addLog({
        event: 'Driver initiated live GPS telemetry broadcast',
        type: 'INFO'
      }));
    }
  };

  const handleReset = async () => {
    soundFx.radarPing();
    dispatch(toggleSimulation(false));
    await telemetryService.resetSimulation();
    dispatch(resetSimulation());
  };

  const logsList = Array.isArray(telemetry?.logs) ? telemetry.logs : [];
  const statusStr = (telemetry?.status || 'AT_PICKUP').replace(/_/g, ' ');
  const progressVal = telemetry?.progressPercent ?? 0;
  const speedVal = telemetry?.speedKmH ?? 0;
  const etaVal = telemetry?.etaMinutes ?? telemetry?.estimatedArrivalMinutes ?? 870;
  const fuelVal = telemetry?.fuelRemainingLiters ?? 185;

  return (
    <div id="live-trip-tracker-panel" className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-xl backdrop-blur-md space-y-6">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300">
            <Radio className="w-5 h-5 text-amber-700 animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-1 -right-1 ring-2 ring-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Active Corridor GPS Telemetry
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                {statusStr}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Vehicle: <span className="text-amber-800 font-mono font-bold">{telemetry?.vehicleReg || 'MP-04-HE-8821'}</span> ({telemetry?.driverName || 'Vikram Sharma'})
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button
            id="telemetry-play-pause-btn"
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
              telemetry?.isSimulating
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {telemetry?.isSimulating ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Pause GPS</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Route</span>
              </>
            )}
          </button>

          {/* Speed selector */}
          <div className="flex items-center gap-1">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => dispatch(setSimulationSpeed(spd))}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  (telemetry?.simulationSpeed || 1) === spd
                    ? 'bg-white text-amber-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer shadow-xs"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Speed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Progress Bar block */}
        <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Corridor Transit Progress</span>
            <span className="text-amber-800 font-mono">{progressVal}% Completed</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progressVal}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Bhopal Mandideep</span>
            <span>Delhi NCR Hub (785 KM)</span>
          </div>
        </div>

        {/* Speed Gauge block */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">GPS Speed</span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {speedVal} <span className="text-xs font-normal text-slate-500">km/h</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">Cruise Eco-Mode</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        {/* ETA & Fuel block */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">ETA Destination</span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {etaVal} <span className="text-xs font-normal text-slate-500">Mins</span>
            </div>
            <span className="text-[10px] text-amber-700 font-semibold font-mono">
              {fuelVal}L Diesel Left
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Live Highway Telemetry Event Logs */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Real-time Highway Telemetry & Geo-fence Feed</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">Auto-logging active</span>
        </div>

        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
          {logsList.slice().reverse().map((log, idx) => (
            <div
              key={log?.id || idx}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-3 text-slate-700 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{log?.event}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0">{log?.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
