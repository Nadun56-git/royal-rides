/**
 * Royal Rides — Package Booking Routes & Controller
 * POST  /api/v1/package-bookings
 * GET   /api/v1/package-bookings/my-bookings
 * GET   /api/v1/package-bookings/:id
 * PATCH /api/v1/package-bookings/:id/cancel
 * PATCH /api/v1/package-bookings/:id/status (Admin)
 * GET   /api/v1/package-bookings/admin/all (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import TravelPackage from '../models/TravelPackage.js';
import TourGuide from '../models/TourGuide.js';
import PackageBooking from '../models/PackageBooking.js';
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

// ── POST /api/v1/package-bookings - Create Reservation ────────────────────────
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const {
      packageId,
      startDate,
      groupSize = 1,
      tourGuideId,
      guestInfo,
      passengers = [],
      specialRequests,
      promoCode,
      currency = 'LKR',
    } = req.body;

    if (!packageId || !startDate) {
      throw new AppError('packageId and startDate are required', 400);
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) throw new AppError('Invalid start date', 400);

    if (!req.user && (!guestInfo || !guestInfo.email || !guestInfo.name || !guestInfo.phone)) {
      throw new AppError('Guest details (name, email, phone) are required', 400);
    }

    const pkg = await TravelPackage.findById(packageId);
    if (!pkg || !pkg.isActive) throw new AppError('Travel package not found or unavailable', 404);

    const size = Math.max(1, Number(groupSize) || 1);
    const end = new Date(start);
    end.setDate(end.getDate() + (pkg.durationDays || 1));

    const basePrice = pkg.basePricePerPersonLKR;
    const baseTotal = basePrice * size;

    let groupDiscount = 0;
    let groupDiscountPercent = 0;
    let soloSurcharge = 0;

    if (size >= (pkg.groupDiscountThreshold || 5)) {
      groupDiscountPercent = pkg.groupDiscountPercent || 10;
      groupDiscount = Math.round((baseTotal * groupDiscountPercent) / 100);
    } else if (size === 1 && pkg.soloSurchargePercent > 0) {
      soloSurcharge = Math.round((baseTotal * pkg.soloSurchargePercent) / 100);
    }

    let guideFeeTotal = 0;
    let guideDailyRate = 0;
    let validGuideId = null;

    if (tourGuideId) {
      const guide = await TourGuide.findById(tourGuideId);
      if (guide && guide.isActive) {
        validGuideId = guide._id;
        guideDailyRate = guide.dailyRateLKR;
        guideFeeTotal = guide.dailyRateLKR * pkg.durationDays;
      }
    }

    let seasonalAdjustment = 0;
    const promoQuery = {
      isActive: true,
      validFrom: { $lte: start },
      validTo: { $gte: start },
      appliesTo: { $in: ['packages', 'all'] },
      $or: [{ specificIds: { $size: 0 } }, { specificIds: pkg._id }],
    };
    if (promoCode) promoQuery.promoCode = promoCode.toUpperCase().trim();

    const promos = await SeasonalRate.find(promoQuery).sort({ priority: -1 });
    if (promos.length > 0) {
      const promo = promos[0];
      if (promo.discountType === 'percentage') {
        seasonalAdjustment = Math.round((baseTotal * promo.discountValue) / 100);
      } else {
        seasonalAdjustment = promo.discountValue;
      }
    }

    const subtotal = Math.max(0, baseTotal - groupDiscount + soloSurcharge + guideFeeTotal - seasonalAdjustment);
    const totalLKR = subtotal;

    const usdRate = await getExchangeRate();
    const lkrToUsdRate = 1 / usdRate;
    const totalUSD = Number((totalLKR * lkrToUsdRate).toFixed(2));
    const isUSD = currency.toUpperCase() === 'USD';

    const bookingRef = generateBookingRef('PK');

    const booking = await PackageBooking.create({
      bookingRef,
      user: req.user ? req.user._id : null,
      guestInfo: req.user
        ? {
            name: `${req.user.firstName} ${req.user.lastName}`,
            email: req.user.email,
            phone: req.user.phone,
          }
        : guestInfo,
      package: pkg._id,
      tourGuide: validGuideId,
      startDate: start,
      endDate: end,
      groupSize: size,
      passengers,
      priceBreakdown: {
        basePricePerPerson: basePrice,
        groupSize: size,
        baseTotal,
        groupDiscount,
        groupDiscountPercent,
        soloSurcharge,
        guideFeePerDay: guideDailyRate,
        guideDays: pkg.durationDays,
        guideFeeTotal,
        seasonalAdjustment,
        addOns: 0,
        subtotal,
        taxRate: 0,
        taxAmount: 0,
        totalLKR,
        currencyUsed: isUSD ? 'USD' : 'LKR',
        exchangeRateUsed: usdRate,
        totalInCurrency: isUSD ? totalUSD : totalLKR,
      },
      specialRequests,
      status: 'confirmed',
    });

    await TravelPackage.findByIdAndUpdate(packageId, { $inc: { totalBookings: 1 } });

    sendCreated(res, booking, 'Package tour confirmed successfully');
  })
);

// ── GET /api/v1/package-bookings/my-bookings - User's Bookings ─────────────────
router.get(
  '/my-bookings',
  protect,
  asyncHandler(async (req, res) => {
    const bookings = await PackageBooking.find({ user: req.user._id })
      .populate('package', 'name category durationDays durationNights coverImage')
      .populate('tourGuide', 'name phone photo')
      .sort({ createdAt: -1 });

    sendSuccess(res, bookings);
  })
);

// ── GET /api/v1/package-bookings/admin/all - Admin List ────────────────────────
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
      PackageBooking.find(query)
        .populate('package', 'name category durationDays')
        .populate('user', 'firstName lastName email')
        .populate('tourGuide', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      PackageBooking.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, bookings, pagination);
  })
);

// ── GET /api/v1/package-bookings/:id - Booking Detail ──────────────────────────
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { bookingRef: req.params.id };

    const booking = await PackageBooking.findOne(query)
      .populate('package')
      .populate('tourGuide');
    if (!booking) throw new AppError('Booking not found', 404);

    sendSuccess(res, booking);
  })
);

// ── PATCH /api/v1/package-bookings/:id/cancel - Cancel Booking ────────────────
router.patch(
  '/:id/cancel',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { cancellationReason } = req.body;
    const booking = await PackageBooking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by customer';
    booking.cancelledAt = new Date();
    await booking.save();

    sendSuccess(res, booking, 'Package tour reservation cancelled');
  })
);

// ── PATCH /api/v1/package-bookings/:id/status - Admin Status ──────────────────
router.patch(
  '/:id/status',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    const { status, internalNotes } = req.body;
    const booking = await PackageBooking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);

    if (status) booking.status = status;
    if (internalNotes !== undefined) booking.internalNotes = internalNotes;
    await booking.save();

    sendSuccess(res, booking, `Booking status updated to ${booking.status}`);
  })
);

export default router;
