/**
 * Royal Rides — Currency Switcher Component
 * Animated switch between Sri Lankan Rupee (LKR) and US Dollar (USD)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useCurrencyStore } from '../../store/useCurrencyStore';

export default function CurrencySwitcher({ className = '' }) {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <div
      className={`relative inline-flex items-center p-1 rounded-full bg-navy/5 border border-navy/10 backdrop-blur-md ${className}`}
    >
      <button
        type="button"
        onClick={() => setCurrency('LKR')}
        className={`relative px-2.5 py-1 text-xs font-semibold rounded-full transition-colors z-10 ${
          currency === 'LKR' ? 'text-white' : 'text-navy-800 hover:text-navy-950'
        }`}
      >
        LKR
      </button>

      <button
        type="button"
        onClick={() => setCurrency('USD')}
        className={`relative px-2.5 py-1 text-xs font-semibold rounded-full transition-colors z-10 ${
          currency === 'USD' ? 'text-white' : 'text-navy-800 hover:text-navy-950'
        }`}
      >
        USD
      </button>

      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="absolute top-1 bottom-1 rounded-full bg-navy shadow-sm"
        style={{
          left: currency === 'LKR' ? '4px' : 'calc(50% + 1px)',
          width: 'calc(50% - 5px)',
        }}
      />
    </div>
  );
}
