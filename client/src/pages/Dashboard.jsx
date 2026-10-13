/**
 * Royal Rides — User Dashboard Page
 * Tabs: My Reservations (Vehicles, Hotels, Packages), Saved Wishlist, Profile Settings.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Car,
  Hotel,
  Compass,
  Heart,
  User,
  Clock,
  Printer,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useWishlistStore } from '../store/useWishlistStore';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { formatPrice } = useCurrencyStore();
  const { savedIds } = useWishlistStore();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'bookings');
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);

  // Profile update state
  const [profileName, setProfileName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard');
      return;
    }

    const fetchAllBookings = async () => {
      setIsLoading(true);
      try {
        const [vh, ht, pk] = await Promise.all([
          api.get('/vehicle-bookings/my-bookings').catch(() => ({ data: [] })),
          api.get('/hotel-bookings/my-bookings').catch(() => ({ data: [] })),
          api.get('/package-bookings/my-bookings').catch(() => ({ data: [] })),
        ]);
        setVehicleBookings(vh.data || []);
        setHotelBookings(ht.data || []);
        setPackageBookings(pk.data || []);
      } catch (err) {
        console.error('Error fetching bookings', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBookings();
  }, [isAuthenticated, navigate]);

  const handleCancelBooking = async (type, id) => {
    try {
      let endpoint = `/vehicle-bookings/${id}/cancel`;
      if (type === 'Hotel') endpoint = `/hotel-bookings/${id}/cancel`;
      if (type === 'Package') endpoint = `/package-bookings/${id}/cancel`;

      await api.patch(endpoint, { cancellationReason: 'Cancelled by customer via dashboard' });

      // Refresh list
      if (type === 'Vehicle') {
        setVehicleBookings(vehicleBookings.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
      } else if (type === 'Hotel') {
        setHotelBookings(hotelBookings.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
      } else {
        setPackageBookings(packageBookings.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
      }
      setCancelModalBooking(null);
    } catch (err) {
      alert('Unable to cancel booking: ' + (err?.message || 'Error'));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-pearl-200 text-navy text-[11px] font-bold uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* ── User Welcome Header ────────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-navy/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-navy text-gold font-serif text-2xl font-bold flex items-center justify-center border border-gold/40 shadow-md">
            {user?.firstName?.[0] || 'R'}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold">
              Royal Rides Sovereign Member
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
              Ayubowan, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-xs text-content-body">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'bg-navy text-gold shadow-sm'
                : 'bg-pearl text-navy hover:bg-navy/5'
            }`}
          >
            My Reservations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-navy text-gold shadow-sm'
                : 'bg-pearl text-navy hover:bg-navy/5'
            }`}
          >
            Profile Details
          </button>
        </div>
      </div>

      {/* ── BOOKINGS TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-navy">
            Your Island Itineraries
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          ) : vehicleBookings.length === 0 && hotelBookings.length === 0 && packageBookings.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-3xl border border-navy/10 space-y-4">
              <Calendar className="w-12 h-12 text-gold mx-auto" />
              <h3 className="font-serif text-xl font-bold text-navy">No Active Reservations</h3>
              <p className="text-xs text-content-body max-w-sm mx-auto">
                You haven't reserved any vehicles, hotels, or packages yet. Explore our luxury fleet to get started.
              </p>
              <button
                type="button"
                onClick={() => navigate('/vehicles')}
                className="btn-gold px-6 py-2.5 rounded-xl text-xs font-bold"
              >
                Browse Sovereign Fleet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vehicle Bookings */}
              {vehicleBookings.map((b) => (
                <div
                  key={b._id}
                  className="glass-card p-6 rounded-2xl border border-navy/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center shrink-0">
                      <Car className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-navy bg-gold/20 px-2 py-0.5 rounded">
                          {b.bookingRef}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>
                      <h4 className="font-serif text-lg font-bold text-navy mt-1">
                        {b.vehicle?.name || 'Chauffeur Vehicle'}
                      </h4>
                      <p className="text-xs text-content-muted mt-0.5">
                        {b.pickupLocation?.address} → {b.dropoffLocation?.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-content-muted uppercase">Total Paid / Due</span>
                      <p className="font-serif text-lg font-bold text-navy tabular-nums">
                        {formatPrice(b.priceBreakdown?.totalLKR)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-2 rounded-xl border border-navy/20 hover:bg-navy/5 text-navy"
                      title="Print Voucher"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {b.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking('Vehicle', b._id)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-xs text-red-600 hover:bg-red-50 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Hotel Bookings */}
              {hotelBookings.map((b) => (
                <div
                  key={b._id}
                  className="glass-card p-6 rounded-2xl border border-navy/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center shrink-0">
                      <Hotel className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-navy bg-gold/20 px-2 py-0.5 rounded">
                          {b.bookingRef}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>
                      <h4 className="font-serif text-lg font-bold text-navy mt-1">
                        {b.hotel?.name || 'Hotel Stay'} — {b.room?.roomTypeName}
                      </h4>
                      <p className="text-xs text-content-muted mt-0.5">
                        {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()} ({b.nights} Nights)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-content-muted uppercase">Total Stay</span>
                      <p className="font-serif text-lg font-bold text-navy tabular-nums">
                        {formatPrice(b.priceBreakdown?.totalLKR)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-2 rounded-xl border border-navy/20 hover:bg-navy/5 text-navy"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {b.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking('Hotel', b._id)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-xs text-red-600 hover:bg-red-50 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Package Bookings */}
              {packageBookings.map((b) => (
                <div
                  key={b._id}
                  className="glass-card p-6 rounded-2xl border border-navy/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center shrink-0">
                      <Compass className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-navy bg-gold/20 px-2 py-0.5 rounded">
                          {b.bookingRef}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>
                      <h4 className="font-serif text-lg font-bold text-navy mt-1">
                        {b.package?.name || 'Travel Package Tour'}
                      </h4>
                      <p className="text-xs text-content-muted mt-0.5">
                        Departing {new Date(b.startDate).toLocaleDateString()} • {b.groupSize} Travelers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-content-muted uppercase">Package Total</span>
                      <p className="font-serif text-lg font-bold text-navy tabular-nums">
                        {formatPrice(b.priceBreakdown?.totalLKR)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-2 rounded-xl border border-navy/20 hover:bg-navy/5 text-navy"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {b.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking('Package', b._id)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-xs text-red-600 hover:bg-red-50 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="max-w-xl glass-card p-8 rounded-3xl border border-navy/10 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-navy">Member Profile</h2>

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
              {profileSuccess}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-pearl/40 border border-navy/10 text-content-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
              />
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const parts = profileName.split(' ');
                  await api.put('/users/me', {
                    firstName: parts[0] || '',
                    lastName: parts.slice(1).join(' ') || '',
                    phone: profilePhone,
                  });
                  setProfileSuccess('Profile saved successfully');
                } catch {
                  setProfileSuccess('Failed to update profile');
                }
              }}
              className="btn-gold px-6 py-2.5 rounded-xl text-xs font-bold"
            >
              Save Profile Updates
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
