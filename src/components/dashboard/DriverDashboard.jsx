import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LiveMap from '../map/LiveMap.jsx';
import LoadCard from '../loads/LoadCard.jsx';
import LiveTripTracker from '../telemetry/LiveTripTracker.jsx';
import { setFilters, toggleAIDispatchModal } from '../../store/slices/loadsSlice.js';
import { openLoginModal, setActiveRole } from '../../store/slices/authSlice.js';
import { 
  Truck, 
  MapPin, 
  Sparkles, 
  SlidersHorizontal, 
  TrendingUp, 
  Zap, 
  Search, 
  Radio,
  Flame,
  ShieldCheck,
  Lock,
  Building2,
  LogIn
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';

export default function DriverDashboard() {
  const dispatch = useDispatch();
  const loads = useSelector((state) => state.loads?.items || []);
  const filters = useSelector((state) => state.loads?.filters || { status: 'ALL', vehicleType: 'ALL', radiusKm: 100, search: '' });
  const currentUser = useSelector((state) => state.auth?.user);
  const telemetry = useSelector((state) => state.telemetry);

  const isShipperLoggedIn = currentUser && currentUser.role === 'SHIPPER';

  // Filter loads based on status / search
  const filteredLoads = loads.filter((load) => {
    if (filters.status && filters.status !== 'ALL' && load.status !== filters.status) return false;
    if (filters.vehicleType && filters.vehicleType !== 'ALL' && load.vehicleTypeRequired !== filters.vehicleType) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        load.title?.toLowerCase().includes(q) ||
        load.pickupLocation?.city?.toLowerCase().includes(q) ||
        load.dropLocation?.city?.toLowerCase().includes(q) ||
        load.cargoType?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="driver-dashboard-view" className="space-y-8">
      {/* RBAC Notice if Shipper is viewing Driver Dashboard */}
      {isShipperLoggedIn && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">Role-Based Access Control Notice</div>
              <div className="text-xs text-amber-800">
                You are currently signed in as an <span className="font-bold">Enterprise Shipper</span>. Real-time driver navigation and freight counter-bidding are restricted to verified Commercial Drivers.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                soundFx.radarPing();
                dispatch(setActiveRole('SHIPPER'));
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Back to Shipper Hub</span>
            </button>
            <button
              onClick={() => {
                soundFx.radarPing();
                dispatch(openLoginModal('DRIVER'));
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in as Driver</span>
            </button>
          </div>
        </div>
      )}

      {/* Driver Workspace Overview Banner */}
      <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                Commercial Driver Freight Workspace
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active Corridor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live GPS route tracking, real-time return load matching, and counter-bidding arena
            </p>
          </div>
        </div>

        {/* Operational Corridor Metrics */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-500 block font-medium">Network Deadhead Saved</span>
            <span className="text-xl font-bold font-mono text-amber-700">
              14,250 KM
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-xs text-slate-500 block font-medium">Corridor Escrow Protection</span>
            <span className="text-xl font-bold font-mono text-emerald-700">
              100% Guaranteed
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Leaflet Map Visualization with Live Telemetry */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-600 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
              Live Freight Corridor & Return Load Radar
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline font-medium">Search Radius:</span>
            <select
              value={filters.radiusKm || 100}
              onChange={(e) => dispatch(setFilters({ radiusKm: Number(e.target.value) }))}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-amber-900 font-mono font-bold shadow-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="50">50 KM Radius</option>
              <option value="100">100 KM Radius</option>
              <option value="250">250 KM Radius</option>
            </select>
          </div>
        </div>

        <LiveMap height="h-[560px]" />
      </div>

      {/* Active Trip Telemetry GPS Simulation Player */}
      <LiveTripTracker />

      {/* Return Loads Marketplace Arena */}
      <div id="live-freight-arena" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
              <span>Matched Return Freight Loads</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {filteredLoads.length} Available
              </span>
            </h3>
            <p className="text-xs text-slate-500">Pre-filtered to match your return destination corridor</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city, cargo..."
                value={filters.search || ''}
                onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 w-48 sm:w-60 shadow-xs"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status || 'ALL'}
              onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-700 shadow-xs focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="BIDDING_OPEN">Bidding Open</option>
              <option value="POSTED">Posted</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="ASSIGNED">Assigned</option>
            </select>
          </div>
        </div>

        {/* Load Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLoads.map((load) => (
            <LoadCard key={load._id} load={load} />
          ))}
        </div>
      </div>
    </div>
  );
}
