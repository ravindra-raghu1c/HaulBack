import React, { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Shield, 
  Zap, 
  TrendingUp, 
  Cpu, 
  Radio, 
  Truck, 
  Route, 
  MapPin, 
  Compass, 
  Play, 
  Sun, 
  Moon, 
  Flame,
  Activity,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleAIDispatchModal, setFilters, togglePostLoadModal, setSelectedLoad } from '../../store/slices/loadsSlice.js';
import { toggleBidModal, setSelectedLoadForBid } from '../../store/slices/bidsSlice.js';
import soundFx from '../../services/soundFx.js';

export default function HeroVisual() {
  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const activeRole = useSelector((state) => state.auth?.activeRole || 'DRIVER');
  const loads = useSelector((state) => state.loads?.items || []);
  const loadsCount = loads.length || 6;
  const [highwaySpeed, setHighwaySpeed] = useState(1);
  const [activeCorridor, setActiveCorridor] = useState('BHOPAL_DELHI');

  // Real-time Highway Canvas with Moving Semi-Trucks & Road Lights
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Dynamic Fleet Trucks on Highway
    const truckList = [
      { id: 1, z: 0.15, lane: 0.25, speed: 0.003, color: '#f59e0b', type: 'Trailer 32T', isOutbound: false },
      { id: 2, z: 0.45, lane: 0.75, speed: 0.0022, color: '#0284c7', type: 'Container 25T', isOutbound: true },
      { id: 3, z: 0.72, lane: 0.35, speed: 0.0035, color: '#10b981', type: 'Reefer 18T', isOutbound: false },
      { id: 4, z: 0.88, lane: 0.65, speed: 0.0018, color: '#8b5cf6', type: 'Heavy Rig 40T', isOutbound: true }
    ];

    // Background Network Particles
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.5),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1
    }));

    let dashOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const horizonY = height * 0.48;
      const roadCenterX = width * 0.5;
      const roadTopWidth = Math.min(180, width * 0.18);
      const roadBottomWidth = width * 0.95;

      // 1. Ambient Horizon Radial Glow
      const glow = ctx.createRadialGradient(roadCenterX, horizonY, 20, roadCenterX, horizonY, width * 0.55);
      glow.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
      glow.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // 2. Perspective Highway Road Surface
      const rTL = roadCenterX - roadTopWidth / 2;
      const rTR = roadCenterX + roadTopWidth / 2;
      const rBL = roadCenterX - roadBottomWidth / 2;
      const rBR = roadCenterX + roadBottomWidth / 2;

      ctx.beginPath();
      ctx.moveTo(rTL, horizonY);
      ctx.lineTo(rTR, horizonY);
      ctx.lineTo(rBR, height);
      ctx.lineTo(rBL, height);
      ctx.closePath();

      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      roadGrad.addColorStop(0, 'rgba(241, 245, 249, 0.7)');
      roadGrad.addColorStop(1, 'rgba(226, 232, 240, 0.9)');
      ctx.fillStyle = roadGrad;
      ctx.fill();

      // Guardrail Glowing Edges
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rTL, horizonY);
      ctx.lineTo(rBL, height);
      ctx.moveTo(rTR, horizonY);
      ctx.lineTo(rBR, height);
      ctx.stroke();

      // Center Line
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadCenterX, horizonY);
      ctx.lineTo(roadCenterX, height);
      ctx.stroke();

      // Dashed Highway Lane Markers with Perspective
      dashOffset = (dashOffset + 0.007 * highwaySpeed) % 1;
      const lanes = [0.25, 0.75];

      lanes.forEach((laneFraction) => {
        const laneTopX = rTL + (rTR - rTL) * laneFraction;
        const laneBottomX = rBL + (rBR - rBL) * laneFraction;

        ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
        ctx.lineWidth = 2;

        const segments = 12;
        for (let s = 0; s < segments; s++) {
          const t1 = ((s / segments) + dashOffset) % 1;
          const t2 = Math.min(1, t1 + 0.035);

          if (t1 < t2) {
            const p1 = Math.pow(t1, 2.2);
            const p2 = Math.pow(t2, 2.2);

            const x1 = laneTopX + (laneBottomX - laneTopX) * p1;
            const y1 = horizonY + (height - horizonY) * p1;
            const x2 = laneTopX + (laneBottomX - laneTopX) * p2;
            const y2 = horizonY + (height - horizonY) * p2;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      });

      // 3. Render Highway Trucks with 3D Depth & Light Cones
      truckList.forEach((truck) => {
        truck.z += truck.speed * highwaySpeed;
        if (truck.z > 1) truck.z = 0;
        if (truck.z < 0) truck.z = 1;

        const p = Math.pow(truck.z, 2.2);
        const roadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * p;
        const roadL = roadCenterX - roadW / 2;
        const truckX = roadL + roadW * truck.lane;
        const truckY = horizonY + (height - horizonY) * p;

        const scale = Math.max(0.12, p);
        const tWidth = 48 * scale;
        const tLength = 80 * scale;

        // Headlight Beams (Inbound) / Taillight Beams (Outbound)
        if (truck.isOutbound) {
          const trailLen = 60 * scale;
          const trailGrad = ctx.createLinearGradient(truckX, truckY, truckX, truckY - trailLen);
          trailGrad.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
          trailGrad.addColorStop(1, 'transparent');
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = 3 * scale;
          ctx.beginPath();
          ctx.moveTo(truckX - tWidth * 0.3, truckY);
          ctx.lineTo(truckX - tWidth * 0.3, truckY - trailLen);
          ctx.moveTo(truckX + tWidth * 0.3, truckY);
          ctx.lineTo(truckX + tWidth * 0.3, truckY - trailLen);
          ctx.stroke();
        } else {
          const beamLen = 110 * scale;
          const beamGrad = ctx.createLinearGradient(truckX, truckY, truckX, truckY + beamLen);
          beamGrad.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
          beamGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(truckX - tWidth * 0.25, truckY);
          ctx.lineTo(truckX - tWidth * 1.1, truckY + beamLen);
          ctx.lineTo(truckX + tWidth * 1.1, truckY + beamLen);
          ctx.lineTo(truckX + tWidth * 0.25, truckY);
          ctx.closePath();
          ctx.fill();
        }

        // Truck Chassis
        ctx.fillStyle = truck.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, 1.5 * scale);
        ctx.beginPath();
        ctx.roundRect(truckX - tWidth / 2, truckY - tLength / 2, tWidth, tLength, Math.max(2, 4 * scale));
        ctx.fill();
        ctx.stroke();

        // Cab windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(truckX - tWidth * 0.35, truckY - tLength * 0.35, tWidth * 0.7, tLength * 0.2);

        // GPS Telemetry Pulse Dot
        ctx.beginPath();
        ctx.arc(truckX, truckY - tLength * 0.4, Math.max(1.5, 3 * scale), 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      });

      // 4. Floating Ambient Nodes
      particles.forEach((pt, i) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.x < 0 || pt.x > width) pt.vx *= -1;
        if (pt.y < 0 || pt.y > horizonY) pt.vy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          const pt2 = particles[j];
          const dist = Math.hypot(pt.x - pt2.x, pt.y - pt2.y);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(217, 119, 6, ${0.2 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [highwaySpeed]);

  const handleExploreLoads = (e) => {
    e.preventDefault();
    soundFx.radarPing();
    const el = document.getElementById('live-freight-arena');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInspectLeadLoad = () => {
    soundFx.radarPing();
    const targetLoad = loads[0] || null;
    if (targetLoad) {
      dispatch(setSelectedLoad(targetLoad));
    }
    dispatch(toggleAIDispatchModal(true));
  };

  return (
    <div id="hero-section" className="relative w-full overflow-hidden rounded-3xl bg-white/95 border border-slate-200/90 shadow-xl p-6 sm:p-10 mb-8 backdrop-blur-md">
      {/* Background Interactive Highway Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-200/35 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Messaging & Action */}
        <div className="lg:col-span-7 space-y-6">
          {/* Trending Category Tag with Live Highway Feed Indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 backdrop-blur-md text-xs font-bold text-amber-900 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
            <span>REAL-TIME HIGHWAY TELEMETRY & ZERO-DEADHEAD MATCHING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight font-['Outfit',sans-serif]">
            Turn Empty Deadhead Miles into <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700">Guaranteed Profit.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
            HaulBack intelligently matches returning commercial trucks with high-value return loads along active national corridors. Powered by Gemini AI dispatch, live GPS telemetry, and cryptographic escrow contracts.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-ai-dispatch-cta"
              onClick={() => {
                soundFx.radarPing();
                dispatch(toggleAIDispatchModal(true));
              }}
              className="px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/25 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>AI Return Load Dispatch</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {activeRole === 'SHIPPER' ? (
              <button
                id="hero-post-load-cta"
                onClick={() => {
                  soundFx.radarPing();
                  dispatch(togglePostLoadModal(true));
                }}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Post Freight Load</span>
              </button>
            ) : (
              <button
                id="hero-explore-loads-cta"
                onClick={handleExploreLoads}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Explore Live Loads ({loadsCount})</span>
              </button>
            )}

            {/* Highway Simulation Speed Control */}
            <div className="flex items-center gap-1 bg-white/90 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs text-xs font-semibold text-slate-700">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-500 text-[11px] hidden sm:inline">Corridor:</span>
              <button
                onClick={() => setHighwaySpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-200 transition cursor-pointer"
              >
                {highwaySpeed}x Flow
              </button>
            </div>
          </div>

          {/* Real-time Value Metrics Ticker */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/90 max-w-lg">
            <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-700">14,250+</div>
              <div className="text-[11px] text-slate-500 font-medium">Deadhead KM Saved</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-700">₹3.8M+</div>
              <div className="text-[11px] text-slate-500 font-medium">Fuel Cost Reclaimed</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-sky-700">99.4%</div>
              <div className="text-[11px] text-slate-500 font-medium">Corridor Match Rate</div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic AI Corridor Dispatch Preview Card */}
        <div className="lg:col-span-5 relative">
          <div className="p-6 rounded-2xl bg-white/95 border border-amber-300 shadow-xl space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-300 text-amber-700">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Return Corridor Engine</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Bhopal Mandideep ↔ Delhi NCR</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                ACTIVE
              </span>
            </div>

            {/* Visual Route Strip */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1 text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Mandideep (Bhopal)</span>
                </div>
                <div className="text-[11px] text-amber-700 font-mono font-bold">785 KM</div>
                <div className="flex items-center gap-1 text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>Delhi NCR Hub</span>
                </div>
              </div>
              
              {/* Progress bar simulation */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-500 rounded-full w-2/3 animate-pulse"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Truck: MP-04-HE-8821 (Vikram S.)</span>
                <span className="text-emerald-700 font-bold">Zero Deadhead Match</span>
              </div>
            </div>

            {/* AI Advantage List */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-slate-700 font-medium">Estimated Fuel Conserved</span>
                <span className="font-mono font-bold text-amber-800">225 Liters (₹20,250)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-slate-700 font-medium">Shipper Cost Savings</span>
                <span className="font-mono font-bold text-emerald-800">12.5% Under Spot Rate</span>
              </div>
            </div>

            <button
              id="hero-inspect-dispatch-card-btn"
              onClick={handleInspectLeadLoad}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect AI Dispatch Rationale</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
