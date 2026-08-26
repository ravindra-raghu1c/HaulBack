import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { switchRole } from '../../store/store.js';
import { 
  Truck, 
  ShieldCheck, 
  Radio, 
  TrendingDown, 
  Sparkles, 
  PlusCircle, 
  Layers, 
  Navigation2, 
  User,
  Zap
} from 'lucide-react';

export default function Header({ onOpenPostModal, onOpenAiModal, onFocusTracking }) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.loads);
  const { data: telemetry } = useSelector((state) => state.telemetry);

  const activeLoadsCount = items.filter(l => l.status === 'BIDDING_OPEN' || l.status === 'POSTED').length;

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 w-full max-w-7xl mx-auto">
      {/* Floating Island Glass Capsule Header (matching Lowbeam design reference) */}
      <div className="bg-[#0f172a]/85 backdrop-blur-xl border border-white/10 rounded-full px-4 sm:px-6 py-2.5 shadow-2xl shadow-black/60 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Logo & Live Radar */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/25">
            <Truck className="w-5 h-5 text-slate-950 stroke-[2.2]" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-['Outfit',sans-serif] font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                HaulBack
              </span>
              <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                AI Logistics
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Zero-Deadhead Freight Network</p>
          </div>
        </div>

        {/* Live Metrics Ticker Pills */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/5 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Live Bids:</span>
            <span className="font-semibold text-emerald-400">{activeLoadsCount} active</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/5 text-xs text-slate-300">
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Deadhead Saved:</span>
            <span className="font-semibold text-amber-300 font-mono">14,250 KM</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Dispatcher Button */}
          <button
            id="header-ai-dispatcher-btn"
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span className="hidden sm:inline">AI Smart Dispatch</span>
            <span className="sm:hidden">AI Match</span>
          </button>

          {/* Post Load (for shipper) */}
          {currentUser.role === 'SHIPPER' ? (
            <button
              id="header-post-load-btn"
              onClick={onOpenPostModal}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Return Cargo</span>
            </button>
          ) : (
            <button
              id="header-track-live-btn"
              onClick={onFocusTracking}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-xs sm:text-sm font-medium transition-all active:scale-95"
            >
              <Navigation2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">GPS Telemetry</span>
            </button>
          )}

          {/* User Role Switcher Pill */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-950/90 border border-white/10 text-xs">
            <button
              id="role-switch-driver"
              onClick={() => dispatch(switchRole('DRIVER'))}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                currentUser.role === 'DRIVER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Driver
            </button>
            <button
              id="role-switch-shipper"
              onClick={() => dispatch(switchRole('SHIPPER'))}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                currentUser.role === 'SHIPPER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Shipper
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
