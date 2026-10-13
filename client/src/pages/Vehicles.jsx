/**
 * Royal Rides — Vehicles Catalog & Distance Calculator Page
 * Luxury vehicle cards, filtering by category/passengers/transmission,
 * interactive distance estimator modal, and instant booking flow.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Users,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  SlidersHorizontal,
  Heart,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';
import DistanceCalculatorModal from '../components/vehicles/DistanceCalculatorModal';
import VehicleBookingModal from '../components/vehicles/VehicleBookingModal';
import api from '../services/api';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useWishlistStore } from '../store/useWishlistStore';

const CATEGORIES = ['All', 'Car', 'Van', 'Luxury Passenger Unit', 'SUV', 'Bus'];

export default function Vehicles() {
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrencyStore();
  const { isSaved, toggleWishlist } = useWishlistStore();

  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [passengerFilter, setPassengerFilter] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState('');
  const [withDriverOnly, setWithDriverOnly] = useState(searchParams.get('withDriver') === 'true');
  const [sortBy, setSortBy] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Modals
  const [calcVehicle, setCalcVehicle] = useState(null);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [bookingInitialData, setBookingInitialData] = useState({});

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const queryParams = new URLSearchParams();
    if (selectedCategory !== 'All') queryParams.set('category', selectedCategory);
    if (passengerFilter) queryParams.set('passengers', passengerFilter);
    if (transmissionFilter) queryParams.set('transmission', transmissionFilter);
    if (withDriverOnly) queryParams.set('withDriver', 'true');
    if (searchQuery) queryParams.set('search', searchQuery);
    if (sortBy === 'price_asc') queryParams.set('sort', 'price_asc');
    if (sortBy === 'price_desc') queryParams.set('sort', 'price_desc');

    api.get(`/vehicles?${queryParams.toString()}`)
      .then((res) => {
        if (isMounted) {
          if (res?.data && res.data.length > 0) {
            setVehicles(res.data);
          } else {
            // Fallback sample data if empty
            setVehicles(getFallbackVehicles());
          }
        }
      })
      .catch(() => {
        if (isMounted) setVehicles(getFallbackVehicles());
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, passengerFilter, transmissionFilter, withDriverOnly, sortBy, searchQuery]);

  const handleLaunchBooking = (veh, initial = {}) => {
    setBookingVehicle(veh);
    setBookingInitialData(initial);
    setCalcVehicle(null);
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold">
          The Sovereign Fleet
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy">
          Luxury Cars, Executive Vans & Chauffeur Units
        </h1>
        <p className="text-sm sm:text-base text-content-body leading-relaxed">
          Traverse emerald mountains and sun-drenched coastal highways with dedicated chauffeurs,
          pristine climate control, and transparent per-kilometer pricing.
        </p>
      </div>

      {/* ── Filter & Search Control Bar ────────────────────────────────────── */}
      <div className="glass-panel p-5 rounded-3xl border border-navy/10 shadow-soft space-y-4">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-navy text-gold shadow-md'
                  : 'bg-pearl text-navy-800 hover:bg-navy/5'
              }`}
            >
              {cat === 'All' ? 'All Vehicles' : cat}
            </button>
          ))}
        </div>

        {/* Detailed Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-navy/10 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
              Search Model / Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Mercedes, HiAce, Prado..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
              />
              <Search className="w-3.5 h-3.5 text-navy-600 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
              Passenger Capacity
            </label>
            <select
              value={passengerFilter}
              onChange={(e) => setPassengerFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
            >
              <option value="">Any Capacity</option>
              <option value="2">2+ Passengers</option>
              <option value="4">4+ Passengers</option>
              <option value="7">7+ Passengers (Groups / Vans)</option>
              <option value="12">12+ Passengers (VIP Mini-Coaches)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
              Transmission
            </label>
            <select
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
            >
              <option value="">All Transmissions</option>
              <option value="Automatic">Automatic Only</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Vehicle Cards Grid ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-3xl skeleton-shimmer" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl border border-navy/10 space-y-3">
          <Car className="w-12 h-12 text-gold mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-navy">No Matching Vehicles Found</h3>
          <p className="text-xs text-content-body">
            Please adjust your filters or contact our 24/7 concierge for custom fleet allocation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((veh) => (
            <motion.div
              key={veh._id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-3xl overflow-hidden border border-navy/10 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image & Badges */}
              <div className="relative h-60 overflow-hidden bg-pearl-200">
                <img
                  src={veh.images?.[0]?.url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'}
                  alt={veh.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-navy/85 backdrop-blur-md text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/30">
                  {veh.category}
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist('Vehicle', veh._id)}
                  aria-label={`Save ${veh.name} to wishlist`}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-navy hover:bg-white hover:text-red-500 transition-colors shadow-sm"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isSaved(veh._id) ? 'fill-red-500 text-red-500' : 'text-navy'
                    }`}
                  />
                </button>
              </div>

              {/* Specs & Rates */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-navy group-hover:text-gold transition-colors">
                    {veh.name}
                  </h3>
                  <p className="text-xs text-content-body mt-1 line-clamp-2">
                    {veh.description || `${veh.make} ${veh.model} (${veh.year || 2024}) tailored for VIP travel.`}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 mt-3 border-y border-navy/10 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-content-muted block uppercase">Seats</span>
                      <span className="font-bold text-navy">{veh.passengerCapacity} Persons</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-content-muted block uppercase">Gearbox</span>
                      <span className="font-bold text-navy">{veh.transmission}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-content-muted block uppercase">Per-KM</span>
                      <span className="font-bold text-gold tabular-nums">{formatPrice(veh.perKmRate)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-content-muted uppercase">Daily Rate</span>
                    <p className="font-serif text-2xl font-bold text-navy tabular-nums">
                      {formatPrice(veh.dailyRate)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCalcVehicle(veh)}
                      className="px-3.5 py-2.5 rounded-xl border border-navy/20 text-xs font-bold text-navy hover:bg-navy hover:text-white transition-colors flex items-center gap-1.5"
                      title="Calculate journey cost by distance"
                    >
                      <Navigation className="w-3.5 h-3.5 text-gold" />
                      <span>Estimate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLaunchBooking(veh)}
                      className="btn-gold px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm"
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Distance Calculator Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {calcVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/75 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-xl">
              <button
                type="button"
                onClick={() => setCalcVehicle(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-navy/10 hover:bg-navy/20 flex items-center justify-center"
              >
                ✕
              </button>
              <DistanceCalculatorModal
                vehicle={calcVehicle}
                onProceedToBooking={(quoteData) => handleLaunchBooking(calcVehicle, quoteData)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Booking Modal Flow ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {bookingVehicle && (
          <VehicleBookingModal
            vehicle={bookingVehicle}
            initialData={bookingInitialData}
            onClose={() => setBookingVehicle(null)}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Fallback seed vehicles
function getFallbackVehicles() {
  return [
    {
      _id: 'v1',
      name: 'Mercedes-Benz E-Class Executive',
      make: 'Mercedes-Benz',
      model: 'E220d',
      year: 2024,
      category: 'Car',
      images: [{ url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80' }],
      passengerCapacity: 3,
      luggageCapacity: 3,
      transmission: 'Automatic',
      baseFee: 5000,
      dailyRate: 38000,
      perKmRate: 160,
      driverFeePerDay: 5000,
      withDriverAvailable: true,
      selfDriveAvailable: false,
    },
    {
      _id: 'v2',
      name: 'Toyota HiAce VIP Luxury Grand Cabin',
      make: 'Toyota',
      model: 'HiAce Commuter VIP',
      year: 2023,
      category: 'Van',
      images: [{ url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' }],
      passengerCapacity: 8,
      luggageCapacity: 8,
      transmission: 'Automatic',
      baseFee: 6000,
      dailyRate: 44000,
      perKmRate: 180,
      driverFeePerDay: 5000,
      withDriverAvailable: true,
      selfDriveAvailable: false,
    },
    {
      _id: 'v3',
      name: 'Toyota Land Cruiser Prado TXL 4x4',
      make: 'Toyota',
      model: 'Land Cruiser Prado',
      year: 2024,
      category: 'SUV',
      images: [{ url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80' }],
      passengerCapacity: 5,
      luggageCapacity: 5,
      transmission: 'Automatic',
      baseFee: 7500,
      dailyRate: 55000,
      perKmRate: 220,
      driverFeePerDay: 6000,
      withDriverAvailable: true,
      selfDriveAvailable: true,
    },
    {
      _id: 'v4',
      name: 'Mercedes-Benz Sprinter VIP Coach',
      make: 'Mercedes-Benz',
      model: 'Sprinter 519 CDI',
      year: 2023,
      category: 'Luxury Passenger Unit',
      images: [{ url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80' }],
      passengerCapacity: 14,
      luggageCapacity: 15,
      transmission: 'Automatic',
      baseFee: 12000,
      dailyRate: 75000,
      perKmRate: 280,
      driverFeePerDay: 7500,
      withDriverAvailable: true,
      selfDriveAvailable: false,
    },
    {
      _id: 'v5',
      name: 'Hyundai Staria Lounge Luxury 7-Seater',
      make: 'Hyundai',
      model: 'Staria Lounge',
      year: 2024,
      category: 'Van',
      images: [{ url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80' }],
      passengerCapacity: 6,
      luggageCapacity: 6,
      transmission: 'Automatic',
      baseFee: 6000,
      dailyRate: 46000,
      perKmRate: 190,
      driverFeePerDay: 5000,
      withDriverAvailable: true,
      selfDriveAvailable: true,
    },
    {
      _id: 'v6',
      name: 'Toyota Premier Coaster VIP Executive',
      make: 'Toyota',
      model: 'Coaster VIP',
      year: 2023,
      category: 'Bus',
      images: [{ url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' }],
      passengerCapacity: 22,
      luggageCapacity: 25,
      transmission: 'Manual',
      baseFee: 18000,
      dailyRate: 95000,
      perKmRate: 350,
      driverFeePerDay: 9000,
      withDriverAvailable: true,
      selfDriveAvailable: false,
    },
  ];
}
