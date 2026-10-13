/**
 * Royal Rides — Main Application Component
 * Manages routing, Lenis smooth scroll, global stores init,
 * navigation layout, and toast notifications.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Lenis from '@studio-freight/lenis';

// Layout Components
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import WhatsAppButton from './components/ui/WhatsAppButton';

// Pages
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Hotels from './pages/Hotels';
import Packages from './pages/Packages';
import ExploreMap from './pages/ExploreMap';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';

// Stores
import { useAuthStore } from './store/useAuthStore';
import { useCurrencyStore } from './store/useCurrencyStore';
import { useWishlistStore } from './store/useWishlistStore';

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const fetchRates = useCurrencyStore((s) => s.fetchRates);
  const loadWishlist = useWishlistStore((s) => s.loadWishlist);

  useEffect(() => {
    // 1. Initialize Lenis buttery smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Initial state hydration
    checkAuth();
    fetchRates();
    loadWishlist();

    return () => {
      lenis.destroy();
    };
  }, [checkAuth, fetchRates, loadWishlist]);

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-pearl text-content-body font-sans antialiased selection:bg-gold/20 selection:text-navy">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0B1F4B',
              color: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid rgba(201, 162, 75, 0.4)',
              fontSize: '13px',
              padding: '12px 18px',
            },
          }}
        />

        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/map" element={<ExploreMap />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </Router>
  );
}
