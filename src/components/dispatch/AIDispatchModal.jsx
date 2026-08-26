import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleAIDispatchModal, updateLoadStatus } from '../../store/slices/loadsSlice.js';
import { aiDispatchService } from '../../services/api.js';
import { 
  X, 
  Sparkles, 
  Cpu, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  TrendingDown, 
  Compass, 
  Zap,
  ArrowRight,
  Flame,
  BatteryCharging
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';
import confetti from 'canvas-confetti';

export default function AIDispatchModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.loads?.isAIDispatchModalOpen);
  const selectedLoad = useSelector((state) => state.loads?.selectedLoad || state.loads?.items?.[0]);
  const currentUser = useSelector((state) => state.auth?.user);

  const [loading, setLoading] = useState(false);
  const [optimizationData, setOptimizationData] = useState(null);
  const [isDispatched, setIsDispatched] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        soundFx.radarPing();
        dispatch(toggleAIDispatchModal(false));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && selectedLoad) {
      fetchAIOptimization();
    }
  }, [isOpen, selectedLoad]);

  const fetchAIOptimization = async () => {
    try {
      setLoading(true);
      const res = await aiDispatchService.optimizeDispatch(selectedLoad);
      if (res.data?.optimization) {
        setOptimizationData(res.data.optimization);
      }
      setLoading(false);
    } catch (err) {
      console.error('AI dispatch optimization error:', err);
      setLoading(false);
    }
  };

  if (!isOpen || !selectedLoad) return null;

  const handleConfirmAIDispatch = () => {
    soundFx.bidAccepted();
    setIsDispatched(true);

    dispatch(updateLoadStatus({
      loadId: selectedLoad._id,
      status: 'ASSIGNED',
      assignedDriverId: 'usr_driver_01',
      assignedDriverName: 'Vikram Sharma',
      assignedPrice: optimizationData?.estimatedFuelSavingsInr ? selectedLoad.basePrice - 4000 : 54000
    }));

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    setTimeout(() => {
      setIsDispatched(false);
      dispatch(toggleAIDispatchModal(false));
    }, 1200);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundFx.radarPing();
          dispatch(toggleAIDispatchModal(false));
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div 
        id="ai-dispatch-modal-container"
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-600">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                  Gemini AI Corridor Match & Autonomous Dispatch
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">Zero-Deadhead Neural Telemetry Routing</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(toggleAIDispatchModal(false))}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin"></div>
                <Sparkles className="w-5 h-5 text-amber-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Executing Multi-Corridor Telemetry Matrix...
                </p>
                <p className="text-xs text-slate-500">
                  Evaluating 64 returning trucks, road gradients, and empty trailer vectors
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Selected Shipment Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="text-amber-800">TARGET SHIPMENT: {selectedLoad.title}</span>
                  <span className="font-mono text-slate-900">₹{selectedLoad.basePrice?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Corridor: {selectedLoad.pickupLocation?.city} ➔ {selectedLoad.dropLocation?.city}</span>
                  <span>{selectedLoad.weightInTons}T Payload</span>
                </div>
              </div>

              {/* AI Top Recommendation Box */}
              <div className="p-5 rounded-3xl bg-amber-50/70 border-2 border-amber-300 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                      Prime Neural Return Match
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold font-mono border border-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{optimizationData?.matchScore || 97}% MATCH ACCURACY</span>
                  </div>
                </div>

                {/* Driver Bio Highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                    <span className="text-[10px] text-slate-500 block font-medium">Recommended Trucker</span>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Vikram Sharma</span>
                      <span className="text-amber-600 text-xs">★ 4.92</span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      Tata Prima 5530.S (MP-04-HE-8821)
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                    <span className="text-[10px] text-slate-500 block font-medium">Deadhead Elimination</span>
                    <div className="text-sm font-bold text-amber-700 font-mono">
                      {optimizationData?.deadheadReductionKm || 785} KM Saved
                    </div>
                    <div className="text-xs text-emerald-700 font-mono font-semibold">
                      ≈ ₹{optimizationData?.estimatedFuelSavingsInr?.toLocaleString('en-IN') || '34,500'} Diesel Conserved
                    </div>
                  </div>
                </div>

                {/* AI Rationale */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-xs">
                  <span className="text-amber-900 font-bold block mb-1">AI Match Rationale:</span>
                  {optimizationData?.dispatchRationale || 'Driver is situated 4.2 km from Mandideep warehouse with an empty trailer returning directly to Delhi NCR home base, achieving zero deadhead diversion.'}
                </div>
              </div>

              {/* Corridor Route & Waypoint Stops */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-sky-600" />
                    <span>AI Suggested Corridor Stops & Checkpoints</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Est. Transit: {optimizationData?.estimatedTransitTimeHours || 14.5} Hours
                  </span>
                </div>

                <div className="space-y-2">
                  {(optimizationData?.recommendedTollAndRestStops || []).map((stop, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-bold font-mono text-[10px] flex items-center justify-center border border-amber-300">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{stop.stopName}</div>
                          <div className="text-[10px] text-slate-500">{stop.location} • {stop.recommendedAction}</div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white text-slate-700 border border-slate-200 whitespace-nowrap shadow-xs">
                        {stop.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk & Fuel Advisory */}
              {optimizationData?.riskAndWeatherAdvisory && (
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sky-900">Highway Advisory & Weather:</span>
                    <span>{optimizationData.riskAndWeatherAdvisory}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  id="confirm-ai-dispatch-btn"
                  onClick={handleConfirmAIDispatch}
                  disabled={isDispatched}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDispatched ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-slate-950" />
                      <span>Driver Dispatched & Route Transmitted!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                      <span>Authorize 1-Click AI Dispatch to Vikram Sharma</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
