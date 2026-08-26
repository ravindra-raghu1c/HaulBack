import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleBidModal, addBid } from '../../store/slices/bidsSlice.js';
import { updateLoadLowestBid } from '../../store/slices/loadsSlice.js';
import { openLoginModal } from '../../store/slices/authSlice.js';
import { addNotification } from '../../store/slices/notificationsSlice.js';
import { bidService } from '../../services/api.js';
import { 
  X, 
  DollarSign, 
  Clock, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  TrendingDown, 
  Info, 
  ShieldCheck,
  Lock,
  LogIn
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';
import confetti from 'canvas-confetti';

export default function BidModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.bids?.isBidModalOpen);
  const selectedLoad = useSelector((state) => state.bids?.selectedLoadForBid || (isOpen ? state.loads?.selectedLoad : null));
  const currentUser = useSelector((state) => state.auth?.user);

  const [bidAmount, setBidAmount] = useState(52000);
  const [estimatedPickupTime, setEstimatedPickupTime] = useState('Today, within 2 Hours');
  const [vehicleReg, setVehicleReg] = useState(currentUser?.vehicle?.regNumber || '');
  const [notes, setNotes] = useState('Empty trailer returning directly on corridor. Ready for immediate dock loading.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isShipper = currentUser && currentUser.role === 'SHIPPER';

  useEffect(() => {
    if (currentUser?.vehicle?.regNumber && !vehicleReg) {
      setVehicleReg(currentUser.vehicle.regNumber);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        soundFx.radarPing();
        dispatch(toggleBidModal(false));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (selectedLoad?.basePrice) {
      // Suggest 8% lower than base price for competitive return-load bidding
      setBidAmount(Math.round(selectedLoad.basePrice * 0.92 / 500) * 500);
    }
  }, [selectedLoad]);

  if (!isOpen || !selectedLoad) return null;

  const handleQuickAdjust = (diff) => {
    soundFx.radarPing();
    setBidAmount((prev) => Math.max(1000, Number(prev) + diff));
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();

    if (isShipper) {
      soundFx.radarPing();
      dispatch(addNotification({
        type: 'WARNING',
        title: 'Role-Based Access Control',
        message: 'Access Denied: Enterprise Shippers cannot submit counter-bids. Bidding is exclusive to Commercial Drivers.'
      }));
      dispatch(openLoginModal('DRIVER'));
      return;
    }

    try {
      setIsSubmitting(true);
      soundFx.bidPlaced();

      const bidPayload = {
        loadId: selectedLoad._id,
        driverId: currentUser?._id || `carrier_${Date.now()}`,
        driverName: currentUser?.name || 'Verified Carrier',
        driverRating: currentUser?.rating || 4.9,
        bidAmount: Number(bidAmount),
        vehicleReg: vehicleReg || currentUser?.vehicle?.regNumber || 'MH-12-AB-1234',
        estimatedPickupTime,
        notes
      };

      const res = await bidService.submitBid(bidPayload);
      
      if (res.data?.bid) {
        dispatch(addBid(res.data.bid));
        dispatch(updateLoadLowestBid({
          loadId: selectedLoad._id,
          lowestBid: Number(bidAmount)
        }));
      }

      try {
        confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.6 }
        });
      } catch {}

      setTimeout(() => {
        setIsSubmitting(false);
        dispatch(toggleBidModal(false));
      }, 700);
    } catch (err) {
      console.error('Bid submit error:', err);
      setIsSubmitting(false);
    }
  };

  const savingsPercent = selectedLoad.basePrice 
    ? Math.round(((selectedLoad.basePrice - bidAmount) / selectedLoad.basePrice) * 100) 
    : 0;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundFx.radarPing();
          dispatch(toggleBidModal(false));
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div 
        id="bid-modal-container"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Place Competitive Freight Bid
              </h3>
              <p className="text-[11px] text-slate-500">Fast-track return dispatch matching</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(toggleBidModal(false))}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmitBid} className="p-6 space-y-5">
          {/* Target Load Info Header */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 line-clamp-1">{selectedLoad.title}</div>
              <div className="text-[11px] text-slate-500">
                {selectedLoad.pickupLocation?.city} ➔ {selectedLoad.dropLocation?.city} ({selectedLoad.distanceKm} KM)
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Shipper Budget</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                ₹{selectedLoad.basePrice?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Bid Amount Input with Quick Adjust Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">
                Your Counter-Bid Rate (INR)
              </label>
              {savingsPercent > 0 && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {savingsPercent}% Under Shipper Budget
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-4 text-lg font-bold text-slate-400 font-mono">₹</span>
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl border border-slate-300 text-slate-900 text-xl font-mono font-bold focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>

            {/* Quick +/- Increments */}
            <div className="flex items-center gap-2 pt-1">
              {[-2000, -1000, -500, 500, 1000, 2000].map((inc) => (
                <button
                  type="button"
                  key={inc}
                  onClick={() => handleQuickAdjust(inc)}
                  className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-semibold transition cursor-pointer border border-slate-200"
                >
                  {inc > 0 ? `+₹${inc}` : `-₹${Math.abs(inc)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup ETA & Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Pickup Availability</label>
              <input
                type="text"
                value={estimatedPickupTime}
                onChange={(e) => setEstimatedPickupTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs font-medium"
                placeholder="e.g. Immediate / 2 Hours"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Vehicle Reg. Number</label>
              <input
                type="text"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>
          </div>

          {/* Notes to Shipper */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-700 font-semibold">Message & Route Confirmation</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="submit-bid-btn"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <CheckCircle2 className="w-5 h-5 animate-spin" />
                <span>Broadcasting Cryptographic Bid...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Confirm & Transmit Bid (₹{Number(bidAmount).toLocaleString('en-IN')})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
