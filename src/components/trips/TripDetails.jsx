import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTelemetry, 
  stepTelemetry, 
  resetTelemetry, 
  requestRouteInsights,
  addNotification 
} from '../../store/index.js';
import LiveMap from '../map/LiveMap.jsx';
import { 
  Truck, 
  Navigation, 
  Gauge, 
  Fuel, 
  Thermometer, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  FileCheck, 
  AlertCircle,
  Zap,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TripDetails() {
  const dispatch = useDispatch();
  const telemetry = useSelector((state) => state.telemetry.state);
  const waypoints = useSelector((state) => state.telemetry.waypoints);
  const routeInsights = useSelector((state) => state.loads.routeInsights);
  const selectedLoad = useSelector((state) => state.loads.selectedLoad);

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  useEffect(() => {
    dispatch(fetchTelemetry());
    dispatch(requestRouteInsights({
      origin: 'Bhopal (Mandideep)',
      destination: 'Delhi NCR (Okhla ICD)',
      cargoType: '18T Basmati Rice',
      weightTons: 18
    }));
  }, [dispatch]);

  // Auto-play simulation interval
  useEffect(() => {
    let timer = null;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        dispatch(stepTelemetry(1)).then((res) => {
          if (res.payload?.telemetry?.progressPercent >= 100) {
            setIsAutoPlaying(false);
            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 }
            });
            dispatch(addNotification({
              title: 'Cargo Successfully Delivered',
              message: 'e-Way Bill POD automatically generated and verified on blockchain.',
              type: 'SUCCESS'
            }));
          }
        });
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, dispatch]);

  const handleStep = () => {
    dispatch(stepTelemetry(1));
  };

  const handleReset = () => {
    setIsAutoPlaying(false);
    dispatch(resetTelemetry());
  };

  if (!telemetry) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Truck className="w-10 h-10 mx-auto animate-bounce mb-3 text-amber-400" />
        <p>Connecting to Driver GPS Telemetry stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Active Highway Corridor Status */}
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE TELEMETRY STREAM
              </span>
              <span className="text-xs text-slate-400 font-mono">Trip #{telemetry.currentLoadId}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Mandideep (Bhopal) <span className="text-amber-400">➔</span> ICD Tughlakabad (New Delhi)
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                {telemetry.driverName} ({telemetry.vehicleReg})
              </span>
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/5">
                Trailer: {telemetry.vehicleType}
              </span>
              <span className="text-emerald-400 font-bold font-mono">
                🌱 100% Zero-Deadhead Return Haul
              </span>
            </div>
          </div>

          {/* Simulation Controller Controls */}
          <div className="flex flex-wrap items-center gap-2.5 bg-slate-950/80 p-3 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                isAutoPlaying 
                  ? 'bg-amber-500 text-slate-950' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Telemetry</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Auto-Drive GPS</span>
                </>
              )}
            </button>

            <button
              onClick={handleStep}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Step +10 km</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Reset Corridor Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Route Completion Progress</span>
            <span className="text-emerald-400 font-mono font-bold">
              {telemetry.progressPercent}% ({telemetry.completedDistanceKm} / {telemetry.totalDistanceKm} km)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10 p-0.5 relative">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 rounded-full transition-all duration-500 relative"
              style={{ width: `${telemetry.progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/60 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Gauge Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Speed */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase">Current Speed</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-white">{telemetry.speedKmH}</span>
            <span className="text-xs text-slate-400 ml-1 font-mono">km/h</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">Cruise Control Active</div>
        </div>

        {/* ETA */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase">Remaining ETA</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {Math.floor(telemetry.etaMinutes / 60)}h {telemetry.etaMinutes % 60}m
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">On-Time Prediction: 98%</div>
        </div>

        {/* Fuel & DEF */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase">Diesel Tank</span>
            <Fuel className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-white">{telemetry.fuelLevelPercent}%</span>
            <span className="text-xs text-slate-400 ml-1">Full</span>
          </div>
          <div className="text-[11px] text-cyan-400 font-medium">~580 km range remaining</div>
        </div>

        {/* e-Way Bill POD */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase">e-Way Bill POD</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2">
            <span className="text-xl font-bold font-mono text-white">
              {telemetry.progressPercent >= 100 ? 'VERIFIED' : 'ACTIVE_LOG'}
            </span>
          </div>
          <div className="text-[11px] text-purple-300 font-medium">GST e-Way: 8819-2041-9921</div>
        </div>
      </div>

      {/* Main Grid: Live Map + Route Insights & Waypoint Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container (2 cols) */}
        <div className="lg:col-span-2 h-[480px]">
          <LiveMap />
        </div>

        {/* Highway Corridor Waypoints & Gemini Insights (1 col) */}
        <div className="space-y-4">
          {/* Gemini Route Insights Box */}
          {routeInsights && (
            <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-purple-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Gemini AI Route & FASTag Advisory</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {routeInsights.fuelSavingTips}
              </p>
              <div className="text-[11px] text-amber-300 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 font-mono flex items-center justify-between">
                <span>FASTag Toll Estimate:</span>
                <span className="font-bold">₹{routeInsights.estimatedTollCost || 1450}</span>
              </div>
            </div>
          )}

          {/* Waypoints Timeline */}
          <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 space-y-3 max-h-[380px] overflow-y-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Corridor Waypoints & Toll Checkpoints
            </h4>

            <div className="space-y-3 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {waypoints.map((wp, idx) => (
                <div key={idx} className="relative flex items-start gap-3 text-xs pl-6">
                  <div className={`absolute left-1.5 top-1 w-2.5 h-2.5 rounded-full ring-4 ${
                    wp.passed 
                      ? 'bg-emerald-400 ring-emerald-500/20' 
                      : 'bg-slate-600 ring-slate-800'
                  }`} />
                  
                  <div className="flex-1">
                    <div className={`font-bold ${wp.passed ? 'text-white' : 'text-slate-400'}`}>
                      {wp.name}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                      <span>{wp.kmFromStart} km</span>
                      <span className={wp.passed ? 'text-emerald-400 font-mono' : 'text-slate-400 font-mono'}>
                        {wp.passed ? `✓ ${wp.passedTime}` : wp.passedTime}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
