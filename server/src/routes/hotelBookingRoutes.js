/**
 * Royal Rides — Hotel Booking Routes & Controller
 * POST  /api/v1/hotel-bookings
 * GET   /api/v1/hotel-bookings/my-bookings
 * GET   /api/v1/hotel-bookings/:id
 * PATCH /api/v1/hotel-bookings/:id/cancel
 * PATCH /api/v1/hotel-bookings/:id/status (Admin)
 * GET   /api/v1/hotel-bookings/admin/all (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Hotel from '../models/Hotel.js';
import HotelBooking from '../models/HotelBooking.js';
import SeasonalRate from '../models/SeasonalRate.js';
import CurrencyRate from '../models/CurrencyRate.js';
import { generateBookingRef } from '../utils/bookingRef.js';
import { sendSuccess, sendCreated, sendPaginated, buildPaginationMeta } from '../utils/apiResponse.js';
import { protect, restrict, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const getExchangeRate = async () => {
  const rateDoc = await CurrencyRate.findOne({ fromCurrency: 'USD', toCurrency: 'LKR', isActive: true });
  return rateDoc ? rateDoc.rate : 310.0;
};

// ── POST /api/v1/hotel-bookings - Create Reservation ──────────────────────────
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const {
      hotelId,
      roomTypeId,
      checkIn,
      checkOut,
      rooms = 1,
      guests = 1,
      guestInfo,
      promoCode,
      specialRequests,
      currency = 'LKR',
    } = req.body;

    if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
      throw new AppError('hotelId, roomTypeId, checkIn, and checkOut are required', 400);
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new AppError('Invalid dates provided', 400);
    }

    if (!req.user && (!guestInfo || !guestInfo.email || !guestInfo.name || !guestInfo.phone)) {
      throw new AppError('Guest details (name, email, phone) are required', 400);
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) throw new AppError('Hotel not found or unavailable', 404);

    const room = hotel.rooms.id(roomTypeId);
    if (!room || !room.isActive) throw new AppError('Selected room type not found', 404);

    const nights = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
    const roomCount = Math.max(1, Number(rooms) || 1);
    const guestCount = Math.max(1, Number(guests) || 1);

    const baseNightlyRate = room.pricePerNightLKR;
    const baseTotal = baseNightlyRate * nights * roomCount;

    // Seasonal / Promo calculation
    let seasonalDiscount = 0;
    let seasonalDiscountPercent = 0;
    let promotionApplied = null;

    const promoQuery = {
      isActive: true,
      validFrom: { $lte: end },
      validTo: { $gte: start },
      appliesTo: { $in: ['hotels', 'all'] },
      $or: [{ specificIds: { $size: 0 } }, { specificIds: hotel._id }],
    };
    if (promoCode) promoQuery.promoCode = promoCode.toUpperCase().trim();

    const matchingPromos = await SeasonalRate.find(promoQuery).sort({ priority: -1 });
    if (matchingPromos.length > 0) {
      const promo = matchingPromos[0];
      promotionApplied = promo.name;
      if (promo.discountType === 'percentage') {
        seasonalDiscountPercent = promo.discountValue;
        seasonalDiscount = Math.round((baseTotal * promo.discountValue) / 100);
        if (promo.maxDiscountLKR && seasonalDiscount > promo.maxDiscountLKR) {
          seasonalDiscount = promo.maxDiscountLKR;
        }
      } else {
        seasonalDiscount = Math.min(baseTotal, promo.discountValue);
        seasonalDiscountPercent = Math.round((seasonalDiscount / baseTotal) * 100);
      }
    }

    const subtotal = Math.max(0, baseTotal - seasonalDiscount);
    const taxRate = hotel.taxRate || 10;
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const serviceChargeRate = hotel.serviceCharge || 10;
    const serviceChargeAmount = Math.round((subtotal * serviceChargeRate) / 100);
    const totalLKR = subtotal + taxAmount + serviceChargeAmount;

    const usdRate = await getExchangeRate();
    const lkrToUsdRate = 1 / usdRate;
    const totalUSD = Number((totalLKR * lkrToUsdRate).toFixed(2));
    const isUSD = currency.toUpperCase() === 'USD';

    const bookingRef = generateBookingRef('HT');

    const booking = await HotelBooking.create({
      bookingRef,
      user: req.user ? req.user._id : null,
      guestInfo: req.user
        ? {
            name: `${req.user.firstName} ${req.user.lastName}`,
            email: req.user.email,
            phone: req.user.phone,
          }
        : guestInfo,
      hotel: hotel._id,
      room: {
        roomTypeId: room._id,
        roomTypeName: room.name,
        pricePerNightLKR: baseNightlyRate,
      },
      checkIn: start,
      checkOut: end,
      nights,
      rooms: roomCount,
      guests: guestCount,
      priceBreakdown: {
        baseNightlyRate,
        nights,
        rooms: roomCount,
        baseTotal,
        seasonalDiscount,
        seasonalDiscountPercent,
        promotionApplied,
        subtotal,
        taxRate,
        taxAmount,
        serviceChargeRate,
        serviceChargeAmount,
        totalLKR,
        currencyUsed: isUSD ? 'USD' : 'LKR',
        exchangeRateUsed: usdRate,
        totalInCurrency: isUSD ? totalUSD : totalLKR,
      },
      specialRequests,
      status: 'confirmed',
    });

    await Hotel.findByIdAndUpdate(hotelId, { $inc: { totalBookings: 1 } });

    sendCreated(res, booking, 'Hotel reservation confirmed successfully');
  })
);

// ── GET /api/v1/hotel-bookings/my-bookings - User's Bookings ───────────────────
router.get(
  '/my-bookings',
  protect,
  asyncHandler(async (req, res) => {
    const bookings = await HotelBooking.find({ user: req.user._id })
      .populate('hotel', 'name city coverImage starRating address')
      .sort({ createdAt: -1 });

    sendSuccess(res, bookings);
  })
);

// ── GET /api/v1/hotel-bookings/admin/all - Admin List ──────────────────────────
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
      HotelBooking.find(query)
        .populate('hotel', 'name city')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      HotelBooking.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, bookings, pagination);
  })
);

// ── GET /api/v1/hotel-bookings/:id - Booking Detail ────────────────────────────
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { bookingRef: req.params.id };

    const booking = await HotelBooking.findOne(query).populate('hotel');
    if (!booking) throw new AppError('Booking not found', 404);

    sendSuccess(res, booking);
  })
);

// ── PATCH /api/v1/hotel-bookings/:id/cancel - Cancel Booking ──────────────────
router.patch(
  '/:id/cancel',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { cancellationReason } = req.body;
    const booking = await HotelBooking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by customer';
    booking.cancelledAt = new Date();
    await booking.save();

    sendSuccess(res, booking, 'Hotel reservation cancelled successfully');
  })
);

// ── PATCH /api/v1/hotel-bookings/:id/status - Admin Status ────────────────────
router.patch(
  '/:id/status',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    const { status, internalNotes } = req.body;
    const booking = await HotelBooking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);

    if (status) booking.status = status;
    if (internalNotes !== undefined) booking.internalNotes = internalNotes;
    await booking.save();

    sendSuccess(res, booking, `Booking status updated to ${booking.status}`);
  })
);

export default router;
