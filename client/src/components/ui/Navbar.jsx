/**
 * Royal Rides — Luxury Navbar Component
 * Features glassmorphic backdrop, live currency switcher, wishlist badge,
 * authenticated user dropdown, and mobile navigation drawer.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Car,
  Hotel,
  MapPin,
  Heart,
  User as UserIcon,
  Menu,
  X,
  PhoneCall,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Calendar,
  Sparkles,
} from 'lucide-react';
import CurrencySwitcher from './CurrencySwitcher';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const location = useLocation();
  const { user, isAuthenticated, logout, isManagerOrAdmin } = useAuthStore();
  const { savedIds } = useWishlistStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Fleet', path: '/vehicles', icon: Car },
    { name: 'Hotels', path: '/hotels', icon: Hotel },
    { name: 'Tour Packages', path: '/packages', icon: Compass },
    { name: 'Sri Lanka Map', path: '/map', icon: MapPin },
    { name: 'Contact', path: '/contact', icon: PhoneCall },
  ];

  const isHeroPage = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-pearl/90 backdrop-blur-md shadow-soft border-b border-navy/10 py-3'
          : isHeroPage
          ? 'bg-navy-950/40 backdrop-blur-md border-b border-white/10 py-4 shadow-lg'
          : 'bg-pearl/95 backdrop-blur-sm border-b border-navy/10 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* ── Brand Logo ────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-navy-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 border border-gold/40">
              <span className="font-serif text-gold text-xl font-bold tracking-tighter">RR</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-serif text-lg font-bold tracking-tight transition-colors leading-none ${
                isHeroPage && !isScrolled ? 'text-white group-hover:text-gold' : 'text-navy group-hover:text-gold'
              }`}>
                ROYAL RIDES
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-semibold mt-1">
                Ceylon Luxury Travel
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation Links ───────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? isHeroPage && !isScrolled
                        ? 'text-gold font-semibold bg-white/10'
                        : 'text-navy font-semibold bg-navy/5'
                      : isHeroPage && !isScrolled
                        ? 'text-pearl-100 hover:text-white hover:bg-white/10'
                        : 'text-content-body hover:text-navy hover:bg-black/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : isHeroPage && !isScrolled ? 'text-gold/80' : 'text-content-muted'}`} />
                  <span>{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-gold rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions: Currency, Wishlist, User/Auth ──────────────────── */}
          <div className="hidden sm:flex items-center gap-3">
            <CurrencySwitcher />

            {/* Wishlist Link */}
            <Link
              to="/dashboard?tab=wishlist"
              className={`relative p-2.5 rounded-full transition-colors ${
                isHeroPage && !isScrolled ? 'text-white hover:bg-white/10' : 'text-navy-800 hover:bg-navy/5'
              }`}
              title="Saved Wishlist"
            >
              <Heart className={`w-5 h-5 transition-colors ${
                isHeroPage && !isScrolled ? 'text-white hover:text-gold' : 'text-navy hover:text-red-500'
              }`} />
              {savedIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-gold text-white rounded-full flex items-center justify-center shadow-sm">
                  {savedIds.length}
                </span>
              )}
            </Link>

            {/* User Profile or Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-navy/5 hover:bg-navy/10 border border-navy/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-navy text-gold text-xs font-semibold flex items-center justify-center">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-navy max-w-[90px] truncate">
                    {user?.firstName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-navy-600" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-premium border border-navy/10 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-navy/5">
                        <p className="text-xs text-content-muted">Signed in as</p>
                        <p className="text-sm font-bold text-navy truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy hover:bg-pearl transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-gold" />
                        My Reservations
                      </Link>

                      {isManagerOrAdmin() && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy hover:bg-pearl transition-colors font-semibold"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Admin Portal
                        </Link>
                      )}

                      <div className="my-1 border-t border-navy/5" />

                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-xs font-bold transition-colors uppercase tracking-wider ${
                    isHeroPage && !isScrolled ? 'text-white hover:text-gold' : 'text-navy hover:text-navy-600'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-gold px-4 py-2 rounded-full text-xs font-semibold shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 lg:hidden">
            <CurrencySwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-navy hover:bg-navy/5 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-pearl/95 backdrop-blur-xl border-b border-navy/10 px-6 py-6 overflow-hidden"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-navy hover:bg-navy/5 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gold" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-navy/10 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-navy"
                    >
                      <UserIcon className="w-4 h-4 text-gold" />
                      Customer Dashboard
                    </Link>
                    {isManagerOrAdmin() && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-emerald-600"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Portal
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={logout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link
                      to="/login"
                      className="flex-1 py-2.5 text-center text-sm font-bold text-navy border border-navy/20 rounded-xl"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 py-2.5 text-center text-sm font-bold text-white bg-gold rounded-xl shadow-sm"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
