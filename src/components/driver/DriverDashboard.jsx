import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLoad, setActiveTab } from '../../store/index.js';
import LoadCard from '../loads/LoadCard.jsx';
import { 
  Truck, 
  MapPin, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  Fuel, 
  Sparkles, 
  Radio,
  ArrowRight,
  Zap,
  Leaf
} from 'lucide-react';

export default function DriverDashboard({ onBidClick, onOptimizeClick }) {
  const dispatch = useDispatch();
  const loads = useSelector((state) => state.loads.items);
  const currentUser = useSelector((state) => state.auth.user);
  const vehicle = currentUser.vehicle;

  // Calculate potential deadhead earnings
  const totalAvailableReturnFreight = loads
    .filter(l => l.status === 'BIDDING_OPEN' || l.status === 'POSTED')
    .reduce((sum, l) => sum + l.currentLowestBid, 0);

  return (
    <div className="space-y-6">
      {/* Driver Status Cockpit Card */}
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Driver Bio & Vehicle Status */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-lg">
                  VS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-lg font-['Outfit']">{currentUser.name}</h3>
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {currentUser.rating} ★
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {vehicle?.regNumber} • {vehicle?.make} ({vehicle?.capacityTons}T {vehicle?.type})
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                UNLOADED & READY
              </span>
            </div>

            {/* Current Geo Location & Return Corridor */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Current Unload Station</span>
                </div>
                <div className="font-bold text-white text-sm">{vehicle?.currentLocation?.address}</div>
                <div className="text-slate-400 font-mono text-[11px]">GPS: [77.5255° E, 23.1428° N]</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Home Base Destination</span>
                </div>
                <div className="font-bold text-white text-sm">{vehicle?.homeBase?.address}</div>
                <div className="text-slate-400 font-mono text-[11px]">Direct Northbound Corridor</div>
              </div>
            </div>
          </div>

          {/* Cumulative Deadhead Savings Metrics */}
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 p-5 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Return Backhaul Efficiency</span>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="text-[10px] text-slate-400">Total Empty KM Saved</div>
                  <div className="text-2xl font-extrabold font-mono text-white">
                    {currentUser.deadheadKmSaved?.toLocaleString() || '14,250'} KM
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Diesel Cost Recovered</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    ₹6.27 Lakhs
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Completed Return Trips:</span>
              <strong className="text-white font-mono">{currentUser.totalTrips}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Return Loads Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-white font-['Outfit']">
              Matched Return-Hauls Near Bhopal / Mandideep
            </h3>
            <p className="text-xs text-slate-400">
              Loads headed along your return path to Delhi NCR. Placing a counter-bid secures cargo for your trip home.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
            {loads.length} Loads on Route
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loads.map((load) => (
            <LoadCard 
              key={load._id} 
              load={load} 
              onBidClick={onBidClick} 
              onOptimizeClick={onOptimizeClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
