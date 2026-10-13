/**
 * Royal Rides — Floating WhatsApp Concierge Button
 */

import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function WhatsAppButton() {
  const phone = '94718282758';
  const message = encodeURIComponent(
    'Hello Royal Rides Concierge, I would like to inquire about booking a luxury travel experience in Sri Lanka.'
  );

  return (
    <aside aria-label="Concierge Assistance" className="fixed bottom-6 right-6 z-40">
      <a
        href={`https://wa.me/${phone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Royal Rides concierge on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-elevated hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
        </span>

        <MessageSquare className="w-6 h-6 fill-current" />

        <div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-navy text-white text-xs font-semibold whitespace-nowrap shadow-premium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
          Chat with Concierge
          <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-navy rotate-45" />
        </div>
      </a>
    </aside>
  );
}
