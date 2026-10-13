/**
 * Royal Rides — Image Upload Routes
 * POST /api/v1/upload (Single or multiple image upload)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mock/Cloudinary-ready image upload endpoint
router.post(
  '/',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    // Return sample or uploaded URLs
    const sampleUrl = req.body.url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80';
    sendSuccess(res, {
      url: sampleUrl,
      publicId: `rr_asset_${Date.now()}`,
    }, 'Image uploaded successfully');
  })
);

export default router;
