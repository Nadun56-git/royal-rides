/**
 * Royal Rides — Hotels & Resorts Catalog Page
 * Boutique coastal villas, colonial hill country tea bungalows,
 * search & filter by amenities/city/stars, and direct room booking modal.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel,
  MapPin,
  Star,
  Wifi,
  Waves,
  Sparkles,
  Heart,
  Search,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import HotelBookingModal from '../components/hotels/HotelBookingModal';
import api from '../services/api';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useWishlistStore } from '../store/useWishlistStore';

const CITIES = ['All', 'Galle', 'Sigiriya', 'Ella', 'Nuwara Eliya', 'Colombo', 'Yala', 'Mirissa'];

export default function Hotels() {
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrencyStore();
  const { isSaved, toggleWishlist } = useWishlistStore();

  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All');
  const [starRating, setStarRating] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingHotel, setBookingHotel] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const queryParams = new URLSearchParams();
    if (selectedCity !== 'All') queryParams.set('city', selectedCity);
    if (starRating) queryParams.set('starRating', starRating);
    if (searchQuery) queryParams.set('search', searchQuery);

    api.get(`/hotels?${queryParams.toString()}`)
      .then((res) => {
        if (isMounted) {
          if (res?.data && res.data.length > 0) {
            setHotels(res.data);
          } else {
            setHotels(getFallbackHotels());
          }
        }
      })
      .catch(() => {
        if (isMounted) setHotels(getFallbackHotels());
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCity, starRating, searchQuery]);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold">
          Exclusive Sanctuaries
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy">
          Boutique Hotels, Colonial Tea Bungalows & Ocean Villas
        </h1>
        <p className="text-sm sm:text-base text-content-body leading-relaxed">
          Unwind in handpicked Sri Lankan luxury havens with seasonal promotional rates,
          transparent cancellation terms, and verified guest reviews.
        </p>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="glass-panel p-5 rounded-3xl border border-navy/10 shadow-soft space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CITIES.map((city) => (
            <button
              type="button"
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCity === city
                  ? 'bg-navy text-gold shadow-md'
                  : 'bg-pearl text-navy-800 hover:bg-navy/5'
              }`}
            >
              {city === 'All' ? 'All Island Regions' : city}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-navy/10 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
              Search Hotel Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Amangalla, Jetwing, Tea Trails..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
              />
              <Search className="w-3.5 h-3.5 text-navy-600 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
              Star Rating
            </label>
            <select
              value={starRating}
              onChange={(e) => setStarRating(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
            >
              <option value="">All Star Categories</option>
              <option value="5">5-Star Luxury Resplendence</option>
              <option value="4">4-Star Boutique Premium</option>
              <option value="3">3-Star Heritage Charm</option>
            </select>
          </div>

          <div className="flex items-end">
            <span className="text-[11px] text-content-muted">
              ✨ Seasonal promotional discounts auto-applied at checkout
            </span>
          </div>
        </div>
      </div>

      {/* ── Hotels Grid ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-3xl skeleton-shimmer" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl border border-navy/10 space-y-3">
          <Hotel className="w-12 h-12 text-gold mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-navy">No Hotels Found</h3>
          <p className="text-xs text-content-body">
            Please adjust your search criteria or contact our concierge for bespoke lodging options.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((htl) => {
            const minRoomPrice =
              htl.rooms?.length > 0
                ? Math.min(...htl.rooms.map((r) => r.pricePerNightLKR))
                : 45000;

            return (
              <motion.div
                key={htl._id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-3xl overflow-hidden border border-navy/10 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Cover Image & Badges */}
                <div className="relative h-60 overflow-hidden bg-pearl-200">
                  <img
                    src={htl.coverImage || htl.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
                    alt={htl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-navy/85 backdrop-blur-md text-gold text-[10px] font-bold flex items-center gap-1 border border-gold/30">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    <span>{htl.starRating}-Star Luxury</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWishlist('Hotel', htl._id)}
                    aria-label={`Save ${htl.name} to wishlist`}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-navy hover:bg-white hover:text-red-500 transition-colors shadow-sm"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isSaved(htl._id) ? 'fill-red-500 text-red-500' : 'text-navy'
                      }`}
                    />
                  </button>
                </div>

                {/* Hotel Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gold font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{htl.city}, Sri Lanka</span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-navy group-hover:text-gold transition-colors">
                      {htl.name}
                    </h3>

                    <p className="text-xs text-content-body mt-2 line-clamp-2 leading-relaxed">
                      {htl.shortDescription || htl.description}
                    </p>

                    {/* Amenities Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {htl.amenities?.slice(0, 4).map((am) => (
                        <span
                          key={am}
                          className="px-2 py-0.5 rounded-md bg-pearl text-[10px] font-medium text-navy-800 border border-navy/10"
                        >
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Booking CTA */}
                  <div className="pt-4 border-t border-navy/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-content-muted uppercase">Starting from</span>
                      <p className="font-serif text-2xl font-bold text-navy tabular-nums">
                        {formatPrice(minRoomPrice)}
                        <span className="text-xs font-sans text-content-muted font-normal"> / night</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingHotel(htl)}
                      className="btn-gold px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
                    >
                      Book Room
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Hotel Booking Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {bookingHotel && (
          <HotelBookingModal
            hotel={bookingHotel}
            onClose={() => setBookingHotel(null)}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Fallback seed hotels
function getFallbackHotels() {
  return [
    {
      _id: 'h1',
      name: 'Amangalla Historic Fortress Manor',
      city: 'Galle',
      starRating: 5,
      coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      shortDescription: '17th-century Dutch colonial sanctuary with four-poster beds, vintage verandas, and Ayurveda baths.',
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Room Service'],
      rooms: [
        { _id: 'r1', name: 'Chamber Suite', maxGuests: 2, bedType: 'King', pricePerNightLKR: 85000, isActive: true },
        { _id: 'r2', name: 'Verandah Suite', maxGuests: 3, bedType: 'King', pricePerNightLKR: 120000, isActive: true },
      ],
      taxRate: 10,
      serviceCharge: 10,
      cancellationPolicy: { freeCancellationDays: 3 },
      isActive: true,
    },
    {
      _id: 'h2',
      name: 'Ceylon Tea Trails Dunkeld Bungalow',
      city: 'Nuwara Eliya',
      starRating: 5,
      coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      shortDescription: 'Perched high above Castlereagh Lake amidst misty emerald tea slopes with private butler service.',
      amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa', 'Yoga'],
      rooms: [
        { _id: 'r3', name: 'Master Lake Suite', maxGuests: 2, bedType: 'King', pricePerNightLKR: 145000, isActive: true },
        { _id: 'r4', name: 'Garden Cottage', maxGuests: 4, bedType: 'Double', pricePerNightLKR: 195000, isActive: true },
      ],
      taxRate: 10,
      serviceCharge: 10,
      cancellationPolicy: { freeCancellationDays: 5 },
      isActive: true,
    },
    {
      _id: 'h3',
      name: 'Water Garden Sigiriya Royal Enclave',
      city: 'Sigiriya',
      starRating: 5,
      coverImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
      shortDescription: 'Surrounded by water canals, lotus ponds, and sweeping direct panoramas of the Sigiriya Rock Citadel.',
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar'],
      rooms: [
        { _id: 'r5', name: 'Deluxe Water Villa', maxGuests: 2, bedType: 'King', pricePerNightLKR: 72000, isActive: true },
        { _id: 'r6', name: 'Duplex Pool Villa', maxGuests: 4, bedType: 'King', pricePerNightLKR: 115000, isActive: true },
      ],
      taxRate: 10,
      serviceCharge: 10,
      cancellationPolicy: { freeCancellationDays: 3 },
      isActive: true,
    },
    {
      _id: 'h4',
      name: 'Wild Coast Tented Lodge Yala',
      city: 'Yala',
      starRating: 5,
      coverImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      shortDescription: 'Luxury cocoon suites where the wild leopard wilderness meets the crashing waves of the Indian Ocean.',
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar'],
      rooms: [
        { _id: 'r7', name: 'Cocoon Suite', maxGuests: 2, bedType: 'King', pricePerNightLKR: 165000, isActive: true },
      ],
      taxRate: 10,
      serviceCharge: 10,
      cancellationPolicy: { freeCancellationDays: 7 },
      isActive: true,
    },
    {
      _id: 'h5',
      name: '98 Acres Resort & Spa Ella',
      city: 'Ella',
      starRating: 4,
      coverImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      shortDescription: 'Eco-luxury chalets made of recycled timber overlooking Little Adams Peak and Ella Gap clouds.',
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bicycle Rental'],
      rooms: [
        { _id: 'r8', name: 'Standard Chalet', maxGuests: 2, bedType: 'Queen', pricePerNightLKR: 58000, isActive: true },
        { _id: 'r9', name: 'Executive Suite with Pool', maxGuests: 3, bedType: 'King', pricePerNightLKR: 92000, isActive: true },
      ],
      taxRate: 10,
      serviceCharge: 10,
      cancellationPolicy: { freeCancellationDays: 3 },
      isActive: true,
    },
  ];
}
