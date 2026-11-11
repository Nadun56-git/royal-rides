/**
 * Royal Rides — Luxury Footer Component
 * Deep Navy (#07142F) styling, contact details, Sri Lankan emergency hotlines,
 * quick links, and newsletter signup.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Shield, Heart, Send, CheckCircle2, Award } from 'lucide-react';
import { FadeIn, FadeUp, SlideIn } from './animate-ui';

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
          <FadeIn delay={0} className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center group">
              <img
                src="/images/royal_rider_logo.png"
                alt="Royal Ride – Luxury Travel & Tours"
                className="h-24 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                style={{ filter: 'drop-shadow(0 2px 10px rgba(192,192,192,0.4)) brightness(1.1) saturate(0.95)' }}
              />
            </Link>

            <p className="text-sm text-pearl-200/80 leading-relaxed max-w-sm pt-2">
              Sri Lanka's premier chauffeur and travel company. Curating bespoke island journeys,
              unrivaled vehicle fleets, elite coastal villas, and unforgettable cultural odysseys.
            </p>

            <div className="space-y-2 pt-2 text-sm text-pearl-200">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+94772383111" className="hover:text-gold transition-colors font-medium group">
                  <span className="relative">
                    +94 77 238 3111
                    <span className="absolute inset-x-0 bottom-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:royalrider.service@gmail.com" className="hover:text-gold transition-colors group">
                  <span className="relative">
                    royalrider.service@gmail.com
                    <span className="absolute inset-x-0 bottom-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span className="text-pearl-200/80">378, Rajagiriya Road, Rajagiriya, Sri Lanka</span>
              </div>
            </div>
          </FadeIn>

          {/* ── Quick Exploration Links ───────────────────────────────────────── */}
          <FadeUp delay={0.1}>
            <h4 className="font-serif text-lg text-white font-semibold mb-4 tracking-wide">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-pearl-200/80">
              <li>
                <Link to="/vehicles" className="hover:text-gold transition-colors relative group">
                  <span>Luxury Fleet</span>
                  <span className="absolute inset-x-0 bottom-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-gold transition-colors relative group">
                  <span>Boutique Hotels &amp; Villas</span>
                  <span className="absolute inset-x-0 bottom-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-gold transition-colors relative group">
                  <span>Curated Travel Packages</span>
                  <span className="absolute inset-x-0 bottom-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-gold transition-colors relative group">
                  <span>Interactive Island Map</span>
                  <span className="absolute inset-x-0 bottom-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/vehicles?driver=true" className="hover:text-gold transition-colors relative group">
                  <span>Chauffeur Drive Services</span>
                  <span className="absolute inset-x-0 bottom-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
            </ul>
          </FadeUp>

          {/* ── Sri Lanka Tourism & Emergency Hotlines ────────────────────────── */}
          <FadeUp delay={0.2}>
            <h4 className="font-serif text-lg text-gold font-semibold mb-4 tracking-wide flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-gold" />
              Emergency &amp; Safety
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
                <span className="text-pearl-200">Fire &amp; Rescue</span>
                <a href="tel:110" className="font-bold text-white hover:underline">
                  110
                </a>
              </div>
            </div>
          </FadeUp>

          {/* ── Newsletter Signup ─────────────────────────────────────────────── */}
          <FadeUp delay={0.3}>
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
          </FadeUp>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────────────────────── */}
        <FadeIn delay={0.4} className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-pearl-200/60 gap-4">
          <p>© {new Date().getFullYear()} Royal Rides Sri Lanka. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/terms" className="hover:text-gold transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/privacy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cancellation" className="hover:text-gold transition-colors">
              Cancellation Terms
            </Link>
            <Link to="/admin/login" className="hover:text-gold transition-colors flex items-center gap-1">
              <Shield className="w-3 h-3 text-gold" />
              Admin Portal
            </Link>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
