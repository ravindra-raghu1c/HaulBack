import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setActiveTab, 
  setActiveRole, 
  openLoginModal, 
  openSignupModal, 
  logout, 
  removeNotification 
} from '../store/index.js';
import { 
  Truck, 
  Map, 
  Gavel, 
  Navigation, 
  PlusCircle, 
  Bell, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Check, 
  X,
  Layers,
  ChevronDown,
  LogIn,
  LogOut,
  UserPlus,
  Lock,
  Building2
} from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.loads?.activeTab || 'map');
  const activeRole = useSelector((state) => state.auth?.activeRole || 'DRIVER');
  const currentUser = useSelector((state) => state.auth?.user);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const notifications = useSelector((state) => state.notifications?.items || state.telemetry?.notifications || []);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navTabs = [
    { id: 'map', label: 'Map Explorer', icon: Map },
    { id: 'bidding', label: 'Live Bidding', icon: Gavel },
    { id: 'trips', label: 'Live GPS Telemetry', icon: Navigation },
    { id: 'driver', label: 'Driver Cockpit', icon: Truck },
    { id: 'transporter', label: 'Shipper Hub', icon: PlusCircle }
  ];

  const handleRoleSwitch = (targetRole) => {
    if (currentUser && currentUser.role === targetRole) {
      dispatch(setActiveRole(targetRole));
    } else {
      // Prompt credentials for target role
      dispatch(openLoginModal(targetRole));
    }
  };

  return (
    <header className="sticky top-0 z-[500] w-full bg-[#080d16]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => dispatch(setActiveTab('map'))}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5 font-bold" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl text-white tracking-tight font-['Outfit']">
                Haul<span className="text-amber-400">Back</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                v2.5 AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Zero-Deadhead Return Logistics Platform</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden lg:flex items-center bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 text-xs shadow-inner">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => dispatch(setActiveTab(tab.id))}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Role switcher + Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Secured Role Selector (Requires Password if not authenticated for role) */}
          <div className="hidden sm:flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => handleRoleSwitch('DRIVER')}
              title={currentUser?.role === 'DRIVER' ? 'Active Driver Profile' : 'Click to log in as Commercial Driver'}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeRole === 'DRIVER' 
                  ? 'bg-amber-500 text-slate-950 shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Driver</span>
              {currentUser?.role !== 'DRIVER' && <Lock className="w-2.5 h-2.5 opacity-60 ml-0.5" />}
            </button>
            
            <button
              onClick={() => handleRoleSwitch('SHIPPER')}
              title={currentUser?.role === 'SHIPPER' ? 'Active Shipper Profile' : 'Click to log in as Enterprise Shipper'}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeRole === 'SHIPPER' 
                  ? 'bg-emerald-500 text-slate-950 shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Shipper</span>
              {currentUser?.role !== 'SHIPPER' && <Lock className="w-2.5 h-2.5 opacity-60 ml-0.5" />}
            </button>
          </div>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsUserMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono text-[9px] font-extrabold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-4 space-y-3 z-[600] animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Live Telemetry Alerts</span>
                  <span className="text-[10px] text-slate-400 font-mono">{notifications.length} New</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">No active telemetry alerts</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id || Math.random()} 
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-amber-300 text-[11px]">{n.title}</div>
                          <div className="text-slate-300 text-[11px] mt-0.5">{n.message}</div>
                          <div className="text-[9px] text-slate-500 mt-1">{n.time || 'Just now'}</div>
                        </div>
                        <button 
                          onClick={() => dispatch(removeNotification(n.id))}
                          className="text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800/90 px-3 py-1.5 rounded-2xl border border-white/10 transition cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                {currentUser?.name?.split(' ').map(n => n[0]).join('') || (isAuthenticated ? 'U' : '?')}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-white leading-none line-clamp-1">{currentUser?.name || 'Guest User'}</div>
                <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                  {currentUser?.role === 'DRIVER' ? 'Verified Driver' : currentUser?.role === 'SHIPPER' ? 'Enterprise Shipper' : 'Sign In Required'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-3 space-y-2.5 z-[600] animate-in fade-in duration-150">
                {currentUser ? (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
                    <div className="font-bold text-white text-sm">{currentUser.name}</div>
                    <div className="text-slate-400 text-[11px] font-mono truncate">{currentUser.email}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      <span>{currentUser.role === 'DRIVER' ? (currentUser.vehicle?.regNumber || 'Driver Active') : 'Shipper Active'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 text-xs text-slate-400">
                    Not currently logged in.
                  </div>
                )}

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      dispatch(openLoginModal('DRIVER'));
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Switch to Driver Login</span>
                    </span>
                    {currentUser?.role === 'DRIVER' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      dispatch(openLoginModal('SHIPPER'));
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Switch to Shipper Login</span>
                    </span>
                    {currentUser?.role === 'SHIPPER' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      dispatch(openSignupModal(activeRole));
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Register New Account</span>
                  </button>

                  {currentUser && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        dispatch(logout());
                        dispatch(openLoginModal(activeRole));
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer border-t border-white/5 pt-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-white/10 px-2 py-2 bg-slate-950/60 overflow-x-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
