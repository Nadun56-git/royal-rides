/**
 * Royal Rides — Currency Store (Zustand)
 * Manages active currency (LKR ↔ USD), exchange rates, and live price formatting.
 */

import { create } from 'zustand';
import api from '../services/api';

export const useCurrencyStore = create((set, get) => ({
  currency: localStorage.getItem('rr_currency') || 'LKR',
  usdToLkr: 310.0,
  isLoading: false,

  setCurrency: (newCurrency) => {
    localStorage.setItem('rr_currency', newCurrency);
    set({ currency: newCurrency });
  },

  fetchRates: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/currency/rate');
      if (res?.data?.usdToLkr) {
        set({ usdToLkr: res.data.usdToLkr });
      }
    } catch {
      // Keep default 310 fallback silently
    } finally {
      set({ isLoading: false });
    }
  },

  // Convert amount in LKR to current active currency
  convertPrice: (amountLKR) => {
    if (!amountLKR || isNaN(amountLKR)) return 0;
    const { currency, usdToLkr } = get();
    if (currency === 'USD') {
      return Number((amountLKR / usdToLkr).toFixed(2));
    }
    return Math.round(amountLKR);
  },

  // Format price string with symbol and tabular typography
  formatPrice: (amountLKR) => {
    if (amountLKR === null || amountLKR === undefined || isNaN(amountLKR)) return '—';
    const { currency, usdToLkr } = get();
    if (currency === 'USD') {
      const val = amountLKR / usdToLkr;
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `LKR ${Math.round(amountLKR).toLocaleString('en-US')}`;
  },
}));
