/**
 * Royal Rides — Travel Package Routes & Controller
 * GET    /api/v1/packages
 * GET    /api/v1/packages/:id
 * POST   /api/v1/packages/calculate-quote
 * POST   /api/v1/packages (Admin)
 * PUT    /api/v1/packages/:id (Admin)
 * DELETE /api/v1/packages/:id (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import TravelPackage from '../models/TravelPackage.js';
import TourGuide from '../models/TourGuide.js';
import SeasonalRate from '../models/SeasonalRate.js';
import CurrencyRate from '../models/CurrencyRate.js';
import { sendSuccess, sendCreated, sendPaginated, buildPaginationMeta } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

const getExchangeRate = async () => {
  const rateDoc = await CurrencyRate.findOne({ fromCurrency: 'USD', toCurrency: 'LKR', isActive: true });
  return rateDoc ? rateDoc.rate : 310.0;
};

// ── GET /api/v1/packages - Search & Filter ────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      category,
      difficulty,
      durationDays,
      minPrice,
      maxPrice,
      sort = 'recommended',
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (category) {
      const cats = Array.isArray(category) ? category : category.split(',');
      query.category = { $in: cats };
    }
    if (difficulty) query.difficulty = difficulty;
    if (durationDays) query.durationDays = { $lte: Number(durationDays) };
    if (minPrice || maxPrice) {
      query.basePricePerPersonLKR = {};
      if (minPrice) query.basePricePerPersonLKR.$gte = Number(minPrice);
      if (maxPrice) query.basePricePerPersonLKR.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { highlights: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOptions = {};
    if (sort === 'price_asc') sortOptions.basePricePerPersonLKR = 1;
    else if (sort === 'price_desc') sortOptions.basePricePerPersonLKR = -1;
    else if (sort === 'duration') sortOptions.durationDays = 1;
    else if (sort === 'rating') sortOptions.averageRating = -1;
    else if (sort === 'popular') sortOptions.totalBookings = -1;
    else sortOptions.createdAt = -1;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [packages, total] = await Promise.all([
      TravelPackage.find(query)
        .populate('destinations', 'name slug province coverImage')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      TravelPackage.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, packages, pagination);
  })
);

// ── POST /api/v1/packages/calculate-quote - Dynamic Quotation ─────────────────
router.post(
  '/calculate-quote',
  asyncHandler(async (req, res) => {
    const {
      packageId,
      groupSize = 1,
      tourGuideId,
      startDate,
      promoCode,
      currency = 'LKR',
    } = req.body;

    if (!packageId) throw new AppError('packageId is required', 400);

    const pkg = await TravelPackage.findById(packageId);
    if (!pkg || !pkg.isActive) throw new AppError('Travel package not found or inactive', 404);

    const size = Math.max(1, Number(groupSize) || 1);
    const basePrice = pkg.basePricePerPersonLKR;
    const baseTotal = basePrice * size;

    // Group discount or solo surcharge
    let groupDiscount = 0;
    let groupDiscountPercent = 0;
    let soloSurcharge = 0;

    if (size >= (pkg.groupDiscountThreshold || 5)) {
      groupDiscountPercent = pkg.groupDiscountPercent || 10;
      groupDiscount = Math.round((baseTotal * groupDiscountPercent) / 100);
    } else if (size === 1 && pkg.soloSurchargePercent > 0) {
      soloSurcharge = Math.round((baseTotal * pkg.soloSurchargePercent) / 100);
    }

    // Guide calculation
    let guideFeeTotal = 0;
    let guideDailyRate = 0;
    let guideName = null;

    if (tourGuideId) {
      const guide = await TourGuide.findById(tourGuideId);
      if (guide && guide.isActive) {
        guideDailyRate = guide.dailyRateLKR;
        guideFeeTotal = guide.dailyRateLKR * pkg.durationDays;
        guideName = guide.name;
      }
    }

    // Seasonal / Promo calculation
    let seasonalAdjustment = 0;
    let promoName = null;

    if (startDate) {
      const tripDate = new Date(startDate);
      const promoQuery = {
        isActive: true,
        validFrom: { $lte: tripDate },
        validTo: { $gte: tripDate },
        appliesTo: { $in: ['packages', 'all'] },
        $or: [{ specificIds: { $size: 0 } }, { specificIds: pkg._id }],
      };
      if (promoCode) promoQuery.promoCode = promoCode.toUpperCase().trim();

      const promos = await SeasonalRate.find(promoQuery).sort({ priority: -1 });
      if (promos.length > 0) {
        const promo = promos[0];
        promoName = promo.name;
        if (promo.discountType === 'percentage') {
          seasonalAdjustment = Math.round((baseTotal * promo.discountValue) / 100);
        } else {
          seasonalAdjustment = promo.discountValue;
        }
      }
    }

    const subtotal = Math.max(0, baseTotal - groupDiscount + soloSurcharge + guideFeeTotal - seasonalAdjustment);
    const taxRate = 0;
    const taxAmount = 0;
    const totalLKR = subtotal + taxAmount;

    const usdRate = await getExchangeRate();
    const lkrToUsdRate = 1 / usdRate;
    const totalUSD = Number((totalLKR * lkrToUsdRate).toFixed(2));
    const pricePerPersonLKR = Math.round(totalLKR / size);
    const pricePerPersonUSD = Number((totalUSD / size).toFixed(2));
    const isUSD = currency.toUpperCase() === 'USD';

    const quote = {
      packageId: pkg._id,
      packageName: pkg.name,
      durationDays: pkg.durationDays,
      durationNights: pkg.durationNights,
      groupSize: size,
      basePricePerPersonLKR: basePrice,
      baseTotal,
      groupDiscount,
      groupDiscountPercent,
      soloSurcharge,
      tourGuideId: tourGuideId || null,
      guideName,
      guideDailyRate,
      guideDays: pkg.durationDays,
      guideFeeTotal,
      seasonalAdjustment,
      promotionApplied: promoName,
      subtotal,
      totalLKR,
      totalUSD,
      pricePerPersonLKR,
      pricePerPersonUSD,
      currencyUsed: isUSD ? 'USD' : 'LKR',
      totalInSelectedCurrency: isUSD ? totalUSD : totalLKR,
      exchangeRateUsed: usdRate,
    };

    sendSuccess(res, quote, 'Package quote calculated successfully');
  })
);

// ── GET /api/v1/packages/:id - Package Detail ─────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pkg = await TravelPackage.findById(req.params.id)
      .populate('destinations')
      .populate('availableGuides');
    if (!pkg) throw new AppError('Travel package not found', 404);

    sendSuccess(res, pkg);
  })
);

// ── POST /api/v1/packages - Admin Create ──────────────────────────────────────
router.post(
  '/',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const pkg = await TravelPackage.create({
      ...req.body,
      createdBy: req.user._id,
    });
    sendCreated(res, pkg, 'Travel package created successfully');
  })
);

// ── PUT /api/v1/packages/:id - Admin Update ───────────────────────────────────
router.put(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const pkg = await TravelPackage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) throw new AppError('Travel package not found', 404);

    sendSuccess(res, pkg, 'Travel package updated successfully');
  })
);

// ── DELETE /api/v1/packages/:id - Admin Delete ────────────────────────────────
router.delete(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const pkg = await TravelPackage.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!pkg) throw new AppError('Travel package not found', 404);

    sendSuccess(res, null, 'Travel package deactivated successfully');
  })
);

export default router;
