/**
 * Royal Rides — Interactive Distance & Price Quote Calculator
 * Uses realistic Sri Lanka route distances or custom km input,
 * calls /api/v1/vehicles/calculate-quote for source-of-truth pricing,
 * and renders interactive cost breakdown.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import api from '../../services/api';
import { useCurrencyStore } from '../../store/useCurrencyStore';

// Preset popular Sri Lankan travel routes with accurate highway/coastal distances
export const POPULAR_ROUTES = [
  { from: 'Bandaranaike Airport (CMB)', to: 'Colombo Fort / Galle Face', km: 35 },
  { from: 'Bandaranaike Airport (CMB)', to: 'Galle / Unawatuna', km: 155 },
  { from: 'Bandaranaike Airport (CMB)', to: 'Kandy Cultural Capital', km: 105 },
  { from: 'Bandaranaike Airport (CMB)', to: 'Sigiriya Rock Fortress', km: 145 },
  { from: 'Colombo', to: 'Ella Highlands', km: 205 },
  { from: 'Colombo', to: 'Yala National Park', km: 260 },
  { from: 'Kandy', to: 'Nuwara Eliya Tea Country', km: 75 },
  { from: 'Galle', to: 'Mirissa Whale Harbor', km: 35 },
  { from: 'Nuwara Eliya', to: 'Ella Nine Arches Bridge', km: 55 },
];

export default function DistanceCalculatorModal({ vehicle, onProceedToBooking }) {
  const { currency, formatPrice } = useCurrencyStore();

  const [selectedRoute, setSelectedRoute] = useState(POPULAR_ROUTES[0]);
  const [customDistance, setCustomDistance] = useState(POPULAR_ROUTES[0].km);
  const [days, setDays] = useState(1);
  const [withDriver, setWithDriver] = useState(true);
  const [extras, setExtras] = useState({ childSeat: false, gps: false, wifi: false });

  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch server-calculated quote whenever parameters change
  useEffect(() => {
    let isMounted = true;
    const fetchQuote = async () => {
      if (!vehicle?._id) return;
      setIsLoading(true);
      try {
        const res = await api.post('/vehicles/calculate-quote', {
          vehicleId: vehicle._id,
          distanceKm: customDistance,
          days,
          withDriver,
          extras,
          currency,
        });
        if (isMounted && res.data) {
          setQuote(res.data);
        }
      } catch (err) {
        console.error('Quote error', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [vehicle?._id, customDistance, days, withDriver, extras, currency]);

  const handleRouteChange = (e) => {
    const route = POPULAR_ROUTES[parseInt(e.target.value, 10)];
    setSelectedRoute(route);
    setCustomDistance(route.km);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-navy/10 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-navy/10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Live Fare Estimator
          </span>
          <h3 className="font-serif text-2xl font-bold text-navy">
            Calculate Journey Rate
          </h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
          <Navigation className="w-5 h-5" />
        </div>
      </div>

      {/* Preset Route or Custom Km */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
            Select Popular Route
          </label>
          <select
            onChange={handleRouteChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-xs text-navy font-medium focus:outline-none focus:border-gold"
          >
            {POPULAR_ROUTES.map((r, idx) => (
              <option key={idx} value={idx}>
                {r.from} → {r.to} ({r.km} km)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2 flex justify-between">
            <span>Distance (Kilometers)</span>
            <span className="text-gold font-bold">{customDistance} km</span>
          </label>
          <input
            type="range"
            min="10"
            max="600"
            step="5"
            value={customDistance}
            onChange={(e) => setCustomDistance(Number(e.target.value))}
            className="w-full accent-gold cursor-pointer"
          />
        </div>
      </div>

      {/* Rental Days & Driver Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
            Rental Duration (Days)
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDays(Math.max(1, days - 1))}
              className="w-9 h-9 rounded-xl bg-pearl border border-navy/20 font-bold text-navy hover:bg-navy hover:text-white transition-colors"
            >
              -
            </button>
            <span className="font-serif text-lg font-bold text-navy px-3">{days} {days === 1 ? 'Day' : 'Days'}</span>
            <button
              type="button"
              onClick={() => setDays(days + 1)}
              className="w-9 h-9 rounded-xl bg-pearl border border-navy/20 font-bold text-navy hover:bg-navy hover:text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
            Chauffeur Option
          </label>
          <div className="flex bg-pearl p-1 rounded-xl border border-navy/15">
            <button
              type="button"
              onClick={() => setWithDriver(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                withDriver ? 'bg-navy text-gold shadow-sm' : 'text-navy-800'
              }`}
            >
              With Chauffeur
            </button>
            <button
              type="button"
              onClick={() => setWithDriver(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !withDriver ? 'bg-navy text-gold shadow-sm' : 'text-navy-800'
              }`}
            >
              Self Drive
            </button>
          </div>
        </div>
      </div>

      {/* Optional Amenities Checkboxes */}
      <div>
        <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
          Travel Extras
        </label>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-navy/10 bg-pearl/50 cursor-pointer hover:border-gold transition-colors">
            <input
              type="checkbox"
              checked={extras.wifi}
              onChange={(e) => setExtras({ ...extras, wifi: e.target.checked })}
              className="accent-gold rounded"
            />
            <span>High-Speed WiFi</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-navy/10 bg-pearl/50 cursor-pointer hover:border-gold transition-colors">
            <input
              type="checkbox"
              checked={extras.gps}
              onChange={(e) => setExtras({ ...extras, gps: e.target.checked })}
              className="accent-gold rounded"
            />
            <span>GPS Navigator</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-navy/10 bg-pearl/50 cursor-pointer hover:border-gold transition-colors">
            <input
              type="checkbox"
              checked={extras.childSeat}
              onChange={(e) => setExtras({ ...extras, childSeat: e.target.checked })}
              className="accent-gold rounded"
            />
            <span>Child Safety Seat</span>
          </label>
        </div>
      </div>

      {/* Live Server-Calculated Price Breakdown Box */}
      <div className="p-5 rounded-2xl bg-pearl border border-navy/10 space-y-3">
        <div className="flex items-center justify-between text-xs text-content-body">
          <span>Base Reservation Fee:</span>
          <span className="font-semibold tabular-nums">{formatPrice(quote?.baseFee || vehicle?.baseFee)}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-content-body">
          <span>Distance Charge ({customDistance} km @ {formatPrice(vehicle?.perKmRate)}/km):</span>
          <span className="font-semibold tabular-nums">{formatPrice(quote?.distanceCharge || 0)}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-content-body">
          <span>Daily Rental ({days} days @ {formatPrice(vehicle?.dailyRate)}/day):</span>
          <span className="font-semibold tabular-nums">{formatPrice(quote?.dailyRateCharge || 0)}</span>
        </div>

        {withDriver && (
          <div className="flex items-center justify-between text-xs text-content-body">
            <span>Chauffeur Fee ({days} days @ {formatPrice(vehicle?.driverFeePerDay)}/day):</span>
            <span className="font-semibold tabular-nums">{formatPrice(quote?.driverFee || 0)}</span>
          </div>
        )}

        {quote?.extrasCharge > 0 && (
          <div className="flex items-center justify-between text-xs text-content-body">
            <span>Selected Extras:</span>
            <span className="font-semibold tabular-nums">{formatPrice(quote.extrasCharge)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-navy/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-navy">
              Estimated Total
            </span>
            <p className="text-[11px] text-content-muted">Includes fuel, insurance & airport tolls</p>
          </div>
          <div className="text-right">
            <span className="font-serif text-2xl font-bold text-navy tabular-nums">
              {formatPrice(quote?.totalLKR || 0)}
            </span>
            {currency === 'USD' && (
              <span className="block text-[10px] text-content-muted">
                (Equivalent to LKR {Math.round(quote?.totalLKR || 0).toLocaleString()})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => onProceedToBooking && onProceedToBooking({
          pickup: selectedRoute.from,
          dropoff: selectedRoute.to,
          distanceKm: customDistance,
          days,
          withDriver,
          extras,
          quote,
        })}
        className="btn-gold w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-premium"
      >
        <span>Reserve {vehicle?.name}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
