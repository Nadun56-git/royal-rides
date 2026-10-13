/**
 * Royal Rides — Destination Routes & Controller
 * GET    /api/v1/destinations
 * GET    /api/v1/destinations/nearby
 * GET    /api/v1/destinations/:id
 * POST   /api/v1/destinations (Admin)
 * PUT    /api/v1/destinations/:id (Admin)
 * DELETE /api/v1/destinations/:id (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Destination from '../models/Destination.js';
import Facility from '../models/Facility.js';
import Hotel from '../models/Hotel.js';
import { sendSuccess, sendCreated, sendPaginated, buildPaginationMeta } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/v1/destinations/nearby - Geospatial $near Query ──────────────────
router.get(
  '/nearby',
  asyncHandler(async (req, res) => {
    const { lng, lat, maxDistance = 50000, limit = 6 } = req.query; // maxDistance in meters (default 50km)

    if (!lng || !lat) {
      throw new AppError('Longitude (lng) and Latitude (lat) are required', 400);
    }

    const destinations = await Destination.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance, 10),
        },
      },
      isActive: true,
    }).limit(parseInt(limit, 10));

    sendSuccess(res, destinations);
  })
);

// ── GET /api/v1/destinations - List All Destinations ──────────────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, province, search, sort = 'popular', page = 1, limit = 24 } = req.query;

    const query = { isActive: true };

    if (category) {
      const cats = Array.isArray(category) ? category : category.split(',');
      query.category = { $in: cats };
    }
    if (province) query.province = province;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { highlights: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOptions = {};
    if (sort === 'name') sortOptions.name = 1;
    else if (sort === 'rating') sortOptions.averageRating = -1;
    else if (sort === 'popular') sortOptions.totalVisitorsCount = -1;
    else sortOptions.createdAt = -1;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [destinations, total] = await Promise.all([
      Destination.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Destination.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, destinations, pagination);
  })
);

// ── GET /api/v1/destinations/:id - Destination Detail with Nearby Facilities ──
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const destination = await Destination.findOne(query);
    if (!destination) throw new AppError('Destination not found', 404);

    // Fetch nearby facilities (police, hospitals, sanitary) within 25km
    let nearbyFacilities = [];
    if (destination.location && destination.location.coordinates) {
      nearbyFacilities = await Facility.find({
        location: {
          $near: {
            $geometry: destination.location,
            $maxDistance: 25000,
          },
        },
        isActive: true,
      }).limit(10);
    }

    // Fetch hotels located in this destination
    const hotels = await Hotel.find({ destination: destination._id, isActive: true })
      .select('name starRating coverImage rooms.pricePerNightLKR averageRating')
      .limit(6);

    sendSuccess(res, {
      destination,
      nearbyFacilities,
      hotels,
    });
  })
);

// ── POST /api/v1/destinations - Admin Create ──────────────────────────────────
router.post(
  '/',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const destination = await Destination.create({
      ...req.body,
      createdBy: req.user._id,
    });
    sendCreated(res, destination, 'Destination created successfully');
  })
);

// ── PUT /api/v1/destinations/:id - Admin Update ───────────────────────────────
router.put(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!destination) throw new AppError('Destination not found', 404);

    sendSuccess(res, destination, 'Destination updated successfully');
  })
);

// ── DELETE /api/v1/destinations/:id - Admin Delete ────────────────────────────
router.delete(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!destination) throw new AppError('Destination not found', 404);

    sendSuccess(res, null, 'Destination deactivated successfully');
  })
);

export default router;
