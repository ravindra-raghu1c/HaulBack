import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setActiveRole, 
  toggleAuthModal, 
  openLoginModal, 
  openSignupModal,
  logout 
} from '../../store/slices/authSlice.js';
import { toggleDrawer, addNotification } from '../../store/slices/notificationsSlice.js';
import { togglePostLoadModal, toggleAIDispatchModal } from '../../store/slices/loadsSlice.js';
import { 
  Truck, 
  Building2, 
  Bell, 
  User, 
  Sparkles, 
  PlusCircle, 
  Radio, 
  SlidersHorizontal,
  Navigation,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';

export default function Navbar() {
  const dispatch = useDispatch();
  const activeRole = useSelector((state) => state.auth?.activeRole || 'DRIVER');
  const currentUser = useSelector((state) => state.auth?.user || null);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated ?? true);
  const unreadNotifs = useSelector((state) => state.notifications?.unreadCount ?? 0);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleRoleChange = (role) => {
    soundFx.radarPing();

    // Enforce Role-Based Access Control
    if (currentUser && currentUser.role && role !== 'FLEET_MANAGER' && currentUser.role !== role) {
      dispatch(addNotification({
        type: 'WARNING',
        title: 'Role-Based Access Control',
        message: `Your account is registered as a ${currentUser.role === 'DRIVER' ? 'Commercial Driver' : 'Enterprise Shipper'}. To access the ${role === 'SHIPPER' ? 'Shipper Workspace' : 'Driver Workspace'}, please authenticate with a ${role === 'SHIPPER' ? 'Shipper' : 'Driver'} account.`
      }));
      dispatch(setActiveRole(role));
      setIsMobileMenuOpen(false);
      setIsProfileDropdownOpen(false);
      return;
    }

    dispatch(setActiveRole(role));
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    soundFx.radarPing();
    dispatch(logout());
    setIsProfileDropdownOpen(false);
    dispatch(addNotification({
      type: 'INFO',
      title: 'Signed Out',
      message: 'You have logged out of your session.'
    }));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-3 md:gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Truck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                Haul<span className="text-amber-600">Back</span>
              </span>
              <span className="hidden xl:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {activeRole === 'DRIVER' ? 'Driver' : activeRole === 'SHIPPER' ? 'Shipper' : 'Fleet Ops'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden 2xl:block">Zero-Deadhead Return Freight Engine • RBAC Protected</p>
          </div>
        </div>

        {/* Center Role Navigation Switcher Tabs (Desktop 1024px+) */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner shrink-0 gap-1">
          <button
            id="role-switch-driver-btn"
            onClick={() => handleRoleChange('DRIVER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'DRIVER'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Driver Workspace</span>
            {currentUser?.role === 'DRIVER' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Verified Driver Account" />
            )}
            {currentUser?.role === 'SHIPPER' && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 text-slate-600 font-mono">Shipper Account</span>
            )}
          </button>

          <button
            id="role-switch-shipper-btn"
            onClick={() => handleRoleChange('SHIPPER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'SHIPPER'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Shipper Workspace</span>
            {currentUser?.role === 'SHIPPER' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Verified Shipper Account" />
            )}
            {currentUser?.role === 'DRIVER' && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 text-slate-600 font-mono">Driver Account</span>
            )}
          </button>

          <button
            id="role-switch-fleet-btn"
            onClick={() => handleRoleChange('FLEET_MANAGER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'FLEET_MANAGER'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Fleet Ops</span>
          </button>
        </div>

        {/* Center Role Switcher Tabs for Tablet (768px to 1023px) - Compact & Balanced */}
        <div className="hidden md:flex lg:hidden items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200 shadow-inner shrink-0 gap-0.5">
          <button
            onClick={() => handleRoleChange('DRIVER')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeRole === 'DRIVER'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Driver</span>
          </button>

          <button
            onClick={() => handleRoleChange('SHIPPER')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeRole === 'SHIPPER'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Shipper</span>
          </button>

          <button
            onClick={() => handleRoleChange('FLEET_MANAGER')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeRole === 'FLEET_MANAGER'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Fleet</span>
          </button>
        </div>

        {/* Right Actions: Post Load, AI Dispatch, Notifs, User Profile / Auth */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
          {/* Post Load button (for Shippers) */}
          {activeRole === 'SHIPPER' && (
            <button
              id="navbar-post-load-btn"
              onClick={() => {
                soundFx.radarPing();
                dispatch(togglePostLoadModal(true));
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition cursor-pointer shrink-0"
              title="Post New Load"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span className="hidden sm:inline">Post</span>
              <span className="hidden xl:inline">Load</span>
            </button>
          )}

          {/* AI Dispatch Button */}
          <button
            id="navbar-ai-dispatch-btn"
            onClick={() => {
              soundFx.radarPing();
              dispatch(toggleAIDispatchModal(true));
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 flex items-center gap-1 transition cursor-pointer shadow-xs shrink-0"
            title="AI Optimizer Dispatch"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 animate-pulse shrink-0" />
            <span className="hidden sm:inline text-[11px] md:text-xs">AI</span>
            <span className="hidden lg:inline text-xs">Optimizer</span>
          </button>

          {/* Notification Bell with Badge */}
          <button
            id="navbar-notifications-btn"
            onClick={() => {
              soundFx.alertNotification();
              dispatch(toggleDrawer(true));
            }}
            className="relative p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer shadow-xs shrink-0"
            title="Real-time Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 ring-2 ring-white animate-bounce">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* User / Authentication Action */}
          <div className="relative shrink-0">
            {currentUser ? (
              <button
                id="navbar-profile-btn"
                onClick={() => {
                  soundFx.radarPing();
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                }}
                className="flex items-center gap-1 sm:gap-1.5 p-1 sm:px-2 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition cursor-pointer text-left shadow-xs shrink-0"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden 2xl:block">
                  <div className="text-xs font-bold text-slate-900 max-w-[90px] truncate">{currentUser.name || 'Account'}</div>
                  <div className="text-[10px] text-amber-700 font-semibold font-mono">{activeRole}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  id="navbar-login-btn"
                  onClick={() => {
                    soundFx.radarPing();
                    dispatch(openLoginModal(activeRole));
                  }}
                  className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] sm:text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
                <button
                  id="navbar-register-btn"
                  onClick={() => {
                    soundFx.radarPing();
                    dispatch(openSignupModal(activeRole));
                  }}
                  className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-bold transition cursor-pointer shadow-xs hidden sm:flex items-center gap-1 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && currentUser && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-1 space-y-0.5">
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Toggle (Visible on <768px) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shrink-0 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-in slide-in-from-top-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Switch Role Workspace</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleRoleChange('DRIVER')}
              className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                activeRole === 'DRIVER' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Driver</span>
            </button>
            <button
              onClick={() => handleRoleChange('SHIPPER')}
              className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                activeRole === 'SHIPPER' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Shipper</span>
            </button>
            <button
              onClick={() => handleRoleChange('FLEET_MANAGER')}
              className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                activeRole === 'FLEET_MANAGER' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Fleet Ops</span>
            </button>
          </div>
          
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                dispatch(openLoginModal(activeRole));
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => {
                dispatch(openSignupModal(activeRole));
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {activeRole === 'SHIPPER' && (
            <button
              onClick={() => {
                soundFx.radarPing();
                dispatch(togglePostLoadModal(true));
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Freight Load</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
