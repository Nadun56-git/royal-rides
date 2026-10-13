/**
 * Royal Rides — Centralized Role-Based Admin Portal
 * Real-time analytics, revenue tracking in LKR & USD,
 * unified bookings moderation, fleet inventory, hotels, packages,
 * exchange rate configuration, and contact inquiries.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  TrendingUp,
  Car,
  Hotel,
  Compass,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Mail,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isManagerOrAdmin, isAuthenticated } = useAuthStore();
  const { formatPrice, usdToLkr } = useCurrencyStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'fleet' | 'currency' | 'inquiries'
  const [overviewData, setOverviewData] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Currency override form
  const [customRate, setCustomRate] = useState(usdToLkr || 310);
  const [rateSaved, setRateSaved] = useState(false);

  // Quick vehicle add form state
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    make: '',
    model: '',
    category: 'Car',
    dailyRate: 35000,
    perKmRate: 150,
    baseFee: 5000,
    passengerCapacity: 3,
    transmission: 'Automatic',
  });

  useEffect(() => {
    if (!isAuthenticated || !isManagerOrAdmin()) {
      navigate('/login?redirect=/admin');
      return;
    }

    const loadAdminData = async () => {
      setIsLoading(true);
      try {
        const [overviewRes, bookingsRes, vehiclesRes, inquiriesRes] = await Promise.all([
          api.get('/admin/analytics/overview').catch(() => ({ data: null })),
          api.get('/admin/bookings/all').catch(() => ({ data: [] })),
          api.get('/vehicles?limit=50').catch(() => ({ data: [] })),
          api.get('/contact?limit=20').catch(() => ({ data: [] })),
        ]);

        if (overviewRes.data) setOverviewData(overviewRes.data);
        if (bookingsRes.data) setAllBookings(bookingsRes.data);
        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (inquiriesRes.data) setInquiries(inquiriesRes.data);
      } catch (err) {
        console.error('Admin data fetch error', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [isAuthenticated, isManagerOrAdmin, navigate]);

  const handleUpdateBookingStatus = async (bookingType, id, newStatus) => {
    try {
      let endpoint = `/vehicle-bookings/${id}/status`;
      if (bookingType === 'Hotel') endpoint = `/hotel-bookings/${id}/status`;
      if (bookingType === 'Package') endpoint = `/package-bookings/${id}/status`;

      await api.patch(endpoint, { status: newStatus });

      setAllBookings(
        allBookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert('Error updating status: ' + err?.message);
    }
  };

  const handleSaveRate = async () => {
    try {
      await api.put('/currency/rate', { usdToLkr: Number(customRate) });
      setRateSaved(true);
      setTimeout(() => setRateSaved(false), 3000);
    } catch (err) {
      alert('Error saving rate: ' + err?.message);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/vehicles', newVehicle);
      setVehicles([res.data, ...vehicles]);
      setShowAddVehicleModal(false);
      setNewVehicle({
        name: '',
        make: '',
        model: '',
        category: 'Car',
        dailyRate: 35000,
        perKmRate: 150,
        baseFee: 5000,
        passengerCapacity: 3,
        transmission: 'Automatic',
      });
    } catch (err) {
      alert('Error adding vehicle: ' + err?.message);
    }
  };

  const kpis = overviewData?.kpis || {
    totalBookings: allBookings.length,
    totalRevenueLKR: allBookings.reduce((sum, b) => sum + (b.totalLKR || 0), 0),
    totalPending: allBookings.filter((b) => b.status === 'pending').length,
    activeVehicles: vehicles.length,
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* ── Admin Top Navigation Bar ───────────────────────────────────────── */}
      <div className="glass-card p-6 rounded-3xl border border-navy/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-navy text-gold flex items-center justify-center font-bold shadow-md">
            <ShieldCheck className="w-6 h-6 text-gold" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold">
              Role-Based Management Console
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
              Royal Rides Admin Portal
            </h1>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 text-xs">
          {['overview', 'bookings', 'fleet', 'currency', 'inquiries'].map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-navy text-gold shadow-md'
                  : 'bg-pearl text-navy-800 hover:bg-navy/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI HIGHLIGHT CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-3xl border border-navy/10 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-content-muted">
            Total Reservations
          </span>
          <p className="font-serif text-3xl font-bold text-navy tabular-nums">
            {kpis.totalBookings}
          </p>
          <span className="text-xs text-emerald-600 font-semibold block">Across All 3 Modules</span>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-navy/10 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-content-muted">
            Revenue (LKR)
          </span>
          <p className="font-serif text-2xl font-bold text-navy tabular-nums">
            LKR {Math.round(kpis.totalRevenueLKR).toLocaleString()}
          </p>
          <span className="text-xs text-gold font-semibold block">
            ~ ${(kpis.totalRevenueLKR / (usdToLkr || 310)).toFixed(0)} USD
          </span>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-navy/10 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-content-muted">
            Pending Actions
          </span>
          <p className="font-serif text-3xl font-bold text-amber-600 tabular-nums">
            {kpis.totalPending}
          </p>
          <span className="text-xs text-content-muted block">Awaiting Staff Confirmation</span>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-navy/10 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-content-muted">
            Active Chauffeur Fleet
          </span>
          <p className="font-serif text-3xl font-bold text-navy tabular-nums">
            {kpis.activeVehicles}
          </p>
          <span className="text-xs text-emerald-600 font-semibold block">Ready for Dispatch</span>
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW & RECENT BOOKINGS ───────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-navy">
              Recent Unified Bookings
            </h3>
            <span className="text-xs text-content-muted">Live incoming customer reservations</span>
          </div>

          <div className="glass-card rounded-3xl border border-navy/10 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pearl-100 text-navy font-bold uppercase tracking-wider border-b border-navy/10">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {allBookings.slice(0, 10).map((b) => (
                    <tr key={b.id || b.ref} className="hover:bg-pearl/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-navy">{b.ref}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-navy/5 font-semibold text-navy">
                          {b.type}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-navy">{b.title || 'Reservation'}</td>
                      <td className="p-4 text-content-body">
                        <div>{b.customerName || b.customer}</div>
                        <div className="text-[10px] text-content-muted">{b.customerPhone}</div>
                      </td>
                      <td className="p-4 font-serif font-bold text-navy tabular-nums">
                        {formatPrice(b.totalLKR)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        {b.status !== 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(b.type, b.id, 'confirmed')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(b.type, b.id, 'cancelled')}
                            className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[11px] font-semibold hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: BOOKINGS COMPREHENSIVE ───────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-navy">
              All System Bookings ({allBookings.length})
            </h3>
          </div>

          <div className="glass-card rounded-3xl border border-navy/10 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pearl-100 text-navy font-bold uppercase tracking-wider border-b border-navy/10">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Item Name</th>
                    <th className="p-4">Customer Info</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {allBookings.map((b) => (
                    <tr key={b.id || b.ref} className="hover:bg-pearl/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-navy">{b.ref}</td>
                      <td className="p-4 font-semibold text-navy">{b.type}</td>
                      <td className="p-4">{b.title}</td>
                      <td className="p-4">
                        <div className="font-semibold text-navy">{b.customerName}</div>
                        <div className="text-[10px] text-content-muted">{b.customerEmail}</div>
                      </td>
                      <td className="p-4 text-content-muted">
                        {new Date(b.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-serif font-bold text-navy tabular-nums">
                        {formatPrice(b.totalLKR)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.type, b.id, 'confirmed')}
                          className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.type, b.id, 'cancelled')}
                          className="px-2 py-1 rounded bg-red-100 text-red-600 text-[10px] font-semibold"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: FLEET MANAGEMENT ─────────────────────────────────────────── */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-navy">
              Vehicle Fleet Inventory ({vehicles.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddVehicleModal(true)}
              className="btn-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div
                key={v._id}
                className="glass-card p-5 rounded-2xl border border-navy/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-navy text-gold text-[10px] font-bold uppercase">
                    {v.category}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">Active Fleet</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-navy">{v.name}</h4>
                <div className="text-xs text-content-body space-y-1">
                  <p>Capacity: {v.passengerCapacity} Persons • {v.transmission}</p>
                  <p className="tabular-nums">Daily Rate: {formatPrice(v.dailyRate)}</p>
                  <p className="tabular-nums">Per KM Rate: {formatPrice(v.perKmRate)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Vehicle Modal */}
          {showAddVehicleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/75 backdrop-blur-md">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-elevated space-y-4">
                <h3 className="font-serif text-xl font-bold text-navy">Add Fleet Unit</h3>
                <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-navy mb-1">Vehicle Name</label>
                    <input
                      type="text"
                      required
                      value={newVehicle.name}
                      onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                      placeholder="e.g. BMW 7-Series Chauffeur Edition"
                      className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-navy mb-1">Make</label>
                      <input
                        type="text"
                        required
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        placeholder="BMW"
                        className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-navy mb-1">Model</label>
                      <input
                        type="text"
                        required
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        placeholder="740Li"
                        className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-navy mb-1">Daily Rate (LKR)</label>
                      <input
                        type="number"
                        required
                        value={newVehicle.dailyRate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, dailyRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-navy mb-1">Per-KM (LKR)</label>
                      <input
                        type="number"
                        required
                        value={newVehicle.perKmRate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, perKmRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-pearl border border-navy/15 text-navy"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddVehicleModal(false)}
                      className="px-4 py-2 rounded-xl text-navy hover:bg-navy/5 font-semibold"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-gold px-5 py-2 rounded-xl font-bold">
                      Save Vehicle
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: CURRENCY EXCHANGE RATE CONFIG ─────────────────────────────── */}
      {activeTab === 'currency' && (
        <div className="max-w-xl glass-card p-8 rounded-3xl border border-navy/10 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Multi-Currency Engine
            </span>
            <h3 className="font-serif text-2xl font-bold text-navy">
              LKR ↔ USD Exchange Rate Configuration
            </h3>
            <p className="text-xs text-content-body">
              All prices across Royal Rides are stored base in LKR. Changing this rate immediately
              re-calibrates live conversion rates across the website.
            </p>
          </div>

          {rateSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Exchange rate updated successfully across entire platform!</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                1 USD = (in Sri Lankan Rupees)
              </label>
              <div className="flex items-center gap-3">
                <span className="font-serif text-xl font-bold text-navy">$1.00 USD =</span>
                <input
                  type="number"
                  step="0.1"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="w-36 px-3.5 py-2.5 rounded-xl bg-pearl border border-navy/20 font-bold text-navy text-sm tabular-nums"
                />
                <span className="font-bold text-navy">LKR</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-pearl border border-navy/10 space-y-2 text-content-body">
              <p>
                <strong>Current Conversion Preview:</strong>
              </p>
              <p>LKR 100,000 = ${(100000 / Number(customRate)).toFixed(2)} USD</p>
              <p>LKR 25,000 = ${(25000 / Number(customRate)).toFixed(2)} USD</p>
            </div>

            <button
              type="button"
              onClick={handleSaveRate}
              className="btn-gold px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm"
            >
              Update Global Rate
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 5: CONTACT INQUIRIES ─────────────────────────────────────────── */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <h3 className="font-serif text-2xl font-bold text-navy">
            Customer Inquiries & Custom Trip Requests ({inquiries.length})
          </h3>

          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div
                key={inq._id}
                className="glass-card p-6 rounded-2xl border border-navy/10 space-y-2 shadow-soft"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-navy text-sm">{inq.subject}</h4>
                    <p className="text-xs text-content-muted">
                      From: <strong>{inq.name}</strong> ({inq.email} • {inq.phone || 'No phone'})
                    </p>
                  </div>
                  <span className="text-[10px] text-content-muted">
                    {new Date(inq.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-content-body bg-pearl p-3 rounded-xl leading-relaxed">
                  {inq.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
