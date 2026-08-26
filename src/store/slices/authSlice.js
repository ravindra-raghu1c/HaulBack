import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_USERS } from '../../server/mockDb.js';

// Safe localStorage initialization
const loadStoredAuth = () => {
  let registeredUsers = [];
  try {
    const savedRegisteredUsers = localStorage.getItem('haulback_registered_users');
    if (savedRegisteredUsers) {
      try { 
        const parsed = JSON.parse(savedRegisteredUsers);
        if (Array.isArray(parsed)) registeredUsers = parsed;
      } catch {}
    }

    const savedUser = localStorage.getItem('haulback_user');
    const savedToken = localStorage.getItem('haulback_jwt_token');

    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      return {
        user: parsedUser,
        token: savedToken,
        isAuthenticated: true,
        activeRole: parsedUser.role || 'DRIVER',
        registeredUsers
      };
    }
  } catch (e) {
    console.warn('Could not read auth from localStorage', e);
  }

  // No demo profile by default
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    activeRole: 'DRIVER',
    registeredUsers
  };
};

const initialAuthState = loadStoredAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialAuthState.user,
    token: initialAuthState.token,
    isAuthenticated: initialAuthState.isAuthenticated,
    activeRole: initialAuthState.activeRole, // 'DRIVER' | 'SHIPPER' | 'FLEET_MANAGER'
    isAuthModalOpen: false,
    authModalMode: 'LOGIN', // 'LOGIN' | 'SIGNUP'
    authTargetRole: 'DRIVER', // 'DRIVER' | 'SHIPPER'
    authErrorMessage: '',
    registeredUsers: initialAuthState.registeredUsers || [],
    allAvailableUsers: initialAuthState.registeredUsers || []
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload?.role) {
        state.activeRole = action.payload.role;
      }
      try {
        if (action.payload) {
          localStorage.setItem('haulback_user', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('haulback_user');
        }
      } catch {}
    },
    setToken: (state, action) => {
      state.token = action.payload;
      try {
        if (action.payload) {
          localStorage.setItem('haulback_jwt_token', action.payload);
        } else {
          localStorage.removeItem('haulback_jwt_token');
        }
      } catch {}
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token || `jwt_haulback_${user._id}_${Date.now()}`;
      state.isAuthenticated = true;
      state.activeRole = user.role || 'DRIVER';
      state.isAuthModalOpen = false;
      state.authErrorMessage = '';

      // Keep user in available users pool
      const existingIdx = state.allAvailableUsers.findIndex(u => u.email?.toLowerCase() === user.email?.toLowerCase());
      if (existingIdx >= 0) {
        state.allAvailableUsers[existingIdx] = user;
      } else {
        state.allAvailableUsers.unshift(user);
      }

      try {
        localStorage.setItem('haulback_user', JSON.stringify(user));
        localStorage.setItem('haulback_jwt_token', state.token);
      } catch {}
    },
    registerSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token || `jwt_haulback_${user._id}_${Date.now()}`;
      state.isAuthenticated = true;
      state.activeRole = user.role || 'DRIVER';
      state.isAuthModalOpen = false;
      state.authErrorMessage = '';
      
      const existingRegIdx = state.registeredUsers.findIndex(u => u.email?.toLowerCase() === user.email?.toLowerCase());
      if (existingRegIdx >= 0) {
        state.registeredUsers[existingRegIdx] = user;
      } else {
        state.registeredUsers.unshift(user);
      }

      const existingAvailIdx = state.allAvailableUsers.findIndex(u => u.email?.toLowerCase() === user.email?.toLowerCase());
      if (existingAvailIdx >= 0) {
        state.allAvailableUsers[existingAvailIdx] = user;
      } else {
        state.allAvailableUsers.unshift(user);
      }

      try {
        localStorage.setItem('haulback_user', JSON.stringify(user));
        localStorage.setItem('haulback_jwt_token', state.token);
        localStorage.setItem('haulback_registered_users', JSON.stringify(state.registeredUsers));
      } catch {}
    },
    setActiveRole: (state, action) => {
      const requestedRole = action.payload;

      // Fleet Ops is general fleet analytics accessible to all users
      if (requestedRole === 'FLEET_MANAGER') {
        state.activeRole = 'FLEET_MANAGER';
        return;
      }

      // If user is logged in, check role-based permissions
      if (state.user && state.user.role) {
        if (state.user.role !== requestedRole) {
          state.authTargetRole = requestedRole;
          state.authModalMode = 'LOGIN';
          state.isAuthModalOpen = true;
          state.authErrorMessage = `Role-Based Access Control (RBAC): You are currently signed in as a ${state.user.role === 'DRIVER' ? 'Commercial Driver' : 'Enterprise Shipper'}. Access to the ${requestedRole === 'SHIPPER' ? 'Shipper Workspace' : 'Driver Workspace'} requires authentication with a valid ${requestedRole === 'SHIPPER' ? 'Enterprise Shipper' : 'Commercial Driver'} account.`;
          return;
        }
      }

      state.activeRole = requestedRole;
    },
    switchRole: (state, action) => {
      const requestedRole = action.payload;

      if (requestedRole === 'FLEET_MANAGER') {
        state.activeRole = 'FLEET_MANAGER';
        return;
      }

      if (state.user && state.user.role) {
        if (state.user.role !== requestedRole) {
          state.authTargetRole = requestedRole;
          state.authModalMode = 'LOGIN';
          state.isAuthModalOpen = true;
          state.authErrorMessage = `Role-Based Access Control (RBAC): You are signed in as a ${state.user.role === 'DRIVER' ? 'Commercial Driver' : 'Enterprise Shipper'}. Please authenticate with a ${requestedRole === 'SHIPPER' ? 'Shipper' : 'Driver'} account to proceed.`;
          return;
        }
      }

      state.activeRole = requestedRole;
    },
    toggleAuthModal: (state, action) => {
      if (typeof action.payload === 'boolean') {
        state.isAuthModalOpen = action.payload;
      } else if (action.payload && typeof action.payload === 'object') {
        state.isAuthModalOpen = action.payload.isOpen !== undefined ? action.payload.isOpen : true;
        if (action.payload.mode) state.authModalMode = action.payload.mode;
        if (action.payload.targetRole) state.authTargetRole = action.payload.targetRole;
        if (action.payload.errorMessage) state.authErrorMessage = action.payload.errorMessage;
      } else {
        state.isAuthModalOpen = !state.isAuthModalOpen;
      }
    },
    setAuthErrorMessage: (state, action) => {
      state.authErrorMessage = action.payload;
    },
    openLoginModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.authModalMode = 'LOGIN';
      if (action.payload) {
        state.authTargetRole = action.payload;
      }
    },
    openSignupModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.authModalMode = 'SIGNUP';
      if (action.payload) {
        state.authTargetRole = action.payload;
      }
    },
    setAuthModalMode: (state, action) => {
      state.authModalMode = action.payload;
    },
    setAuthTargetRole: (state, action) => {
      state.authTargetRole = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('haulback_user');
        localStorage.removeItem('haulback_jwt_token');
      } catch {}
    }
  }
});

export const { 
  setUser, 
  setToken, 
  loginSuccess,
  registerSuccess,
  setActiveRole, 
  switchRole, 
  toggleAuthModal, 
  openLoginModal,
  openSignupModal,
  setAuthModalMode,
  setAuthTargetRole,
  setAuthErrorMessage,
  logout 
} = authSlice.actions;

export default authSlice.reducer;
