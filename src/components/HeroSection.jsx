import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, setStatusFilter, setSearchQuery, switchRole } from '../store/index.js';
import { 
  Truck, 
  MapPin, 
  Sparkles, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Leaf, 
  Navigation,
  Clock,
  CircleDot,
  Radio
} from 'lucide-react';

export default function HeroSection({ onExploreLoads }) {
  const dispatch = useDispatch();
  const activeRole = useSelector((state) => state.auth.activeRole);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchFrom || searchTo) {
      dispatch(setSearchQuery(searchFrom || searchTo));
    }
    dispatch(setActiveTab('map'));
    if (onExploreLoads) onExploreLoads();
  };

  return (
    <section className="relative min-h-[580px] lg:min-h-[640px] rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Background Cinematic Visual & Video Transition Simulation */}
      <div className="absolute inset-0 bg-[#06090e] z-0 overflow-hidden">
        {/* Cinematic highway truck bridge background image matching user reference */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 opacity-60 filter contrast-125 brightness-90 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop')`
          }}
        />

        {/* Ambient video-styled light trail animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b12] via-[#070b12]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-transparent to-[#070b12]/60 z-10" />

        {/* Dynamic Light Stream Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent -translate-y-12 animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Hero Top Bar with Floating Pill Badge */}
      <div className="relative z-20 pt-8 px-6 sm:px-10 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/15 text-xs font-semibold text-slate-200 shadow-xl">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="tracking-wide">AI-Powered Zero-Deadhead Logistics</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-mono">14,200+ KM Empty Runs Eliminated Today</span>
        </div>

        {/* Role Switcher in Hero */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl border border-white/15 shadow-xl text-xs">
          <button
            onClick={() => dispatch(switchRole('DRIVER'))}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeRole === 'DRIVER'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Driver Mode</span>
          </button>
          <button
            onClick={() => dispatch(switchRole('SHIPPER'))}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeRole === 'SHIPPER'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Shipper / Transporter</span>
          </button>
        </div>
      </div>

      {/* Hero Core Content */}
      <div className="relative z-20 px-6 sm:px-10 py-10 max-w-4xl">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-4 font-['Outfit']">
          Turn Empty Backhauls into{' '}
          <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
            Profitable Return Trips
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mb-8 font-light">
          HaulBack matches returning trucks with shippers along their exact route using geospatial 2dsphere indexing, Gemini AI driver dispatching, and real-time live bidding rooms.
        </p>

        {/* Floating Route Finder Form */}
        <form 
          onSubmit={handleQuickSearch}
          className="bg-slate-900/90 backdrop-blur-2xl p-2.5 sm:p-3 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-3xl"
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/70 border border-white/10 w-full">
            <CircleDot className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              placeholder="Current location / Origin (e.g. Bhopal, MP)"
              value={searchFrom}
              onChange={(e) => setSearchFrom(e.target.value)}
              className="bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none w-full font-medium"
            />
          </div>

          <div className="hidden md:flex items-center text-slate-500">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/70 border border-white/10 w-full">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="text"
              placeholder="Home base / Destination (e.g. Delhi NCR)"
              value={searchTo}
              onChange={(e) => setSearchTo(e.target.value)}
              className="bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none w-full font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Find Return Loads</span>
          </button>
        </form>
      </div>

      {/* Bottom Live Metrics Strip */}
      <div className="relative z-20 px-6 sm:px-10 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Deadhead Reduction</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">38.4% Avg</div>
          <div className="text-[11px] text-slate-400">Miles repurposed</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Fuel Cost Saved</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">₹42.8 Lakhs</div>
          <div className="text-[11px] text-slate-400">Direct carrier savings</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
            <Leaf className="w-3.5 h-3.5" />
            <span>CO₂ Emission Offset</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">124.6 Tons</div>
          <div className="text-[11px] text-slate-400">Green freight corridor</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <Radio className="w-3.5 h-3.5" />
            <span>Redis SETNX Locks</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">&lt;12ms</div>
          <div className="text-[11px] text-slate-400">Atomic dispatch safety</div>
        </div>
      </div>
    </section>
  );
}
