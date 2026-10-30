/**
 * Royal Rides — Centralized Role-Based Admin Portal
 * Real-time analytics, revenue tracking in LKR & USD,
 * unified & separated bookings moderation (Vehicles, Hotels, Tour Packages),
 * full CRUD for Fleet, Hotels, and Tour Packages,
 * Multer image upload from local computer,
 * User Management, Inquiries Management, and Currency Settings.
 * Zero mock data — 100% connected to live MongoDB backend.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  Filter,
  MapPin,
  Calendar,
  Phone,
  UserCheck,
  AlertTriangle,
  Star,
  Settings,
  X,
  ExternalLink,
  UploadCloud,
  ImageIcon,
  Sparkles,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isManagerOrAdmin, isAuthenticated, logout } = useAuthStore();
  const { formatPrice, usdToLkr, setUsdToLkr } = useCurrencyStore();

  // Active view tab:
  // 'overview' | 'vehicle_bookings' | 'hotel_bookings' | 'tour_bookings' | 'fleet' | 'hotels' | 'packages' | 'users' | 'inquiries' | 'currency'
  const [activeTab, setActiveTab] = useState('overview');

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Data states from real backend
  const [overviewData, setOverviewData] = useState(null);
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [packages, setPackages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Search and status filters per tab
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Currency override form
  const [customRate, setCustomRate] = useState(usdToLkr || 310);
  const [rateSaving, setRateSaving] = useState(false);

  // Modals state
  const [detailModal, setDetailModal] = useState({ open: false, type: null, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null, title: '' });

  // File input refs for uploading from computer
  const vehicleFileInputRef = useRef(null);
  const hotelFileInputRef = useRef(null);
  const packageFileInputRef = useRef(null);

  // Vehicle Modal (Add / Edit)
  const [vehicleModal, setVehicleModal] = useState({ open: false, isEdit: false, data: null });
  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    category: 'Car',
    make: '',
    model: '',
    year: 2024,
    licensePlate: '',
    passengerCapacity: 4,
    luggageCapacity: 3,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    dailyRate: 35000,
    perKmRate: 150,
    baseFee: 5000,
    driverFeePerDay: 4000,
    hasAC: true,
    hasWifi: true,
    hasGPS: true,
    hasChildSeat: false,
    imageUrl: '',
    description: '',
    isAvailable: true,
  });

  // Hotel Modal (Add / Edit)
  const [hotelModal, setHotelModal] = useState({ open: false, isEdit: false, data: null });
  const [hotelForm, setHotelForm] = useState({
    name: '',
    destination: '',
    city: '',
    address: '',
    starRating: 5,
    coverImage: '',
    description: '',
    shortDescription: '',
    roomName: 'Deluxe Suite',
    roomCategory: 'Suite',
    roomMaxGuests: 2,
    roomPricePerNightLKR: 45000,
    roomTotalRooms: 10,
    amenities: 'WiFi, Pool, Spa, Restaurant, Bar, Beach Access',
    isActive: true,
    isFeatured: true,
  });

  // Tour Package Modal (Add / Edit)
  const [packageModal, setPackageModal] = useState({ open: false, isEdit: false, data: null });
  const [packageForm, setPackageForm] = useState({
    name: '',
    tagline: '',
    category: 'Cultural',
    difficulty: 'Easy',
    durationDays: 5,
    durationNights: 4,
    basePricePerPersonLKR: 125000,
    startLocation: 'Colombo',
    endLocation: 'Galle',
    coverImage: '',
    description: '',
    highlights: 'Sigiriya Rock Fortress, Temple of the Tooth, Tea Plantations, Galle Dutch Fort',
    inclusions: 'Luxury Chauffeur Vehicle, 5-Star Accommodations, Breakfast & Dinner, Site Entrance Fees',
    exclusions: 'International Flights, Personal Expenses, Alcoholic Beverages',
    isActive: true,
    isFeatured: true,
  });

  // User Role Modal
  const [roleModal, setRoleModal] = useState({ open: false, user: null, newRole: 'customer' });

  // Inquiry Reply Modal
  const [inquiryModal, setInquiryModal] = useState({ open: false, inquiry: null, replyNotes: '', status: 'replied' });

  // ── Authentication Check ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !isManagerOrAdmin()) {
      navigate('/admin/login?redirect=/admindashboard');
    }
  }, [isAuthenticated, isManagerOrAdmin, navigate]);

  // ── Fetch All Admin Data from Live APIs ─────────────────────────────────────
  const loadAdminData = async (isRef = false) => {
    if (isRef) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [
        overviewRes,
        vhBookingsRes,
        htBookingsRes,
        pkBookingsRes,
        vehiclesRes,
        hotelsRes,
        packagesRes,
        usersRes,
        inquiriesRes,
        destinationsRes,
      ] = await Promise.all([
        api.get('/admin/analytics/overview').catch(() => ({ data: null })),
        api.get('/vehicle-bookings/admin/all?limit=100').catch(() => ({ data: [] })),
        api.get('/hotel-bookings/admin/all?limit=100').catch(() => ({ data: [] })),
        api.get('/package-bookings/admin/all?limit=100').catch(() => ({ data: [] })),
        api.get('/vehicles?all=true&limit=100').catch(() => ({ data: [] })),
        api.get('/hotels?all=true&limit=100').catch(() => ({ data: [] })),
        api.get('/packages?all=true&limit=100').catch(() => ({ data: [] })),
        api.get('/users/admin/all?limit=100').catch(() => ({ data: [] })),
        api.get('/contact?limit=100').catch(() => ({ data: [] })),
        api.get('/destinations?limit=50').catch(() => ({ data: [] })),
      ]);

      const extractList = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        return [];
      };

      if (overviewRes?.data) setOverviewData(overviewRes.data);
      setVehicleBookings(extractList(vhBookingsRes));
      setHotelBookings(extractList(htBookingsRes));
      setPackageBookings(extractList(pkBookingsRes));
      setVehicles(extractList(vehiclesRes));
      setHotels(extractList(hotelsRes));
      setPackages(extractList(packagesRes));
      setUsersList(extractList(usersRes));
      setInquiries(extractList(inquiriesRes));

      const dests = extractList(destinationsRes);
      setDestinations(dests);
      if (dests.length > 0 && !hotelForm.destination) {
        setHotelForm((prev) => ({ ...prev, destination: dests[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      toast.error('Failed to load real-time admin metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isManagerOrAdmin()) {
      loadAdminData();
    }
  }, [isAuthenticated, isManagerOrAdmin]);

  // Reset filters when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  // ── Unified Bookings for Overview ──────────────────────────────────────────
  const unifiedBookings = useMemo(() => {
    const vh = vehicleBookings.map((b) => ({
      ...b,
      moduleType: 'Vehicle',
      displayTitle: b.vehicle?.name || 'Chauffeur Vehicle',
      customerName: b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.name || 'Guest',
      customerEmail: b.user?.email || b.guestInfo?.email || 'N/A',
      customerPhone: b.user?.phone || b.guestInfo?.phone || 'N/A',
      totalLKR: b.priceBreakdown?.totalLKR || 0,
      createdAtDate: b.createdAt,
    }));

    const ht = hotelBookings.map((b) => ({
      ...b,
      moduleType: 'Hotel',
      displayTitle: b.hotel?.name || 'Hotel Stay',
      customerName: b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.name || 'Guest',
      customerEmail: b.user?.email || b.guestInfo?.email || 'N/A',
      customerPhone: b.user?.phone || b.guestInfo?.phone || 'N/A',
      totalLKR: b.priceBreakdown?.totalLKR || 0,
      createdAtDate: b.createdAt,
    }));

    const pk = packageBookings.map((b) => ({
      ...b,
      moduleType: 'Package',
      displayTitle: b.package?.name || 'Tour Package',
      customerName: b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.name || 'Guest',
      customerEmail: b.user?.email || b.guestInfo?.email || 'N/A',
      customerPhone: b.user?.phone || b.guestInfo?.phone || 'N/A',
      totalLKR: b.priceBreakdown?.totalLKR || 0,
      createdAtDate: b.createdAt,
    }));

    return [...vh, ...ht, ...pk].sort((a, b) => new Date(b.createdAtDate) - new Date(a.createdAtDate));
  }, [vehicleBookings, hotelBookings, packageBookings]);

  // Dynamic KPIs calculated from real database records
  const kpis = useMemo(() => {
    const totalBookings = unifiedBookings.length;
    const totalRevenueLKR = unifiedBookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.totalLKR || 0), 0);
    const totalPending = unifiedBookings.filter((b) => b.status === 'pending').length;

    const vhRev = vehicleBookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.priceBreakdown?.totalLKR || 0), 0);
    const htRev = hotelBookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.priceBreakdown?.totalLKR || 0), 0);
    const pkRev = packageBookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.priceBreakdown?.totalLKR || 0), 0);

    const newInquiries = inquiries.filter((i) => i.status === 'new').length;

    return {
      totalBookings,
      totalRevenueLKR,
      totalRevenueUSD: Number((totalRevenueLKR / (usdToLkr || 310)).toFixed(0)),
      totalPending,
      activeVehicles: vehicles.filter((v) => v.isActive).length,
      activeHotels: hotels.filter((h) => h.isActive).length,
      activePackages: packages.filter((p) => p.isActive).length,
      registeredUsers: usersList.length,
      totalInquiries: inquiries.length,
      newInquiries,
      vhCount: vehicleBookings.length,
      htCount: hotelBookings.length,
      pkCount: packageBookings.length,
      vhPending: vehicleBookings.filter((b) => b.status === 'pending').length,
      htPending: hotelBookings.filter((b) => b.status === 'pending').length,
      pkPending: packageBookings.filter((b) => b.status === 'pending').length,
      vhRev,
      htRev,
      pkRev,
    };
  }, [unifiedBookings, vehicleBookings, hotelBookings, packageBookings, vehicles, hotels, packages, usersList, inquiries, usdToLkr]);

  // ── MULTER LOCAL FILE UPLOAD HANDLER ─────────────────────────────────────────
  const handleUploadFromComputer = async (e, target = 'vehicle') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please choose an image file (PNG, JPG, WebP, etc.).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image is too large. Max file size is 15MB.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const toastId = toast.loading(`Uploading "${file.name}" from your computer…`);
    setIsUploading(true);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.url || res.url;
      if (!uploadedUrl) {
        throw new Error('Server did not return an image URL.');
      }

      if (target === 'vehicle') {
        setVehicleForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      } else if (target === 'hotel') {
        setHotelForm((prev) => ({ ...prev, coverImage: uploadedUrl }));
      } else if (target === 'package') {
        setPackageForm((prev) => ({ ...prev, coverImage: uploadedUrl }));
      }

      toast.success('Photo uploaded from your computer successfully!', { id: toastId });
    } catch (err) {
      console.error('File upload failed:', err);
      toast.error('Upload failed: ' + (err?.message || 'Error uploading file'), { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input so same file can be reselected
    }
  };

  // ── Booking Status Update ──────────────────────────────────────────────────
  const handleUpdateBookingStatus = async (moduleType, id, newStatus) => {
    try {
      let endpoint = '';
      if (moduleType === 'Vehicle') endpoint = `/vehicle-bookings/${id}/status`;
      else if (moduleType === 'Hotel') endpoint = `/hotel-bookings/${id}/status`;
      else if (moduleType === 'Package') endpoint = `/package-bookings/${id}/status`;

      await api.patch(endpoint, { status: newStatus });
      toast.success(`${moduleType} booking updated to ${newStatus}`);

      if (moduleType === 'Vehicle') {
        setVehicleBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b)));
      } else if (moduleType === 'Hotel') {
        setHotelBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b)));
      } else if (moduleType === 'Package') {
        setPackageBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b)));
      }
    } catch (err) {
      toast.error('Failed to update booking status: ' + (err?.message || 'Error'));
    }
  };

  // ── Booking Delete ─────────────────────────────────────────────────────────
  const handleDeleteBooking = async (moduleType, id) => {
    try {
      let endpoint = '';
      if (moduleType === 'Vehicle') endpoint = `/vehicle-bookings/${id}`;
      else if (moduleType === 'Hotel') endpoint = `/hotel-bookings/${id}`;
      else if (moduleType === 'Package') endpoint = `/package-bookings/${id}`;

      await api.delete(endpoint);
      toast.success(`${moduleType} reservation deleted successfully`);

      if (moduleType === 'Vehicle') setVehicleBookings((prev) => prev.filter((b) => b._id !== id));
      if (moduleType === 'Hotel') setHotelBookings((prev) => prev.filter((b) => b._id !== id));
      if (moduleType === 'Package') setPackageBookings((prev) => prev.filter((b) => b._id !== id));
      setDeleteConfirm({ open: false, type: null, id: null, title: '' });
    } catch (err) {
      toast.error('Failed to delete booking: ' + (err?.message || 'Error'));
    }
  };

  // ── Vehicle CRUD ───────────────────────────────────────────────────────────
  const handleOpenAddVehicle = () => {
    setVehicleForm({
      name: '',
      category: 'Car',
      make: '',
      model: '',
      year: 2024,
      licensePlate: '',
      passengerCapacity: 4,
      luggageCapacity: 3,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      dailyRate: 35000,
      perKmRate: 150,
      baseFee: 5000,
      driverFeePerDay: 4000,
      hasAC: true,
      hasWifi: true,
      hasGPS: true,
      hasChildSeat: false,
      imageUrl: '',
      description: '',
      isAvailable: true,
    });
    setVehicleModal({ open: true, isEdit: false, data: null });
  };

  const handleOpenEditVehicle = (veh) => {
    setVehicleForm({
      name: veh.name || '',
      category: veh.category || 'Car',
      make: veh.make || '',
      model: veh.model || '',
      year: veh.year || 2024,
      licensePlate: veh.licensePlate || '',
      passengerCapacity: veh.passengerCapacity || 4,
      luggageCapacity: veh.luggageCapacity || 3,
      transmission: veh.transmission || 'Automatic',
      fuelType: veh.fuelType || 'Petrol',
      dailyRate: veh.dailyRate || 35000,
      perKmRate: veh.perKmRate || 150,
      baseFee: veh.baseFee || 5000,
      driverFeePerDay: veh.driverFeePerDay || 4000,
      hasAC: veh.hasAC ?? true,
      hasWifi: veh.hasWifi ?? true,
      hasGPS: veh.hasGPS ?? true,
      hasChildSeat: veh.hasChildSeat ?? false,
      imageUrl: veh.images?.[0]?.url || '',
      description: veh.description || '',
      isAvailable: veh.isAvailable ?? true,
    });
    setVehicleModal({ open: true, isEdit: true, data: veh });
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    try {
      const finalImageUrl =
        vehicleForm.imageUrl ||
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';

      const payload = {
        name: vehicleForm.name,
        category: vehicleForm.category,
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: Number(vehicleForm.year),
        licensePlate: vehicleForm.licensePlate,
        passengerCapacity: Number(vehicleForm.passengerCapacity),
        luggageCapacity: Number(vehicleForm.luggageCapacity),
        transmission: vehicleForm.transmission,
        fuelType: vehicleForm.fuelType,
        dailyRate: Number(vehicleForm.dailyRate),
        perKmRate: Number(vehicleForm.perKmRate),
        baseFee: Number(vehicleForm.baseFee),
        driverFeePerDay: Number(vehicleForm.driverFeePerDay),
        hasAC: Boolean(vehicleForm.hasAC),
        hasWifi: Boolean(vehicleForm.hasWifi),
        hasGPS: Boolean(vehicleForm.hasGPS),
        hasChildSeat: Boolean(vehicleForm.hasChildSeat),
        images: [{ url: finalImageUrl, isPrimary: true, alt: vehicleForm.name }],
        description: vehicleForm.description,
        isAvailable: Boolean(vehicleForm.isAvailable),
        isActive: true,
      };

      if (vehicleModal.isEdit) {
        const res = await api.put(`/vehicles/${vehicleModal.data._id}`, payload);
        const updated = res.data || res;
        setVehicles((prev) => prev.map((v) => (v._id === vehicleModal.data._id ? updated : v)));
        toast.success('Vehicle updated successfully!');
      } else {
        const res = await api.post('/vehicles', payload);
        const created = res.data || res;
        setVehicles((prev) => [created, ...prev]);
        toast.success('New vehicle added to fleet!');
      }
      setVehicleModal({ open: false, isEdit: false, data: null });
    } catch (err) {
      toast.error('Vehicle save failed: ' + (err?.message || 'Error'));
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await api.delete(`/vehicles/${id}?hard=true`);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      toast.success('Vehicle deleted successfully');
      setDeleteConfirm({ open: false, type: null, id: null, title: '' });
    } catch (err) {
      toast.error('Failed to delete vehicle: ' + (err?.message || 'Error'));
    }
  };

  const handleToggleVehicleAvailability = async (veh) => {
    try {
      const updatedStatus = !veh.isAvailable;
      const res = await api.put(`/vehicles/${veh._id}`, { isAvailable: updatedStatus });
      const updated = res.data || res;
      setVehicles((prev) => prev.map((v) => (v._id === veh._id ? { ...v, isAvailable: updatedStatus } : v)));
      toast.success(`Vehicle marked ${updatedStatus ? 'Available' : 'Unavailable'}`);
    } catch (err) {
      toast.error('Failed to toggle availability: ' + err?.message);
    }
  };

  // ── Hotel CRUD ─────────────────────────────────────────────────────────────
  const handleOpenAddHotel = () => {
    setHotelForm({
      name: '',
      destination: destinations[0]?._id || '',
      city: '',
      address: '',
      starRating: 5,
      coverImage: '',
      description: '',
      shortDescription: '',
      roomName: 'Deluxe Ocean Suite',
      roomCategory: 'Suite',
      roomMaxGuests: 2,
      roomPricePerNightLKR: 45000,
      roomTotalRooms: 10,
      amenities: 'WiFi, Pool, Spa, Restaurant, Bar, Beach Access',
      isActive: true,
      isFeatured: true,
    });
    setHotelModal({ open: true, isEdit: false, data: null });
  };

  const handleOpenEditHotel = (htl) => {
    const primaryRoom = htl.rooms?.[0] || {};
    setHotelForm({
      name: htl.name || '',
      destination: htl.destination?._id || htl.destination || destinations[0]?._id || '',
      city: htl.city || '',
      address: htl.address || '',
      starRating: htl.starRating || 5,
      coverImage: htl.coverImage || htl.images?.[0]?.url || '',
      description: htl.description || '',
      shortDescription: htl.shortDescription || '',
      roomName: primaryRoom.name || 'Standard Luxury Room',
      roomCategory: primaryRoom.category || 'Deluxe',
      roomMaxGuests: primaryRoom.maxGuests || 2,
      roomPricePerNightLKR: primaryRoom.pricePerNightLKR || 35000,
      roomTotalRooms: primaryRoom.totalRooms || 8,
      amenities: (htl.amenities || ['WiFi', 'Pool', 'Restaurant']).join(', '),
      isActive: htl.isActive ?? true,
      isFeatured: htl.isFeatured ?? true,
    });
    setHotelModal({ open: true, isEdit: true, data: htl });
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArr = hotelForm.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const finalCover =
        hotelForm.coverImage ||
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

      const payload = {
        name: hotelForm.name,
        destination: hotelForm.destination || destinations[0]?._id,
        city: hotelForm.city,
        address: hotelForm.address,
        location: {
          type: 'Point',
          coordinates: [80.221, 6.0535],
        },
        starRating: Number(hotelForm.starRating),
        coverImage: finalCover,
        images: [{ url: finalCover, isPrimary: true, alt: hotelForm.name }],
        description: hotelForm.description,
        shortDescription: hotelForm.shortDescription,
        amenities: amenitiesArr,
        rooms: [
          {
            name: hotelForm.roomName,
            category: hotelForm.roomCategory,
            maxGuests: Number(hotelForm.roomMaxGuests),
            totalRooms: Number(hotelForm.roomTotalRooms),
            availableRooms: Number(hotelForm.roomTotalRooms),
            pricePerNightLKR: Number(hotelForm.roomPricePerNightLKR),
            amenities: ['WiFi', 'Air Conditioning'],
          },
        ],
        isActive: Boolean(hotelForm.isActive),
        isFeatured: Boolean(hotelForm.isFeatured),
      };

      if (hotelModal.isEdit) {
        const res = await api.put(`/hotels/${hotelModal.data._id}`, payload);
        const updated = res.data || res;
        setHotels((prev) => prev.map((h) => (h._id === hotelModal.data._id ? updated : h)));
        toast.success('Hotel details updated!');
      } else {
        const res = await api.post('/hotels', payload);
        const created = res.data || res;
        setHotels((prev) => [created, ...prev]);
        toast.success('New luxury hotel created!');
      }
      setHotelModal({ open: false, isEdit: false, data: null });
    } catch (err) {
      toast.error('Hotel save failed: ' + (err?.message || 'Error'));
    }
  };

  const handleDeleteHotel = async (id) => {
    try {
      await api.delete(`/hotels/${id}?hard=true`);
      setHotels((prev) => prev.filter((h) => h._id !== id));
      toast.success('Hotel deleted successfully');
      setDeleteConfirm({ open: false, type: null, id: null, title: '' });
    } catch (err) {
      toast.error('Failed to delete hotel: ' + (err?.message || 'Error'));
    }
  };

  // ── Tour Package CRUD ──────────────────────────────────────────────────────
  const handleOpenAddPackage = () => {
    setPackageForm({
      name: '',
      tagline: '',
      category: 'Cultural',
      difficulty: 'Easy',
      durationDays: 5,
      durationNights: 4,
      basePricePerPersonLKR: 125000,
      startLocation: 'Colombo',
      endLocation: 'Galle',
      coverImage: '',
      description: '',
      highlights: 'Sigiriya Rock Fortress, Temple of the Tooth, Tea Plantations, Galle Dutch Fort',
      inclusions: 'Chauffeur Vehicle, 5-Star Accommodations, Breakfast & Dinner, Site Entrance Fees',
      exclusions: 'International Flights, Personal Expenses, Alcoholic Beverages',
      isActive: true,
      isFeatured: true,
    });
    setPackageModal({ open: true, isEdit: false, data: null });
  };

  const handleOpenEditPackage = (pkg) => {
    setPackageForm({
      name: pkg.name || '',
      tagline: pkg.tagline || '',
      category: pkg.category || 'Cultural',
      difficulty: pkg.difficulty || 'Easy',
      durationDays: pkg.durationDays || 5,
      durationNights: pkg.durationNights || 4,
      basePricePerPersonLKR: pkg.basePricePerPersonLKR || 125000,
      startLocation: pkg.startLocation || 'Colombo',
      endLocation: pkg.endLocation || 'Galle',
      coverImage: pkg.coverImage || pkg.images?.[0]?.url || '',
      description: pkg.description || '',
      highlights: (pkg.highlights || []).join(', '),
      inclusions: (pkg.inclusions || []).join(', '),
      exclusions: (pkg.exclusions || []).join(', '),
      isActive: pkg.isActive ?? true,
      isFeatured: pkg.isFeatured ?? true,
    });
    setPackageModal({ open: true, isEdit: true, data: pkg });
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      const splitClean = (str) =>
        str
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

      const finalCover =
        packageForm.coverImage ||
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80';

      const payload = {
        name: packageForm.name,
        tagline: packageForm.tagline,
        category: packageForm.category,
        difficulty: packageForm.difficulty,
        durationDays: Number(packageForm.durationDays),
        durationNights: Number(packageForm.durationNights),
        basePricePerPersonLKR: Number(packageForm.basePricePerPersonLKR),
        startLocation: packageForm.startLocation,
        endLocation: packageForm.endLocation,
        coverImage: finalCover,
        images: [{ url: finalCover, isPrimary: true, alt: packageForm.name }],
        description: packageForm.description,
        highlights: splitClean(packageForm.highlights),
        inclusions: splitClean(packageForm.inclusions),
        exclusions: splitClean(packageForm.exclusions),
        destinations: destinations.slice(0, 3).map((d) => d._id),
        isActive: Boolean(packageForm.isActive),
        isFeatured: Boolean(packageForm.isFeatured),
      };

      if (packageModal.isEdit) {
        const res = await api.put(`/packages/${packageModal.data._id}`, payload);
        const updated = res.data || res;
        setPackages((prev) => prev.map((p) => (p._id === packageModal.data._id ? updated : p)));
        toast.success('Tour Package updated successfully!');
      } else {
        const res = await api.post('/packages', payload);
        const created = res.data || res;
        setPackages((prev) => [created, ...prev]);
        toast.success('New Tour Package created!');
      }
      setPackageModal({ open: false, isEdit: false, data: null });
    } catch (err) {
      toast.error('Tour package save failed: ' + (err?.message || 'Error'));
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      await api.delete(`/packages/${id}?hard=true`);
      setPackages((prev) => prev.filter((p) => p._id !== id));
      toast.success('Tour Package deleted successfully');
      setDeleteConfirm({ open: false, type: null, id: null, title: '' });
    } catch (err) {
      toast.error('Failed to delete package: ' + (err?.message || 'Error'));
    }
  };

  // ── User Management Handlers ───────────────────────────────────────────────
  const handleOpenRoleModal = (usr) => {
    setRoleModal({ open: true, user: usr, newRole: usr.role });
  };

  const handleSaveUserRole = async () => {
    if (!roleModal.user) return;
    try {
      const res = await api.patch(`/users/admin/${roleModal.user._id}/role`, {
        role: roleModal.newRole,
      });
      const updated = res.data || res;
      setUsersList((prev) =>
        prev.map((u) => (u._id === roleModal.user._id ? { ...u, role: roleModal.newRole } : u))
      );
      toast.success(`User role updated to ${roleModal.newRole}`);
      setRoleModal({ open: false, user: null, newRole: 'customer' });
    } catch (err) {
      toast.error('Failed to update role: ' + (err?.message || 'Error'));
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/users/admin/${id}`);
      setUsersList((prev) => prev.filter((u) => u._id !== id));
      toast.success('User account removed');
      setDeleteConfirm({ open: false, type: null, id: null, title: '' });
    } catch (err) {
      toast.error('Failed to delete user: ' + (err?.message || 'Error'));
    }
  };

  // ── Inquiry Handlers ───────────────────────────────────────────────────────
  const handleUpdateInquiryStatus = async (id, status, notes = '') => {
    try {
      const res = await api.patch(`/contact/${id}/status`, {
        status,
        replyText: notes || undefined,
      });
      setInquiries((prev) =>
        prev.map((i) => (i._id === id ? { ...i, status, replyText: notes || i.replyText } : i))
      );
      toast.success(`Inquiry marked as ${status}`);
      if (inquiryModal.open) setInquiryModal({ open: false, inquiry: null, replyNotes: '', status: 'replied' });
    } catch (err) {
      toast.error('Failed to update inquiry: ' + (err?.message || 'Error'));
    }
  };

  const handleDeleteInquiry = async (id) => {
    try {
      await api.delete(`/contact/${id}`);
      setInquiries((prev) => prev.filter((i) => i._id !== id));
      toast.success('Inquiry deleted successfully');
      setDeleteConfirm({ open: false, type: null, id: null, title: '' });
    } catch (err) {
      toast.error('Failed to delete inquiry: ' + (err?.message || 'Error'));
    }
  };

  // ── Currency Rate Update ───────────────────────────────────────────────────
  const handleSaveRate = async () => {
    setRateSaving(true);
    try {
      const rateNum = Number(customRate);
      if (isNaN(rateNum) || rateNum <= 0) {
        toast.error('Please enter a valid rate greater than 0');
        return;
      }
      await api.put('/currency/rate', { usdToLkr: rateNum });
      if (setUsdToLkr) setUsdToLkr(rateNum);
      toast.success(`Exchange rate set to 1 USD = ${rateNum} LKR`);
    } catch (err) {
      toast.error('Failed to update rate: ' + (err?.message || 'Error'));
    } finally {
      setRateSaving(false);
    }
  };

  // ── Filtered Records for Active Tab ────────────────────────────────────────
  const filteredVehicleBookings = useMemo(() => {
    return vehicleBookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const ref = (b.bookingRef || '').toLowerCase();
      const guest = (b.guestInfo?.name || b.user?.firstName || '').toLowerCase();
      const veh = (b.vehicle?.name || '').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        ref.includes(searchTerm.toLowerCase()) ||
        guest.includes(searchTerm.toLowerCase()) ||
        veh.includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [vehicleBookings, statusFilter, searchTerm]);

  const filteredHotelBookings = useMemo(() => {
    return hotelBookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const ref = (b.bookingRef || '').toLowerCase();
      const guest = (b.guestInfo?.name || b.user?.firstName || '').toLowerCase();
      const htl = (b.hotel?.name || '').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        ref.includes(searchTerm.toLowerCase()) ||
        guest.includes(searchTerm.toLowerCase()) ||
        htl.includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [hotelBookings, statusFilter, searchTerm]);

  const filteredPackageBookings = useMemo(() => {
    return packageBookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const ref = (b.bookingRef || '').toLowerCase();
      const guest = (b.guestInfo?.name || b.user?.firstName || '').toLowerCase();
      const pkg = (b.package?.name || '').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        ref.includes(searchTerm.toLowerCase()) ||
        guest.includes(searchTerm.toLowerCase()) ||
        pkg.includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [packageBookings, statusFilter, searchTerm]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesCat = categoryFilter === 'all' || v.category === categoryFilter;
      const name = (v.name || '').toLowerCase();
      const make = (v.make || '').toLowerCase();
      const model = (v.model || '').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm.toLowerCase()) ||
        make.includes(searchTerm.toLowerCase()) ||
        model.includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [vehicles, categoryFilter, searchTerm]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const name = (h.name || '').toLowerCase();
      const city = (h.city || '').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm.toLowerCase()) ||
        city.includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [hotels, searchTerm]);

  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      const name = (p.name || '').toLowerCase();
      const tagline = (p.tagline || '').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm.toLowerCase()) ||
        tagline.includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [packages, categoryFilter, searchTerm]);

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const matchesRole = statusFilter === 'all' || u.role === statusFilter;
      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [usersList, statusFilter, searchTerm]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
      const name = (i.name || '').toLowerCase();
      const email = (i.email || '').toLowerCase();
      const subject = (i.subject || '').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        subject.includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [inquiries, statusFilter, searchTerm]);

  // Helper badge for booking status
  const renderStatusBadge = (status) => {
    const map = {
      pending: 'bg-amber-100 text-amber-800 border-amber-300',
      confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-purple-100 text-purple-800 border-purple-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      new: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      read: 'bg-blue-100 text-blue-800 border-blue-300',
      replied: 'bg-purple-100 text-purple-800 border-purple-300',
      closed: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
          map[status] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {status?.replace('_', ' ')}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-serif font-bold text-navy tracking-widest uppercase">
          Initializing Royal Rides Management Console…
        </p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-navy/15 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy to-navy-700 text-gold flex items-center justify-center font-bold shadow-lg border border-gold/40">
            <ShieldCheck className="w-8 h-8 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/15 px-2.5 py-0.5 rounded-full border border-gold/30">
                {user?.role?.replace('_', ' ')} Console
              </span>
              <span className="text-xs text-content-muted">
                Logged in as <strong className="text-navy">{user?.firstName} {user?.lastName}</strong>
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy mt-1">
              Royal Rides Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Top Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => loadAdminData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pearl hover:bg-navy/5 border border-navy/15 text-navy font-semibold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Live Data…' : 'Sync Live Data'}</span>
          </button>

          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-pearl hover:bg-navy/5 border border-navy/15 text-navy-700 font-semibold text-xs transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-navy-600" />
            <span>Public Site</span>
          </Link>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-navy/10">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp, badge: null },
          { id: 'vehicle_bookings', label: 'Vehicle Bookings', icon: Car, badge: kpis.vhCount },
          { id: 'hotel_bookings', label: 'Hotel Bookings', icon: Hotel, badge: kpis.htCount },
          { id: 'tour_bookings', label: 'Tour Bookings', icon: Compass, badge: kpis.pkCount },
          { id: 'fleet', label: 'Fleet Management', icon: Car, badge: kpis.activeVehicles },
          { id: 'hotels', label: 'Hotels Management', icon: Hotel, badge: kpis.activeHotels },
          { id: 'packages', label: 'Tour Packages', icon: Compass, badge: kpis.activePackages },
          { id: 'users', label: 'User Management', icon: Users, badge: kpis.registeredUsers },
          { id: 'inquiries', label: 'Inquiries', icon: Mail, badge: kpis.newInquiries ? `${kpis.newInquiries} new` : kpis.totalInquiries },
          { id: 'currency', label: 'Currency & Rates', icon: DollarSign, badge: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm ${
                isActive
                  ? 'bg-navy text-gold shadow-md border border-gold/40'
                  : 'bg-white hover:bg-navy/5 text-navy-800 border border-navy/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-navy-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== null && tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-gold/25 text-gold' : 'bg-navy/10 text-navy'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card p-6 rounded-3xl border border-navy/10 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-content-muted">
                Total System Reservations
              </span>
              <p className="font-serif text-3xl font-bold text-navy tabular-nums">
                {kpis.totalBookings}
              </p>
              <div className="flex items-center justify-between text-xs font-semibold pt-1 text-emerald-600">
                <span>Vehicles: {kpis.vhCount}</span>
                <span>Hotels: {kpis.htCount}</span>
                <span>Tours: {kpis.pkCount}</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-navy/10 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-content-muted">
                Total Revenue
              </span>
              <p className="font-serif text-2xl font-bold text-navy tabular-nums">
                LKR {Math.round(kpis.totalRevenueLKR).toLocaleString()}
              </p>
              <span className="text-xs text-gold font-bold block">
                ≈ ${kpis.totalRevenueUSD.toLocaleString()} USD (Live @ {usdToLkr || 310})
              </span>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-navy/10 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-content-muted">
                Pending Moderation
              </span>
              <p className="font-serif text-3xl font-bold text-amber-600 tabular-nums">
                {kpis.totalPending}
              </p>
              <div className="flex items-center gap-3 text-xs text-content-muted">
                <span>Vehicles: {kpis.vhPending}</span>
                <span>Hotels: {kpis.htPending}</span>
                <span>Tours: {kpis.pkPending}</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-navy/10 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-content-muted">
                Client Inquiries
              </span>
              <p className="font-serif text-3xl font-bold text-navy tabular-nums">
                {kpis.totalInquiries}
              </p>
              <span className="text-xs text-emerald-600 font-semibold block">
                {kpis.newInquiries} Awaiting Response
              </span>
            </div>
          </div>

          {/* Module Deep-Dive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-navy/10 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-navy">Chauffeur Fleet</h3>
                    <p className="text-xs text-content-muted">{kpis.activeVehicles} Ready for Dispatch</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('fleet')}
                  className="text-xs text-gold font-bold hover:underline"
                >
                  Manage →
                </button>
              </div>
              <div className="pt-2 border-t border-navy/5 flex justify-between text-xs">
                <span className="text-content-muted">Fleet Revenue</span>
                <span className="font-bold text-navy">LKR {Math.round(kpis.vhRev).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-navy/10 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-700">
                    <Hotel className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-navy">Hotels & Villas</h3>
                    <p className="text-xs text-content-muted">{kpis.activeHotels} Active Properties</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('hotels')}
                  className="text-xs text-gold font-bold hover:underline"
                >
                  Manage →
                </button>
              </div>
              <div className="pt-2 border-t border-navy/5 flex justify-between text-xs">
                <span className="text-content-muted">Hotels Revenue</span>
                <span className="font-bold text-navy">LKR {Math.round(kpis.htRev).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-navy/10 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-navy">Tour Packages</h3>
                    <p className="text-xs text-content-muted">{kpis.activePackages} Curated Tours</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('packages')}
                  className="text-xs text-gold font-bold hover:underline"
                >
                  Manage →
                </button>
              </div>
              <div className="pt-2 border-t border-navy/5 flex justify-between text-xs">
                <span className="text-content-muted">Tours Revenue</span>
                <span className="font-bold text-navy">LKR {Math.round(kpis.pkRev).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-card p-6 rounded-3xl border border-navy/10 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-navy uppercase tracking-wider">
              Quick Management Shortcuts:
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleOpenAddVehicle}
                className="px-3.5 py-2 rounded-xl bg-navy text-gold text-xs font-bold hover:brightness-110 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Vehicle
              </button>
              <button
                type="button"
                onClick={handleOpenAddHotel}
                className="px-3.5 py-2 rounded-xl bg-navy text-gold text-xs font-bold hover:brightness-110 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Hotel
              </button>
              <button
                type="button"
                onClick={handleOpenAddPackage}
                className="px-3.5 py-2 rounded-xl bg-navy text-gold text-xs font-bold hover:brightness-110 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tour Package
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('users')}
                className="px-3.5 py-2 rounded-xl bg-pearl border border-navy/20 text-navy text-xs font-bold hover:bg-navy/5 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Users className="w-3.5 h-3.5" />
                User Roles
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('inquiries')}
                className="px-3.5 py-2 rounded-xl bg-pearl border border-navy/20 text-navy text-xs font-bold hover:bg-navy/5 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                Client Inquiries
              </button>
            </div>
          </div>

          {/* Recent Unified Bookings Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy">
                  Recent Incoming Bookings (Unified Live Stream)
                </h3>
                <p className="text-xs text-content-muted">
                  Latest customer bookings across Chauffeurs, Luxury Hotels, and Tour Packages
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-navy/10 overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-pearl-100 text-navy font-bold uppercase tracking-wider border-b border-navy/10">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Module</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    {unifiedBookings.slice(0, 10).map((b) => (
                      <tr key={`${b.moduleType}-${b._id}`} className="hover:bg-pearl/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-navy">{b.bookingRef}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              b.moduleType === 'Vehicle'
                                ? 'bg-amber-100 text-amber-800'
                                : b.moduleType === 'Hotel'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {b.moduleType}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-navy max-w-xs truncate">{b.displayTitle}</td>
                        <td className="p-4">
                          <span className="block font-medium text-navy">{b.customerName}</span>
                          <span className="text-[11px] text-content-muted">{b.customerPhone}</span>
                        </td>
                        <td className="p-4 font-bold text-navy tabular-nums">
                          LKR {Math.round(b.totalLKR).toLocaleString()}
                        </td>
                        <td className="p-4">{renderStatusBadge(b.status)}</td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {b.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.moduleType, b._id, 'confirmed')}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="Confirm Booking"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDetailModal({ open: true, type: b.moduleType, data: b })}
                              className="p-1.5 rounded-lg bg-navy/5 text-navy hover:bg-navy/10 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  open: true,
                                  type: b.moduleType,
                                  id: b._id,
                                  title: `${b.moduleType} Booking #${b.bookingRef}`,
                                })
                              }
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete Booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {unifiedBookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-content-muted">
                          No reservations in database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: VEHICLE BOOKINGS ─────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'vehicle_bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">Chauffeur Vehicle Bookings</h2>
              <p className="text-xs text-content-muted">Manage car, van, and luxury coach bookings</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search reference, guest, car..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy font-semibold focus:outline-none focus:border-gold"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-navy/10 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pearl-100 text-navy font-bold uppercase tracking-wider border-b border-navy/10">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Rental Dates</th>
                    <th className="p-4">Pickup / Dropoff</th>
                    <th className="p-4">Total (LKR)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {filteredVehicleBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-pearl/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-navy">{b.bookingRef}</td>
                      <td className="p-4 font-semibold text-navy">
                        {b.vehicle?.name || 'Vehicle'}
                        <span className="block text-[11px] text-content-muted font-normal">
                          {b.rentalType === 'self_drive' ? 'Self Drive' : 'With Driver'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-navy">
                          {b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.name || 'Guest'}
                        </span>
                        <span className="block text-[11px] text-content-muted">{b.guestInfo?.phone || b.user?.phone}</span>
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        {b.rentalPeriod?.start ? new Date(b.rentalPeriod.start).toLocaleDateString() : 'N/A'} -{' '}
                        {b.rentalPeriod?.end ? new Date(b.rentalPeriod.end).toLocaleDateString() : 'N/A'}
                        <span className="block text-content-muted font-sans font-semibold">
                          ({b.rentalPeriod?.totalDays || 1} Days)
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate text-[11px] text-content-body">
                        <span>{b.pickupLocation?.address || 'Colombo'}</span>
                        <span className="block text-content-muted">→ {b.dropoffLocation?.address || 'Same'}</span>
                      </td>
                      <td className="p-4 font-bold text-navy tabular-nums">
                        LKR {Math.round(b.priceBreakdown?.totalLKR || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateBookingStatus('Vehicle', b._id, e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-pearl border border-navy/15 text-navy focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailModal({ open: true, type: 'Vehicle', data: b })}
                            className="p-1.5 rounded-lg bg-navy/5 text-navy hover:bg-navy/10 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                type: 'Vehicle',
                                id: b._id,
                                title: `Vehicle Booking #${b.bookingRef}`,
                              })
                            }
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredVehicleBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-content-muted">
                        No vehicle bookings match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 3: HOTEL BOOKINGS ───────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'hotel_bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">Hotel & Villa Reservations</h2>
              <p className="text-xs text-content-muted">Manage accommodations, check-ins, and guest stays</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search reference, guest, hotel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy font-semibold focus:outline-none focus:border-gold"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-navy/10 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pearl-100 text-navy font-bold uppercase tracking-wider border-b border-navy/10">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Hotel Property</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Check-In / Out</th>
                    <th className="p-4">Room & Guests</th>
                    <th className="p-4">Total (LKR)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {filteredHotelBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-pearl/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-navy">{b.bookingRef}</td>
                      <td className="p-4 font-semibold text-navy">
                        {b.hotel?.name || 'Hotel'}
                        <span className="block text-[11px] text-content-muted font-normal">{b.hotel?.city || 'Sri Lanka'}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-navy">
                          {b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.name || 'Guest'}
                        </span>
                        <span className="block text-[11px] text-content-muted">{b.guestInfo?.phone || b.user?.phone}</span>
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        {b.stayPeriod?.checkIn ? new Date(b.stayPeriod.checkIn).toLocaleDateString() : 'N/A'} -{' '}
                        {b.stayPeriod?.checkOut ? new Date(b.stayPeriod.checkOut).toLocaleDateString() : 'N/A'}
                        <span className="block text-content-muted font-sans font-semibold">
                          ({b.stayPeriod?.totalNights || 1} Nights)
                        </span>
                      </td>
                      <td className="p-4 text-[11px]">
                        <span className="font-semibold text-navy">{b.roomType?.name || 'Standard'}</span>
                        <span className="block text-content-muted">
                          {b.roomCount || 1} Room(s) · {b.guestCount || 2} Guest(s)
                        </span>
                      </td>
                      <td className="p-4 font-bold text-navy tabular-nums">
                        LKR {Math.round(b.priceBreakdown?.totalLKR || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateBookingStatus('Hotel', b._id, e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-pearl border border-navy/15 text-navy focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailModal({ open: true, type: 'Hotel', data: b })}
                            className="p-1.5 rounded-lg bg-navy/5 text-navy hover:bg-navy/10 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                type: 'Hotel',
                                id: b._id,
                                title: `Hotel Booking #${b.bookingRef}`,
                              })
                            }
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredHotelBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-content-muted">
                        No hotel reservations match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 4: TOUR BOOKINGS ────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'tour_bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">Tour Package Bookings</h2>
              <p className="text-xs text-content-muted">Manage multi-day excursions, guides, and group itineraries</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search reference, guest, tour..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy font-semibold focus:outline-none focus:border-gold"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-navy/10 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pearl-100 text-navy font-bold uppercase tracking-wider border-b border-navy/10">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Tour Package</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">Travelers & Guide</th>
                    <th className="p-4">Total (LKR)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {filteredPackageBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-pearl/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-navy">{b.bookingRef}</td>
                      <td className="p-4 font-semibold text-navy">
                        {b.package?.name || 'Tour Package'}
                        <span className="block text-[11px] text-content-muted font-normal">
                          {b.package?.durationDays || 1} Days Tour
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-navy">
                          {b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.name || 'Guest'}
                        </span>
                        <span className="block text-[11px] text-content-muted">{b.guestInfo?.phone || b.user?.phone}</span>
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-[11px]">
                        <span className="font-semibold text-navy">{b.groupSize || 1} Traveler(s)</span>
                        <span className="block text-content-muted">
                          {b.tourGuide ? `Guide: ${b.tourGuide.name}` : 'No guide assigned'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-navy tabular-nums">
                        LKR {Math.round(b.priceBreakdown?.totalLKR || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateBookingStatus('Package', b._id, e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-pearl border border-navy/15 text-navy focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailModal({ open: true, type: 'Package', data: b })}
                            className="p-1.5 rounded-lg bg-navy/5 text-navy hover:bg-navy/10 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                type: 'Package',
                                id: b._id,
                                title: `Tour Booking #${b.bookingRef}`,
                              })
                            }
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPackageBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-content-muted">
                        No tour package bookings match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 5: FLEET MANAGEMENT (CRUD) ─────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">Fleet Management</h2>
              <p className="text-xs text-content-muted">
                Add, edit, deactivate, or delete vehicles from the live database
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search fleet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy font-semibold focus:outline-none focus:border-gold"
              >
                <option value="all">All Categories</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Luxury Passenger Unit">Luxury Unit</option>
                <option value="SUV">SUV</option>
                <option value="Bus">Bus</option>
                <option value="Tuk Tuk">Tuk Tuk</option>
              </select>

              <button
                type="button"
                onClick={handleOpenAddVehicle}
                className="px-4 py-2 rounded-xl bg-navy text-gold text-xs font-bold hover:brightness-110 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((veh) => {
              const primaryImg =
                veh.images?.find((img) => img.isPrimary)?.url ||
                veh.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={veh._id}
                  className="bg-white rounded-3xl border border-navy/10 overflow-hidden shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-navy-950">
                      <img
                        src={primaryImg}
                        alt={veh.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                            veh.isAvailable
                              ? 'bg-emerald-600/90 text-white'
                              : 'bg-red-600/90 text-white'
                          }`}
                        >
                          {veh.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-navy/90 text-gold text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                          {veh.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-serif text-lg font-bold text-navy truncate">{veh.name}</h4>
                        <p className="text-xs text-content-muted">
                          {veh.make} {veh.model} ({veh.year || 2024}) · Plate: {veh.licensePlate || 'N/A'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-navy/5">
                        <div>
                          <span className="text-[10px] text-content-muted uppercase block">Daily Rate</span>
                          <span className="font-bold text-navy">LKR {veh.dailyRate?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-content-muted uppercase block">Per Km</span>
                          <span className="font-bold text-navy">LKR {veh.perKmRate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-content-muted uppercase block">Capacity</span>
                          <span className="font-semibold text-content-body">{veh.passengerCapacity} Passengers</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-content-muted uppercase block">Gearbox</span>
                          <span className="font-semibold text-content-body">{veh.transmission}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-pearl-50 border-t border-navy/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleVehicleAvailability(veh)}
                      className="text-xs font-semibold text-navy-700 hover:text-navy underline"
                    >
                      {veh.isAvailable ? 'Mark Busy' : 'Mark Available'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditVehicle(veh)}
                        className="p-2 rounded-xl bg-pearl hover:bg-navy/5 border border-navy/15 text-navy transition-colors"
                        title="Edit Vehicle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            open: true,
                            type: 'Fleet',
                            id: veh._id,
                            title: `Vehicle "${veh.name}"`,
                          })
                        }
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredVehicles.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-navy/10 text-content-muted">
              No vehicles found matching criteria.
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 6: HOTELS MANAGEMENT (CRUD) ─────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'hotels' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">Hotels & Villas Management</h2>
              <p className="text-xs text-content-muted">
                Add, modify, and manage luxury hospitality listings
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search hotel name, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenAddHotel}
                className="px-4 py-2 rounded-xl bg-navy text-gold text-xs font-bold hover:brightness-110 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Hotel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((htl) => {
              const coverImg =
                htl.coverImage ||
                htl.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
              const startingPrice = htl.rooms?.[0]?.pricePerNightLKR || 35000;

              return (
                <div
                  key={htl._id}
                  className="bg-white rounded-3xl border border-navy/10 overflow-hidden shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-navy-950">
                      <img
                        src={coverImg}
                        alt={htl.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        {Array.from({ length: htl.starRating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                        ))}
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-navy/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                          {htl.city || 'Sri Lanka'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-serif text-lg font-bold text-navy truncate">{htl.name}</h4>
                        <p className="text-xs text-content-muted truncate">{htl.address || htl.city}</p>
                      </div>

                      <div className="pt-2 border-t border-navy/5 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-content-muted uppercase block">Rooms Available</span>
                          <span className="font-semibold text-navy">{htl.rooms?.length || 1} Room Type(s)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-content-muted uppercase block">From / Night</span>
                          <span className="font-bold text-navy">LKR {startingPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-pearl-50 border-t border-navy/10 flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        htl.isActive ? 'text-emerald-700' : 'text-content-muted'
                      }`}
                    >
                      {htl.isActive ? '● Live on Catalog' : '○ Inactive'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditHotel(htl)}
                        className="p-2 rounded-xl bg-pearl hover:bg-navy/5 border border-navy/15 text-navy transition-colors"
                        title="Edit Hotel"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            open: true,
                            type: 'Hotels',
                            id: htl._id,
                            title: `Hotel "${htl.name}"`,
                          })
                        }
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Delete Hotel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredHotels.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-navy/10 text-content-muted">
              No hotels found matching criteria.
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 7: TOUR PACKAGES (CRUD) ─────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">Tour Packages Management</h2>
              <p className="text-xs text-content-muted">
                Create, update, and publish curated multi-day island journeys
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy font-semibold focus:outline-none focus:border-gold"
              >
                <option value="all">All Categories</option>
                <option value="Cultural">Cultural</option>
                <option value="Beach">Beach</option>
                <option value="Wildlife">Wildlife</option>
                <option value="Adventure">Adventure</option>
                <option value="Honeymoon">Honeymoon</option>
                <option value="Hill Country">Hill Country</option>
                <option value="Family">Family</option>
              </select>

              <button
                type="button"
                onClick={handleOpenAddPackage}
                className="px-4 py-2 rounded-xl bg-navy text-gold text-xs font-bold hover:brightness-110 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Tour Package
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const coverImg =
                pkg.coverImage ||
                pkg.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={pkg._id}
                  className="bg-white rounded-3xl border border-navy/10 overflow-hidden shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-navy-950">
                      <img
                        src={coverImg}
                        alt={pkg.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold text-navy shadow-sm">
                          {pkg.durationDays}D / {pkg.durationNights || pkg.durationDays - 1}N
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-navy/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                          {pkg.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-serif text-lg font-bold text-navy truncate">{pkg.name}</h4>
                        <p className="text-xs text-content-muted line-clamp-1">{pkg.tagline || pkg.description}</p>
                      </div>

                      <div className="pt-2 border-t border-navy/5 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-content-muted uppercase block">Route</span>
                          <span className="font-semibold text-navy">
                            {pkg.startLocation || 'Colombo'} → {pkg.endLocation || 'Galle'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-content-muted uppercase block">Price / Person</span>
                          <span className="font-bold text-navy">
                            LKR {pkg.basePricePerPersonLKR?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-pearl-50 border-t border-navy/10 flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        pkg.isActive ? 'text-emerald-700' : 'text-content-muted'
                      }`}
                    >
                      {pkg.isActive ? '● Published' : '○ Draft / Hidden'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPackage(pkg)}
                        className="p-2 rounded-xl bg-pearl hover:bg-navy/5 border border-navy/15 text-navy transition-colors"
                        title="Edit Package"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            open: true,
                            type: 'Packages',
                            id: pkg._id,
                            title: `Tour Package "${pkg.name}"`,
                          })
                        }
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Delete Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredPackages.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-navy/10 text-content-muted">
              No tour packages found matching criteria.
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 8: USER MANAGEMENT ──────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">User Management</h2>
              <p className="text-xs text-content-muted">
                Admin controls for customer accounts, managers, and system privileges
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search user name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy font-semibold focus:outline-none focus:border-gold"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-navy/10 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pearl-100 text-navy font-bold uppercase tracking-wider border-b border-navy/10">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Current Role</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {filteredUsers.map((u) => {
                    const isSelf = u._id === user?._id;
                    return (
                      <tr key={u._id} className="hover:bg-pearl/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-navy text-gold font-bold flex items-center justify-center text-xs">
                              {u.firstName?.[0] || 'U'}
                            </div>
                            <div>
                              <span className="font-bold text-navy block">
                                {u.firstName} {u.lastName}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] text-emerald-600 font-bold">(You)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-navy">{u.email}</td>
                        <td className="p-4 text-content-muted">{u.phone || 'N/A'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ['super_admin', 'admin'].includes(u.role)
                                ? 'bg-gold/20 text-gold-800 border border-gold/40'
                                : u.role === 'manager'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {u.role?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-content-muted">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenRoleModal(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-gold" />
                              Role
                            </button>
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirm({
                                    open: true,
                                    type: 'User',
                                    id: u._id,
                                    title: `User "${u.firstName} ${u.lastName}"`,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-content-muted">
                        No users found matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 9: INQUIRIES & CONTACT FORM ─────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">Customer Inquiries</h2>
              <p className="text-xs text-content-muted">
                Incoming public contact messages and bespoke VIP requests
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search name, email, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-navy/15 text-xs text-navy font-semibold focus:outline-none focus:border-gold"
              >
                <option value="all">All Inquiries</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="in_progress">In Progress</option>
                <option value="replied">Replied</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-navy/10 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pearl-100 text-navy font-bold uppercase tracking-wider border-b border-navy/10">
                  <tr>
                    <th className="p-4">Sender</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Message Snippet</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Received Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq._id} className="hover:bg-pearl/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-navy block">{inq.name}</span>
                        <span className="text-[11px] text-content-muted">{inq.email}</span>
                        {inq.phone && <span className="text-[10px] text-content-muted block">{inq.phone}</span>}
                      </td>
                      <td className="p-4 font-semibold text-navy max-w-xs truncate">{inq.subject}</td>
                      <td className="p-4 text-content-body max-w-sm truncate">{inq.message}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-pearl text-navy border border-navy/10">
                          {inq.inquiryType || 'general'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-content-muted whitespace-nowrap">
                        {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4">{renderStatusBadge(inq.status)}</td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setInquiryModal({
                                open: true,
                                inquiry: inq,
                                replyNotes: inq.replyText || '',
                                status: inq.status,
                              })
                            }
                            className="p-1.5 rounded-lg bg-navy/5 text-navy hover:bg-navy/10 transition-colors"
                            title="View / Reply"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                type: 'Inquiry',
                                id: inq._id,
                                title: `Inquiry from "${inq.name}"`,
                              })
                            }
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredInquiries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-content-muted">
                        No inquiries found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 10: CURRENCY & EXCHANGE RATES ───────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'currency' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-navy/10 shadow-soft space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gold/15 text-gold border border-gold/30">
                <DollarSign className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy">Exchange Rate Configuration</h2>
                <p className="text-xs text-content-muted">
                  Royal Rides live currency multiplier for USD conversions
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-pearl border border-navy/10 space-y-3">
              <span className="text-xs uppercase font-bold text-content-muted tracking-wider block">
                Active Benchmark
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-navy">1 USD =</span>
                <span className="font-serif text-3xl font-bold text-gold tabular-nums">
                  {usdToLkr || 310} LKR
                </span>
              </div>
              <p className="text-xs text-content-body leading-relaxed">
                All vehicles, hotels, and tour packages are stored with native Sri Lankan Rupee (LKR)
                pricing. Guests choosing USD billing are converted dynamically via this live rate.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                  Update 1 USD → LKR Rate
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-navy/40">LKR</span>
                  <input
                    type="number"
                    step="0.01"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 rounded-xl bg-pearl/60 border border-navy/15 text-navy font-bold text-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveRate}
                disabled={rateSaving}
                className="w-full py-3.5 px-6 rounded-xl bg-navy text-gold font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {rateSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-gold" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    Save & Broadcast Live Exchange Rate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: VEHICLE ADD / EDIT (WITH MULTER FILE UPLOAD) ───────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {vehicleModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-navy/15 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-navy text-gold">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy">
                      {vehicleModal.isEdit ? 'Update Vehicle' : 'Add New Vehicle to Fleet'}
                    </h3>
                    <p className="text-xs text-content-muted">Upload photos from computer & edit fleet specs</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVehicleModal({ open: false, isEdit: false, data: null })}
                  className="p-2 rounded-xl hover:bg-navy/5 text-content-muted hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs">
                {/* ── Photo Upload from Computer (Multer) ────────────────────── */}
                <div className="p-4 rounded-2xl bg-pearl/60 border border-gold/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-gold" />
                      Vehicle Photo (Upload From Your Computer)
                    </span>
                    {isUploading && (
                      <span className="text-gold font-bold text-[11px] animate-pulse">
                        Uploading file…
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Live Preview Box */}
                    <div className="w-32 h-24 rounded-xl overflow-hidden bg-navy-900 border border-navy/20 shrink-0 relative flex items-center justify-center">
                      {vehicleForm.imageUrl ? (
                        <img
                          src={vehicleForm.imageUrl}
                          alt="Vehicle preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-pearl-200/50">
                          <Car className="w-6 h-6 mx-auto mb-1 text-gold/40" />
                          <span className="text-[10px] block leading-tight">No photo</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-2 w-full">
                      {/* Hidden file input triggered by button */}
                      <input
                        type="file"
                        ref={vehicleFileInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
                        onChange={(e) => handleUploadFromComputer(e, 'vehicle')}
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => vehicleFileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-navy hover:bg-navy-700 text-gold font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                          <UploadCloud className="w-4 h-4 text-gold" />
                          <span>Choose Photo from Computer</span>
                        </button>

                        {vehicleForm.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setVehicleForm({ ...vehicleForm, imageUrl: '' })}
                            className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-content-muted">
                        Select any PNG, JPG, or WebP photo directly from your PC (max 15MB). Multer stores it securely on the server.
                      </p>

                      {/* Fallback image URL input */}
                      <div className="pt-1">
                        <input
                          type="text"
                          value={vehicleForm.imageUrl}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, imageUrl: e.target.value })}
                          placeholder="Or paste an image URL here..."
                          className="w-full p-2 rounded-lg border border-navy/15 text-[11px] bg-white text-navy focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-navy mb-1">Vehicle Display Name *</label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.name}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                      placeholder="e.g. Mercedes-Benz E-Class VIP"
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Category *</label>
                    <select
                      value={vehicleForm.category}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    >
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="Luxury Passenger Unit">Luxury Passenger Unit</option>
                      <option value="SUV">SUV</option>
                      <option value="Bus">Bus</option>
                      <option value="Tuk Tuk">Tuk Tuk</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-navy mb-1">Make *</label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                      placeholder="Toyota / Benz"
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Model *</label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                      placeholder="HiAce / E200"
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">License Plate</label>
                    <input
                      type="text"
                      value={vehicleForm.licensePlate}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                      placeholder="WP CAB-1234"
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-navy mb-1">Daily Rate (LKR) *</label>
                    <input
                      type="number"
                      required
                      value={vehicleForm.dailyRate}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, dailyRate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Per-Km Rate (LKR) *</label>
                    <input
                      type="number"
                      required
                      value={vehicleForm.perKmRate}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, perKmRate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Base Fee (LKR) *</label>
                    <input
                      type="number"
                      required
                      value={vehicleForm.baseFee}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, baseFee: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-navy mb-1">Passenger Capacity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={60}
                      value={vehicleForm.passengerCapacity}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, passengerCapacity: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Transmission</label>
                    <select
                      value={vehicleForm.transmission}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, transmission: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Fuel Type</label>
                    <select
                      value={vehicleForm.fuelType}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                </div>

                {/* Amenities Checkboxes */}
                <div className="pt-2">
                  <span className="block font-bold text-navy mb-2">Vehicle Features & Inclusions</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'hasAC', label: 'Air Conditioning' },
                      { key: 'hasWifi', label: 'High-speed WiFi' },
                      { key: 'hasGPS', label: 'GPS Navigation' },
                      { key: 'hasChildSeat', label: 'Child Seat Ready' },
                    ].map((feat) => (
                      <label key={feat.key} className="flex items-center gap-2 cursor-pointer font-medium text-navy">
                        <input
                          type="checkbox"
                          checked={vehicleForm[feat.key]}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, [feat.key]: e.target.checked })}
                          className="rounded text-gold focus:ring-gold"
                        />
                        <span>{feat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">Vehicle Description</label>
                  <textarea
                    rows={3}
                    value={vehicleForm.description}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
                    placeholder="Provide details about interior comfort, luggage capacity, and ideal usage..."
                    className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy/10">
                  <button
                    type="button"
                    onClick={() => setVehicleModal({ open: false, isEdit: false, data: null })}
                    className="px-4 py-2.5 rounded-xl bg-pearl text-navy font-bold hover:bg-navy/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-navy text-gold font-bold hover:brightness-110 shadow-sm"
                  >
                    {vehicleModal.isEdit ? 'Save Changes' : 'Add Vehicle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: HOTEL ADD / EDIT (WITH MULTER FILE UPLOAD) ───────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hotelModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-navy/15 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-navy text-gold">
                    <Hotel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy">
                      {hotelModal.isEdit ? 'Update Hotel Property' : 'Add New Hotel / Villa'}
                    </h3>
                    <p className="text-xs text-content-muted">Luxury accommodation inventory</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHotelModal({ open: false, isEdit: false, data: null })}
                  className="p-2 rounded-xl hover:bg-navy/5 text-content-muted hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveHotel} className="space-y-4 text-xs">
                {/* Hotel Photo Upload from Computer */}
                <div className="p-4 rounded-2xl bg-pearl/60 border border-gold/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-gold" />
                      Hotel Cover Photo (Upload From Your Computer)
                    </span>
                    {isUploading && (
                      <span className="text-gold font-bold text-[11px] animate-pulse">
                        Uploading…
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-32 h-24 rounded-xl overflow-hidden bg-navy-900 border border-navy/20 shrink-0 relative flex items-center justify-center">
                      {hotelForm.coverImage ? (
                        <img
                          src={hotelForm.coverImage}
                          alt="Hotel preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-pearl-200/50">
                          <Hotel className="w-6 h-6 mx-auto mb-1 text-gold/40" />
                          <span className="text-[10px] block leading-tight">No photo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="file"
                        ref={hotelFileInputRef}
                        accept="image/*"
                        onChange={(e) => handleUploadFromComputer(e, 'hotel')}
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => hotelFileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-navy hover:bg-navy-700 text-gold font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                          <UploadCloud className="w-4 h-4 text-gold" />
                          <span>Choose Hotel Photo</span>
                        </button>

                        {hotelForm.coverImage && (
                          <button
                            type="button"
                            onClick={() => setHotelForm({ ...hotelForm, coverImage: '' })}
                            className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>

                      <div className="pt-1">
                        <input
                          type="text"
                          value={hotelForm.coverImage}
                          onChange={(e) => setHotelForm({ ...hotelForm, coverImage: e.target.value })}
                          placeholder="Or paste an image URL..."
                          className="w-full p-2 rounded-lg border border-navy/15 text-[11px] bg-white text-navy focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-navy mb-1">Hotel Name *</label>
                    <input
                      type="text"
                      required
                      value={hotelForm.name}
                      onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                      placeholder="e.g. Amangalla Resort & Spa"
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Destination *</label>
                    <select
                      value={hotelForm.destination}
                      onChange={(e) => setHotelForm({ ...hotelForm, destination: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    >
                      {destinations.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.province || 'Sri Lanka'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-navy mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={hotelForm.city}
                      onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                      placeholder="Galle / Colombo / Kandy"
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Star Rating (1-5) *</label>
                    <select
                      value={hotelForm.starRating}
                      onChange={(e) => setHotelForm({ ...hotelForm, starRating: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    >
                      <option value={5}>5-Star Luxury</option>
                      <option value={4}>4-Star Premium</option>
                      <option value={3}>3-Star Comfort</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Address *</label>
                    <input
                      type="text"
                      required
                      value={hotelForm.address}
                      onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                      placeholder="10 Church Street, Galle Fort"
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-pearl/60 border border-navy/10 space-y-3">
                  <span className="font-bold text-navy uppercase text-[10px] tracking-wider block">
                    Primary Room Type & Nightly Rate
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-navy mb-1">Room Name</label>
                      <input
                        type="text"
                        value={hotelForm.roomName}
                        onChange={(e) => setHotelForm({ ...hotelForm, roomName: e.target.value })}
                        className="w-full p-2 rounded-lg border border-navy/15"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-navy mb-1">Category</label>
                      <select
                        value={hotelForm.roomCategory}
                        onChange={(e) => setHotelForm({ ...hotelForm, roomCategory: e.target.value })}
                        className="w-full p-2 rounded-lg border border-navy/15"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Superior">Superior</option>
                        <option value="Suite">Suite</option>
                        <option value="Villa">Villa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-navy mb-1">Price / Night (LKR) *</label>
                      <input
                        type="number"
                        required
                        value={hotelForm.roomPricePerNightLKR}
                        onChange={(e) => setHotelForm({ ...hotelForm, roomPricePerNightLKR: e.target.value })}
                        className="w-full p-2 rounded-lg border border-navy/15 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-navy mb-1">Max Guests</label>
                      <input
                        type="number"
                        min={1}
                        value={hotelForm.roomMaxGuests}
                        onChange={(e) => setHotelForm({ ...hotelForm, roomMaxGuests: e.target.value })}
                        className="w-full p-2 rounded-lg border border-navy/15"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    value={hotelForm.amenities}
                    onChange={(e) => setHotelForm({ ...hotelForm, amenities: e.target.value })}
                    placeholder="WiFi, Pool, Spa, Gym, Restaurant, Bar, Beach Access, Parking"
                    className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">Hotel Description</label>
                  <textarea
                    rows={3}
                    value={hotelForm.description}
                    onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                    placeholder="Describe heritage architecture, ocean views, culinary options..."
                    className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy/10">
                  <button
                    type="button"
                    onClick={() => setHotelModal({ open: false, isEdit: false, data: null })}
                    className="px-4 py-2.5 rounded-xl bg-pearl text-navy font-bold hover:bg-navy/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-navy text-gold font-bold hover:brightness-110 shadow-sm"
                  >
                    {hotelModal.isEdit ? 'Save Hotel' : 'Create Hotel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: TOUR PACKAGE ADD / EDIT (WITH MULTER FILE UPLOAD) ────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {packageModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-navy/15 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-navy text-gold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy">
                      {packageModal.isEdit ? 'Update Tour Package' : 'Create New Tour Package'}
                    </h3>
                    <p className="text-xs text-content-muted">Bespoke island itineraries</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPackageModal({ open: false, isEdit: false, data: null })}
                  className="p-2 rounded-xl hover:bg-navy/5 text-content-muted hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
                {/* Tour Package Photo Upload from Computer */}
                <div className="p-4 rounded-2xl bg-pearl/60 border border-gold/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-gold" />
                      Package Cover Photo (Upload From Your Computer)
                    </span>
                    {isUploading && (
                      <span className="text-gold font-bold text-[11px] animate-pulse">
                        Uploading…
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-32 h-24 rounded-xl overflow-hidden bg-navy-900 border border-navy/20 shrink-0 relative flex items-center justify-center">
                      {packageForm.coverImage ? (
                        <img
                          src={packageForm.coverImage}
                          alt="Package preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-pearl-200/50">
                          <Compass className="w-6 h-6 mx-auto mb-1 text-gold/40" />
                          <span className="text-[10px] block leading-tight">No photo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="file"
                        ref={packageFileInputRef}
                        accept="image/*"
                        onChange={(e) => handleUploadFromComputer(e, 'package')}
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => packageFileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-navy hover:bg-navy-700 text-gold font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                          <UploadCloud className="w-4 h-4 text-gold" />
                          <span>Choose Tour Photo</span>
                        </button>

                        {packageForm.coverImage && (
                          <button
                            type="button"
                            onClick={() => setPackageForm({ ...packageForm, coverImage: '' })}
                            className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>

                      <div className="pt-1">
                        <input
                          type="text"
                          value={packageForm.coverImage}
                          onChange={(e) => setPackageForm({ ...packageForm, coverImage: e.target.value })}
                          placeholder="Or paste an image URL..."
                          className="w-full p-2 rounded-lg border border-navy/15 text-[11px] bg-white text-navy focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-navy mb-1">Package Name *</label>
                    <input
                      type="text"
                      required
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="e.g. Royal Ceylon Cultural Odyssey"
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Category *</label>
                    <select
                      value={packageForm.category}
                      onChange={(e) => setPackageForm({ ...packageForm, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 focus:outline-none focus:border-gold"
                    >
                      <option value="Cultural">Cultural</option>
                      <option value="Beach">Beach</option>
                      <option value="Wildlife">Wildlife</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Honeymoon">Honeymoon</option>
                      <option value="Hill Country">Hill Country</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-navy mb-1">Duration (Days) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={packageForm.durationDays}
                      onChange={(e) => setPackageForm({ ...packageForm, durationDays: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Duration (Nights) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={packageForm.durationNights}
                      onChange={(e) => setPackageForm({ ...packageForm, durationNights: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Base Price / Person (LKR) *</label>
                    <input
                      type="number"
                      required
                      value={packageForm.basePricePerPersonLKR}
                      onChange={(e) => setPackageForm({ ...packageForm, basePricePerPersonLKR: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-navy/15 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-navy mb-1">Start Location</label>
                    <input
                      type="text"
                      value={packageForm.startLocation}
                      onChange={(e) => setPackageForm({ ...packageForm, startLocation: e.target.value })}
                      placeholder="Colombo Airport (CMB)"
                      className="w-full p-2.5 rounded-xl border border-navy/15"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">End Location</label>
                    <input
                      type="text"
                      value={packageForm.endLocation}
                      onChange={(e) => setPackageForm({ ...packageForm, endLocation: e.target.value })}
                      placeholder="Galle / Colombo"
                      className="w-full p-2.5 rounded-xl border border-navy/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">Highlights (Comma separated)</label>
                  <input
                    type="text"
                    value={packageForm.highlights}
                    onChange={(e) => setPackageForm({ ...packageForm, highlights: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-navy/15"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">Inclusions (Comma separated)</label>
                  <input
                    type="text"
                    value={packageForm.inclusions}
                    onChange={(e) => setPackageForm({ ...packageForm, inclusions: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-navy/15"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">Tour Description</label>
                  <textarea
                    rows={3}
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                    placeholder="Full day-by-day expedition overview..."
                    className="w-full p-2.5 rounded-xl border border-navy/15"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy/10">
                  <button
                    type="button"
                    onClick={() => setPackageModal({ open: false, isEdit: false, data: null })}
                    className="px-4 py-2.5 rounded-xl bg-pearl text-navy font-bold hover:bg-navy/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-navy text-gold font-bold hover:brightness-110 shadow-sm"
                  >
                    {packageModal.isEdit ? 'Save Package' : 'Create Package'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: BOOKING DETAIL DRAWER ────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {detailModal.open && detailModal.data && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-navy/15 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy/10">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold">
                    {detailModal.type} Booking Details
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-navy mt-0.5">
                    Ref #{detailModal.data.bookingRef}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailModal({ open: false, type: null, data: null })}
                  className="p-2 rounded-xl hover:bg-navy/5 text-content-muted hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Date */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-pearl border border-navy/10">
                <div>
                  <span className="text-[10px] text-content-muted uppercase block">Booking Status</span>
                  <div className="mt-1">{renderStatusBadge(detailModal.data.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-content-muted uppercase block">Booked On</span>
                  <span className="font-semibold text-navy">
                    {detailModal.data.createdAt ? new Date(detailModal.data.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Guest Information */}
              <div className="space-y-2 p-4 rounded-2xl border border-navy/10">
                <span className="font-bold text-navy text-[11px] uppercase tracking-wider block">
                  Guest Information
                </span>
                <div className="grid grid-cols-2 gap-2 text-navy">
                  <div>
                    <span className="text-content-muted block text-[10px]">Name:</span>
                    <span className="font-bold">
                      {detailModal.data.user
                        ? `${detailModal.data.user.firstName} ${detailModal.data.user.lastName}`
                        : detailModal.data.guestInfo?.name || 'Guest'}
                    </span>
                  </div>
                  <div>
                    <span className="text-content-muted block text-[10px]">Email:</span>
                    <span className="font-semibold">{detailModal.data.guestInfo?.email || detailModal.data.user?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-content-muted block text-[10px]">Phone:</span>
                    <span className="font-semibold">{detailModal.data.guestInfo?.phone || detailModal.data.user?.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-content-muted block text-[10px]">Special Requests:</span>
                    <span className="font-semibold">{detailModal.data.specialRequests || 'Standard reservation'}</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-2 p-4 rounded-2xl border border-navy/10">
                <span className="font-bold text-navy text-[11px] uppercase tracking-wider block">
                  Reserved Service
                </span>
                <p className="font-bold text-base text-navy">
                  {detailModal.data.vehicle?.name ||
                    detailModal.data.hotel?.name ||
                    detailModal.data.package?.name ||
                    'Royal Rides Service'}
                </p>
                {detailModal.data.pickupLocation?.address && (
                  <p className="text-content-body">
                    <strong>Pickup:</strong> {detailModal.data.pickupLocation.address}
                  </p>
                )}
                {detailModal.data.dropoffLocation?.address && (
                  <p className="text-content-body">
                    <strong>Dropoff:</strong> {detailModal.data.dropoffLocation.address}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-navy text-pearl space-y-2">
                <div className="flex justify-between font-serif text-lg font-bold text-gold">
                  <span>Grand Total:</span>
                  <span>
                    LKR {Math.round(detailModal.data.priceBreakdown?.totalLKR || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-pearl/80">
                  <span>USD Equivalent:</span>
                  <span>
                    ≈ ${(
                      (detailModal.data.priceBreakdown?.totalLKR || 0) / (usdToLkr || 310)
                    ).toFixed(2)}{' '}
                    USD
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDetailModal({ open: false, type: null, data: null })}
                  className="px-5 py-2.5 rounded-xl bg-navy text-gold font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: CHANGE USER ROLE ─────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {roleModal.open && roleModal.user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-navy/15 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy/10">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-gold" />
                  <h3 className="font-serif text-lg font-bold text-navy">Update User Role</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRoleModal({ open: false, user: null, newRole: 'customer' })}
                  className="p-1.5 rounded-lg hover:bg-navy/5 text-content-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-content-body">
                Update account privileges for{' '}
                <strong className="text-navy">{roleModal.user.firstName} {roleModal.user.lastName}</strong> ({roleModal.user.email}).
              </p>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Select Role Privilege</label>
                <select
                  value={roleModal.newRole}
                  onChange={(e) => setRoleModal({ ...roleModal, newRole: e.target.value })}
                  className="w-full p-3 rounded-xl border border-navy/20 text-xs font-bold text-navy bg-pearl"
                >
                  <option value="customer">Customer (Standard reservations)</option>
                  <option value="staff">Staff (Operational view)</option>
                  <option value="manager">Manager (Fleet & Bookings Moderator)</option>
                  <option value="admin">Admin (Full System Administrator)</option>
                  <option value="super_admin">Super Admin (Root Executive)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy/10 text-xs">
                <button
                  type="button"
                  onClick={() => setRoleModal({ open: false, user: null, newRole: 'customer' })}
                  className="px-4 py-2 rounded-xl bg-pearl text-navy font-semibold hover:bg-navy/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserRole}
                  className="px-5 py-2 rounded-xl bg-navy text-gold font-bold hover:brightness-110 shadow-sm"
                >
                  Save New Role
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: INQUIRY DETAIL & REPLY ───────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {inquiryModal.open && inquiryModal.inquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 border border-navy/15 shadow-2xl space-y-5 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy/10">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-gold" />
                  <h3 className="font-serif text-lg font-bold text-navy">Inquiry Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInquiryModal({ open: false, inquiry: null, replyNotes: '', status: 'replied' })}
                  className="p-1.5 rounded-lg hover:bg-navy/5 text-content-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-pearl/60 border border-navy/10 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-navy text-sm">{inquiryModal.inquiry.name}</span>
                  <span className="text-content-muted">
                    {inquiryModal.inquiry.createdAt ? new Date(inquiryModal.inquiry.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <p className="text-navy font-semibold">{inquiryModal.inquiry.email} · {inquiryModal.inquiry.phone || 'No phone'}</p>
                <p className="text-navy font-bold pt-1">Subject: {inquiryModal.inquiry.subject}</p>
                <div className="p-3 bg-white rounded-xl border border-navy/10 text-content-body whitespace-pre-wrap">
                  {inquiryModal.inquiry.message}
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy mb-1.5">Staff Internal Notes / Reply Record</label>
                <textarea
                  rows={3}
                  value={inquiryModal.replyNotes}
                  onChange={(e) => setInquiryModal({ ...inquiryModal, replyNotes: e.target.value })}
                  placeholder="Record summary of call or email response sent to the customer..."
                  className="w-full p-2.5 rounded-xl border border-navy/20 bg-pearl/40"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-navy/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateInquiryStatus(inquiryModal.inquiry._id, 'read')}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 font-semibold text-[11px]"
                  >
                    Mark Read
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateInquiryStatus(inquiryModal.inquiry._id, 'replied', inquiryModal.replyNotes)}
                    className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 font-semibold text-[11px]"
                  >
                    Mark Replied
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateInquiryStatus(inquiryModal.inquiry._id, 'closed', inquiryModal.replyNotes)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 font-semibold text-[11px]"
                  >
                    Close
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setInquiryModal({ open: false, inquiry: null, replyNotes: '', status: 'replied' })}
                  className="px-4 py-2 rounded-xl bg-navy text-gold font-bold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: CONFIRM DELETE DIALOG ─────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 border border-navy/15 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-navy">Confirm Permanent Deletion</h3>
                <p className="text-xs text-content-body mt-1">
                  Are you sure you want to permanently delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ open: false, type: null, id: null, title: '' })}
                  className="px-4 py-2.5 rounded-xl bg-pearl text-navy font-bold text-xs hover:bg-navy/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { type, id } = deleteConfirm;
                    if (type === 'Vehicle' || type === 'Hotel' || type === 'Package') {
                      handleDeleteBooking(type, id);
                    } else if (type === 'Fleet') {
                      handleDeleteVehicle(id);
                    } else if (type === 'Hotels') {
                      handleDeleteHotel(id);
                    } else if (type === 'Packages') {
                      handleDeletePackage(id);
                    } else if (type === 'User') {
                      handleDeleteUser(id);
                    } else if (type === 'Inquiry') {
                      handleDeleteInquiry(id);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-md"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
