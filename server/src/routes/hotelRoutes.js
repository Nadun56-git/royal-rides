/**
 * Royal Rides — Hotel Routes & Controller
 * GET    /api/v1/hotels
 * GET    /api/v1/hotels/:id
 * POST   /api/v1/hotels/calculate-quote
 * POST   /api/v1/hotels (Admin)
 * PUT    /api/v1/hotels/:id (Admin)
 * DELETE /api/v1/hotels/:id (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Hotel from '../models/Hotel.js';
import SeasonalRate from '../models/SeasonalRate.js';
import CurrencyRate from '../models/CurrencyRate.js';
import { sendSuccess, sendCreated, sendPaginated, buildPaginationMeta } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

const getExchangeRate = async () => {
  const rateDoc = await CurrencyRate.findOne({ fromCurrency: 'USD', toCurrency: 'LKR', isActive: true });
  return rateDoc ? rateDoc.rate : 310.0;
};

// ── GET /api/v1/hotels - Search & List ────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      destination,
      city,
      starRating,
      amenities,
      minPrice,
      maxPrice,
      sort = 'recommended',
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (destination) query.destination = destination;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (starRating) {
      const stars = Array.isArray(starRating) ? starRating : starRating.split(',');
      query.starRating = { $in: stars.map(Number) };
    }
    if (amenities) {
      const amList = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amList };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      query['rooms.pricePerNightLKR'] = {};
      if (minPrice) query['rooms.pricePerNightLKR'].$gte = Number(minPrice);
      if (maxPrice) query['rooms.pricePerNightLKR'].$lte = Number(maxPrice);
    }

    const sortOptions = {};
    if (sort === 'price_asc') sortOptions['rooms.0.pricePerNightLKR'] = 1;
    else if (sort === 'price_desc') sortOptions['rooms.0.pricePerNightLKR'] = -1;
    else if (sort === 'rating') sortOptions.averageRating = -1;
    else if (sort === 'stars') sortOptions.starRating = -1;
    else sortOptions.createdAt = -1;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [hotels, total] = await Promise.all([
      Hotel.find(query)
        .populate('destination', 'name slug province region')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Hotel.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, hotels, pagination);
  })
);

// ── POST /api/v1/hotels/calculate-quote - Dynamic Pricing & Seasonal Discounts
router.post(
  '/calculate-quote',
  asyncHandler(async (req, res) => {
    const {
      hotelId,
      roomTypeId,
      checkIn,
      checkOut,
      rooms = 1,
      guests = 2,
      promoCode,
      currency = 'LKR',
    } = req.body;

    if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
      throw new AppError('hotelId, roomTypeId, checkIn, and checkOut are required', 400);
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) throw new AppError('Hotel not found or unavailable', 404);

    const room = hotel.rooms.id(roomTypeId);
    if (!room || !room.isActive) throw new AppError('Selected room type not found', 404);

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    if (startDate >= endDate) throw new AppError('Check-out date must be after check-in date', 400);

    const nights = Math.max(1, Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)));
    const roomCount = Math.max(1, Number(rooms) || 1);
    const guestCount = Math.max(1, Number(guests) || 1);

    const baseNightlyRate = room.pricePerNightLKR;
    const baseTotal = baseNightlyRate * nights * roomCount;

    // Check for applicable seasonal rate or promotion
    let seasonalDiscount = 0;
    let seasonalDiscountPercent = 0;
    let promotionApplied = null;

    const now = new Date();
    const promoQuery = {
      isActive: true,
      validFrom: { $lte: endDate },
      validTo: { $gte: startDate },
      appliesTo: { $in: ['hotels', 'all'] },
      $or: [
        { specificIds: { $size: 0 } },
        { specificIds: hotel._id },
      ],
    };

    if (promoCode) {
      promoQuery.promoCode = promoCode.toUpperCase().trim();
    }

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
    const taxRate = hotel.taxRate || 10; // 10% VAT/TDT
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const serviceChargeRate = hotel.serviceCharge || 10; // 10%
    const serviceChargeAmount = Math.round((subtotal * serviceChargeRate) / 100);
    const totalLKR = subtotal + taxAmount + serviceChargeAmount;

    const usdRate = await getExchangeRate();
    const lkrToUsdRate = 1 / usdRate;
    const totalUSD = Number((totalLKR * lkrToUsdRate).toFixed(2));
    const isUSD = currency.toUpperCase() === 'USD';

    const quote = {
      hotelId: hotel._id,
      hotelName: hotel.name,
      roomTypeId: room._id,
      roomTypeName: room.name,
      nights,
      rooms: roomCount,
      guests: guestCount,
      baseNightlyRate,
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
      totalUSD,
      currencyUsed: isUSD ? 'USD' : 'LKR',
      totalInSelectedCurrency: isUSD ? totalUSD : totalLKR,
      exchangeRateUsed: usdRate,
      cancellationPolicy: hotel.cancellationPolicy,
    };

    sendSuccess(res, quote, 'Hotel price quote calculated successfully');
  })
);

// ── GET /api/v1/hotels/:id - Hotel Detail ─────────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id).populate('destination');
    if (!hotel) throw new AppError('Hotel not found', 404);

    sendSuccess(res, hotel);
  })
);

// ── POST /api/v1/hotels - Admin Create ────────────────────────────────────────
router.post(
  '/',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const hotel = await Hotel.create(req.body);
    sendCreated(res, hotel, 'Hotel created successfully');
  })
);

// ── PUT /api/v1/hotels/:id - Admin Update ─────────────────────────────────────
router.put(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hotel) throw new AppError('Hotel not found', 404);

    sendSuccess(res, hotel, 'Hotel updated successfully');
  })
);

// ── DELETE /api/v1/hotels/:id - Admin Delete ──────────────────────────────────
router.delete(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!hotel) throw new AppError('Hotel not found', 404);

    sendSuccess(res, null, 'Hotel deactivated successfully');
  })
);

export default router;
