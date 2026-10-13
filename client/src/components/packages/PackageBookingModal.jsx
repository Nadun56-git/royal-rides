/**
 * Royal Rides — Package Booking Modal Flow
 * Guide allocation, group size auto discount, date selection,
 * and voucher receipt.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Compass,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  Printer,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useCurrencyStore } from '../../store/useCurrencyStore';

export default function PackageBookingModal({ pkg, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const { currency, formatPrice } = useCurrencyStore();

  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [groupSize, setGroupSize] = useState(2);
  const [tourGuideId, setTourGuideId] = useState('');
  const [availableGuides, setAvailableGuides] = useState([]);
  const [guestName, setGuestName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [quote, setQuote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch tour guides
  useEffect(() => {
    api.get('/tour-guides')
      .then((res) => {
        if (res?.data) setAvailableGuides(res.data);
      })
      .catch(() => {});
  }, []);

  // Fetch quote dynamically
  useEffect(() => {
    let isMounted = true;
    const fetchQuote = async () => {
      if (!pkg?._id) return;
      try {
        const res = await api.post('/packages/calculate-quote', {
          packageId: pkg._id,
          groupSize,
          tourGuideId: tourGuideId || undefined,
          startDate,
          currency,
        });
        if (isMounted && res.data) {
          setQuote(res.data);
        }
      } catch (err) {
        console.error('Package quote error', err);
      }
    };

    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [pkg?._id, groupSize, tourGuideId, startDate, currency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/package-bookings', {
        packageId: pkg._id,
        startDate,
        groupSize,
        tourGuideId: tourGuideId || null,
        specialRequests,
        guestInfo: {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
        },
        currency,
      });

      setConfirmedBooking(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to confirm tour booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-elevated border border-navy/10 overflow-hidden my-8"
      >
        <div className="bg-navy p-6 text-white flex items-center justify-between border-b border-gold/30">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
              Bespoke Tour Booking
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold">{pkg?.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-600 font-bold">
                Tour Reserved Successfully
              </span>
              <h3 className="font-serif text-3xl font-bold text-navy mt-1">
                Your Odyssey Awaits
              </h3>
              <p className="text-xs text-content-body mt-2 max-w-md mx-auto">
                Full travel itinerary and concierge contact dispatched to{' '}
                <strong className="text-navy">{guestEmail}</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-pearl border border-navy/15 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-navy/10">
                <span className="text-content-muted">Booking Reference:</span>
                <span className="font-mono font-bold text-navy text-sm bg-gold/20 px-2 py-0.5 rounded">
                  {confirmedBooking.bookingRef}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Package:</span>
                <span className="font-semibold text-navy">{pkg?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Duration:</span>
                <span className="font-semibold text-navy">{pkg?.durationDays} Days / {pkg?.durationNights} Nights</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Group Size:</span>
                <span className="font-semibold text-navy">{confirmedBooking.groupSize} Travelers</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-navy/10 text-sm">
                <span className="font-bold text-navy">Total (All In):</span>
                <span className="font-serif font-bold text-navy text-base">
                  {formatPrice(confirmedBooking.priceBreakdown?.totalLKR)}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-navy/20 text-xs font-semibold text-navy hover:bg-navy/5 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-navy px-6 py-2.5 rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{errorMessage}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Tour Departure Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Number of Travelers
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={groupSize}
                    onChange={(e) => setGroupSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Traveler (Solo)' : `Travelers ${n >= 5 ? '(10% Group Discount)' : ''}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tour Guide Allocation */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-gold" /> Licensed National Tour Guide
              </label>
              <select
                value={tourGuideId}
                onChange={(e) => setTourGuideId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
              >
                <option value="">No Guide / Self Guided Expedition</option>
                {availableGuides.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name} — {g.languages?.map((l) => l.language).join(', ')} ({formatPrice(g.dailyRateLKR)}/day)
                  </option>
                ))}
              </select>
            </div>

            {/* Guest details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Lead Traveler Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
                  placeholder="Primary guest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
                  placeholder="name@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            {quote && (
              <div className="p-4 rounded-2xl bg-pearl border border-navy/10 space-y-1.5 text-xs text-content-body">
                <div className="flex justify-between">
                  <span>
                    Base Tour ({quote.groupSize} persons @ {formatPrice(quote.basePricePerPersonLKR)}):
                  </span>
                  <span className="font-semibold tabular-nums">{formatPrice(quote.baseTotal)}</span>
                </div>

                {quote.groupDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Group Discount ({quote.groupDiscountPercent}% off):</span>
                    <span className="tabular-nums">-{formatPrice(quote.groupDiscount)}</span>
                  </div>
                )}

                {quote.guideFeeTotal > 0 && (
                  <div className="flex justify-between">
                    <span>
                      Chauffeur Guide ({quote.guideDays} days @ {formatPrice(quote.guideDailyRate)}):
                    </span>
                    <span className="font-semibold tabular-nums">{formatPrice(quote.guideFeeTotal)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-navy/10 flex justify-between items-center text-sm font-bold text-navy">
                  <div>
                    <span>Total Package Cost:</span>
                    <span className="block text-[10px] text-content-muted font-normal">
                      ({formatPrice(quote.pricePerPersonLKR)} per person)
                    </span>
                  </div>
                  <span className="font-serif text-lg">{formatPrice(quote.totalLKR)}</span>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-premium disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm Tour Reservation</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
