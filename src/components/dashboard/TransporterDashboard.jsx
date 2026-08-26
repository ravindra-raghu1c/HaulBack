import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LiveMap from '../map/LiveMap.jsx';
import LoadCard from '../loads/LoadCard.jsx';
import { togglePostLoadModal, toggleAIDispatchModal } from '../../store/slices/loadsSlice.js';
import { openLoginModal, setActiveRole } from '../../store/slices/authSlice.js';
import { addNotification } from '../../store/slices/notificationsSlice.js';
import { 
  Building2, 
  PlusCircle, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Layers,
  Lock,
  AlertTriangle,
  LogIn
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';

export default function TransporterDashboard() {
  const dispatch = useDispatch();
  const loads = useSelector((state) => state.loads?.items || []);
  const currentUser = useSelector((state) => state.auth?.user);

  const isDriverLoggedIn = currentUser && currentUser.role === 'DRIVER';
  const isShipperLoggedIn = currentUser && currentUser.role === 'SHIPPER';

  // High-level freight KPIs
  const activeLoadsCount = loads.filter((l) => l.status !== 'COMPLETED').length;
  const inTransitCount = loads.filter((l) => l.status === 'IN_TRANSIT').length;
  const totalBidsCount = loads.reduce((acc, curr) => acc + (curr.bidsCount || 0), 0);

  const handlePostLoadClick = () => {
    soundFx.radarPing();
    if (isDriverLoggedIn) {
      dispatch(addNotification({
        type: 'WARNING',
        title: 'Role-Based Access Control',
        message: 'Access Denied: Commercial Driver accounts cannot post freight loads. Please sign in with an Enterprise Shipper account.'
      }));
      dispatch(openLoginModal('SHIPPER'));
      return;
    }
    dispatch(togglePostLoadModal(true));
  };

  return (
    <div id="transporter-dashboard-view" className="space-y-8">
      {/* RBAC Notice if Driver is viewing Shipper Dashboard */}
      {isDriverLoggedIn && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">Role-Based Access Control Notice</div>
              <div className="text-xs text-amber-800">
                You are currently signed in as a <span className="font-bold">Commercial Driver</span>. Freight posting and shipper dispatch tools are restricted to verified Enterprise Shippers.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                soundFx.radarPing();
                dispatch(setActiveRole('DRIVER'));
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Back to Driver Hub</span>
            </button>
            <button
              onClick={() => {
                soundFx.radarPing();
                dispatch(openLoginModal('SHIPPER'));
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in as Shipper</span>
            </button>
          </div>
        </div>
      )}

      {/* Transporter Workspace Banner */}
      <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                Enterprise Shipper & Freight Dispatch
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Shipper Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Post return cargo loads, review incoming driver bids, and automate multi-corridor dispatch
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            id="shipper-post-load-banner-btn"
            onClick={handlePostLoadClick}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Post New Freight Load</span>
          </button>

          <button
            id="shipper-ai-dispatch-banner-btn"
            onClick={() => {
              soundFx.radarPing();
              dispatch(toggleAIDispatchModal(true));
            }}
            className="px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>AI Fleet Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-1">
          <span className="text-xs text-slate-500 font-medium">Active Return Shipments</span>
          <div className="text-2xl font-bold font-mono text-slate-900">{activeLoadsCount}</div>
          <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Multi-corridor broadcast</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-1">
          <span className="text-xs text-slate-500 font-medium">Incoming Live Bids</span>
          <div className="text-2xl font-bold font-mono text-amber-700">{totalBidsCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Avg. response time 4.2 mins</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-1">
          <span className="text-xs text-slate-500 font-medium">In Transit En Route</span>
          <div className="text-2xl font-bold font-mono text-emerald-700">{inTransitCount}</div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live GPS Telemetry Active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-1">
          <span className="text-xs text-slate-500 font-medium">Freight Budget Saved</span>
          <div className="text-2xl font-bold font-mono text-sky-700">₹1,48,500</div>
          <div className="text-[11px] text-sky-700 font-semibold">14.2% below spot rate</div>
        </div>
      </div>

      {/* Corridor Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-600" />
            <span>National Corridor Freight Density & Returning Fleets</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Interactive Multi-corridor Routing</span>
        </div>
        <LiveMap height="h-[460px]" />
      </div>

      {/* Outgoing Shipments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
            Active Freight Broadcasts & Dispatches
          </h3>
          <span className="text-xs text-slate-500">{loads.length} total shipments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loads.map((load) => (
            <LoadCard key={load._id} load={load} />
          ))}
        </div>
      </div>
    </div>
  );
}
