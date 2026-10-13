/**
 * Royal Rides — Hero Search Widget
 * Floating glassmorphic multi-tab search widget for Vehicles, Hotels, and Packages.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Hotel,
  Compass,
  MapPin,
  Calendar,
  Users,
  Search,
  Check,
  ShieldCheck,
} from 'lucide-react';

const SRI_LANKA_DESTINATIONS = [
  'Bandaranaike International Airport (CMB)',
  'Colombo',
  'Kandy',
  'Galle & Unawatuna',
  'Sigiriya & Dambulla',
  'Ella',
  'Nuwara Eliya',
  'Mirissa & Weligama',
  'Yala National Park',
  'Trincomalee',
  'Bentota',
];

export default function HeroSearchWidget() {
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'hotels' | 'packages'
  const navigate = useNavigate();

  // Vehicle search state
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [withDriver, setWithDriver] = useState(true);
  const [vehicleCategory, setVehicleCategory] = useState('');

  // Hotel search state
  const [hotelDestination, setHotelDestination] = useState('');
  const [guests, setGuests] = useState('2');

  // Package search state
  const [packageCategory, setPackageCategory] = useState('');
  const [duration, setDuration] = useState('');

  const handleVehicleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickup) params.set('pickup', pickup);
    if (dropoff) params.set('dropoff', dropoff);
    if (withDriver) params.set('withDriver', 'true');
    if (vehicleCategory) params.set('category', vehicleCategory);
    navigate(`/vehicles?${params.toString()}`);
  };

  const handleHotelSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (hotelDestination) params.set('city', hotelDestination);
    navigate(`/hotels?${params.toString()}`);
  };

  const handlePackageSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (packageCategory) params.set('category', packageCategory);
    if (duration) params.set('durationDays', duration);
    navigate(`/packages?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ── Tabs Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm ${
            activeTab === 'vehicles'
              ? 'bg-navy text-gold shadow-md scale-105'
              : 'bg-white/80 hover:bg-white text-navy-800 backdrop-blur-md'
          }`}
        >
          <Car className="w-4 h-4 text-gold" />
          <span>Luxury Fleet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hotels')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm ${
            activeTab === 'hotels'
              ? 'bg-navy text-gold shadow-md scale-105'
              : 'bg-white/80 hover:bg-white text-navy-800 backdrop-blur-md'
          }`}
        >
          <Hotel className="w-4 h-4 text-gold" />
          <span>Hotels & Villas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm ${
            activeTab === 'packages'
              ? 'bg-navy text-gold shadow-md scale-105'
              : 'bg-white/80 hover:bg-white text-navy-800 backdrop-blur-md'
          }`}
        >
          <Compass className="w-4 h-4 text-gold" />
          <span>Curated Tours</span>
        </button>
      </div>

      {/* ── Tab Content Container (Glassmorphic) ────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-elevated border border-white/60">
        <AnimatePresence mode="wait">
          {/* VEHICLES TAB */}
          {activeTab === 'vehicles' && (
            <motion.form
              key="vehicles"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleVehicleSearch}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Pickup Location */}
                <div className="relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gold" /> Pickup Location
                  </label>
                  <select
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl-50 border border-navy/15 text-xs text-navy font-medium focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Select pickup point</option>
                    {SRI_LANKA_DESTINATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Drop-off Location */}
                <div className="relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gold" /> Drop-off Destination
                  </label>
                  <select
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl-50 border border-navy/15 text-xs text-navy font-medium focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Select drop-off point</option>
                    {SRI_LANKA_DESTINATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center gap-1">
                    <Car className="w-3 h-3 text-gold" /> Vehicle Type
                  </label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl-50 border border-navy/15 text-xs text-navy font-medium focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">All Categories</option>
                    <option value="Car">Sedan & Premium Car</option>
                    <option value="Van">Luxury Chauffeur Van</option>
                    <option value="Luxury Passenger Unit">Luxury Passenger Unit</option>
                    <option value="SUV">4x4 Luxury SUV</option>
                    <option value="Bus">VIP Coach</option>
                  </select>
                </div>

                {/* Chauffeur Option Toggle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-gold" /> Chauffeur Mode
                  </label>
                  <div className="flex bg-pearl-50 p-1 rounded-xl border border-navy/15">
                    <button
                      type="button"
                      onClick={() => setWithDriver(true)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        withDriver ? 'bg-navy text-gold shadow-sm' : 'text-navy-800'
                      }`}
                    >
                      With Driver
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

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-content-muted hidden sm:inline">
                  ⚡ Transparent mileage rates • Zero hidden airport toll surcharges
                </span>
                <button
                  type="submit"
                  className="btn-gold px-7 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-premium hover:scale-102 ml-auto"
                >
                  <Search className="w-4 h-4" />
                  <span>Check Fleet Availability</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* HOTELS TAB */}
          {activeTab === 'hotels' && (
            <motion.form
              key="hotels"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleHotelSearch}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gold" /> Destination or City
                  </label>
                  <select
                    value={hotelDestination}
                    onChange={(e) => setHotelDestination(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl-50 border border-navy/15 text-xs text-navy font-medium focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Anywhere in Sri Lanka</option>
                    <option value="Galle">Galle & Southern Coast</option>
                    <option value="Sigiriya">Sigiriya & Cultural Triangle</option>
                    <option value="Ella">Ella & Hill Country</option>
                    <option value="Nuwara Eliya">Nuwara Eliya Tea Valleys</option>
                    <option value="Colombo">Colombo Luxury Enclaves</option>
                    <option value="Yala">Yala Safari Wilderness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3 text-gold" /> Guests & Occupancy
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl-50 border border-navy/15 text-xs text-navy font-medium focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="1">1 Guest (Single Room)</option>
                    <option value="2">2 Guests (Couple / Double)</option>
                    <option value="3">3 Guests (Triple / Family)</option>
                    <option value="4">4+ Guests (Suite / Villa)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="btn-gold w-full py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-premium"
                  >
                    <Search className="w-4 h-4" />
                    <span>Explore Luxury Resorts</span>
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          {/* PACKAGES TAB */}
          {activeTab === 'packages' && (
            <motion.form
              key="packages"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              onSubmit={handlePackageSearch}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-gold" /> Tour Experience
                  </label>
                  <select
                    value={packageCategory}
                    onChange={(e) => setPackageCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl-50 border border-navy/15 text-xs text-navy font-medium focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">All Curated Experiences</option>
                    <option value="Cultural">Cultural Heritage & Ancient Kingdoms</option>
                    <option value="Beach">Golden Sand & Coastal Retreat</option>
                    <option value="Wildlife">Leopards & Elephant Wildlife Safaris</option>
                    <option value="Hill Country">Tea Trails & Misty Mountains</option>
                    <option value="Honeymoon">VIP Romantic Honeymoon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gold" /> Desired Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl-50 border border-navy/15 text-xs text-navy font-medium focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Any Duration</option>
                    <option value="4">Up to 4 Days (Short Escape)</option>
                    <option value="7">7 Days (Classic Circuit)</option>
                    <option value="10">10 Days (Grand Island Odyssey)</option>
                    <option value="14">14+ Days (Complete Sri Lanka)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="btn-gold w-full py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-premium"
                  >
                    <Search className="w-4 h-4" />
                    <span>View Itineraries</span>
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
