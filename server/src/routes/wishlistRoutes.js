/**
 * Royal Rides — Wishlist Routes & Controller
 * GET    /api/v1/wishlist
 * POST   /api/v1/wishlist/toggle
 * DELETE /api/v1/wishlist/:itemType/:itemId
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Wishlist from '../models/Wishlist.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/v1/wishlist - Get current user's wishlist
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'items.itemId',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    sendSuccess(res, wishlist);
  })
);

// POST /api/v1/wishlist/toggle - Add or remove item
router.post(
  '/toggle',
  protect,
  asyncHandler(async (req, res) => {
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      throw new AppError('itemType and itemId are required', 400);
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    const existingIndex = wishlist.items.findIndex(
      (item) => item.itemType === itemType && String(item.itemId) === String(itemId)
    );

    let saved = false;
    if (existingIndex > -1) {
      // Remove
      wishlist.items.splice(existingIndex, 1);
      saved = false;
    } else {
      // Add
      wishlist.items.push({ itemType, itemId });
      saved = true;
    }

    await wishlist.save();

    sendSuccess(res, {
      saved,
      wishlist,
      message: saved ? 'Saved to your wishlist' : 'Removed from wishlist',
    });
  })
);

export default router;
