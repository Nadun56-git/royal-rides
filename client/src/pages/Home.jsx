/**
 * Royal Rides — Luxury Home Page
 * Full-screen cinematic hero, floating glass search widget, live stats,
 * fleet showcase, boutique hotel highlights, package itineraries,
 * interactive mini-map teaser, and guest testimonials.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Star, Users, ChevronRight, Clock,
  Sparkles, PhoneCall, CheckCircle2,
} from "lucide-react";
import HeroSearchWidget from "../components/home/HeroSearchWidget";
import InteractiveSriLankaMap from "../components/map/InteractiveSriLankaMap";
import api from "../services/api";
import { useCurrencyStore } from "../store/useCurrencyStore";

/** Reusable scroll-triggered fade-up wrapper */
const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const PILLARS = [
  { icon: Shield, title: "Chauffeur Mastery", desc: "SLTDA-certified, English-speaking professional drivers trained in defensive highway navigation, discretion, and deep cultural storytelling." },
  { icon: Sparkles, title: "Zero Hidden Surcharges", desc: "Transparent per-kilometer and daily rates with airport express expressway tolls, comprehensive passenger insurance, and clean vehicle guarantees." },
  { icon: PhoneCall, title: "24/7 Island Concierge", desc: "Dedicated trip assistants monitoring flight delays in real-time, arranging secret tea tastings, and providing rapid emergency medical support." },
];

