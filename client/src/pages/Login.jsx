/**
 * Royal Rides — Luxury Sign In Page
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (['admin', 'superadmin'].includes(res.user?.role) && redirect === '/dashboard') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } else {
      setError(res.message);
    }
  };

  const fillAdminDemo = () => {
    setEmail('admin@royalrides.lk');
    setPassword('Admin@123456');
  };

  const fillCustomerDemo = () => {
    setEmail('james.wilson@example.com');
    setPassword('Customer@123');
  };

  return (
    <div className="pt-28 pb-20 min-h-[90vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border border-navy/15 shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy to-navy-600 text-gold font-serif font-black text-2xl flex items-center justify-center mx-auto shadow-md border border-gold/40">
            RR
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy">Member Sign In</h1>
          <p className="text-xs text-content-body">
            Access your reservations, curated itineraries, and VIP concierge benefits.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium focus:outline-none focus:border-gold"
              />
              <Mail className="w-4 h-4 text-navy-600 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5 flex justify-between">
              <span>Password</span>
              <a href="#" className="text-gold hover:underline font-semibold">
                Forgot?
              </a>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium focus:outline-none focus:border-gold"
              />
              <Lock className="w-4 h-4 text-navy-600 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-premium disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-2 border-t border-navy/10 space-y-2 text-center text-xs">
          <span className="text-[10px] text-content-muted uppercase tracking-wider block">
            Developer / Demonstration Access:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillAdminDemo}
              className="flex-1 py-1.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy text-[11px] font-semibold transition-colors"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={fillCustomerDemo}
              className="flex-1 py-1.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy text-[11px] font-semibold transition-colors"
            >
              Demo Traveler
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-content-body">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-gold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
