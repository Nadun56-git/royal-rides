/**
 * Royal Rides — Vehicle Booking Routes & Controller
 * POST  /api/v1/vehicle-bookings
 * GET   /api/v1/vehicle-bookings/my-bookings
 * GET   /api/v1/vehicle-bookings/:id
 * PATCH /api/v1/vehicle-bookings/:id/cancel
 * PATCH /api/v1/vehicle-bookings/:id/status (Admin)
 * GET   /api/v1/vehicle-bookings/admin/all (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Vehicle from '../models/Vehicle.js';
import VehicleBooking from '../models/VehicleBooking.js';
import CurrencyRate from '../models/CurrencyRate.js';
import { generateBookingRef } from '../utils/bookingRef.js';
import { sendSuccess, sendCreated, sendPaginated, buildPaginationMeta } from '../utils/apiResponse.js';
import { protect, restrict, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const getExchangeRate = async () => {
  const rateDoc = await CurrencyRate.findOne({ fromCurrency: 'USD', toCurrency: 'LKR', isActive: true });
  return rateDoc ? rateDoc.rate : 310.0;
};

// ── POST /api/v1/vehicle-bookings - Create Reservation ────────────────────────
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const {
      vehicleId,
      pickupLocation,
      dropoffLocation,
      startDate,
      endDate,
      rentalType = 'with_driver',
      driverRequested = true,
      guestInfo,
      passengerCount = 1,
      estimatedDistanceKm = 0,
      extras = {},
      specialRequests,
      currency = 'LKR',
    } = req.body;

    if (!vehicleId || !pickupLocation || !dropoffLocation || !startDate || !endDate) {
      throw new AppError('Vehicle, pickup/dropoff locations, and dates are required', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new AppError('Invalid rental dates provided', 400);
    }

    // Require either auth user or guest info
    if (!req.user && (!guestInfo || !guestInfo.email || !guestInfo.name || !guestInfo.phone)) {
      throw new AppError('Contact details (name, email, phone) are required for booking', 400);
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.isActive) throw new AppError('Vehicle is unavailable', 404);

    // Double booking check
    const overlapping = await VehicleBooking.countDocuments({
      vehicle: vehicleId,
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      $or: [
        { 'rentalPeriod.start': { $lte: end }, 'rentalPeriod.end': { $gte: start } },
      ],
    });
    if (overlapping > 0) {
      throw new AppError('This vehicle is already booked for the selected dates', 409);
    }

    // Server-side price calculation
    const diffTime = Math.abs(end - start);
    const numDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const dist = Math.max(0, Number(estimatedDistanceKm) || 0);

    const baseFee = vehicle.baseFee;
    const distanceCharge = Math.round(dist * vehicle.perKmRate);
    const dailyRateCharge = Math.round(numDays * vehicle.dailyRate);
    const withDriver = rentalType === 'with_driver' || driverRequested;
    const driverFee = withDriver ? Math.round(numDays * (vehicle.driverFeePerDay || 0)) : 0;

    let extrasCharge = 0;
    if (extras.childSeat) extrasCharge += 1500 * numDays;
    if (extras.gps) extrasCharge += 1000 * numDays;
    if (extras.wifi) extrasCharge += 800 * numDays;

    const subtotal = baseFee + distanceCharge + dailyRateCharge + driverFee + extrasCharge;
    const totalLKR = subtotal;

    const usdRate = await getExchangeRate();
    const lkrToUsdRate = 1 / usdRate;
    const totalUSD = Number((totalLKR * lkrToUsdRate).toFixed(2));
    const isUSD = currency.toUpperCase() === 'USD';

    const bookingRef = generateBookingRef('VH');

    const booking = await VehicleBooking.create({
      bookingRef,
      user: req.user ? req.user._id : null,
      guestInfo: req.user
        ? {
            name: `${req.user.firstName} ${req.user.lastName}`,
            email: req.user.email,
            phone: req.user.phone,
          }
        : guestInfo,
      vehicle: vehicle._id,
      pickupLocation: typeof pickupLocation === 'string' ? { address: pickupLocation } : pickupLocation,
      dropoffLocation: typeof dropoffLocation === 'string' ? { address: dropoffLocation } : dropoffLocation,
      rentalPeriod: {
        start,
        end,
        totalDays: numDays,
      },
      rentalType: withDriver ? 'with_driver' : 'self_drive',
      driverRequested: withDriver,
      passengerCount: Math.min(vehicle.passengerCapacity, Number(passengerCount) || 1),
      estimatedDistanceKm: dist,
      extrasSelected: extras,
      priceBreakdown: {
        baseFee,
        distanceKm: dist,
        perKmRate: vehicle.perKmRate,
        distanceCharge,
        driverFee,
        extraDays: numDays,
        dailyRateCharge,
        extras: extrasCharge,
        subtotal,
        taxRate: 0,
        taxAmount: 0,
        totalLKR,
        currencyUsed: isUSD ? 'USD' : 'LKR',
        exchangeRateUsed: usdRate,
        totalInCurrency: isUSD ? totalUSD : totalLKR,
      },
      specialRequests,
      status: 'confirmed', // Confirmed booking
    });

    // Increment booking count on vehicle
    await Vehicle.findByIdAndUpdate(vehicleId, { $inc: { totalBookings: 1 } });

    sendCreated(res, booking, 'Vehicle booking confirmed successfully');
  })
);

// ── GET /api/v1/vehicle-bookings/my-bookings - Authenticated User's Bookings ──
router.get(
  '/my-bookings',
  protect,
  asyncHandler(async (req, res) => {
    const bookings = await VehicleBooking.find({ user: req.user._id })
      .populate('vehicle', 'name category make model images dailyRate')
      .sort({ createdAt: -1 });

    sendSuccess(res, bookings);
  })
);

// ── GET /api/v1/vehicle-bookings/admin/all - Admin List ────────────────────────
router.get(
  '/admin/all',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      VehicleBooking.find(query)
        .populate('vehicle', 'name category licensePlate')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      VehicleBooking.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, bookings, pagination);
  })
);

// ── GET /api/v1/vehicle-bookings/:id - Booking Detail ──────────────────────────
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { bookingRef: req.params.id };

    const booking = await VehicleBooking.findOne(query).populate(
      'vehicle',
      'name category make model images dailyRate perKmRate'
    );
    if (!booking) throw new AppError('Booking not found', 404);

    sendSuccess(res, booking);
  })
);

// ── PATCH /api/v1/vehicle-bookings/:id/cancel - Cancel Booking ────────────────
router.patch(
  '/:id/cancel',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { cancellationReason } = req.body;
    const booking = await VehicleBooking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.status === 'cancelled') {
      throw new AppError('Booking is already cancelled', 400);
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by customer';
    booking.cancelledAt = new Date();
    await booking.save();

    sendSuccess(res, booking, 'Booking cancelled successfully');
  })
);

// ── PATCH /api/v1/vehicle-bookings/:id/status - Admin Status Update ────────────
router.patch(
  '/:id/status',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    const { status, internalNotes } = req.body;
    const booking = await VehicleBooking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);

    if (status) booking.status = status;
    if (internalNotes !== undefined) booking.internalNotes = internalNotes;
    await booking.save();

    sendSuccess(res, booking, `Booking status updated to ${booking.status}`);
  })
);

export default router;
