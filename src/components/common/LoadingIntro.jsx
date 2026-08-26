import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Radio, 
  Cpu, 
  ShieldCheck, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Wifi,
  Navigation
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';

const STARTUP_STEPS = [
  {
    icon: Radio,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    title: 'Connecting Highway Telemetry',
    detail: 'Linking GSAT satellites & NH44 / NH48 sensor mesh'
  },
  {
    icon: Cpu,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    title: 'Booting Gemini AI Match Engine',
    detail: 'Calculating return backhaul routes & deadhead reduction'
  },
  {
    icon: MapPin,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    title: 'Mapping National Freight Corridors',
    detail: 'Delhi-Mumbai, Bangalore-Chennai & Central Hubs'
  },
  {
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    title: 'Securing Escrow Vault & Fastag',
    detail: '256-bit encrypted carrier payouts & VAHAN validation'
  },
  {
    icon: Sparkles,
    color: 'text-amber-300',
    bgColor: 'bg-amber-400/20',
    title: 'Systems Fully Operational',
    detail: 'Zero-deadhead return freight terminal initialized'
  }
];

export default function LoadingIntro({ onComplete, onSkip }) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Play initial ignition sound at the very first step
    soundFx.engineIgnite();

    // Keyboard shortcut to skip
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Smooth progress increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        // Variable realistic acceleration
        const increment = prev < 30 ? 2.5 : prev < 70 ? 2 : prev < 90 ? 3 : 4;
        const nextVal = Math.min(100, prev + increment);

        // Update step index based on progress
        const currentStep = Math.min(
          STARTUP_STEPS.length - 1,
          Math.floor((nextVal / 100) * STARTUP_STEPS.length)
        );
        
        setStepIndex((oldStep) => {
          if (oldStep !== currentStep && nextVal < 100) {
            soundFx.radarPing();
          }
          return currentStep;
        });

        return nextVal;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      soundFx.bidAccepted();
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  const handleSkip = () => {
    soundFx.radarPing();
    setIsExiting(true);
    setTimeout(() => {
      if (onSkip) onSkip();
      else onComplete();
    }, 300);
  };

  const currentStep = STARTUP_STEPS[stepIndex] || STARTUP_STEPS[0];
  const StepIcon = currentStep.icon;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="haulback-intro-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-white font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none"
        >
          {/* Background Animated Perspective Highway Grid & Ambient Lights */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Radial Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl" />
            
            {/* Animated Road Lines */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-full max-w-4xl h-full border-x border-dashed border-amber-400/30 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-amber-500/0 via-amber-400/40 to-amber-500/0" />
              </div>
            </div>

            {/* Subtle Star / Satellite Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
          </div>

          {/* Top Status Header */}
          <div className="relative z-10 w-full max-w-5xl px-6 pt-6 sm:pt-8 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-emerald-400 shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>TELEMETRY FEED ONLINE</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
                <Wifi className="w-3 h-3 text-amber-400" />
                <span>5G GSAT-IND</span>
              </div>
            </div>

            {/* Skip Button */}
            <button
              id="skip-intro-btn"
              onClick={handleSkip}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-amber-400/50 text-xs font-semibold transition-all shadow-md backdrop-blur-md cursor-pointer"
            >
              <span>Skip Intro</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-amber-400" />
            </button>
          </div>

          {/* Center Brand Identity & Animated Radar Core */}
          <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center my-auto">
            {/* Animated Radar Shield Emblem */}
            <div className="relative mb-6 flex items-center justify-center">
              {/* Outer Pulsing Rings */}
              <motion.div 
                animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-36 h-36 rounded-full border border-amber-500/30"
              />
              <motion.div 
                animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="absolute w-44 h-44 rounded-full border border-emerald-500/20"
              />

              {/* Rotating Orbit Satellite Dot */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute w-48 h-48 rounded-full border border-slate-800/80"
              >
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_12px_#fbbf24] flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </motion.div>

              {/* Core Icon Badge */}
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-slate-950 p-1 shadow-2xl shadow-amber-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
                  {/* Subtle sweep line */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/10 to-amber-400/30 origin-center"
                  />
                  <Truck className="w-12 h-12 text-amber-400 relative z-10 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]" />
                </div>
              </div>
            </div>

            {/* Brand Typography */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="space-y-1.5"
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
                Haul<span className="text-amber-500">Back</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xs">
                Zero-Deadhead Return Freight Intelligence
              </p>
            </motion.div>

            {/* Step Status Badge */}
            <motion.div
              key={currentStep.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-6 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner max-w-sm w-full"
            >
              <div className={`w-9 h-9 rounded-xl ${currentStep.bgColor} ${currentStep.color} flex items-center justify-center shrink-0`}>
                <StepIcon className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] font-mono font-bold text-amber-400 border border-slate-700">
                    STEP {stepIndex + 1} OF {STARTUP_STEPS.length}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate">{currentStep.title}</div>
                <div className="text-[10px] text-slate-400 truncate">{currentStep.detail}</div>
              </div>
              {progress >= 100 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin shrink-0" />
              )}
            </motion.div>

            {/* 5-Step Visual Progress Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3 w-full max-w-xs">
              {STARTUP_STEPS.map((s, idx) => {
                const isCurrent = idx === stepIndex;
                const isPassed = idx < stepIndex || progress >= 100;
                return (
                  <div
                    key={s.title}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'w-7 bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                        : isPassed
                        ? 'w-3.5 bg-emerald-400'
                        : 'w-2 bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>

            {/* Futuristic Progress Bar */}
            <div className="w-full mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-amber-400" />
                  <span>INITIALIZING HUB</span>
                </span>
                <span className="text-amber-400 font-bold">{Math.round(progress)}%</span>
              </div>

              {/* Progress Track */}
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.1 }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Corridor Metrics & Ticker */}
          <div className="relative z-10 w-full max-w-5xl px-6 pb-6 sm:pb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md text-center">
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/50 border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Corridors</div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono">NH44 • NH48 • NH19</div>
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/50 border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Active Fleets</div>
                <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">4,850+ Trucks</div>
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/50 border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Match Efficiency</div>
                <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">94.8% Zero-Deadhead</div>
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/50 border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Escrow Vault</div>
                <div className="text-xs sm:text-sm font-bold text-purple-300 font-mono">UPI & GST Verified</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono border border-slate-700">ESC</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono border border-slate-700">SPACE</kbd> to skip intro</span>
              <span className="hidden sm:inline font-mono">HaulBack v2.4 • India Logistics OS</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
