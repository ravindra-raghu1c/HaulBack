import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLoad, toggleAIDispatchModal } from '../../store/slices/loadsSlice.js';
import { toggleBidModal, setSelectedLoadForBid } from '../../store/slices/bidsSlice.js';
import { 
  MapPin, 
  Truck, 
  Weight, 
  ArrowRight, 
  DollarSign, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';

export default function LoadCard({ load }) {
  const dispatch = useDispatch();
  const selectedLoad = useSelector((state) => state.loads?.selectedLoad);
  const activeRole = useSelector((state) => state.auth?.activeRole || 'DRIVER');

  const isSelected = selectedLoad?._id === load._id;

  const handleCardClick = () => {
    soundFx.radarPing();
    dispatch(setSelectedLoad(load));
  };

  const handleOpenBid = (e) => {
    e.stopPropagation();
    soundFx.radarPing();
    dispatch(setSelectedLoadForBid(load));
    dispatch(toggleBidModal(true));
  };

  const handleAIDispatch = (e) => {
    e.stopPropagation();
    soundFx.radarPing();
    dispatch(setSelectedLoad(load));
    dispatch(toggleAIDispatchModal(true));
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'BIDDING_OPEN':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'POSTED':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'IN_TRANSIT':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'ASSIGNED':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div
      id={`load-card-${load._id}`}
      onClick={handleCardClick}
      className={`group relative p-5 rounded-3xl transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'bg-white border-2 border-amber-500 shadow-xl ring-2 ring-amber-500/20'
          : 'bg-white border border-slate-200/90 shadow-md hover:shadow-xl hover:border-slate-300'
      }`}
    >
      {/* Top Header Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${getStatusBadge(load.status)}`}>
            {load.status.replace('_', ' ')}
          </span>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-medium">Shipper Base Rate</span>
            <span className="text-base font-extrabold font-mono text-slate-900">
              ₹{load.basePrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Shipment Title */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition line-clamp-1">
            {load.title}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-1">{load.cargoType}</p>
        </div>

        {/* Visual Route Corridor */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{load.pickupLocation?.city || 'Origin'}</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <span>{load.distanceKm} KM</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>

            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>{load.dropLocation?.city || 'Destination'}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 truncate">
            {load.pickupLocation?.address}
          </div>
        </div>

        {/* Load Meta Specs: Weight, Vehicle, Deadhead savings */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block">Required Rig</span>
            <span className="font-semibold text-slate-800 line-clamp-1">
              {load.vehicleTypeRequired?.replace('_', ' ')}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block">Payload</span>
            <span className="font-bold font-mono text-slate-800">
              {load.weightInTons} Metric Tons
            </span>
          </div>
        </div>

        {/* Deadhead Elimination Pill */}
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Deadhead Elimination</span>
          </div>
          <span className="font-mono font-bold text-amber-800">
            {load.deadheadReductionKm || 785} KM Saved
          </span>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center gap-2 mt-3">
        {activeRole === 'DRIVER' ? (
          <>
            <button
              id={`card-bid-btn-${load._id}`}
              onClick={handleOpenBid}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Place Bid</span>
            </button>

            <button
              id={`card-details-btn-${load._id}`}
              onClick={handleCardClick}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition cursor-pointer"
            >
              Details
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleAIDispatch}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>AI Dispatch Match</span>
            </button>

            <button
              onClick={handleCardClick}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition cursor-pointer"
            >
              Manage
            </button>
          </>
        )}
      </div>
    </div>
  );
}
