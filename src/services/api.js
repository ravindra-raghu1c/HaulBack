import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage or session
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('haulback_jwt_token') || 'mock_jwt_haulback_user_auth';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  getMe: () => api.get('/auth/me'),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getAllUsers: () => api.get('/auth/users')
};

export const loadService = {
  getLoads: (params) => api.get('/loads', { params }),
  getLoadById: (id) => api.get(`/loads/${id}`),
  createLoad: (loadData) => api.post('/loads', loadData),
  updateLoadStatus: (id, data) => api.patch(`/loads/${id}/status`, data)
};

export const bidService = {
  getBidsForLoad: (loadId) => api.get('/bids', { params: { loadId } }),
  submitBid: (bidData) => api.post('/bids', bidData),
  acceptBidWithLock: (bidId) => api.post(`/bids/${bidId}/accept`)
};

export const aiDispatchService = {
  optimizeDispatch: (load) => api.post('/ai/optimize-dispatch', { load }),
  getRouteInsights: (payload) => api.post('/ai/route-insights', payload)
};

export const telemetryService = {
  getTelemetryState: () => api.get('/telemetry/state'),
  stepSimulation: (step = 1) => api.post('/telemetry/step', { step }),
  resetSimulation: () => api.post('/telemetry/reset')
};

export default api;
