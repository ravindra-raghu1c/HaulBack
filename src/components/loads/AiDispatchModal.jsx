import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestAiDispatch, clearAiOptimization, addNotification, acceptBid } from '../../store/index.js';
import { 
  X, 
  Sparkles, 
  BrainCircuit, 
  Truck, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  Fuel, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Navigation,
  Layers,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AiDispatchModal({ load, isOpen, onClose }) {
  const dispatch = useDispatch();
  const aiOptimization = useSelector((state) => state.loads.aiOptimization);
  const aiLoading = useSelector((state) => state.loads.aiLoading);

  useEffect(() => {
    if (isOpen && load && !aiOptimization) {
      dispatch(requestAiDispatch(load));
    }
  }, [isOpen, load, aiOptimization, dispatch]);

  if (!isOpen || !load) return null;

  const handleApplyAiDispatch = async () => {
    try {
      await dispatch(acceptBid(`bid_${load._id}`)).unwrap();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
      dispatch(addNotification({
        title: 'Gemini AI Dispatch Confirmed',
        message: `Optimized route dispatched to driver Vikram Sharma. Telemetry tracking active.`,
        type: 'SUCCESS'
      }));
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl shadow-purple-500/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Gradient Banner */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-purple-950/80 via-slate-950/90 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Gemini AI Dispatch & Route Optimizer</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30">
                  GEMINI 2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-deadhead return haul algorithm with real-time corridor analysis</p>
            </div>
          </div>

          <button 
            onClick={() => {
              dispatch(clearAiOptimization());
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {aiLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base mb-1">Analyzing Freight Corridor & Truck Telemetry...</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Evaluating 38 returning drivers, proximity coordinates, highway toll gates, and deadhead fuel savings on NH46/NH44.
                </p>
              </div>
            </div>
          ) : aiOptimization ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* AI Match Overview Score Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-purple-950/40 p-4 rounded-2xl border border-purple-500/30 flex flex-col justify-between">
                  <div className="text-[11px] font-bold uppercase text-purple-300 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                    <span>Match Score</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-white mt-1">
                    {aiOptimization.matchScore}%
                  </div>
                  <div className="text-[10px] text-purple-200 mt-1">Optimal return backhaul alignment</div>
                </div>

                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
                  <div className="text-[11px] font-bold uppercase text-emerald-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deadhead Eliminated</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                    {aiOptimization.deadheadReductionKm} km
                  </div>
                  <div className="text-[10px] text-emerald-200 mt-1">≈ ₹{aiOptimization.estimatedFuelSavingsInr?.toLocaleString()} diesel saved</div>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                  <div className="text-[11px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Estimated Transit</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-white mt-1">
                    {aiOptimization.estimatedTransitTimeHours} hrs
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Green corridor priority routing</div>
                </div>
              </div>

              {/* AI Recommended Driver Assignment */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recommended Driver Assignment
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Verified Return Driver
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
                      VS
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Vikram Sharma (Tata Prima 5530.S)</div>
                      <div className="text-xs text-slate-400 font-mono">Reg: MP-04-HE-8821 • 25T Heavy Trailer</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-300">Driver Rating</div>
                    <div className="text-amber-400 font-bold text-sm">4.92 ★ (184 Trips)</div>
                  </div>
                </div>

                {/* AI Rationale Box */}
                <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-xl text-xs text-purple-200 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Dispatch Rationale:</span>
                  </div>
                  <p className="leading-relaxed">
                    {aiOptimization.dispatchRationale}
                  </p>
                </div>
              </div>

              {/* Recommended Route & Toll Waypoints */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Optimized Corridor: {aiOptimization.optimalRouteSummary}</span>
                </div>

                {aiOptimization.recommendedTollAndRestStops && (
                  <div className="space-y-2">
                    {aiOptimization.recommendedTollAndRestStops.map((stop, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white">{stop.stopName}</div>
                            <div className="text-[11px] text-slate-400">{stop.recommendedAction}</div>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-amber-400 font-semibold">{stop.mileMarkerKm} km</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Weather & Safety Advisory */}
                {aiOptimization.riskAndWeatherAdvisory && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span><strong>Advisory:</strong> {aiOptimization.riskAndWeatherAdvisory}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              dispatch(clearAiOptimization());
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyAiDispatch}
            disabled={aiLoading || !aiOptimization}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply AI Dispatch & Broadcast Route</span>
          </button>
        </div>
      </div>
    </div>
  );
}
