import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Gauge, Leaf, DollarSign, Radio, Compass } from 'lucide-react';

export default function HeroSection({ onExploreMap, onOpenAiModal, onOpenPostModal, userRole }) {
  const canvasRef = useRef(null);
  const [selectedCorridor, setSelectedCorridor] = useState('BHOPAL_DELHI');

  // Interactive Particle and Highway Trail Canvas Animation (Matching the reference images)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Node & Highway Network Simulation
    const nodes = Array.from({ length: 38 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1.2,
      energy: Math.random()
    }));

    // Glowing highway curve trails
    const trafficBeams = Array.from({ length: 14 }, () => ({
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.004,
      offsetY: (Math.random() - 0.5) * 80,
      color: Math.random() > 0.4 ? 'rgba(245, 158, 11, ' : 'rgba(239, 68, 68, ',
      length: 0.12 + Math.random() * 0.15
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Radial glowing background ambient center
      const gradient = ctx.createRadialGradient(
        width * 0.5, height * 0.45, 20,
        width * 0.5, height * 0.45, width * 0.65
      );
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
      gradient.addColorStop(0.4, 'rgba(15, 23, 42, 0.4)');
      gradient.addColorStop(1, 'rgba(11, 15, 23, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw curved highway bridge flow representing real-time freight corridors
      const startX = -50;
      const startY = height * 0.85;
      const cp1X = width * 0.35;
      const cp1Y = height * 0.25;
      const cp2X = width * 0.7;
      const cp2Y = height * 0.4;
      const endX = width + 50;
      const endY = height * 0.2;

      // Draw highway bridge tracks
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw moving traffic light beams (truck headlights / taillights like reference image)
      trafficBeams.forEach(beam => {
        beam.progress = (beam.progress + beam.speed) % 1;
        
        // Sample points along bezier
        const getBezierPoint = (t) => {
          const u = 1 - t;
          const tt = t * t;
          const uu = u * u;
          const uuu = uu * u;
          const ttt = tt * t;

          let pX = uuu * startX;
          pX += 3 * uu * t * cp1X;
          pX += 3 * u * tt * cp2X;
          pX += ttt * endX;

          let pY = uuu * startY;
          pY += 3 * uu * t * cp1Y;
          pY += 3 * u * tt * cp2Y;
          pY += ttt * endY;

          return { x: pX, y: pY };
        };

        const headT = beam.progress;
        const tailT = Math.max(0, beam.progress - beam.length);
        const head = getBezierPoint(headT);
        const tail = getBezierPoint(tailT);

        const beamGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        beamGrad.addColorStop(0, beam.color + '0)');
        beamGrad.addColorStop(0.8, beam.color + '0.7)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(head.x, head.y);
        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow head
        ctx.beginPath();
        ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw interactive particle nodes
      nodes.forEach((n, i) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-white/5">
      {/* Background Video & Animated Canvas with Highway Trail and Node Web */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Seamless Looping Highway Transit Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter saturate-150 contrast-125"
          poster="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1920&q=75"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41544-large.mp4"
            type="video/mp4"
          />
        </video>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        
        {/* Subtle grid texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px' 
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/60 to-[#0b0f17]/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md shadow-sm">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI-Powered Return-Haul Freight Network</span>
          </div>

          {/* Main Display Headline (Inspired by reference aesthetics) */}
          <h1 className="font-['Outfit',sans-serif] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Eliminate Empty Miles. <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
              Match Return Freight in Real-Time.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            HaulBack connects long-haul truckers on their return leg with shippers needing instant cargo dispatch. Powered by real-time GPS telemetry, live bidding rooms, and Gemini AI corridor matching.
          </p>

          {/* Main Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
            <button
              id="hero-explore-map-btn"
              onClick={onExploreMap}
              className="flex-1 min-w-[170px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Live Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-ai-match-btn"
              onClick={onOpenAiModal}
              className="flex-1 min-w-[170px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-100 font-semibold text-sm sm:text-base shadow-lg transition-all backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Dispatch Engine</span>
            </button>
          </div>

          {/* Highlighted Value Proposition Cards */}
          <div className="mt-12 w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="p-4 rounded-2xl bg-[#0f172a]/70 backdrop-blur-md border border-white/10 text-left transition-all hover:border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Deadhead Cut</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Gauge className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-2">-88.4%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Empty backhauls turned profitable</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f172a]/70 backdrop-blur-md border border-white/10 text-left transition-all hover:border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Avg Shipper Savings</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-2">24 - 38%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Dynamic competitive return bids</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f172a]/70 backdrop-blur-md border border-white/10 text-left transition-all hover:border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">CO₂ Reduction</span>
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                  <Leaf className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-teal-300 mt-2">1,120 kg</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Offset per 1,000 KM return route</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f172a]/70 backdrop-blur-md border border-white/10 text-left transition-all hover:border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Redis Atomic Lock</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-blue-300 mt-2">0.2s</p>
              <p className="text-[11px] text-slate-400 mt-0.5">SETNX collision-free bid acceptance</p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
