import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { runAiDispatchOptimization, addNotification } from '../../store/store.js';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  TrendingDown, 
  DollarSign, 
  Leaf, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Compass,
  Zap,
  Radio
} from 'lucide-react';

export default function AiDispatcherModal({ load, isOpen, onClose, onAssignConfirmed }) {
  const dispatch = useDispatch();
  const { currentOptimization, loading } = useSelector((state) => state.ai);

  useEffect(() => {
    if (isOpen && load) {
      dispatch(runAiDispatchOptimization(load));
    }
  }, [isOpen, load, dispatch]);

  if (!isOpen || !load) return null;

  const handleConfirmAssignment = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.5 }
    });

    dispatch(addNotification({
      title: 'AI Optimal Driver Assigned',
      description: `Dispatched with ${currentOptimization?.matchScore || 97}% algorithmic match score.`,
      type: 'AI_DISPATCH_COMPLETE'
    }));

    if (onAssignConfirmed) onAssignConfirmed(load);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/10 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header with Glowing Sparkles */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Outfit',sans-serif] font-bold text-lg sm:text-xl text-white">
                  Gemini AI Autonomous Dispatcher
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  GEMINI 2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-Deadhead Route Optimization & Multi-Factor Match</p>
            </div>
          </div>

          <button
            id="ai-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin"></div>
              <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Analyzing Return Corridor Telemetry...</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Querying nearby returning trucks, historical route efficiency, fuel economics, and toll schedules.
              </p>
            </div>
          </div>
        ) : currentOptimization ? (
          <div className="mt-5 space-y-5">
            
            {/* Top Match Score Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-emerald-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 block font-semibold">
                  MATCH CONFIDENCE SCORE
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                  {currentOptimization.matchScore}%
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Route Efficiency: <span className="text-emerald-400 font-bold">{currentOptimization.routeEfficiencyScore || 95}/100</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Recommended Truck</span>
                <span className="text-sm font-bold text-white block">Tata Prima 5530.S</span>
                <span className="text-xs font-mono text-amber-400 block">MP-04-HE-8821 (Vikram S.)</span>
                <span className="text-[10px] text-emerald-400">4.2 KM from pickup</span>
              </div>
            </div>

            {/* Savings & ROI Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px]">Deadhead Saved</span>
                </div>
                <p className="text-base sm:text-lg font-bold font-mono text-amber-300">
                  +{currentOptimization.deadheadReductionKm} KM
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px]">Fuel Conservation</span>
                </div>
                <p className="text-base sm:text-lg font-bold font-mono text-emerald-300">
                  ₹{currentOptimization.estimatedFuelSavingsInr?.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Leaf className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[10px]">CO₂ Prevented</span>
                </div>
                <p className="text-base sm:text-lg font-bold font-mono text-teal-300">
                  {currentOptimization.co2ReductionKg} kg
                </p>
              </div>
            </div>

            {/* Dispatch Rationale */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Algorithmic Dispatch Rationale</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentOptimization.dispatchRationale}
              </p>
            </div>

            {/* Optimal Route Corridor & Recommended Rest/Toll Stops */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Suggested Optimal Highway Path</span>
                <span className="text-slate-400 font-mono">~{currentOptimization.estimatedTransitTimeHours || 14.5} hrs transit</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs font-mono text-emerald-300">
                📍 {currentOptimization.optimalRouteSummary || 'NH46 Biaora Corridor -> NH44 Gwalior -> Yamuna Expressway'}
              </div>

              {/* Waypoints / Stops */}
              {currentOptimization.recommendedTollAndRestStops && (
                <div className="mt-2 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">AI Recommended Stops & Fastag Lanes:</span>
                  {currentOptimization.recommendedTollAndRestStops.map((stop, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950/80 border border-white/5 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                          {stop.mileMarkerKm} KM
                        </span>
                        <span className="text-white font-medium">{stop.stopName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 italic">{stop.recommendedAction}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weather & Safety Advisory */}
            {currentOptimization.riskAndWeatherAdvisory && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{currentOptimization.riskAndWeatherAdvisory}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                id="ai-modal-cancel-btn"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Dismiss
              </button>

              <button
                type="button"
                id="ai-modal-assign-btn"
                onClick={handleConfirmAssignment}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Auto-Dispatch & Lock (₹49,500)</span>
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
