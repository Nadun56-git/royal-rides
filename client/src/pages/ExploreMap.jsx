/**
 * Royal Rides — Dedicated Interactive Sri Lanka Map & Safety Page
 */

import React from 'react';
import { Shield, PhoneCall, HeartPulse, Coffee, Compass } from 'lucide-react';
import InteractiveSriLankaMap from '../components/map/InteractiveSriLankaMap';

export default function ExploreMap() {
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold">
          Interactive Geospatial Explorer
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy">
          Sri Lanka Tourism, Heritage & Safety Map
        </h1>
        <p className="text-sm sm:text-base text-content-body leading-relaxed">
          Navigate the teardrop island in comfort. Locate world-heritage monuments,
          luxury beachfront resorts, official Tourist Police outposts, and verified emergency facilities.
        </p>
      </div>

      {/* ── Quick Emergency Hotlines Bar ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-navy/10 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-navy flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-navy" />
          </div>
          <div>
            <span className="text-[10px] text-content-muted uppercase block font-semibold">Tourist Police</span>
            <a href="tel:1912" className="font-serif text-lg font-bold text-navy hover:text-gold">
              1912
            </a>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-navy/10 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-content-muted uppercase block font-semibold">Suwa Seriya Ambulance</span>
            <a href="tel:1990" className="font-serif text-lg font-bold text-red-600 hover:underline">
              1990
            </a>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-navy/10 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-content-muted uppercase block font-semibold">Royal Rides Concierge</span>
            <a href="tel:0718282758" className="font-serif text-lg font-bold text-navy hover:text-gold">
              0718282758
            </a>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-navy/10 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pearl text-teal-accent flex items-center justify-center font-bold">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-content-muted uppercase block font-semibold">Highway Rest Lounges</span>
            <span className="font-serif text-sm font-bold text-navy">
              24/7 E01 & E02
            </span>
          </div>
        </div>
      </div>

      {/* ── Interactive Map ─────────────────────────────────────────────────── */}
      <InteractiveSriLankaMap />
    </div>
  );
}
