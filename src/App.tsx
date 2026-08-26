import React, { useState } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store/index.js';
import Navbar from './components/navbar/Navbar.jsx';
import HeroVisual from './components/hero/HeroVisual.jsx';
import DriverDashboard from './components/dashboard/DriverDashboard.jsx';
import TransporterDashboard from './components/dashboard/TransporterDashboard.jsx';
import FleetAnalytics from './components/dashboard/FleetAnalytics.jsx';
import LoadDetailPanel from './components/loads/LoadDetailPanel.jsx';
import BidModal from './components/bidding/BidModal.jsx';
import AIDispatchModal from './components/dispatch/AIDispatchModal.jsx';
import PostLoadModal from './components/loads/PostLoadModal.jsx';
import NotificationDrawer from './components/common/NotificationDrawer.jsx';
import AuthModal from './components/common/AuthModal.jsx';
import HighwayBackdrop from './components/backdrop/HighwayBackdrop.jsx';
import LoadingIntro from './components/common/LoadingIntro.jsx';
import { 
  Truck, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Radio, 
  Zap, 
  Lock, 
  Globe, 
  Cpu,
  Eye,
  Sliders,
  Image as ImageIcon,
  Compass,
  Moon,
  Sun,
  Activity,
  Play
} from 'lucide-react';
import soundFx from './services/soundFx.js';

function AppContent() {
  const activeRole = useSelector((state: any) => state.auth?.activeRole || 'DRIVER');
  const [bgMode, setBgMode] = useState<'night' | 'sunset' | 'day'>('night');
  const [bgIntensity, setBgIntensity] = useState<'vivid' | 'frosted' | 'clean'>('vivid');
  const [showHighwayControls, setShowHighwayControls] = useState<boolean>(false);
  const [isLoadingIntro, setIsLoadingIntro] = useState<boolean>(true);

  const handleIntensityChange = (intensity: 'vivid' | 'frosted' | 'clean') => {
    soundFx.radarPing();
    setBgIntensity(intensity);
  };

  const handleModeChange = (mode: 'night' | 'sunset' | 'day') => {
    soundFx.radarPing();
    setBgMode(mode);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col bg-slate-900 text-slate-900 selection:bg-amber-500/25 selection:text-amber-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Starting Loading Cinematic Intro */}
      {isLoadingIntro && (
        <LoadingIntro
          onComplete={() => setIsLoadingIntro(false)}
          onSkip={() => setIsLoadingIntro(false)}
        />
      )}
      {/* Dynamic Animated 3D Highway Perspective Backdrop */}
      {bgIntensity !== 'clean' && (
        <HighwayBackdrop 
          mode={bgMode} 
          intensity={bgIntensity}
          showControls={showHighwayControls}
          onModeChange={setBgMode}
        />
      )}

      {/* Top Floating Glass Navbar */}
      <div className="relative z-40">
        <Navbar />
      </div>

      {/* Background Backdrop Interactive Controller Bar (Top Right) */}
      <div className="relative z-30 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-white/90 border border-slate-200 shadow-xs backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-slate-800">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
          <span>Live Highway Telemetry:</span>
          <span className="text-amber-700 font-mono truncate">NH44 & NH48 Corridors</span>
        </div>

        <div className="inline-flex items-center justify-between sm:justify-start gap-1 p-1 rounded-xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-md text-[10px] sm:text-[11px] font-medium text-slate-700 overflow-x-auto">
          <div className="hidden md:flex items-center gap-1 text-slate-500 pl-1">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Theme:</span>
          </div>
          
          <button
            id="backdrop-mode-night-btn"
            onClick={() => handleModeChange('night')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
              bgMode === 'night' && bgIntensity !== 'clean'
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : 'hover:text-slate-900 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Night</span>
          </button>

          <button
            id="backdrop-mode-sunset-btn"
            onClick={() => handleModeChange('sunset')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
              bgMode === 'sunset' && bgIntensity !== 'clean'
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : 'hover:text-slate-900 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Sunset</span>
          </button>

          <button
            id="backdrop-mode-day-btn"
            onClick={() => handleModeChange('day')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
              bgMode === 'day' && bgIntensity !== 'clean'
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : 'hover:text-slate-900 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Day</span>
          </button>

          <div className="h-3.5 w-px bg-slate-300 mx-0.5" />

          <button
            id="backdrop-intensity-vivid-btn"
            onClick={() => handleIntensityChange('vivid')}
            className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              bgIntensity === 'vivid' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'hover:text-slate-900 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Vivid
          </button>

          <button
            id="backdrop-intensity-frosted-btn"
            onClick={() => handleIntensityChange('frosted')}
            className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              bgIntensity === 'frosted' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'hover:text-slate-900 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Frosted
          </button>

          <button
            id="backdrop-intensity-clean-btn"
            onClick={() => handleIntensityChange('clean')}
            className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              bgIntensity === 'clean' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'hover:text-slate-900 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Pure
          </button>

          <div className="h-3.5 w-px bg-slate-300 mx-0.5" />

          <button
            id="replay-loading-intro-btn"
            onClick={() => {
              soundFx.radarPing();
              setIsLoadingIntro(true);
            }}
            title="Replay Loading Intro"
            className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer text-amber-800 hover:text-amber-950 hover:bg-amber-100/80 flex items-center gap-1 shrink-0"
          >
            <Play className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
            <span className="hidden sm:inline">Intro</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
        {/* Dynamic Hero Section */}
        <HeroVisual />

        {/* Role-Specific Active Workspace */}
        {activeRole === 'DRIVER' && <DriverDashboard />}
        {activeRole === 'SHIPPER' && <TransporterDashboard />}
        {activeRole === 'FLEET_MANAGER' && <FleetAnalytics />}
      </main>

      {/* Slide-out & Modal Portals */}
      <LoadDetailPanel />
      <BidModal />
      <AIDispatchModal />
      <PostLoadModal />
      <NotificationDrawer />
      <AuthModal />

      {/* High-Contrast Light Theme Footer */}
      <footer className="relative z-10 w-full bg-white/95 border-t border-slate-200/90 mt-16 py-10 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200/80">
            {/* Brand column */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-sm">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                    <Truck className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                  Haul<span className="text-amber-600">Back</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Light Edition
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                Smart empty backhaul freight matching platform eliminating deadhead miles across India's high-density logistics corridors with real-time GPS telemetry and Gemini AI dispatch.
              </p>
            </div>

            {/* Quick links */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 tracking-wider uppercase">Platform</span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="hover:text-amber-600 cursor-pointer">Live Freight Arena</li>
                <li className="hover:text-amber-600 cursor-pointer">Corridor Radar</li>
                <li className="hover:text-amber-600 cursor-pointer">AI Dispatch Assistant</li>
                <li className="hover:text-amber-600 cursor-pointer">Smart Escrow Vault</li>
              </ul>
            </div>

            {/* Support / Legal */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 tracking-wider uppercase">Security & Compliance</span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit Escrow Vault</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-600" />
                  <span>Gemini Logistics API</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  <span>GSTIN & VAHAN Verified</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} HaulBack Logistics Technologies Inc. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Terms of Carriage</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">GST Invoicing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
