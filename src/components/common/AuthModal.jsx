import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  toggleAuthModal, 
  loginSuccess, 
  registerSuccess, 
  setActiveRole,
  setAuthModalMode,
  setAuthTargetRole
} from '../../store/slices/authSlice.js';
import { authService } from '../../services/api.js';
import { addNotification } from '../../store/slices/notificationsSlice.js';
import { 
  X, 
  User, 
  ShieldCheck, 
  Truck, 
  Building2, 
  CheckCircle2, 
  KeyRound, 
  Award,
  Zap,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
  Layers,
  MapPin,
  FileText
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';

export default function AuthModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.auth?.isAuthModalOpen);
  const currentUser = useSelector((state) => state.auth?.user);
  const modalMode = useSelector((state) => state.auth?.authModalMode || 'LOGIN');
  const targetRole = useSelector((state) => state.auth?.authTargetRole || 'DRIVER');
  const reduxErrorMessage = useSelector((state) => state.auth?.authErrorMessage || '');
  const allAvailableUsers = useSelector((state) => state.auth?.allAvailableUsers || []);
  const registeredUsers = useSelector((state) => state.auth?.registeredUsers || []);

  const [mode, setMode] = useState(modalMode); // 'LOGIN' | 'SIGNUP'
  const [selectedRole, setSelectedRole] = useState(targetRole); // 'DRIVER' | 'SHIPPER'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Driver fields
    vehicleReg: '',
    vehicleType: 'HEAVY_TRAILER',
    capacityTons: 25,
    homeCity: '',
    licenseNumber: '',
    // Shipper fields
    company: '',
    gstin: '',
    cargoType: 'Agricultural Produce',
    hubCity: ''
  });

  useEffect(() => {
    setMode(modalMode);
    setSelectedRole(targetRole);
    setErrorMessage(reduxErrorMessage || '');
  }, [modalMode, targetRole, isOpen, reduxErrorMessage]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const emailToAuth = (loginEmail || '').trim().toLowerCase();
    const passwordToAuth = loginPassword || '';

    if (!emailToAuth) {
      setErrorMessage('Please enter your registered email address.');
      setIsLoading(false);
      return;
    }

    if (!passwordToAuth) {
      setErrorMessage('Please enter your account password.');
      setIsLoading(false);
      return;
    }

    try {
      soundFx.radarPing();

      // Check API
      let loginSuccessUser = null;
      let loginToken = null;

      try {
        const res = await authService.login({
          email: emailToAuth,
          password: passwordToAuth,
          role: selectedRole
        });

        if (res.data?.success && res.data?.user) {
          loginSuccessUser = res.data.user;
          loginToken = res.data.token;
        }
      } catch (apiErr) {
        if (apiErr.response?.status === 401) {
          setErrorMessage('Invalid password. Please verify your credentials and try again.');
          setIsLoading(false);
          return;
        }
        if (apiErr.response?.status === 403) {
          setErrorMessage(apiErr.response.data?.message || `Access restricted: Account role mismatch. Cannot log into ${selectedRole} portal.`);
          setIsLoading(false);
          return;
        }
      }

      // If API succeeded
      if (loginSuccessUser) {
        dispatch(loginSuccess({ user: loginSuccessUser, token: loginToken }));
        dispatch(setActiveRole(loginSuccessUser.role));
        dispatch(addNotification({
          type: 'SUCCESS',
          title: 'Welcome Back!',
          message: `Logged in as ${loginSuccessUser.name} (${loginSuccessUser.role})`
        }));
        setIsLoading(false);
        return;
      }

      // Offline / Local fallback validation against registeredUsers
      const matchingUser = (registeredUsers || []).find(
        (u) => u.email?.toLowerCase() === emailToAuth
      );

      if (!matchingUser) {
        setErrorMessage(`No account found for "${emailToAuth}". Please check your email or click "Sign Up" to register.`);
        setIsLoading(false);
        return;
      }

      if (passwordToAuth !== matchingUser.password) {
        setErrorMessage(`Invalid password for "${matchingUser.name}". Please check your password.`);
        setIsLoading(false);
        return;
      }

      if (matchingUser.role !== selectedRole) {
        setErrorMessage(
          `Role Mismatch: "${matchingUser.name}" is registered as a ${matchingUser.role === 'DRIVER' ? 'Commercial Driver' : 'Enterprise Shipper'}. You cannot log into the ${selectedRole} Portal with this account.`
        );
        setIsLoading(false);
        return;
      }

      const token = `jwt_haulback_${matchingUser._id}_${Date.now()}`;
      dispatch(loginSuccess({ user: matchingUser, token }));
      dispatch(setActiveRole(matchingUser.role));
      dispatch(addNotification({
        type: 'SUCCESS',
        title: 'Logged In Successfully',
        message: `Welcome, ${matchingUser.name}!`
      }));
    } catch (err) {
      setErrorMessage('Login failed. Please verify your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signupData.name?.trim() || !signupData.email?.trim() || !signupData.phone?.trim()) {
      setErrorMessage('Please fill in your name, email, and phone number.');
      return;
    }

    if (!signupData.password || signupData.password.length < 4) {
      setErrorMessage('Please enter a password with minimum 4 characters.');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    const cleanEmail = signupData.email.trim().toLowerCase();

    // Check if email already registered locally
    const existing = allAvailableUsers.find(u => u.email?.toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMessage(`An account with email "${cleanEmail}" already exists. Please switch to the "Log In" tab.`);
      return;
    }

    setIsLoading(true);

    try {
      soundFx.radarPing();
      const payload = {
        name: signupData.name.trim(),
        email: cleanEmail,
        phone: signupData.phone.trim(),
        password: signupData.password,
        role: selectedRole,
        // Role specific
        ...(selectedRole === 'DRIVER' ? {
          vehicleReg: signupData.vehicleReg?.trim().toUpperCase() || 'MH-12-HB-2026',
          vehicleType: signupData.vehicleType || 'HEAVY_TRAILER',
          capacityTons: Number(signupData.capacityTons) || 25,
          homeCity: signupData.homeCity?.trim() || 'Bhopal Mandideep Hub',
          licenseNumber: signupData.licenseNumber?.trim() || 'DL-2026-IND'
        } : {
          company: signupData.company?.trim() || signupData.name.trim(),
          gstin: signupData.gstin?.trim().toUpperCase() || '23AABCA1234F1Z5',
          cargoType: signupData.cargoType || 'Agricultural Produce',
          hubCity: signupData.hubCity?.trim() || 'Bhopal Industrial Hub'
        })
      };

      let registeredUser = null;
      let token = null;

      try {
        const res = await authService.register(payload);
        if (res.data?.success && res.data?.user) {
          registeredUser = res.data.user;
          token = res.data.token;
        }
      } catch (apiErr) {
        if (apiErr.response?.status === 409) {
          setErrorMessage(apiErr.response.data?.message || 'An account with this email address already exists.');
          setIsLoading(false);
          return;
        }
      }

      if (!registeredUser) {
        const newUserId = selectedRole === 'DRIVER' ? `usr_driver_${Date.now()}` : `usr_shipper_${Date.now()}`;
        registeredUser = {
          _id: newUserId,
          name: payload.name,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          role: selectedRole,
          rating: 5.0,
          createdAt: new Date().toISOString(),
          ...(selectedRole === 'DRIVER' ? {
            totalTrips: 0,
            deadheadKmSaved: 0,
            earningsThisMonth: 0,
            vehicle: {
              regNumber: payload.vehicleReg,
              type: payload.vehicleType,
              capacityTons: payload.capacityTons,
              make: `${payload.vehicleType.replace('_', ' ')} Commercial Rig`,
              status: 'AVAILABLE_FOR_RETURN',
              currentLocation: {
                type: 'Point',
                coordinates: [77.5255, 23.1428],
                address: payload.homeCity
              },
              homeBase: {
                coordinates: [77.2090, 28.6139],
                address: `${payload.homeCity} Terminal`
              }
            }
          } : {
            company: payload.company,
            gstin: payload.gstin,
            cargoType: payload.cargoType,
            address: payload.hubCity,
            escrowBalance: 500000,
            totalShipments: 0
          })
        };
        token = `jwt_haulback_${registeredUser._id}_${Date.now()}`;
      }

      dispatch(registerSuccess({ user: registeredUser, token }));
      dispatch(setActiveRole(registeredUser.role));
      dispatch(addNotification({
        type: 'SUCCESS',
        title: 'Account Created Successfully!',
        message: `Welcome, ${registeredUser.name}! Your ${registeredUser.role} profile is saved & ready.`
      }));

      // Reset signup form
      setSignupData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        vehicleReg: '',
        vehicleType: 'HEAVY_TRAILER',
        capacityTons: 25,
        homeCity: 'Bhopal Mandideep Hub',
        licenseNumber: '',
        company: '',
        gstin: '',
        cargoType: 'Agricultural Produce',
        hubCity: 'Bhopal Industrial Area'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="auth-modal-container"
        className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md font-bold">
              {mode === 'LOGIN' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                {mode === 'LOGIN' ? 'Log In to HaulBack Portal' : 'Register New Verified Profile'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'LOGIN' 
                  ? 'Access your isolated Driver or Shipper dashboard' 
                  : 'Join India\'s zero-deadhead return freight network'}
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(toggleAuthModal(false))}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Auth Mode Switcher Tabs (Login vs Register) */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1 rounded-2xl">
            <button
              onClick={() => {
                soundFx.radarPing();
                setMode('LOGIN');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'LOGIN'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-amber-600" />
              <span>Log In</span>
            </button>

            <button
              onClick={() => {
                soundFx.radarPing();
                setMode('SIGNUP');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'SIGNUP'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>Sign Up / Register</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Choice Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Choose Workspace Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.radarPing();
                  setSelectedRole('DRIVER');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  selectedRole === 'DRIVER'
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl ${selectedRole === 'DRIVER' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Commercial Driver</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Find return loads, counter-bid & track GPS
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.radarPing();
                  setSelectedRole('SHIPPER');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  selectedRole === 'SHIPPER'
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl ${selectedRole === 'SHIPPER' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Freight Shipper</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Post loads, lock bids & 1-click AI dispatch
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* ================= MODE: LOGIN ================= */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {selectedRole === 'DRIVER' ? 'Driver Email Address' : 'Enterprise Shipper Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder={selectedRole === 'DRIVER' ? 'vikram.driver@haulback.io' : 'logistics@adaniagri.com'}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>{isLoading ? 'Authenticating...' : `Log In to ${selectedRole === 'DRIVER' ? 'Driver' : 'Shipper'} Portal`}</span>
              </button>
            </form>
          )}

          {/* ================= MODE: SIGN UP / REGISTER ================= */}
          {mode === 'SIGNUP' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Common Fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {selectedRole === 'DRIVER' ? 'Full Driver Name *' : 'Contact Person Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedRole === 'DRIVER' ? 'e.g. Ramesh Kumar' : 'e.g. Rahul Mehta'}
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile Number (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={selectedRole === 'DRIVER' ? 'ramesh.trucks@gmail.com' : 'logistics@company.com'}
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Create Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific Fields */}
              {selectedRole === 'DRIVER' ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-700" />
                    <span>Commercial Truck & Vehicle Registration Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Vehicle Reg Number (Number Plate)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MP-04-HE-8821"
                        value={signupData.vehicleReg}
                        onChange={(e) => setSignupData({ ...signupData, vehicleReg: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Rig / Vehicle Type
                      </label>
                      <select
                        value={signupData.vehicleType}
                        onChange={(e) => setSignupData({ ...signupData, vehicleType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-medium"
                      >
                        <option value="HEAVY_TRAILER">Heavy Trailer (25T - 35T)</option>
                        <option value="CONTAINER_TRUCK">Container Truck (32T)</option>
                        <option value="REEFER_COLD">Reefer Cold Chain (18T)</option>
                        <option value="FLATBED">Flatbed Rig (12T - 20T)</option>
                        <option value="OPEN_BODY">Open Body 16-Wheeler (20T)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Payload Capacity (Metric Tons)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={signupData.capacityTons}
                        onChange={(e) => setSignupData({ ...signupData, capacityTons: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Home Corridor / Base City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bhopal Mandideep Hub"
                        value={signupData.homeCity}
                        onChange={(e) => setSignupData({ ...signupData, homeCity: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <span>Enterprise Transporter & Cargo Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Company / Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Reliance Retail Logistics"
                        value={signupData.company}
                        onChange={(e) => setSignupData({ ...signupData, company: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Business GSTIN / Tax ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 23AABCA1234F1Z5"
                        value={signupData.gstin}
                        onChange={(e) => setSignupData({ ...signupData, gstin: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Primary Cargo Type
                      </label>
                      <select
                        value={signupData.cargoType}
                        onChange={(e) => setSignupData({ ...signupData, cargoType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-medium"
                      >
                        <option value="Agricultural Produce">Agricultural Produce / Grains</option>
                        <option value="Automotive Components">Automotive Components & Chassis</option>
                        <option value="Pharmaceuticals">Pharmaceuticals & Cold Chain</option>
                        <option value="Heavy Metals / Steel">Heavy Metals & Steel Coils</option>
                        <option value="FMCG / Retail Goods">FMCG / Retail Consumer Goods</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Operating Hub City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bhopal Mandideep Hub"
                        value={signupData.hubCity}
                        onChange={(e) => setSignupData({ ...signupData, hubCity: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Escrow guarantee note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  By signing up, your account is covered under HaulBack 256-Bit Escrow & Zero-Deadhead Guarantee.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>{isLoading ? 'Creating Verified Profile...' : `Register as ${selectedRole === 'DRIVER' ? 'Commercial Driver' : 'Freight Shipper'}`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

