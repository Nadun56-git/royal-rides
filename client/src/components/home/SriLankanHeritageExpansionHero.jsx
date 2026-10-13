/**
 * Royal Rides — Sri Lankan Heritage Scroll Expansion Hero
 * Implements the scroll-expansion-hero component with authentic
 * Sri Lankan heritage destinations (Sigiriya, Ella, Galle Fort)
 * and seamless integration of the luxury booking search widget.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Compass, ShieldCheck } from 'lucide-react';
import ScrollExpandMedia from '../ui/scroll-expansion-hero';
import HeroSearchWidget from './HeroSearchWidget';

const HERITAGE_DESTINATIONS = {
  sigiriya: {
    id: 'sigiriya',
    name: 'Sigiriya Lion Rock',
    subtitle: '5th Century Royal Citadel',
    title: 'ROYAL SIGIRIYA',
    date: 'UNESCO World Heritage • Matale Valley',
    scrollToExpand: '↓ Scroll or Swipe to Expand Kingdom',
    bgImage: '/images/sigiriya_hero.jpg',
    mediaImage: '/images/sigiriya_hero.jpg',
    badge: 'Ancient Citadel & Royal Water Gardens',
    tagline: 'Rising 370m above misty jungle canopy, King Kashyapa\'s ancient rock palace fortress stands as the 8th Wonder of the World.',
  },
  ella: {
    id: 'ella',
    name: 'Ella Nine Arch',
    subtitle: 'Colonial Hill Country Viaduct',
    title: 'ELLA HIGHLANDS',
    date: 'Nine Arch Bridge • Central Highlands',
    scrollToExpand: '↓ Scroll or Swipe to Expand Tea Enclave',
    bgImage: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1920&q=85',
    mediaImage: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1280&q=85',
    badge: 'Highland Tea Valleys & Scenic Rail',
    tagline: 'Perched in the misty hills at 1,041m elevation, the iconic stone viaduct curves gracefully amidst emerald Ceylon tea estates.',
  },
  galle: {
    id: 'galle',
    name: 'Galle Fort Bastions',
    subtitle: '17th Century Living Citadel',
    title: 'GALLE BASTIONS',
    date: 'UNESCO Dutch Fort • Indian Ocean Coast',
    scrollToExpand: '↓ Scroll or Swipe to Expand Ocean Fort',
    bgImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1920&q=85',
    mediaImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1280&q=85',
    badge: 'Dutch-Colonial Ramparts & Lighthouse',
    tagline: 'Cobblestone alleyways, historic maritime ramparts, and luxury sanctuaries overlooking the turquoise Indian Ocean.',
  },
};

export default function SriLankanHeritageExpansionHero() {
  const [selectedHeritage, setSelectedHeritage] = useState('sigiriya');
  const activeData = HERITAGE_DESTINATIONS[selectedHeritage] || HERITAGE_DESTINATIONS.sigiriya;

  return (
    <div className="relative w-full">
      {/* ── Heritage Destination Switcher Pills ─────────────────────────── */}
      <div className="fixed top-24 right-4 sm:right-8 z-40 flex items-center gap-1.5 p-1.5 rounded-full bg-navy-950/80 backdrop-blur-xl border border-gold/40 shadow-gold-glow">
        {Object.values(HERITAGE_DESTINATIONS).map((dest) => {
          const isSelected = selectedHeritage === dest.id;
          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => setSelectedHeritage(dest.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gold text-navy shadow-md font-bold scale-105'
                  : 'text-pearl-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <MapPin className={`w-3 h-3 ${isSelected ? 'text-navy' : 'text-gold'}`} />
              <span className="hidden sm:inline">{dest.name}</span>
              <span className="sm:hidden">{dest.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* ── Scroll Expansion Media Hero Component ───────────────────────── */}
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={activeData.mediaImage}
        bgImageSrc={activeData.bgImage}
        title={activeData.title}
        date={activeData.date}
        scrollToExpand={activeData.scrollToExpand}
      >
        {/* ── Content Revealed When Hero Expands ─────────────────────────── */}
        <div className="w-full max-w-6xl mx-auto space-y-10 py-6">
          {/* Editorial Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeData.badge}</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy tracking-tight">
              Experience Ceylon in Sovereign Luxury
            </h3>

            <p className="text-sm sm:text-base text-content-body max-w-2xl mx-auto leading-relaxed">
              {activeData.tagline}
            </p>
          </div>

          {/* Search & Reservation Widget */}
          <div className="w-full shadow-elevated">
            <HeroSearchWidget />
          </div>

          {/* Luxury Highlights Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-navy/10 text-center">
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-navy/5 shadow-soft">
              <ShieldCheck className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="font-serif font-bold text-navy text-sm">SLTDA-Certified Chauffeurs</p>
              <p className="text-xs text-content-muted mt-0.5">Government vetted, multi-lingual guides</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-navy/5 shadow-soft">
              <Compass className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="font-serif font-bold text-navy text-sm">Transparent Fixed Quotes</p>
              <p className="text-xs text-content-muted mt-0.5">Zero airport toll markups or surprise fees</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-navy/5 shadow-soft">
              <MapPin className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="font-serif font-bold text-navy text-sm">Full Island Coverage</p>
              <p className="text-xs text-content-muted mt-0.5">24/7 GPS dispatch across all 9 provinces</p>
            </div>
          </div>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
