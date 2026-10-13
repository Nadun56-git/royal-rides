/**
 * Royal Rides — Auth Store (Zustand)
 * User session, tokens, login/logout, profile updates, and role checking.
 */

import { create } from 'zustand';
import api from '../services/api';

const safeJsonParse = (str, fallback = null) => {
  try {
    if (!str || str === 'undefined' || str === 'null') return fallback;
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export const useAuthStore = create((set, get) => ({
  user: safeJsonParse(localStorage.getItem('rr_user'), null),
  token: localStorage.getItem('rr_access_token') || null,
  isAuthenticated: !!localStorage.getItem('rr_access_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data;

      localStorage.setItem('rr_access_token', accessToken);
      localStorage.setItem('rr_user', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, user };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err?.message || 'Login failed' };
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', formData);
      const { user, accessToken } = res.data;

      localStorage.setItem('rr_access_token', accessToken);
      localStorage.setItem('rr_user', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, user };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err?.message || 'Registration failed' };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('rr_access_token');
      localStorage.removeItem('rr_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('rr_access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      const user = res.data.user;
      localStorage.setItem('rr_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('rr_access_token');
      localStorage.removeItem('rr_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  isAdmin: () => {
    const { user } = get();
    return user && ['admin', 'superadmin', 'super_admin'].includes(user.role);
  },

  isManagerOrAdmin: () => {
    const { user } = get();
    return user && ['manager', 'admin', 'superadmin', 'super_admin'].includes(user.role);
  },
}));
