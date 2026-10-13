/**
 * Royal Rides — Contact & Concierge Inquiry Page
 * Official contact numbers, Sri Lankan emergency hotlines, and inquiry form.
 */

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Send,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.post('/contact', formData);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general',
      });
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to send inquiry. Please try again or call us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold">
          24/7 Island Concierge
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy">
          Speak with our Private Travel Specialists
        </h1>
        <p className="text-sm sm:text-base text-content-body leading-relaxed">
          Whether you require a diplomatic motorcade, custom private helicopter transfer,
          or villa buyout across the south coast, our Colombo team is at your sovereign service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <div className="glass-card p-8 rounded-3xl border border-navy/15 space-y-6 shadow-soft">
          <h3 className="font-serif text-2xl font-bold text-navy">
            Headquarters & Desk
          </h3>

          <div className="space-y-4 text-xs text-content-body">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy block text-sm">Official Hotline:</span>
                <a href="tel:0718282758" className="hover:text-gold transition-colors font-medium text-sm">
                  +94 71 828 2758
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy block text-sm">Email Inquiries:</span>
                <a href="mailto:Info@uncage.lk" className="hover:text-gold transition-colors text-sm">
                  Info@uncage.lk
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy block text-sm">Colombo Office:</span>
                <span>No. 45, Galle Face Terrace, Colombo 03, Sri Lanka</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy block text-sm">Operating Hours:</span>
                <span>24 Hours / 7 Days a Week Chauffeur Dispatch</span>
              </div>
            </div>
          </div>

          {/* Emergency Safety Hotlines Box */}
          <div className="p-4 rounded-2xl bg-pearl border border-navy/10 space-y-2 text-xs">
            <h4 className="font-bold text-navy flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-gold" />
              Official Emergency Services
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-content-muted block">Tourist Police:</span>
                <a href="tel:1912" className="font-bold text-navy hover:underline">1912</a>
              </div>
              <div>
                <span className="text-content-muted block">Ambulance:</span>
                <a href="tel:1990" className="font-bold text-teal-accent hover:underline">1990</a>
              </div>
              <div>
                <span className="text-content-muted block">Police 911/119:</span>
                <a href="tel:119" className="font-bold text-navy hover:underline">119</a>
              </div>
              <div>
                <span className="text-content-muted block">Fire & Rescue:</span>
                <a href="tel:110" className="font-bold text-navy hover:underline">110</a>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-navy/15 shadow-soft">
          <h3 className="font-serif text-2xl font-bold text-navy mb-4">
            Send a Private Travel Request
          </h3>

          {isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-navy">
                Inquiry Received with Distinction
              </h4>
              <p className="text-xs text-content-body max-w-md mx-auto">
                Thank you for reaching out to Royal Rides. Our Colombo operations director
                will review your specifications and contact you within 2 hours.
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="btn-navy px-6 py-2 rounded-xl text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{errorMessage}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                    Contact Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                    Inquiry Type
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
                  >
                    <option value="general">General Travel Inquiry</option>
                    <option value="vehicle_booking">Custom Fleet / Chauffeur Hire</option>
                    <option value="hotel_booking">Boutique Hotel / Villa Reservation</option>
                    <option value="package">Bespoke Multi-Day Island Circuit</option>
                    <option value="partnership">Corporate / VIP Diplomatic Transport</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. 7-Day Chauffeur Tour for Family of 4"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                  Message & Trip Details
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your desired dates, preferred vehicle category, party size, and special preferences..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/15 text-navy font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-premium disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Transmitting...' : 'Send Inquiry to Concierge'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
