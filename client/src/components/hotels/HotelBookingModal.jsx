/**
 * Royal Rides — Hotel Booking Modal Flow
 * Room selection, calendar dates, seasonal discount calculation,
 * guest details, and voucher confirmation.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Hotel,
  Calendar,
  Users,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Printer,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useCurrencyStore } from '../../store/useCurrencyStore';

export default function HotelBookingModal({ hotel, selectedRoom, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const { currency, formatPrice } = useCurrencyStore();

  const [activeRoomId, setActiveRoomId] = useState(
    selectedRoom?._id || hotel?.rooms?.[0]?._id
  );
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [promoCode, setPromoCode] = useState('');
  const [guestName, setGuestName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [quote, setQuote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch dynamic price quote
  useEffect(() => {
    let isMounted = true;
    const fetchQuote = async () => {
      if (!hotel?._id || !activeRoomId) return;
      try {
        const res = await api.post('/hotels/calculate-quote', {
          hotelId: hotel._id,
          roomTypeId: activeRoomId,
          checkIn,
          checkOut,
          rooms,
          guests,
          promoCode,
          currency,
        });
        if (isMounted && res.data) {
          setQuote(res.data);
        }
      } catch (err) {
        console.error('Hotel quote error', err);
      }
    };

    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [hotel?._id, activeRoomId, checkIn, checkOut, rooms, guests, promoCode, currency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/hotel-bookings', {
        hotelId: hotel._id,
        roomTypeId: activeRoomId,
        checkIn,
        checkOut,
        rooms,
        guests,
        promoCode,
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
      setErrorMessage(err?.message || 'Failed to complete hotel reservation');
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
              Resort & Villa Reservation
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold">{hotel?.name}</h3>
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
          /* Confirmation Receipt */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-600 font-bold">
                Reservation Confirmed
              </span>
              <h3 className="font-serif text-3xl font-bold text-navy mt-1">
                Luxury Stay Reserved
              </h3>
              <p className="text-xs text-content-body mt-2 max-w-md mx-auto">
                Your confirmation voucher has been emailed to{' '}
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
                <span className="text-content-muted">Hotel:</span>
                <span className="font-semibold text-navy">{hotel?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Room Type:</span>
                <span className="font-semibold text-navy">{confirmedBooking.room?.roomTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Duration:</span>
                <span className="font-semibold text-navy">{confirmedBooking.nights} Nights</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-navy/10 text-sm">
                <span className="font-bold text-navy">Total (Taxes & Fees Inc.):</span>
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

            {/* Room Type Selector */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                Select Suite / Room Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hotel?.rooms?.map((rm) => (
                  <button
                    type="button"
                    key={rm._id}
                    onClick={() => setActiveRoomId(rm._id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeRoomId === rm._id
                        ? 'border-gold bg-gold/5 shadow-sm'
                        : 'border-navy/10 bg-pearl/40 hover:border-navy/30'
                    }`}
                  >
                    <p className="font-bold text-navy text-xs">{rm.name}</p>
                    <p className="text-[11px] text-content-muted mt-0.5">
                      Max {rm.maxGuests} Guests • {rm.bedType} Bed
                    </p>
                    <p className="text-xs font-bold text-navy mt-1 tabular-nums">
                      {formatPrice(rm.pricePerNightLKR)} / night
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Check-In
                </label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Check-Out
                </label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Rooms & Guests
                </label>
                <div className="flex gap-2">
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                    className="flex-1 px-2.5 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
                  >
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3 Rooms</option>
                  </select>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="flex-1 px-2.5 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Primary guest"
                  className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
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
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
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
                  placeholder="+94 77 123 4567"
                  className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-xs text-navy"
                />
              </div>
            </div>

            {/* Promo code & Price Breakdown */}
            <div className="p-4 rounded-2xl bg-pearl border border-navy/10 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code (e.g. CEYLON10)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-navy/15 text-xs uppercase"
                />
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-navy text-gold text-xs font-semibold"
                >
                  Apply
                </button>
              </div>

              {quote && (
                <div className="pt-2 space-y-1.5 text-xs text-content-body">
                  <div className="flex justify-between">
                    <span>
                      Stay ({quote.nights} nights x {quote.rooms} room):
                    </span>
                    <span className="font-semibold tabular-nums">{formatPrice(quote.baseTotal)}</span>
                  </div>
                  {quote.seasonalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Seasonal Promo ({quote.promotionApplied || 'Promo'}):</span>
                      <span className="tabular-nums">-{formatPrice(quote.seasonalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-content-muted text-[11px]">
                    <span>Taxes & Service Charge ({quote.taxRate + quote.serviceChargeRate}%):</span>
                    <span className="tabular-nums">
                      {formatPrice(quote.taxAmount + quote.serviceChargeAmount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-navy/10 flex justify-between items-center text-sm font-bold text-navy">
                    <span>Total Cost:</span>
                    <span className="font-serif text-lg">{formatPrice(quote.totalLKR)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-premium disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm Hotel Reservation</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
