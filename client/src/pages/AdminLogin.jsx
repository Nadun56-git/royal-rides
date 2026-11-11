/**
 * Royal Rides — Dedicated Executive Admin Portal Sign-In
 * High-security access for administrators and fleet managers.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  KeyRound,
  AlertCircle,
  Car,
  Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admindashboard';

  const { login, isAuthenticated, isManagerOrAdmin, logout, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && isManagerOrAdmin()) {
      navigate('/admindashboard');
    }
  }, [isAuthenticated, isManagerOrAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your admin email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      const role = res.user?.role;
      const hasAccess = ['admin', 'superadmin', 'super_admin', 'manager'].includes(role);

      if (!hasAccess) {
        await logout();
        setError('Access denied: Your account does not have management or administrative clearance.');
        toast.error('Restricted: Staff and Admin credentials required.');
        return;
      }

      toast.success(`Welcome back, ${res.user.firstName || 'Administrator'}!`);
      navigate(redirect);
    } else {
      setError(res.message || 'Authentication failed. Please verify credentials.');
      toast.error(res.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 bg-gradient-to-br from-navy-950 via-navy to-navy-900 text-pearl relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-navy-900/80 backdrop-blur-2xl border border-gold/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/40 text-gold shadow-lg shadow-gold/10">
            <ShieldCheck className="w-8 h-8 text-gold" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest uppercase font-bold text-gold/90 bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
              Executive Console
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-2">
              Royal Rides Admin
            </h1>
            <p className="text-xs text-pearl-200/70 mt-1">
              Authorized access for fleet managers & system administrators
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-pearl-100 mb-1.5 uppercase tracking-wider">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gold/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@royalrides.lk"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-800/80 border border-gold/20 text-white placeholder-pearl-200/30 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-pearl-100 mb-1.5 uppercase tracking-wider">
              Access Secret Key / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gold/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-800/80 border border-gold/20 text-white placeholder-pearl-200/30 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold via-gold-400 to-amber-500 text-navy font-bold text-sm shadow-lg shadow-gold/20 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Authenticate & Enter Portal
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-pearl-200/50 hover:text-gold transition-colors inline-flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Royal Rides Public Site
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
