/**
 * Royal Rides — Tour Packages Catalog Page
 * Curated multi-day journeys, day-by-day itineraries,
 * guide allocation, group size auto discount, and booking flow.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Shield,
  Search,
} from 'lucide-react';
import PackageBookingModal from '../components/packages/PackageBookingModal';
import api from '../services/api';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useWishlistStore } from '../store/useWishlistStore';

const CATEGORIES = ['All', 'Cultural', 'Beach', 'Wildlife', 'Adventure', 'Honeymoon', 'Hill Country'];

export default function Packages() {
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrencyStore();
  const { isSaved, toggleWishlist } = useWishlistStore();

  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedDuration, setSelectedDuration] = useState(searchParams.get('durationDays') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPackageId, setExpandedPackageId] = useState(null);
  const [bookingPackage, setBookingPackage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const queryParams = new URLSearchParams();
    if (selectedCategory !== 'All') queryParams.set('category', selectedCategory);
    if (selectedDuration) queryParams.set('durationDays', selectedDuration);
    if (searchQuery) queryParams.set('search', searchQuery);

    api.get(`/packages?${queryParams.toString()}`)
      .then((res) => {
        if (isMounted) {
          if (res?.data && res.data.length > 0) {
            setPackages(res.data);
          } else {
            setPackages(getFallbackPackages());
          }
        }
      })
      .catch(() => {
        if (isMounted) setPackages(getFallbackPackages());
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedDuration, searchQuery]);

  const toggleItinerary = (id) => {
    setExpandedPackageId(expandedPackageId === id ? null : id);
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold">
          Grand Island Circuits
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy">
          Curated Sri Lankan Travel Packages
        </h1>
        <p className="text-sm sm:text-base text-content-body leading-relaxed">
          Comprehensive, stress-free island odysseys featuring private executive chauffeur
          vehicles, luxury boutique accommodations, and optional licensed national guides.
        </p>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-5 rounded-3xl border border-navy/10 shadow-soft space-y-4">
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
              {cat === 'All' ? 'All Expeditions' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-navy/10 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
              Search Tour
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Heritage, Highlands, Safari..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
              />
              <Search className="w-3.5 h-3.5 text-navy-600 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
              Maximum Days
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
            >
              <option value="">Any Length</option>
              <option value="5">Up to 5 Days</option>
              <option value="7">Up to 7 Days</option>
              <option value="10">Up to 10 Days</option>
              <option value="14">Up to 14 Days</option>
            </select>
          </div>

          <div className="flex items-end">
            <span className="text-[11px] text-content-muted">
              ✨ 10% automatic group discount for parties of 5 or more travelers
            </span>
          </div>
        </div>
      </div>

      {/* ── Packages Listing ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-3xl skeleton-shimmer" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl border border-navy/10 space-y-3">
          <Compass className="w-12 h-12 text-gold mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-navy">No Tours Match Your Criteria</h3>
          <p className="text-xs text-content-body">
            Please reset your filters or request a bespoke itinerary from our concierge.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const isExpanded = expandedPackageId === pkg._id;

            return (
              <motion.div
                key={pkg._id}
                layout
                className="glass-card rounded-3xl overflow-hidden border border-navy/10 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Cover Image & Badges */}
                <div className="relative h-60 overflow-hidden bg-pearl-200">
                  <img
                    src={pkg.coverImage || 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&q=80'}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-navy/85 backdrop-blur-md text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/30">
                    {pkg.category}
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWishlist('TravelPackage', pkg._id)}
                    aria-label={`Save ${pkg.name} to wishlist`}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-navy hover:bg-white hover:text-red-500 transition-colors shadow-sm"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isSaved(pkg._id) ? 'fill-red-500 text-red-500' : 'text-navy'
                      }`}
                    />
                  </button>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-navy group-hover:text-gold transition-colors">
                      {pkg.name}
                    </h3>

                    <p className="text-xs text-content-body mt-2 leading-relaxed">
                      {pkg.tagline || pkg.description}
                    </p>

                    {/* Highlights bullet points */}
                    <div className="mt-3 space-y-1">
                      {pkg.highlights?.slice(0, 3).map((hl, i) => (
                        <div key={i} className="text-xs text-content-body flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expandable Itinerary Accordion Button */}
                    {pkg.itinerary && pkg.itinerary.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleItinerary(pkg._id)}
                        className="mt-4 w-full py-2 px-3 rounded-xl bg-pearl border border-navy/10 text-xs font-bold text-navy flex items-center justify-between hover:bg-navy/5 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Detailed Itinerary' : `View ${pkg.itinerary.length}-Day Route Itinerary`}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Itinerary Accordion Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-2 text-xs bg-pearl/60 p-3 rounded-xl border border-navy/10 max-h-48 overflow-y-auto"
                        >
                          {pkg.itinerary.map((dayItem) => (
                            <div key={dayItem.day} className="pb-2 border-b border-navy/5 last:border-b-0">
                              <span className="font-bold text-navy">Day {dayItem.day}: {dayItem.title}</span>
                              <p className="text-[11px] text-content-muted mt-0.5">{dayItem.description}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Pricing & Booking CTA */}
                  <div className="pt-4 border-t border-navy/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-content-muted uppercase">Base Price</span>
                      <p className="font-serif text-2xl font-bold text-navy tabular-nums">
                        {formatPrice(pkg.basePricePerPersonLKR)}
                        <span className="text-xs font-sans text-content-muted font-normal"> / person</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingPackage(pkg)}
                      className="btn-gold px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
                    >
                      Book Tour
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Package Booking Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {bookingPackage && (
          <PackageBookingModal
            pkg={bookingPackage}
            onClose={() => setBookingPackage(null)}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Fallback seed packages
function getFallbackPackages() {
  return [
    {
      _id: 'pk1',
      name: 'Highlands & Colonial Tea Trails Odyssey',
      category: 'Hill Country',
      durationDays: 7,
      durationNights: 6,
      basePricePerPersonLKR: 125000,
      coverImage: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&q=80',
      tagline: 'Kandy, Nuwara Eliya tea hills, and the scenic Ella train crossing.',
      highlights: [
        'Private executive chauffeur vehicle for all 7 days',
        'Scenic colonial blue train journey through Nuwara Eliya',
        'VIP guided tour of ancient Temple of the Tooth',
      ],
      itinerary: [
        { day: 1, title: 'Arrival & Colombo Gateway', description: 'VIP Airport meet & transfer to oceanfront boutique hotel.' },
        { day: 2, title: 'Royal Botanical & Sacred Kandy', description: 'Peradeniya gardens and candlelit evening puja at Temple of Tooth.' },
        { day: 3, title: 'Misty Nuwara Eliya Tea Valleys', description: 'Scenic mountain climb, waterfall viewing, and heritage tea factory tasting.' },
        { day: 4, title: 'Highland Blue Train to Ella', description: 'World-renowned train ride crossing Nine Arches Bridge.' },
        { day: 5, title: 'Little Adams Peak & Ravana Falls', description: 'Sunrise hike and natural pool relaxation.' },
        { day: 6, title: 'Southern Coastline Retreat', description: 'Descent to Galle Fort for sunset cocktails.' },
        { day: 7, title: 'Colombo Airport Departure', description: 'Expressway chauffeur transfer to departure lounge.' },
      ],
      isActive: true,
    },
    {
      _id: 'pk2',
      name: 'Kingdoms, Monoliths & Wild Leopards',
      category: 'Cultural',
      durationDays: 8,
      durationNights: 7,
      basePricePerPersonLKR: 148000,
      coverImage: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&q=80',
      tagline: 'Sigiriya 5th-century rock fortress, Dambulla cave temples & Yala leopards.',
      highlights: [
        'Dawn ascent of UNESCO Sigiriya Rock Fortress',
        'Private 4x4 open safari inside Yala National Park',
        'Dambulla Golden Cave Temple golden statues',
      ],
      itinerary: [
        { day: 1, title: 'Arrival & Transfer to Cultural Triangle', description: 'Chauffeur pickup to luxury water garden resort.' },
        { day: 2, title: 'Sigiriya Monolith & Village Catamaran', description: 'Early climb of the royal palace citadel.' },
        { day: 3, title: 'Polonnaruwa Medieval Ruins', description: 'Bicycle tour of ancient stone carvings and royal baths.' },
        { day: 4, title: 'Dambulla Caves & Spice Gardens', description: 'Cave frescoes followed by natural spice aroma tour.' },
        { day: 5, title: 'Drive to Yala Wilderness', description: 'Scenic drive to luxury safari glamping tents.' },
        { day: 6, title: 'Yala Dawn & Dusk Leopard Safaris', description: 'Full-day game drive with tracker for leopards and elephants.' },
        { day: 7, title: 'Mirissa Coastal Sanctuary', description: 'Relaxation on pristine secluded southern beaches.' },
        { day: 8, title: 'Return Airport Transfer', description: 'Expressway chauffeur transit to CMB.' },
      ],
      isActive: true,
    },
    {
      _id: 'pk3',
      name: 'Southern Riviera & Whale Odyssey',
      category: 'Beach',
      durationDays: 5,
      durationNights: 4,
      basePricePerPersonLKR: 88000,
      coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
      tagline: 'Galle Fort ramparts, private catamaran whale watching, and beach villas.',
      highlights: [
        'Blue whale watching in deep Indian Ocean trenches',
        'Private architectural walking tour of Galle Dutch Fort',
        'Sunset seafood banquet on secluded white sands',
      ],
      itinerary: [
        { day: 1, title: 'Airport Chauffeur to Galle Fort', description: 'Check-in to historic luxury fortress manor.' },
        { day: 2, title: 'Colonial Ramparts & Gem Boutiques', description: 'Cobblestone streets, art galleries, and lighthouse sunset.' },
        { day: 3, title: 'Mirissa Whale Expedition', description: 'Private morning catamaran searching for majestic blue whales.' },
        { day: 4, title: 'Unawatuna Lagoon & Stilt Fishermen', description: 'Mangrove boat safari and sea turtle conservation.' },
        { day: 5, title: 'Scenic Return Transfer', description: 'Direct highway chauffeur to Colombo Airport.' },
      ],
      isActive: true,
    },
  ];
}
