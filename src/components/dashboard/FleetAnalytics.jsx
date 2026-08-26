import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleAIDispatchModal } from '../../store/slices/loadsSlice.js';
import LiveMap from '../map/LiveMap.jsx';
import { 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  BatteryCharging, 
  Flame, 
  Award,
  BarChart3,
  Activity
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';

export default function FleetAnalytics() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.user);

  return (
    <div id="fleet-analytics-view" className="space-y-8">
      {/* Fleet Banner */}
      <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
            <SlidersHorizontal className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                Fleet Operations & Corridor Analytics
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Real-time Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Network dispatch efficiency, deadhead reduction indices, and fuel ESG intelligence
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.radarPing();
            dispatch(toggleAIDispatchModal(true));
          }}
          className="px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
          <span>Launch AI Dispatch Optimizer</span>
        </button>
      </div>

      {/* Fleet Efficiency & ESG Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Deadhead Eliminated</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">42,850 KM</div>
          <div className="text-[11px] text-amber-700 font-semibold">
            +18.4% month-over-month
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Diesel Fuel Conserved</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">12,240 Liters</div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            ≈ ₹11,01,600 Cost Savings
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">CO₂ Reduction Metric</span>
            <Award className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-700">32.8 Metric Tons</div>
          <div className="text-[11px] text-sky-700 font-semibold">
            ISO 14064 ESG Compliant
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">AI Dispatch Rate</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-700">94.6%</div>
          <div className="text-[11px] text-purple-700 font-semibold">
            Zero human intervention
          </div>
        </div>
      </div>

      {/* Fleet Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>National Fleet Operations & Telemetry Map</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Real-time GPS updates (1000ms latency)</span>
        </div>
        <LiveMap height="h-[520px]" />
      </div>
    </div>
  );
}
