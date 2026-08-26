import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_TRIP_WAYPOINTS } from '../../server/mockDb.js';

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState: {
    activeLoadId: 'load_001',
    driverName: 'Vikram Sharma',
    vehicleReg: 'MP-04-HE-8821',
    vehicleType: 'HEAVY_TRAILER',
    currentLocation: {
      lat: 23.1428,
      lng: 77.5255,
      address: 'Mandideep Logistics Hub, Bhopal'
    },
    pickup: {
      lat: 23.1428,
      lng: 77.5255,
      address: 'Mandideep, Bhopal'
    },
    destination: {
      lat: 28.5355,
      lng: 77.2715,
      address: 'ICD Tughlakabad / Okhla, New Delhi'
    },
    totalDistanceKm: 785,
    completedDistanceKm: 0,
    speedKmH: 0,
    heading: 32,
    status: 'AT_PICKUP', // 'AT_PICKUP', 'IN_TRANSIT', 'TOLL_PAID', 'REST_BREAK', 'DELIVERED'
    progressPercent: 0,
    etaMinutes: 870,
    waypoints: INITIAL_TRIP_WAYPOINTS,
    currentWaypointIndex: 0,
    isSimulating: false,
    simulationSpeed: 1, // 1x, 2x, 5x
    deadheadSavedKm: 785,
    fuelSavingsInr: 34500,
    co2ReductionKg: 890,
    batteryTempC: 38,
    tirePressurePsi: 118,
    lastGeofenceAlert: 'Vehicle within 500m of Warehouse Gate #4',
    logs: [
      { id: 1, time: '06:30 IST', event: 'Driver arrived at Mandideep Origin Point', type: 'INFO' },
      { id: 2, time: '06:45 IST', event: 'Tarpaulin waterproof check verified & e-Way Bill generated', type: 'SUCCESS' },
      { id: 3, time: '07:00 IST', event: 'GPS live telemetry stream initiated (10s intervals)', type: 'INFO' }
    ]
  },
  reducers: {
    updateTelemetry: (state, action) => {
      return { ...state, ...action.payload };
    },
    toggleSimulation: (state, action) => {
      state.isSimulating = typeof action.payload === 'boolean' ? action.payload : !state.isSimulating;
    },
    setSimulationSpeed: (state, action) => {
      state.simulationSpeed = action.payload;
    },
    addLog: (state, action) => {
      state.logs.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ...action.payload
      });
    },
    resetSimulation: (state) => {
      state.progressPercent = 0;
      state.completedDistanceKm = 0;
      state.speedKmH = 0;
      state.etaMinutes = 870;
      state.status = 'AT_PICKUP';
      state.currentLocation = {
        lat: 23.1428,
        lng: 77.5255,
        address: 'Mandideep Logistics Hub, Bhopal'
      };
      state.currentWaypointIndex = 0;
      state.waypoints.forEach((wp, idx) => {
        wp.passed = idx === 0;
      });
    }
  }
});

export const { updateTelemetry, toggleSimulation, setSimulationSpeed, addLog, resetSimulation } = telemetrySlice.actions;
export default telemetrySlice.reducer;
