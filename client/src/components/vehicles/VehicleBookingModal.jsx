/**
 * Royal Rides — Multi-Step Vehicle Booking Modal Flow
 * Step 1: Trip & Route Details
 * Step 2: Extras & Preferences
 * Step 3: Guest / Traveler Information
 * Step 4: Confirmation & Receipt Card with Booking Reference ID
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Car,
  Calendar,
  MapPin,
  ShieldCheck,
  User,
  Phone,
  Mail,
  FileText,
  Printer,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useCurrencyStore } from '../../store/useCurrencyStore';

export default function VehicleBookingModal({ vehicle, initialData = {}, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const { currency, formatPrice } = useCurrencyStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    pickupLocation: initialData.pickup || 'Bandaranaike International Airport (CMB)',
    dropoffLocation: initialData.dropoff || 'Colombo Fort / Galle Face',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * (initialData.days || 1)).toISOString().split('T')[0],
    rentalType: initialData.withDriver !== false ? 'with_driver' : 'self_drive',
    passengerCount: 2,
    estimatedDistanceKm: initialData.distanceKm || 35,
    extras: initialData.extras || { childSeat: false, gps: false, wifi: false },
    specialRequests: '',
    guestName: user ? `${user.firstName} ${user.lastName}` : '',
    guestEmail: user?.email || '',
    guestPhone: user?.phone || '',
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        vehicleId: vehicle._id,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        startDate: formData.startDate,
        endDate: formData.endDate,
        rentalType: formData.rentalType,
        driverRequested: formData.rentalType === 'with_driver',
        passengerCount: formData.passengerCount,
        estimatedDistanceKm: formData.estimatedDistanceKm,
        extras: formData.extras,
        specialRequests: formData.specialRequests,
        guestInfo: {
          name: formData.guestName,
          email: formData.guestEmail,
          phone: formData.guestPhone,
        },
        currency,
      };

      const res = await api.post('/vehicle-bookings', payload);
      setConfirmedBooking(res.data);
      setStep(4); // Success step
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to complete booking. Please try again.');
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
        {/* Header */}
        <div className="bg-navy p-6 text-white flex items-center justify-between border-b border-gold/30">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
              Chauffeur & Fleet Reservation
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold">
              {vehicle?.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 py-4 bg-pearl border-b border-navy/10 flex items-center justify-between text-xs font-semibold">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-navy font-bold' : 'text-content-muted'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-gold text-navy' : 'bg-navy/10'}`}>
                1
              </div>
              <span>Trip Route</span>
            </div>
            <div className="w-10 h-0.5 bg-navy/10" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-navy font-bold' : 'text-content-muted'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-gold text-navy' : 'bg-navy/10'}`}>
                2
              </div>
              <span>Extras</span>
            </div>
            <div className="w-10 h-0.5 bg-navy/10" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-navy font-bold' : 'text-content-muted'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-gold text-navy' : 'bg-navy/10'}`}>
                3
              </div>
              <span>Contact</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="m-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* ── STEP 1: ROUTE & DATES ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Pickup Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                  placeholder="e.g. Bandaranaike Intl Airport"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Drop-off Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.dropoffLocation}
                  onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                  placeholder="e.g. Galle Fort"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Rental Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Rental Return Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="btn-gold px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: EXTRAS & PREFERENCES ──────────────────────────────────── */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
              Select Amenities & Add-ons
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-navy/10 bg-pearl/40 cursor-pointer">
                <span className="text-xs font-medium text-navy">High-Speed 4G/5G In-Vehicle WiFi</span>
                <input
                  type="checkbox"
                  checked={formData.extras.wifi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      extras: { ...formData.extras, wifi: e.target.checked },
                    })
                  }
                  className="accent-gold w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-navy/10 bg-pearl/40 cursor-pointer">
                <span className="text-xs font-medium text-navy">Child Safety Seat / Booster</span>
                <input
                  type="checkbox"
                  checked={formData.extras.childSeat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      extras: { ...formData.extras, childSeat: e.target.checked },
                    })
                  }
                  className="accent-gold w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-navy/10 bg-pearl/40 cursor-pointer">
                <span className="text-xs font-medium text-navy">Dedicated GPS Navigation System</span>
                <input
                  type="checkbox"
                  checked={formData.extras.gps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      extras: { ...formData.extras, gps: e.target.checked },
                    })
                  }
                  className="accent-gold w-4 h-4"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                Special Flight or Trip Instructions
              </label>
              <textarea
                rows="3"
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Flight number, hotel entrance, child ages, extra luggage notes..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-navy hover:bg-navy/5 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="btn-gold px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: CUSTOMER CONTACT ──────────────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                  placeholder="e.g. Jonathan Edwards"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Email Address (for confirmation)
                </label>
                <input
                  type="email"
                  required
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                  placeholder="jonathan@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-pearl border border-navy/10 text-xs text-content-body flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free cancellation up to 48 hours prior to pickup. No prepayment required.</span>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-navy hover:bg-navy/5 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-premium disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Reservation...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4: SUCCESS RECEIPT CARD ──────────────────────────────────── */}
        {step === 4 && confirmedBooking && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-600 font-bold">
                Reservation Confirmed
              </span>
              <h3 className="font-serif text-3xl font-bold text-navy mt-1">
                Ayubowan! You're All Set
              </h3>
              <p className="text-xs text-content-body mt-2 max-w-md mx-auto">
                A confirmation voucher and chauffeur contact details have been dispatched to{' '}
                <strong className="text-navy">{formData.guestEmail}</strong>.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="p-5 rounded-2xl bg-pearl border border-navy/15 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-navy/10">
                <span className="text-content-muted">Booking Reference:</span>
                <span className="font-mono font-bold text-navy text-sm bg-gold/20 px-2 py-0.5 rounded">
                  {confirmedBooking.bookingRef}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-content-muted">Vehicle:</span>
                <span className="font-semibold text-navy">{vehicle?.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-content-muted">Pickup Location:</span>
                <span className="font-semibold text-navy">{confirmedBooking.pickupLocation?.address}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-content-muted">Drop-off Destination:</span>
                <span className="font-semibold text-navy">{confirmedBooking.dropoffLocation?.address}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-navy/10 text-sm">
                <span className="font-bold text-navy">Total Amount:</span>
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
                className="btn-navy px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                Return to Exploration
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
