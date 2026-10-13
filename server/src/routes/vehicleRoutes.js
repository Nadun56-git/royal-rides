/**
 * Royal Rides — Vehicle Routes & Controller
 * GET    /api/v1/vehicles
 * GET    /api/v1/vehicles/:id
 * POST   /api/v1/vehicles/calculate-quote
 * POST   /api/v1/vehicles/check-availability
 * POST   /api/v1/vehicles (Admin)
 * PUT    /api/v1/vehicles/:id (Admin)
 * DELETE /api/v1/vehicles/:id (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Vehicle from '../models/Vehicle.js';
import VehicleBooking from '../models/VehicleBooking.js';
import CurrencyRate from '../models/CurrencyRate.js';
import { sendSuccess, sendCreated, sendPaginated, buildPaginationMeta } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: Get active USD to LKR rate
const getExchangeRate = async () => {
  const rateDoc = await CurrencyRate.findOne({ fromCurrency: 'USD', toCurrency: 'LKR', isActive: true });
  return rateDoc ? rateDoc.rate : 310.0;
};

// ── GET /api/v1/vehicles - List & Filter ──────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      category,
      passengers,
      transmission,
      withDriver,
      selfDrive,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      page = 1,
      limit = 12,
      search,
    } = req.query;

    const query = { isActive: true };

    if (category) {
      const cats = Array.isArray(category) ? category : category.split(',');
      query.category = { $in: cats };
    }
    if (passengers) {
      query.passengerCapacity = { $gte: Number(passengers) };
    }
    if (transmission) {
      query.transmission = transmission;
    }
    if (withDriver === 'true') {
      query.withDriverAvailable = true;
    }
    if (selfDrive === 'true') {
      query.selfDriveAvailable = true;
    }
    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOptions = {};
    if (sort === 'price_asc') sortOptions.dailyRate = 1;
    else if (sort === 'price_desc') sortOptions.dailyRate = -1;
    else if (sort === 'rating') sortOptions.averageRating = -1;
    else if (sort === 'popular') sortOptions.totalBookings = -1;
    else sortOptions.createdAt = -1;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Vehicle.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, vehicles, pagination);
  })
);

// ── POST /api/v1/vehicles/calculate-quote - Live Distance & Price Quote ─────────
router.post(
  '/calculate-quote',
  asyncHandler(async (req, res) => {
    const {
      vehicleId,
      distanceKm = 0,
      days = 1,
      withDriver = true,
      extras = {},
      currency = 'LKR',
    } = req.body;

    if (!vehicleId) throw new AppError('vehicleId is required', 400);

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const dist = Math.max(0, Number(distanceKm) || 0);
    const numDays = Math.max(1, Number(days) || 1);

    // Calculate components
    const baseFee = vehicle.baseFee;
    const distanceCharge = Math.round(dist * vehicle.perKmRate);
    const dailyRateCharge = Math.round(numDays * vehicle.dailyRate);
    const driverFee = withDriver ? Math.round(numDays * (vehicle.driverFeePerDay || 0)) : 0;

    let extrasCharge = 0;
    if (extras.childSeat) extrasCharge += 1500 * numDays;
    if (extras.gps) extrasCharge += 1000 * numDays;
    if (extras.wifi) extrasCharge += 800 * numDays;

    const subtotal = baseFee + distanceCharge + dailyRateCharge + driverFee + extrasCharge;
    const taxRate = 0; // Tax included or 0%
    const taxAmount = Math.round(subtotal * taxRate);
    const totalLKR = subtotal + taxAmount;

    // Currency conversion
    const usdRate = await getExchangeRate();
    const lkrToUsdRate = 1 / usdRate;
    const totalUSD = Number((totalLKR * lkrToUsdRate).toFixed(2));

    const quote = {
      vehicleId: vehicle._id,
      vehicleName: vehicle.name,
      category: vehicle.category,
      baseFee,
      distanceKm: dist,
      perKmRate: vehicle.perKmRate,
      distanceCharge,
      dailyRate: vehicle.dailyRate,
      days: numDays,
      dailyRateCharge,
      withDriver,
      driverFeePerDay: vehicle.driverFeePerDay || 0,
      driverFee,
      extrasCharge,
      depositRequired: withDriver ? 0 : (vehicle.depositRequired || 0),
      subtotal,
      taxAmount,
      totalLKR,
      totalUSD,
      currencyUsed: currency.toUpperCase() === 'USD' ? 'USD' : 'LKR',
      totalInSelectedCurrency: currency.toUpperCase() === 'USD' ? totalUSD : totalLKR,
      exchangeRateUsed: usdRate,
    };

    sendSuccess(res, quote, 'Price quote generated successfully');
  })
);

// ── POST /api/v1/vehicles/check-availability ──────────────────────────────────
router.post(
  '/check-availability',
  asyncHandler(async (req, res) => {
    const { vehicleId, startDate, endDate } = req.body;

    if (!vehicleId || !startDate || !endDate) {
      throw new AppError('vehicleId, startDate, and endDate are required', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) throw new AppError('End date must be after start date', 400);

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    // Check blocked dates
    const isBlocked = vehicle.blockedDates.some(
      (b) => (start <= b.to && end >= b.from)
    );

    if (isBlocked) {
      return sendSuccess(res, { available: false, reason: 'Vehicle is unavailable for maintenance on selected dates' });
    }

    // Check active bookings
    const overlapping = await VehicleBooking.countDocuments({
      vehicle: vehicleId,
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      $or: [
        { 'rentalPeriod.start': { $lte: end }, 'rentalPeriod.end': { $gte: start } },
      ],
    });

    sendSuccess(res, {
      available: overlapping === 0,
      reason: overlapping > 0 ? 'Vehicle already reserved for these dates' : 'Available',
    });
  })
);

// ── GET /api/v1/vehicles/:id - Vehicle Detail ─────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    sendSuccess(res, vehicle);
  })
);

// ── POST /api/v1/vehicles - Admin Create ──────────────────────────────────────
router.post(
  '/',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.create({
      ...req.body,
      createdBy: req.user._id,
    });
    sendCreated(res, vehicle, 'Vehicle created successfully');
  })
);

// ── PUT /api/v1/vehicles/:id - Admin Update ───────────────────────────────────
router.put(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    sendSuccess(res, vehicle, 'Vehicle updated successfully');
  })
);

// ── DELETE /api/v1/vehicles/:id - Admin Delete ────────────────────────────────
router.delete(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    sendSuccess(res, null, 'Vehicle deactivated successfully');
  })
);

export default router;
