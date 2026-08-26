import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitBid, acceptBid, addNotification } from '../../store/index.js';
import { 
  X, 
  Gavel, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  TrendingDown, 
  Clock, 
  Sparkles, 
  Truck, 
  Fuel, 
  ArrowRight,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BidModal({ load, isOpen, onClose }) {
  const dispatch = useDispatch();
  const activeRole = useSelector((state) => state.auth.activeRole);
  const currentUser = useSelector((state) => state.auth.user);
  const [bidAmount, setBidAmount] = useState(load ? Math.round(load.currentLowestBid * 0.96) : 48000);
  const [etaPickupMins, setEtaPickupMins] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockAcquired, setLockAcquired] = useState(false);

  if (!isOpen || !load) return null;

  const discountPercent = Number(((load.basePrice - bidAmount) / load.basePrice * 100).toFixed(1));
  const ratePerKm = Math.round(bidAmount / (load.distanceKm || 785));

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(submitBid({
        loadId: load._id,
        driverId: currentUser._id,
        driverName: currentUser.name,
        vehicleReg: currentUser.vehicle?.regNumber || 'MP-04-HE-8821',
        vehicleType: currentUser.vehicle?.type || 'HEAVY_TRAILER',
        bidAmount: Number(bidAmount),
        driverProximityKm: 4.2,
        etaPickupMins: Number(etaPickupMins)
      })).unwrap();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      dispatch(addNotification({
        title: 'Return Bid Broadcasted via Socket.io',
        message: `Your bid of ₹${Number(bidAmount).toLocaleString()} for ${load.title} is now active.`,
        type: 'SUCCESS'
      }));

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleAcceptBidAsShipper = async () => {
    setIsSubmitting(true);
    setLockAcquired(true);

    try {
      // Simulate Redis SETNX atomic locking verification
      await new Promise(r => setTimeout(r, 600));
      
      await dispatch(acceptBid(`bid_${load._id}`)).unwrap();
      
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });

      dispatch(addNotification({
        title: 'Bid Accepted & Driver Locked',
        message: `Redis SETNX lock confirmed. Assigned to Vikram Sharma (Tata Prima).`,
        type: 'SUCCESS'
      }));

      setTimeout(() => {
        setIsSubmitting(false);
        setLockAcquired(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setLockAcquired(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden">
        {/* Top Header bar */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Live Bidding Room</h3>
              <p className="text-xs text-slate-400 font-mono">Load ID: #{load._id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Load Brief Details */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Cargo Shipment</span>
                <div className="font-bold text-white text-sm">{load.title}</div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {load.weightInTons}T • {load.cargoType}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/5 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>{load.pickupLocation.city}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{load.dropLocation.city}</span>
              </div>
              <span className="font-mono text-slate-400 font-bold">({load.distanceKm} km)</span>
            </div>
          </div>

          {/* Current Benchmark Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Base Shipper Budget</span>
              <div className="text-base font-bold text-slate-200 font-mono">₹{load.basePrice.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-amber-400 uppercase font-semibold">Current Lowest Bid</span>
              <div className="text-base font-bold text-amber-400 font-mono">₹{load.currentLowestBid.toLocaleString()}</div>
            </div>
          </div>

          {activeRole === 'DRIVER' ? (
            /* Driver Bid Submission Form */
            <form onSubmit={handleSubmitBid} className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <label className="font-bold text-slate-200">Your Return-Haul Bid Amount (₹)</label>
                  <span className="text-emerald-400 font-bold font-mono">
                    {discountPercent > 0 ? `${discountPercent}% below budget` : 'Standard rate'}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                  <input
                    type="number"
                    step="500"
                    min="15000"
                    max={load.basePrice}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-9 py-3 text-white font-mono text-lg font-bold focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    ≈ ₹{ratePerKm}/km
                  </span>
                </div>
              </div>

              {/* Quick Bid Preset Chips */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Quick adjust:</span>
                {[
                  { label: '-₹1,000', delta: -1000 },
                  { label: '-₹2,500', delta: -2500 },
                  { label: 'Match Lowest', set: load.currentLowestBid }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (preset.set) setBidAmount(preset.set);
                      else setBidAmount(prev => Math.max(10000, Number(prev) + preset.delta));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-white/10 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <strong className="text-white">Zero Deadhead Return Advantage:</strong> Since your home base is in {load.dropLocation.city}, taking this return load recovers ~₹{load.fuelSavingsEstimatedInr?.toLocaleString() || '34,500'} in diesel costs that would otherwise be wasted on an empty run.
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Radio className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Broadcasting Bid to Shipper...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    <span>Submit Competitive Bid (₹{Number(bidAmount).toLocaleString()})</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Shipper View: Accept Bid & Lock Driver */
            <div className="space-y-4 pt-2">
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      VS
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Vikram Sharma (Tata Prima 5530)</div>
                      <div className="text-[11px] text-slate-400">4.92 ★ • 184 Trips • 4.2 km proximity</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-base">₹{load.currentLowestBid.toLocaleString()}</span>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                  <span>Atomic Lock Protection:</span>
                  <span className="font-mono text-cyan-300 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-cyan-400" /> Redis SETNX Active
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAcceptBidAsShipper}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Lock className="w-4 h-4 animate-bounce text-slate-950" />
                    <span>Acquiring Redis Lock & Dispatching...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Bid & Lock Driver (₹{load.currentLowestBid.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
