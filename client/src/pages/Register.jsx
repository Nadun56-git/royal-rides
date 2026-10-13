/**
 * Royal Rides — Member Registration Page
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await register({ firstName, lastName, email, phone, password });
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-[90vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border border-navy/15 shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy to-navy-600 text-gold font-serif font-black text-2xl flex items-center justify-center mx-auto shadow-md border border-gold/40">
            RR
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy">Join Royal Rides</h1>
          <p className="text-xs text-content-body">
            Unlock exclusive member perks, priority chauffeur allocation, and personalized journeys.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Elena"
                className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Rostova"
                className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@domain.com"
              className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
              Mobile / WhatsApp Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+94 77 123 4567"
              className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
              Create Password
            </label>
            <input
              type="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-premium disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-content-body">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-gold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
