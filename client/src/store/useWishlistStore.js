/**
 * Royal Rides — Wishlist Store (Zustand)
 * User wishlist management with optimistic local storage fallback.
 */

import { create } from 'zustand';
import api from '../services/api';

const safeJsonParse = (str, fallback = []) => {
  try {
    if (!str || str === 'undefined' || str === 'null') return fallback;
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const useWishlistStore = create((set, get) => ({
  savedIds: safeJsonParse(localStorage.getItem('rr_saved_ids'), []),
  isLoading: false,

  isSaved: (itemId) => {
    return get().savedIds.includes(String(itemId));
  },

  toggleWishlist: async (itemType, itemId) => {
    const { savedIds } = get();
    const idStr = String(itemId);
    const exists = savedIds.includes(idStr);

    // Optimistic UI update
    const newSaved = exists
      ? savedIds.filter((id) => id !== idStr)
      : [...savedIds, idStr];

    set({ savedIds: newSaved });
    localStorage.setItem('rr_saved_ids', JSON.stringify(newSaved));

    // Sync with backend if logged in
    try {
      const token = localStorage.getItem('rr_access_token');
      if (token) {
        await api.post('/wishlist/toggle', { itemType, itemId });
      }
    } catch {
      // Keep optimistic state
    }
  },

  loadWishlist: async () => {
    const token = localStorage.getItem('rr_access_token');
    if (!token) return;
    try {
      set({ isLoading: true });
      const res = await api.get('/wishlist');
      if (res?.data?.items) {
        const ids = res.data.items.map((i) => String(i.itemId?._id || i.itemId));
        set({ savedIds: ids });
        localStorage.setItem('rr_saved_ids', JSON.stringify(ids));
      }
    } catch {
      // Ignore
    } finally {
      set({ isLoading: false });
    }
  },
}));