const PACKAGES = [
  { img: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&q=80", alt: "Ella Highland", badge: "7 Days / 6 Nights", tag: "Hill Country & Tea Enclaves", title: "Misty Highlands & Colonial Railways", desc: "Kandy Temple of the Tooth, historic Nuwara Eliya tea estates, Ella Nine Arches Bridge, and private chauffeur transport throughout.", price: 125000 },
  { img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80", alt: "Yala Leopard", badge: "5 Days / 4 Nights", tag: "Wild Sri Lanka", title: "Leopards, Elephants & Coastal Wilds", desc: "Yala National Park dawn safaris, Udawalawe elephant transit home, luxury safari tented lodges, and expert naturalists.", price: 98000 },
  { img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80", alt: "Galle Fort Ocean", badge: "6 Days / 5 Nights", tag: "Southern Riviera", title: "Galle Maritime Heritage & Secret Coves", desc: "Colonial cobblestone ramparts, blue whale watching in Mirissa, private surfing bays, and oceanfront private villa dining.", price: 110000 },
];

export default function Home() {
  const { formatPrice } = useCurrencyStore();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);

  useEffect(() => {
    api.get("/vehicles?limit=3").then((res) => { if (res?.data?.length > 0) setFeaturedVehicles(res.data); }).catch(() => {});
  }, []);

  const fallbackVehicles = [
    { _id: "fv1", name: "Mercedes-Benz E-Class Executive", category: "Car", images: [{ url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80" }], passengerCapacity: 3, transmission: "Automatic", dailyRate: 35000 },
    { _id: "fv2", name: "Toyota HiAce VIP Luxury Cruiser", category: "Van", images: [{ url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80" }], passengerCapacity: 7, transmission: "Automatic", dailyRate: 42000 },
    { _id: "fv3", name: "Land Cruiser Prado 4x4 V8", category: "SUV", images: [{ url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80" }], passengerCapacity: 5, transmission: "Automatic", dailyRate: 50000 },
  ];
  const vehiclesToDisplay = featuredVehicles.length > 0 ? featuredVehicles : fallbackVehicles;

  return (
    <div className="pb-20">

      {/* ── 1. CINEMATIC HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[96vh] flex flex-col justify-center items-center pt-32 pb-24 px-4 overflow-hidden isolate">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            src="/images/sigiriya_hero.jpg"
            alt="Sigiriya Lion Rock Sri Lanka Ancient Citadel"
            className="w-full h-full object-cover object-center brightness-90"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1920&q=85"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/25 to-pearl/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-pearl via-pearl/60 to-transparent" />
        </div>
        <motion.div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-gold/8 blur-[80px] pointer-events-none z-0" animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-navy-950/75 backdrop-blur-xl border border-gold/50 text-gold text-xs font-bold uppercase tracking-widest shadow-gold-glow"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulseSubtle" />
            <span>Royal Rides &mdash; Sri Lanka&apos;s Premier Chauffeur Fleet</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="font-serif text-5xl sm:text-6xl lg:text-[5.5rem] font-bold text-white tracking-tight leading-[1.05] drop-shadow-[0_6px_32px_rgba(0,0,0,0.5)]">
            Experience Ceylon<br className="hidden sm:block" />
            <span className="text-gold"> in Sovereign Luxury</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.38, ease: [0.22, 1, 0.36, 1] }} className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Chauffeur-driven executive fleets, handpicked colonial sanctuaries, and custom private expeditions across paradise.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }} className="flex flex-wrap justify-center gap-2.5 pt-2">
            {[{ icon: CheckCircle2, label: "SLTDA Certified" }, { icon: Shield, label: "Zero Hidden Fees" }, { icon: Star, label: "4.9\u2605 Rated" }, { icon: Clock, label: "24/7 Concierge" }].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/85 text-[11px] font-semibold tracking-wide">
                <Icon className="w-3 h-3 text-gold flex-shrink-0" />{label}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.65, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 w-full">
          <HeroSearchWidget />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.9 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} className="w-px h-8 bg-gradient-to-b from-gold/50 to-transparent rounded-full" />
        </motion.div>
      </section>

      {/* ── 2. STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-30">
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }} className="glass-card rounded-3xl p-6 sm:p-10 shadow-elevated border border-navy/8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ value: "15,000+", label: "VIP Journeys Crafted" }, { value: "120+", label: "Luxury Chauffeur Fleet" }, { value: "48+", label: "Curated Destinations" }, { value: "4.9\u2605", label: "Customer Excellence" }].map(({ value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-navy block">{value}</span>
              <span className="text-xs uppercase tracking-wider text-gold font-bold mt-1.5 block">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 3. WHY ROYAL RIDES ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <FadeUp className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">Uncompromising Standards</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Why Travelers Choose Royal Rides</h2>
          <p className="text-sm text-content-body leading-relaxed">Setting the benchmark for safety, discreet luxury, and warm Sri Lankan hospitality.</p>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map(({ icon: Icon, title, desc }, i) => (
            <FadeUp key={title} delay={i * 0.13}>
              <div className="glass-card p-8 rounded-3xl border border-navy/10 space-y-4 hover:shadow-elevated hover:-translate-y-2 transition-all duration-500 cursor-default h-full">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy to-navy-700 text-gold flex items-center justify-center shadow-md"><Icon className="w-6 h-6" /></div>
                <h3 className="font-serif text-xl font-bold text-navy">{title}</h3>
                <p className="text-sm text-content-body leading-relaxed">{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── 4. FLEET ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <FadeUp className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Prestige Mobility</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-1">The Royal Fleet</h2>
            <p className="text-sm text-content-body mt-1">Immaculately maintained sedans, VIP passenger cruisers, and rugged safari 4x4s.</p>
          </div>
          <Link to="/vehicles" className="inline-flex items-center gap-1.5 text-xs font-bold text-navy uppercase tracking-wider hover:text-gold transition-colors group">
            <span>Explore All Vehicles</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {vehiclesToDisplay.map((veh, i) => (
            <FadeUp key={veh._id} delay={i * 0.1}>
              <div className="glass-card rounded-3xl overflow-hidden border border-navy/10 shadow-soft hover:shadow-elevated hover:-translate-y-2 transition-all duration-500 flex flex-col group h-full">
                <div className="relative h-56 overflow-hidden bg-pearl-200 flex-shrink-0">
                  <img src={veh.images?.[0]?.url} alt={veh.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-navy/90 backdrop-blur-md text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/30">{veh.category}</div>
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy group-hover:text-gold transition-colors duration-300">{veh.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-content-muted mt-2 flex-wrap">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{veh.passengerCapacity} Pax</span>
                      <span className="text-navy/20">|</span>
                      <span>{veh.transmission}</span>
                      <span className="text-navy/20">|</span>
                      <span className="text-emerald-600 font-semibold">Chauffeur Ready</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-navy/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-content-muted uppercase tracking-wide">Starting at</span>
                      <p className="font-serif text-xl font-bold text-navy tabular-nums">{formatPrice(veh.dailyRate)}<span className="text-xs font-sans text-content-muted font-normal"> / day</span></p>
                    </div>
                    <Link to="/vehicles" className="btn-navy px-4 py-2 rounded-xl text-xs font-semibold shadow-sm">View Specs</Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── 5. MAP ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <FadeUp className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">Geospatial Exploration</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Interactive Island Tourism &amp; Safety Map</h2>
          <p className="text-sm text-content-body leading-relaxed">Locate ancient heritage fortresses, high-altitude tea trails, nearby police outposts, and certified sanitary travel lounges in real-time.</p>
        </FadeUp>
        <FadeUp delay={0.1}><InteractiveSriLankaMap /></FadeUp>
      </section>

      {/* ── 6. PACKAGES ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <FadeUp className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Signature Odysseys</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-1">Handcrafted Travel Circuits</h2>
            <p className="text-sm text-content-body mt-1">Bespoke multi-day private journeys guided by licensed national tour guides.</p>
          </div>
          <Link to="/packages" className="inline-flex items-center gap-1.5 text-xs font-bold text-navy uppercase tracking-wider hover:text-gold transition-colors group">
            <span>View All Packages</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PACKAGES.map(({ img, alt, badge, tag, title, desc, price }, i) => (
            <FadeUp key={title} delay={i * 0.1}>
              <div className="glass-card rounded-3xl overflow-hidden border border-navy/10 shadow-soft hover:shadow-elevated hover:-translate-y-2 transition-all duration-500 group h-full flex flex-col">
                <div className="h-52 overflow-hidden relative flex-shrink-0">
                  <img src={img} alt={alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-navy-950/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-navy/90 backdrop-blur-sm text-gold text-xs px-3 py-1 rounded-full font-bold border border-gold/30">{badge}</span>
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-gold">{tag}</span>
                  <h3 className="font-serif text-xl font-bold text-navy group-hover:text-gold transition-colors duration-300">{title}</h3>
                  <p className="text-xs text-content-body leading-relaxed flex-1">{desc}</p>
                  <div className="pt-3 border-t border-navy/10 flex justify-between items-center mt-auto">
                    <span className="font-serif font-bold text-lg text-navy">{formatPrice(price)} <span className="text-xs font-normal text-content-muted">/ person</span></span>
                    <Link to="/packages" className="btn-navy px-4 py-2 rounded-xl text-xs font-semibold">View Tour</Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── 7. CONCIERGE CTA ─────────────────────────────────────────────────── */}
      <FadeUp className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-navy-deep via-navy to-navy-700 p-8 sm:p-14 text-white relative overflow-hidden shadow-elevated border border-gold/20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="absolute -top-24 -right-16 w-80 h-80 bg-gold/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 max-w-xl z-10 relative">
            <span className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Customized Chauffeur Arrangements
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-snug">Require a Custom Chauffeur Route or Diplomatic Escort?</h2>
            <p className="text-sm text-pearl-200/70 leading-relaxed">Our Colombo operations desk is on standby 24/7 to orchestrate complex multi-city circuits, wedding motorcades, or corporate delegate transport.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 z-10 relative shrink-0">
            <a href="tel:0718282758" className="btn-gold px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-premium hover:scale-105 active:scale-95 transition-transform duration-300">
              <PhoneCall className="w-4 h-4" /><span>Call +94 71 828 2758</span>
            </a>
            <Link to="/contact" className="px-6 py-3.5 rounded-2xl border border-white/25 text-xs sm:text-sm font-bold text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-center">Send Custom Inquiry</Link>
          </div>
        </div>
      </FadeUp>

    </div>
  );
}
