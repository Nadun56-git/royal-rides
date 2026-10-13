/**
 * Royal Rides — User Routes & Controller
 * GET   /api/v1/users/me
 * PUT   /api/v1/users/me
 * PUT   /api/v1/users/change-password
 * GET   /api/v1/users/admin/all (Admin)
 * PATCH /api/v1/users/admin/:id/role (Admin)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import { sendSuccess, sendPaginated, buildPaginationMeta } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/v1/users/me - Current user profile
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    sendSuccess(res, user);
  })
);

// PUT /api/v1/users/me - Update profile
router.put(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, phone, avatar, preferredCurrency } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) throw new AppError('User not found', 404);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (preferredCurrency) user.preferredCurrency = preferredCurrency;

    await user.save();
    sendSuccess(res, user, 'Profile updated successfully');
  })
);

// PUT /api/v1/users/change-password
router.put(
  '/change-password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError('Current password is incorrect', 400);

    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, 'Password updated successfully');
  })
);

// GET /api/v1/users/admin/all - Admin user list
router.get(
  '/admin/all',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, users, pagination);
  })
);

// PATCH /api/v1/users/admin/:id/role - Admin update user role
router.patch(
  '/admin/:id/role',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!['customer', 'staff', 'manager', 'admin'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) throw new AppError('User not found', 404);

    sendSuccess(res, user, `User role changed to ${role}`);
  })
);

export default router;
