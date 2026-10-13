/**
 * Royal Rides — Facility Routes & Controller
 * Emergency contacts, police stations, sanitary facilities, hospitals
 * GET /api/v1/facilities
 * GET /api/v1/facilities/nearby
 * POST /api/v1/facilities (Admin)
 * DELETE /api/v1/facilities/:id (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Facility from '../models/Facility.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/v1/facilities/nearby - Geospatial Query ──────────────────────────
router.get(
  '/nearby',
  asyncHandler(async (req, res) => {
    const { lng, lat, type, maxDistance = 30000, limit = 10 } = req.query;

    if (!lng || !lat) {
      throw new AppError('Longitude (lng) and Latitude (lat) are required', 400);
    }

    const query = {
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
    };

    if (type) query.type = type;

    const facilities = await Facility.find(query).limit(parseInt(limit, 10));
    sendSuccess(res, facilities);
  })
);

// ── GET /api/v1/facilities - List All Facilities ───────────────────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { type, district, limit = 100 } = req.query;
    const query = { isActive: true };

    if (type) query.type = type;
    if (district) query.district = district;

    const facilities = await Facility.find(query)
      .populate('nearestDestination', 'name')
      .limit(parseInt(limit, 10))
      .lean();

    sendSuccess(res, facilities);
  })
);

// ── POST /api/v1/facilities - Admin Create ────────────────────────────────────
router.post(
  '/',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const facility = await Facility.create({
      ...req.body,
      createdBy: req.user._id,
    });
    sendCreated(res, facility, 'Facility created successfully');
  })
);

// ── DELETE /api/v1/facilities/:id - Admin Delete ──────────────────────────────
router.delete(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!facility) throw new AppError('Facility not found', 404);

    sendSuccess(res, null, 'Facility removed successfully');
  })
);

export default router;
