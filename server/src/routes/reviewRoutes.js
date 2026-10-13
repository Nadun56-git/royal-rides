/**
 * Royal Rides — Review Routes & Controller
 * GET   /api/v1/reviews/item/:subjectType/:subjectId
 * POST  /api/v1/reviews
 * GET   /api/v1/reviews/admin/all (Admin)
 * PATCH /api/v1/reviews/:id/status (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Review from '../models/Review.js';
import { sendSuccess, sendCreated, sendPaginated, buildPaginationMeta } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/v1/reviews/item/:subjectType/:subjectId - Public Approved Reviews ──
router.get(
  '/item/:subjectType/:subjectId',
  asyncHandler(async (req, res) => {
    const { subjectType, subjectId } = req.params;

    const reviews = await Review.find({
      subjectType,
      subjectId,
      status: 'approved',
    })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    sendSuccess(res, {
      reviews,
      stats: {
        totalReviews: total,
        averageRating: Number(avg.toFixed(1)),
      },
    });
  })
);

// ── POST /api/v1/reviews - Submit Review ───────────────────────────────────────
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { subjectType, subjectId, rating, title, body, bookingType, bookingId } = req.body;

    if (!subjectType || !subjectId || !rating || !title || !body) {
      throw new AppError('subjectType, subjectId, rating, title, and body are required', 400);
    }

    const review = await Review.create({
      user: req.user._id,
      subjectType,
      subjectId,
      rating: Number(rating),
      title,
      body,
      bookingType,
      bookingId,
      isVerified: Boolean(bookingId),
      status: 'approved', // Auto-approved for verified/instant feedback in dev
    });

    sendCreated(res, review, 'Thank you! Your review has been submitted.');
  })
);

// ── GET /api/v1/reviews/admin/all - Admin Moderation List ─────────────────────
router.get(
  '/admin/all',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, reviews, pagination);
  })
);

// ── PATCH /api/v1/reviews/:id/status - Moderate Review ────────────────────────
router.patch(
  '/:id/status',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!review) throw new AppError('Review not found', 404);

    sendSuccess(res, review, `Review marked as ${status}`);
  })
);

export default router;
