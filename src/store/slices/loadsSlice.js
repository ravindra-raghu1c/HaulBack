import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_LOADS } from '../../server/mockDb.js';

const loadsSlice = createSlice({
  name: 'loads',
  initialState: {
    items: INITIAL_LOADS,
    selectedLoad: null,
    isDetailPanelOpen: false,
    isPostLoadModalOpen: false,
    isAIDispatchModalOpen: false,
    activeTab: 'map', // 'map' | 'bidding' | 'trips' | 'driver' | 'transporter'
    statusFilter: 'ALL',
    vehicleFilter: 'ALL',
    searchQuery: '',
    aiOptimization: null,
    aiLoading: false,
    routeInsights: null,
    filters: {
      status: 'ALL', // 'ALL', 'POSTED', 'BIDDING_OPEN', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED'
      vehicleType: 'ALL',
      search: '',
      radiusKm: 100, // driver radius filter
      onlyReturnLoads: true
    },
    mapCenter: [23.1428, 77.5255], // Bhopal
    mapZoom: 6,
    activeRoutePolyline: null,
    isLoading: false,
    error: null
  },
  reducers: {
    setLoads: (state, action) => {
      state.items = action.payload;
    },
    addLoad: (state, action) => {
      state.items.unshift(action.payload);
      state.selectedLoad = action.payload;
    },
    updateLoadStatus: (state, action) => {
      const { loadId, status, assignedDriverId, assignedDriverName, assignedPrice, currentProgressPercent } = action.payload;
      const index = state.items.findIndex(l => l._id === loadId);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          status: status || state.items[index].status,
          assignedDriverId: assignedDriverId || state.items[index].assignedDriverId,
          assignedDriverName: assignedDriverName || state.items[index].assignedDriverName,
          assignedPrice: assignedPrice || state.items[index].assignedPrice,
          currentProgressPercent: currentProgressPercent !== undefined ? currentProgressPercent : state.items[index].currentProgressPercent
        };
        if (state.selectedLoad?._id === loadId) {
          state.selectedLoad = state.items[index];
        }
      }
    },
    updateLoadLowestBid: (state, action) => {
      const { loadId, lowestBid } = action.payload;
      const index = state.items.findIndex(l => l._id === loadId);
      if (index !== -1) {
        state.items[index].lowestBid = lowestBid;
        state.items[index].bidsCount = (state.items[index].bidsCount || 0) + 1;
        state.items[index].status = 'BIDDING_OPEN';
        if (state.selectedLoad?._id === loadId) {
          state.selectedLoad = state.items[index];
        }
      }
    },
    setSelectedLoad: (state, action) => {
      state.selectedLoad = action.payload;
      state.isDetailPanelOpen = !!action.payload;
      if (action.payload?.pickupLocation?.coordinates) {
        const [lng, lat] = action.payload.pickupLocation.coordinates;
        state.mapCenter = [lat, lng];
      }
    },
    toggleDetailPanel: (state, action) => {
      state.isDetailPanelOpen = typeof action.payload === 'boolean' ? action.payload : !state.isDetailPanelOpen;
    },
    togglePostLoadModal: (state, action) => {
      state.isPostLoadModalOpen = typeof action.payload === 'boolean' ? action.payload : !state.isPostLoadModalOpen;
    },
    toggleAIDispatchModal: (state, action) => {
      state.isAIDispatchModalOpen = typeof action.payload === 'boolean' ? action.payload : !state.isAIDispatchModalOpen;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      if (action.payload.status) state.statusFilter = action.payload.status;
      if (action.payload.vehicleType) state.vehicleFilter = action.payload.vehicleType;
      if (action.payload.search !== undefined) state.searchQuery = action.payload.search;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.filters.status = action.payload;
    },
    setVehicleFilter: (state, action) => {
      state.vehicleFilter = action.payload;
      state.filters.vehicleType = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.filters.search = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setAiOptimization: (state, action) => {
      state.aiOptimization = action.payload;
    },
    clearAiOptimization: (state) => {
      state.aiOptimization = null;
    },
    setMapCenter: (state, action) => {
      state.mapCenter = action.payload;
    },
    setMapZoom: (state, action) => {
      state.mapZoom = action.payload;
    }
  }
});

export const {
  setLoads,
  addLoad,
  updateLoadStatus,
  updateLoadLowestBid,
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
} = loadsSlice.actions;

export default loadsSlice.reducer;
