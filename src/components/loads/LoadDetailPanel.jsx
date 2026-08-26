import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedLoad, toggleDetailPanel, toggleAIDispatchModal, updateLoadStatus } from '../../store/slices/loadsSlice.js';
import { toggleBidModal, setSelectedLoadForBid } from '../../store/slices/bidsSlice.js';
import { openLoginModal } from '../../store/slices/authSlice.js';
import { addNotification } from '../../store/slices/notificationsSlice.js';
import { bidService } from '../../services/api.js';
import { 
  X, 
  MapPin, 
  Truck, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  User, 
  Lock,
  Layers,
  Flame,
  LogIn
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';
import confetti from 'canvas-confetti';

export default function LoadDetailPanel() {
  const dispatch = useDispatch();
  const selectedLoad = useSelector((state) => state.loads?.selectedLoad);
  const isDetailPanelOpen = useSelector((state) => state.loads?.isDetailPanelOpen);
  const activeRole = useSelector((state) => state.auth?.activeRole || 'DRIVER');
  const allBids = useSelector((state) => state.bids?.items || []);
  const currentUser = useSelector((state) => state.auth?.user);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDetailPanelOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailPanelOpen]);

  if (!isDetailPanelOpen || !selectedLoad) return null;

  const handleClose = () => {
    soundFx.radarPing();
    dispatch(toggleDetailPanel(false));
    dispatch(setSelectedLoad(null));
  };

  const handleOpenBid = () => {
    soundFx.radarPing();
    if (currentUser && currentUser.role === 'SHIPPER') {
      dispatch(addNotification({
        type: 'WARNING',
        title: 'Role-Based Access Control',
        message: 'Access Denied: Enterprise Shippers cannot place bids. Please authenticate with a Commercial Driver account.'
      }));
      dispatch(openLoginModal('DRIVER'));
      return;
    }
    dispatch(setSelectedLoadForBid(selectedLoad));
    dispatch(toggleBidModal(true));
  };

  const handleOpenAIDispatch = () => {
    soundFx.radarPing();
    dispatch(toggleAIDispatchModal(true));
  };

  const handleAcceptBid = async (bid) => {
    if (currentUser && currentUser.role === 'DRIVER') {
      soundFx.radarPing();
      dispatch(addNotification({
        type: 'WARNING',
        title: 'Role-Based Access Control',
        message: 'Access Denied: Commercial Drivers cannot accept freight bids. Only the Shipper can lock contracts.'
      }));
      dispatch(openLoginModal('SHIPPER'));
      return;
    }

    try {
      soundFx.bidAccepted();
      await bidService.acceptBidWithLock(bid._id);
      
      // Update local store state
      dispatch(updateLoadStatus({
        loadId: selectedLoad._id,
        status: 'ASSIGNED',
        assignedDriverId: bid.driverId,
        assignedDriverName: bid.driverName,
        assignedPrice: bid.bidAmount
      }));

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } catch (err) {
      console.error('Accept bid error:', err);
    }
  };

  // Filter bids for this specific load
  const loadBids = allBids.filter((b) => b.loadId === selectedLoad._id);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end"
    >
      <div 
        id="load-detail-drawer"
        className="w-full max-w-xl bg-white border-l border-slate-200 h-full shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10 flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {selectedLoad.status?.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {selectedLoad._id}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
              {selectedLoad.title}
            </h3>
          </div>

          <button
            id="close-load-detail-btn"
            onClick={handleClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Corridor Pickup & Drop Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <div>
                  <div>{selectedLoad.pickupLocation?.city}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{selectedLoad.pickupLocation?.address}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-amber-800 font-mono">{selectedLoad.distanceKm} KM</div>
                <div className="text-[10px] text-slate-500 font-normal">Corridor Transit</div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-200 pt-3">
              <span className="w-3 h-3 rounded-full bg-sky-500"></span>
              <div className="text-xs font-bold text-slate-900">
                <div>{selectedLoad.dropLocation?.city}</div>
                <div className="text-[10px] text-slate-500 font-normal">{selectedLoad.dropLocation?.address}</div>
              </div>
            </div>
          </div>

          {/* Pricing & Deadhead Value Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
              <span className="text-xs text-amber-900 font-semibold block">Shipper Base Budget</span>
              <div className="text-xl font-extrabold font-mono text-amber-950">
                ₹{selectedLoad.basePrice?.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-amber-800 font-medium">Guaranteed Escrow Lock</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <span className="text-xs text-emerald-900 font-semibold block">Deadhead Savings</span>
              <div className="text-xl font-extrabold font-mono text-emerald-950">
                {selectedLoad.deadheadReductionKm || 785} KM
              </div>
              <div className="text-[10px] text-emerald-800 font-medium">≈ 225L Diesel Conserved</div>
            </div>
          </div>

          {/* Freight Specifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Freight & Vehicle Requirements
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Payload Weight</span>
                <span className="font-bold text-slate-900 font-mono">{selectedLoad.weightInTons} Metric Tons</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Vehicle Specification</span>
                <span className="font-bold text-slate-900">{selectedLoad.vehicleTypeRequired?.replace('_', ' ')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Cargo Category</span>
                <span className="font-bold text-slate-900">{selectedLoad.cargoType}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Urgency Status</span>
                <span className="font-bold text-amber-800">{selectedLoad.urgency || 'HIGH'}</span>
              </div>
            </div>
          </div>

          {/* Live Competitive Bids Room */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Incoming Driver Counter-Bids</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300">
                  {loadBids.length} Active
                </span>
              </h4>
            </div>

            {loadBids.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <DollarSign className="w-6 h-6 text-slate-400 mx-auto" />
                <p>No counter-bids placed on this shipment yet.</p>
                <p className="text-[11px] text-amber-800 font-semibold">Be the first trucker to bid on this return load!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {loadBids.map((bid) => (
                  <div
                    key={bid._id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{bid.driverName}</span>
                        <span className="text-xs text-amber-600 font-semibold">★ 4.92</span>
                        <span className="text-[10px] text-slate-500 font-mono">({bid.vehicleReg})</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Pickup ETA: <span className="font-semibold text-slate-800">{bid.estimatedPickupTime}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-base font-extrabold font-mono text-slate-900">
                        ₹{bid.bidAmount?.toLocaleString('en-IN')}
                      </div>

                      {activeRole === 'SHIPPER' && selectedLoad.status !== 'ASSIGNED' && (
                        <button
                          onClick={() => handleAcceptBid(bid)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          Accept & Lock
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Action Bar */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/90 sticky bottom-0 z-10 flex items-center gap-3 backdrop-blur-md">
          {activeRole === 'DRIVER' ? (
            <>
              <button
                id="drawer-submit-bid-btn"
                onClick={handleOpenBid}
                className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-4 h-4 stroke-[2.5]" />
                <span>Submit Counter-Bid</span>
              </button>

              <button
                onClick={handleOpenAIDispatch}
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-amber-800 border border-slate-300 shadow-xs transition flex items-center justify-center cursor-pointer"
                title="AI Route Optimization"
              >
                <Sparkles className="w-5 h-5 text-amber-600" />
              </button>
            </>
          ) : (
            <button
              onClick={handleOpenAIDispatch}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>AI Corridor Match & Auto-Dispatch</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
