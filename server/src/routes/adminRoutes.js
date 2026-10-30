/**
 * Royal Rides — Admin Analytics & Unified Bookings Routes
 * GET /api/v1/admin/analytics/overview
 * GET /api/v1/admin/bookings/all
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import VehicleBooking from '../models/VehicleBooking.js';
import HotelBooking from '../models/HotelBooking.js';
import PackageBooking from '../models/PackageBooking.js';
import Vehicle from '../models/Vehicle.js';
import Hotel from '../models/Hotel.js';
import TravelPackage from '../models/TravelPackage.js';
import User from '../models/User.js';
import Destination from '../models/Destination.js';
import CurrencyRate from '../models/CurrencyRate.js';
import Contact from '../models/Contact.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

const getExchangeRate = async () => {
  const rateDoc = await CurrencyRate.findOne({ fromCurrency: 'USD', toCurrency: 'LKR', isActive: true });
  return rateDoc ? rateDoc.rate : 310.0;
};

// ── GET /api/v1/admin/analytics/overview ──────────────────────────────────────
router.get(
  '/analytics/overview',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    const usdRate = await getExchangeRate();

    const [
      vhCount,
      htCount,
      pkCount,
      vehicleCount,
      hotelCount,
      packageCount,
      userCount,
      destCount,
      totalInquiries,
      newInquiries,
      vhBookings,
      htBookings,
      pkBookings,
    ] = await Promise.all([
      VehicleBooking.countDocuments(),
      HotelBooking.countDocuments(),
      PackageBooking.countDocuments(),
      Vehicle.countDocuments({ isActive: true }),
      Hotel.countDocuments({ isActive: true }),
      TravelPackage.countDocuments({ isActive: true }),
      User.countDocuments(),
      Destination.countDocuments({ isActive: true }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      VehicleBooking.find({ status: { $ne: 'cancelled' } }).select('priceBreakdown.totalLKR status createdAt'),
      HotelBooking.find({ status: { $ne: 'cancelled' } }).select('priceBreakdown.totalLKR status createdAt'),
      PackageBooking.find({ status: { $ne: 'cancelled' } }).select('priceBreakdown.totalLKR status createdAt'),
    ]);

    // Calculate total revenues
    const vhRev = vhBookings.reduce((sum, b) => sum + (b.priceBreakdown?.totalLKR || 0), 0);
    const htRev = htBookings.reduce((sum, b) => sum + (b.priceBreakdown?.totalLKR || 0), 0);
    const pkRev = pkBookings.reduce((sum, b) => sum + (b.priceBreakdown?.totalLKR || 0), 0);
    const totalRevLKR = vhRev + htRev + pkRev;
    const totalRevUSD = Number((totalRevLKR / usdRate).toFixed(2));

    const totalBookings = vhCount + htCount + pkCount;

    // Pending requests
    const vhPending = await VehicleBooking.countDocuments({ status: 'pending' });
    const htPending = await HotelBooking.countDocuments({ status: 'pending' });
    const pkPending = await PackageBooking.countDocuments({ status: 'pending' });
    const totalPending = vhPending + htPending + pkPending;

    // Dynamically compute past 6 months revenue from real bookings
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const mName = monthNames[mIdx];

      const vhM = vhBookings
        .filter((b) => {
          const bd = new Date(b.createdAt);
          return bd.getMonth() === mIdx && bd.getFullYear() === yr;
        })
        .reduce((sum, b) => sum + (b.priceBreakdown?.totalLKR || 0), 0);

      const htM = htBookings
        .filter((b) => {
          const bd = new Date(b.createdAt);
          return bd.getMonth() === mIdx && bd.getFullYear() === yr;
        })
        .reduce((sum, b) => sum + (b.priceBreakdown?.totalLKR || 0), 0);

      const pkM = pkBookings
        .filter((b) => {
          const bd = new Date(b.createdAt);
          return bd.getMonth() === mIdx && bd.getFullYear() === yr;
        })
        .reduce((sum, b) => sum + (b.priceBreakdown?.totalLKR || 0), 0);

      chartData.push({
        month: mName,
        vehicles: vhM,
        hotels: htM,
        packages: pkM,
        total: vhM + htM + pkM,
      });
    }

    // Recent 5 bookings from each category
    const [recentVh, recentHt, recentPk] = await Promise.all([
      VehicleBooking.find()
        .populate('vehicle', 'name category')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      HotelBooking.find()
        .populate('hotel', 'name city')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      PackageBooking.find()
        .populate('package', 'name durationDays')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Format into unified recent bookings
    const combinedRecent = [
      ...recentVh.map((b) => ({
        id: b._id,
        ref: b.bookingRef,
        type: 'Vehicle',
        title: b.vehicle?.name || 'Vehicle Booking',
        customer: b.guestInfo?.name || 'Customer',
        totalLKR: b.priceBreakdown?.totalLKR || 0,
        currencyUsed: b.priceBreakdown?.currencyUsed || 'LKR',
        status: b.status,
        date: b.createdAt,
      })),
      ...recentHt.map((b) => ({
        id: b._id,
        ref: b.bookingRef,
        type: 'Hotel',
        title: b.hotel?.name || 'Hotel Booking',
        customer: b.guestInfo?.name || 'Customer',
        totalLKR: b.priceBreakdown?.totalLKR || 0,
        currencyUsed: b.priceBreakdown?.currencyUsed || 'LKR',
        status: b.status,
        date: b.createdAt,
      })),
      ...recentPk.map((b) => ({
        id: b._id,
        ref: b.bookingRef,
        type: 'Package',
        title: b.package?.name || 'Package Tour',
        customer: b.guestInfo?.name || 'Customer',
        totalLKR: b.priceBreakdown?.totalLKR || 0,
        currencyUsed: b.priceBreakdown?.currencyUsed || 'LKR',
        status: b.status,
        date: b.createdAt,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    sendSuccess(res, {
      kpis: {
        totalBookings,
        vhCount,
        htCount,
        pkCount,
        totalRevenueLKR: totalRevLKR,
        totalRevenueUSD: totalRevUSD,
        vhRev,
        htRev,
        pkRev,
        totalPending,
        vhPending,
        htPending,
        pkPending,
        activeVehicles: vehicleCount,
        activeHotels: hotelCount,
        activePackages: packageCount,
        registeredUsers: userCount,
        destinationsCount: destCount,
        totalInquiries,
        newInquiries,
        usdExchangeRate: usdRate,
      },
      chartData,
      recentBookings: combinedRecent,
    });
  })
);

// ── GET /api/v1/admin/bookings/all ────────────────────────────────────────────
router.get(
  '/bookings/all',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    const { type, status } = req.query;

    const query = {};
    if (status) query.status = status;

    let vh = [];
    let ht = [];
    let pk = [];

    if (!type || type === 'all' || type === 'vehicle') {
      vh = await VehicleBooking.find(query)
        .populate('vehicle', 'name category')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
    }
    if (!type || type === 'all' || type === 'hotel') {
      ht = await HotelBooking.find(query)
        .populate('hotel', 'name city')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
    }
    if (!type || type === 'all' || type === 'package') {
      pk = await PackageBooking.find(query)
        .populate('package', 'name durationDays')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
    }

    const unified = [
      ...vh.map((b) => ({
        id: b._id,
        ref: b.bookingRef,
        type: 'Vehicle',
        title: b.vehicle?.name,
        customerName: b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.name,
        customerEmail: b.user?.email || b.guestInfo?.email,
        customerPhone: b.user?.phone || b.guestInfo?.phone,
        totalLKR: b.priceBreakdown?.totalLKR,
        status: b.status,
        date: b.createdAt,
      })),
      ...ht.map((b) => ({
        id: b._id,
        ref: b.bookingRef,
        type: 'Hotel',
        title: b.hotel?.name,
        customerName: b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.name,
        customerEmail: b.user?.email || b.guestInfo?.email,
        customerPhone: b.user?.phone || b.guestInfo?.phone,
        totalLKR: b.priceBreakdown?.totalLKR,
        status: b.status,
        date: b.createdAt,
      })),
      ...pk.map((b) => ({
        id: b._id,
        ref: b.bookingRef,
        type: 'Package',
        title: b.package?.name,
        customerName: b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.name,
        customerEmail: b.user?.email || b.guestInfo?.email,
        customerPhone: b.user?.phone || b.guestInfo?.phone,
        totalLKR: b.priceBreakdown?.totalLKR,
        status: b.status,
        date: b.createdAt,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    sendSuccess(res, unified);
  })
);

export default router;
