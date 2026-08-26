import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import authReducer, { 
  setActiveRole, 
  switchRole, 
  setUser, 
  setToken, 
  loginSuccess,
  registerSuccess,
  toggleAuthModal, 
  openLoginModal,
  openSignupModal,
  setAuthModalMode,
  setAuthTargetRole,
  logout 
} from './slices/authSlice.js';
import loadsReducer, { 
  setLoads, 
  addLoad, 
  updateLoadStatus, 
  setSelectedLoad, 
  toggleDetailPanel, 
  togglePostLoadModal, 
  toggleAIDispatchModal, 
  setFilters, 
  setStatusFilter, 
  setVehicleFilter, 
  setSearchQuery, 
  setActiveTab, 
  setAiOptimization, 
  clearAiOptimization, 
  setMapCenter, 
  setMapZoom 
} from './slices/loadsSlice.js';
import bidsReducer, { 
  setBids, 
  addBid, 
  openBidModal, 
  closeBidModal, 
  setLockState, 
  acceptBidLocally 
} from './slices/bidsSlice.js';
import telemetryReducer, { 
  updateTelemetry, 
  toggleSimulation, 
  setSimulationSpeed, 
  addLog, 
  resetSimulation 
} from './slices/telemetrySlice.js';
import notificationsReducer, { 
  toggleDrawer, 
  addNotification, 
  removeNotification, 
  markAllRead, 
  clearNotifications 
} from './slices/notificationsSlice.js';

// API Client
const api = axios.create({
  baseURL: '/api'
});

// Auth Async Thunks
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { dispatch }) => {
  try {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.user) {
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  } catch (err) {
    throw err;
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { dispatch }) => {
  try {
    const res = await api.post('/auth/register', userData);
    if (res.data?.user) {
      dispatch(registerSuccess({ user: res.data.user, token: res.data.token }));
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  } catch (err) {
    throw err;
  }
});

// Async Thunks
export const fetchLoads = createAsyncThunk('loads/fetchLoads', async (filters = {}, { dispatch }) => {
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.vehicleType && filters.vehicleType !== 'ALL') params.append('vehicleType', filters.vehicleType);
    if (filters.search) params.append('search', filters.search);
    
    const res = await api.get(`/loads?${params.toString()}`);
    if (res.data?.loads) {
      dispatch(setLoads(res.data.loads));
      return res.data.loads;
    }
    return [];
  } catch (err) {
    console.warn('Using local fallback for loads:', err.message);
    return [];
  }
});

export const postNewLoad = createAsyncThunk('loads/postNewLoad', async (loadData, { dispatch }) => {
  try {
    const res = await api.post('/loads', loadData);
    if (res.data?.load) {
      dispatch(addLoad(res.data.load));
      return res.data.load;
    }
    return loadData;
  } catch (err) {
    dispatch(addLoad(loadData));
    return loadData;
  }
});

export const submitBid = createAsyncThunk('bids/submitBid', async (bidData, { dispatch }) => {
  try {
    const res = await api.post('/bids', bidData);
    if (res.data?.bid) {
      dispatch(addBid(res.data.bid));
    }
    return res.data;
  } catch (err) {
    dispatch(addBid({
      _id: `bid_${Date.now()}`,
      ...bidData,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }));
    return { success: true };
  }
});

export const acceptBid = createAsyncThunk('bids/acceptBid', async (bidId, { dispatch, getState }) => {
  try {
    const res = await api.post(`/bids/${bidId}/accept`);
    if (res.data?.load) {
      dispatch(updateLoadStatus({
        loadId: res.data.load._id,
        status: 'ASSIGNED'
      }));
    }
    return res.data;
  } catch (err) {
    return { success: true, bidId };
  }
});

export const acceptBidWithLock = acceptBid;

export const fetchTelemetry = createAsyncThunk('telemetry/fetchTelemetry', async (_, { dispatch }) => {
  try {
    const res = await api.get('/telemetry/state');
    if (res.data?.telemetry) {
      dispatch(updateTelemetry(res.data.telemetry));
    }
    return res.data;
  } catch (err) {
    return null;
  }
});

export const stepTelemetry = createAsyncThunk('telemetry/stepTelemetry', async (step = 1, { dispatch }) => {
  try {
    const res = await api.post('/telemetry/step', { step });
    if (res.data?.telemetry) {
      dispatch(updateTelemetry(res.data.telemetry));
    }
    return res.data;
  } catch (err) {
    return null;
  }
});

export const resetTelemetry = createAsyncThunk('telemetry/resetTelemetry', async (_, { dispatch }) => {
  try {
    const res = await api.post('/telemetry/reset');
    dispatch(resetSimulation());
    return res.data;
  } catch (err) {
    dispatch(resetSimulation());
    return null;
  }
});

export const requestAiDispatch = createAsyncThunk('ai/optimize', async (load, { dispatch }) => {
  try {
    const res = await api.post('/ai/optimize-dispatch', { load });
    if (res.data?.optimization) {
      dispatch(setAiOptimization(res.data.optimization));
      return res.data.optimization;
    }
    return null;
  } catch (err) {
    return null;
  }
});

export const runAiDispatchOptimization = requestAiDispatch;

export const requestRouteInsights = createAsyncThunk('ai/insights', async (routeData) => {
  try {
    const res = await api.post('/ai/route-insights', routeData);
    return res.data?.insights;
  } catch (err) {
    return null;
  }
});

export const fetchAiRouteInsights = requestRouteInsights;

// Aliases for compatibility
export const clearNotification = removeNotification;
export const toggleAutoSimulation = toggleSimulation;

// Configure Unified Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    loads: loadsReducer,
    bids: bidsReducer,
    telemetry: telemetryReducer,
    notifications: notificationsReducer,
    // Add legacy alias for any component expecting state.ai
    ai: (state = { currentOptimization: null, routeInsights: null, loading: false }, action) => {
      if (action.type === 'ai/optimize/fulfilled') {
        return { ...state, currentOptimization: action.payload, loading: false };
      }
      if (action.type === 'ai/optimize/pending') {
        return { ...state, loading: true };
      }
      if (action.type === 'ai/optimize/rejected') {
        return { ...state, loading: false };
      }
      return state;
    }
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

// Re-export all actions
export {
  setActiveRole,
  switchRole,
  setUser,
  setToken,
  loginSuccess,
  registerSuccess,
  toggleAuthModal,
  openLoginModal,
  openSignupModal,
  setAuthModalMode,
  setAuthTargetRole,
  logout,
  setLoads,
  addLoad,
  updateLoadStatus,
  setSelectedLoad,
  toggleDetailPanel,
  togglePostLoadModal,
  toggleAIDispatchModal,
  setFilters,
  setStatusFilter,
  setVehicleFilter,
  setSearchQuery,
  setActiveTab,
  setAiOptimization,
  clearAiOptimization,
  setMapCenter,
  setMapZoom,
  setBids,
  addBid,
  openBidModal,
  closeBidModal,
  setLockState,
  acceptBidLocally,
  updateTelemetry,
  toggleSimulation,
  setSimulationSpeed,
  addLog,
  resetSimulation,
  toggleDrawer,
  addNotification,
  removeNotification,
  markAllRead,
  clearNotifications
};

export default store;
