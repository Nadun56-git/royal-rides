/**
 * Royal Rides — Luxury Footer Component
 * Deep Navy (#07142F) styling, contact details, Sri Lankan emergency hotlines,
 * quick links, and newsletter signup.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Shield, Heart, Send, CheckCircle2, Award } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-navy-deep text-pearl-100 border-t border-gold/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* ── Brand Col ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center text-navy font-serif font-black text-xl shadow-gold-glow">
                RR
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                  ROYAL RIDES
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-semibold">
                  Ceylon Tourism & Luxury Travel
                </span>
              </div>
            </Link>

            <p className="text-sm text-pearl-200/80 leading-relaxed max-w-sm pt-2">
              Sri Lanka's premier chauffeur and travel company. Curating bespoke island journeys,
              unrivaled vehicle fleets, elite coastal villas, and unforgettable cultural odysseys.
            </p>

            <div className="space-y-2 pt-2 text-sm text-pearl-200">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:0718282758" className="hover:text-gold transition-colors font-medium">
                  +94 71 828 2758
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:Info@uncage.lk" className="hover:text-gold transition-colors">
                  Info@uncage.lk
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span className="text-pearl-200/80">No. 45, Galle Face Terrace, Colombo 03, Sri Lanka</span>
              </div>
            </div>
          </div>

          {/* ── Quick Exploration Links ───────────────────────────────────────── */}
          <div>
            <h4 className="font-serif text-lg text-white font-semibold mb-4 tracking-wide">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-pearl-200/80">
              <li>
                <Link to="/vehicles" className="hover:text-gold transition-colors">
                  Luxury Fleet
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-gold transition-colors">
                  Boutique Hotels & Villas
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-gold transition-colors">
                  Curated Travel Packages
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-gold transition-colors">
                  Interactive Island Map
                </Link>
              </li>
              <li>
                <Link to="/vehicles?driver=true" className="hover:text-gold transition-colors">
                  Chauffeur Drive Services
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Sri Lanka Tourism & Emergency Hotlines ────────────────────────── */}
          <div>
            <h4 className="font-serif text-lg text-gold font-semibold mb-4 tracking-wide flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-gold" />
              Emergency & Safety
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <span className="text-pearl-200">Tourist Police Hotline</span>
                <a href="tel:1912" className="font-bold text-gold hover:underline">
                  1912
                </a>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <span className="text-pearl-200">Police Emergency</span>
                <a href="tel:119" className="font-bold text-white hover:underline">
                  119
                </a>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <span className="text-pearl-200">Suwa Seriya Ambulance</span>
                <a href="tel:1990" className="font-bold text-teal-accent hover:underline">
                  1990
                </a>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <span className="text-pearl-200">Fire & Rescue</span>
                <a href="tel:110" className="font-bold text-white hover:underline">
                  110
                </a>
              </div>
            </div>
          </div>

          {/* ── Newsletter Signup ─────────────────────────────────────────────── */}
          <div>
            <h4 className="font-serif text-lg text-white font-semibold mb-4 tracking-wide">
              The Royal Dispatch
            </h4>
            <p className="text-xs text-pearl-200/80 mb-3 leading-relaxed">
              Subscribe for exclusive seasonal offers, secret hidden beaches, and bespoke VIP travel itineraries.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-teal-accent/20 border border-teal-accent/40 text-teal-accent text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Welcome! You're subscribed to the Royal Dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-pearl-200/50 text-xs focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gold text-navy rounded-lg hover:bg-gold-hover transition-colors flex items-center justify-center text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 flex items-center gap-2 text-[11px] text-pearl-200/60">
              <Award className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>Certified Sri Lanka Tourism Development Authority (SLTDA) Partner</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────────────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-pearl-200/60 gap-4">
          <p>© {new Date().getFullYear()} Royal Rides Sri Lanka. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/terms" className="hover:text-gold transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cancellation" className="hover:text-gold transition-colors">
              Cancellation Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
