/**
 * Royal Rides — Tour Guide Routes & Controller
 * GET  /api/v1/tour-guides
 * GET  /api/v1/tour-guides/:id
 * POST /api/v1/tour-guides (Admin)
 * PUT  /api/v1/tour-guides/:id (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import TourGuide from '../models/TourGuide.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/v1/tour-guides - List all available tour guides
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { language, specialization } = req.query;
    const query = { isActive: true, isAvailable: true };

    if (language) {
      query['languages.language'] = { $regex: language, $options: 'i' };
    }
    if (specialization) {
      query.specializations = specialization;
    }

    const guides = await TourGuide.find(query).sort({ averageRating: -1, totalTours: -1 });
    sendSuccess(res, guides);
  })
);

// GET /api/v1/tour-guides/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const guide = await TourGuide.findById(req.params.id);
    if (!guide) throw new AppError('Tour guide not found', 404);

    sendSuccess(res, guide);
  })
);

// POST /api/v1/tour-guides - Admin Create
router.post(
  '/',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const guide = await TourGuide.create(req.body);
    sendCreated(res, guide, 'Tour guide added successfully');
  })
);

// PUT /api/v1/tour-guides/:id - Admin Update
router.put(
  '/:id',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const guide = await TourGuide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!guide) throw new AppError('Tour guide not found', 404);

    sendSuccess(res, guide, 'Tour guide updated successfully');
  })
);

export default router;
