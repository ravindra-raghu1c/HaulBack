import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_BIDS } from '../../server/mockDb.js';

const bidsSlice = createSlice({
  name: 'bids',
  initialState: {
    items: INITIAL_BIDS,
    isBidModalOpen: false,
    selectedLoadForBid: null,
    activeBidLoad: null,
    isSubmitting: false,
    lockedLoadId: null, // Redis SETNX lock simulation state
    lockExpiresAt: null
  },
  reducers: {
    setBids: (state, action) => {
      state.items = action.payload;
    },
    addBid: (state, action) => {
      state.items.unshift(action.payload);
    },
    toggleBidModal: (state, action) => {
      state.isBidModalOpen = typeof action.payload === 'boolean' ? action.payload : !state.isBidModalOpen;
      if (!state.isBidModalOpen) {
        state.selectedLoadForBid = null;
        state.activeBidLoad = null;
      }
    },
    setSelectedLoadForBid: (state, action) => {
      state.selectedLoadForBid = action.payload;
      state.activeBidLoad = action.payload;
    },
    openBidModal: (state, action) => {
      state.activeBidLoad = action.payload;
      state.selectedLoadForBid = action.payload;
      state.isBidModalOpen = true;
    },
    closeBidModal: (state) => {
      state.isBidModalOpen = false;
      state.activeBidLoad = null;
      state.selectedLoadForBid = null;
    },
    setLockState: (state, action) => {
      state.lockedLoadId = action.payload.loadId;
      state.lockExpiresAt = action.payload.expiresAt;
    },
    acceptBidLocally: (state, action) => {
      const { bidId, loadId } = action.payload;
      state.items.forEach(b => {
        if (b.loadId === loadId) {
          b.status = b._id === bidId ? 'ACCEPTED' : 'REJECTED';
        }
      });
    }
  }
});

export const { 
  setBids, 
  addBid, 
  toggleBidModal, 
  setSelectedLoadForBid, 
  openBidModal, 
  closeBidModal, 
  setLockState, 
  acceptBidLocally 
} = bidsSlice.actions;

export default bidsSlice.reducer;
