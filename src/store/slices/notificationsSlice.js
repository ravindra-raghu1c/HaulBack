import { createSlice } from '@reduxjs/toolkit';

const initialNotifications = [
  {
    id: 'notif_1',
    title: 'New Counter-Bid on Load #load_001',
    message: 'Vikram Sharma submitted ₹49,500 for Bhopal → Delhi return freight (8.3% savings).',
    timestamp: 'Just now',
    type: 'BID_PLACED',
    read: false
  },
  {
    id: 'notif_2',
    title: 'AI Return Load Recommendation',
    message: 'Gemini matched 2 high-value return loads along your return corridor to eliminate 785 empty km.',
    timestamp: '12m ago',
    type: 'AI_OPTIMIZATION',
    read: false
  },
  {
    id: 'notif_3',
    title: 'Geofence Entry: Biaora Toll',
    message: 'Driver Gurpreet Singh crossed Biaora Bypass Plaza. FASTag debit successful.',
    timestamp: '45m ago',
    type: 'TELEMETRY',
    read: false
  }
];

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    isOpen: false,
    isDrawerOpen: false,
    unreadCount: 3,
    items: initialNotifications,
    messages: initialNotifications
  },
  reducers: {
    toggleDrawer: (state, action) => {
      const open = typeof action.payload === 'boolean' ? action.payload : !state.isOpen;
      state.isOpen = open;
      state.isDrawerOpen = open;
      if (open) {
        state.unreadCount = 0;
        state.items.forEach(i => { i.read = true; });
        if (state.messages) state.messages.forEach(i => { i.read = true; });
      }
    },
    addNotification: (state, action) => {
      const newNotif = {
        id: `notif_${Date.now()}`,
        timestamp: 'Just now',
        read: false,
        ...action.payload
      };
      state.items.unshift(newNotif);
      if (!state.messages) state.messages = [];
      state.messages.unshift(newNotif);
      if (!state.isOpen && !state.isDrawerOpen) {
        state.unreadCount += 1;
      }
      if (state.items.length > 20) state.items.pop();
      if (state.messages.length > 20) state.messages.pop();
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter(m => m.id !== action.payload);
      if (state.messages) state.messages = state.messages.filter(m => m.id !== action.payload);
    },
    markAllRead: (state) => {
      state.unreadCount = 0;
      state.items.forEach(i => { i.read = true; });
      if (state.messages) state.messages.forEach(i => { i.read = true; });
    },
    markAllAsRead: (state) => {
      state.unreadCount = 0;
      state.items.forEach(i => { i.read = true; });
      if (state.messages) state.messages.forEach(i => { i.read = true; });
    },
    clearNotifications: (state) => {
      state.items = [];
      state.messages = [];
      state.unreadCount = 0;
    },
    clearAll: (state) => {
      state.items = [];
      state.messages = [];
      state.unreadCount = 0;
    }
  }
});

export const { 
  toggleDrawer, 
  addNotification, 
  removeNotification, 
  markAllRead, 
  markAllAsRead, 
  clearNotifications, 
  clearAll 
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
