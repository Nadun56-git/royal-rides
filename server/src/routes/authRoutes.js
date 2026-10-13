/**
 * Royal Rides — Auth Routes
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/logout
 * POST /api/v1/auth/refresh-token
 * POST /api/v1/auth/forgot-password
 * PUT  /api/v1/auth/reset-password/:token
 * GET  /api/v1/auth/verify-email/:token
 * GET  /api/v1/auth/me
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Stricter rate limiter for auth endpoints ────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { success: false, message: 'Too many auth attempts, please try again in 15 minutes.' },
});

// ── Helper: Set refresh token cookie ────────────────────────────────────────
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth',
  });
};

// ── Register ─────────────────────────────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      throw new AppError('First name, last name, email, and password are required', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('An account with this email already exists', 409);

    const user = await User.create({ firstName, lastName, email, password, phone });

    // Generate email verification token
    const verifyToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // TODO (Step 2+): Send verification email via Nodemailer

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store hashed refresh token (security: store hash, not raw token)
    user.refreshTokens.push({
      token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return sendCreated(
      res,
      {
        accessToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
      'Account created successfully. Please verify your email.'
    );
  })
);

// ── Login ─────────────────────────────────────────────────────────────────────
router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required', 400);

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    if (user.isBanned) throw new AppError('Your account has been suspended. Contact support.', 403);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Limit stored refresh tokens to 5 per user (multi-device but cap abuse)
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens.shift(); // Remove oldest
    }
    user.refreshTokens.push({
      token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return sendSuccess(res, {
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        preferredCurrency: user.preferredCurrency,
        avatar: user.avatar,
      },
    }, 'Login successful');
  })
);

// ── Refresh Token ─────────────────────────────────────────────────────────────
router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('Refresh token not found', 401);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': hashedToken,
    });
    if (!user) throw new AppError('Refresh token revoked', 401);

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashedToken);
    const newRefreshToken = user.generateRefreshToken();
    user.refreshTokens.push({
      token: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, newRefreshToken);
    const accessToken = user.generateAccessToken();

    return sendSuccess(res, { accessToken }, 'Token refreshed');
  })
);

// ── Logout ────────────────────────────────────────────────────────────────────
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      await User.updateOne(
        { 'refreshTokens.token': hashedToken },
        { $pull: { refreshTokens: { token: hashedToken } } }
      );
    }
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return sendSuccess(res, null, 'Logged out successfully');
  })
);

// ── Forgot Password ───────────────────────────────────────────────────────────
router.post(
  '/forgot-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond 200 to prevent email enumeration
    if (!user) {
      return sendSuccess(res, null, 'If that email exists, a reset link has been sent.');
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO (Step 2+): Send reset email via Nodemailer
    // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    return sendSuccess(res, null, 'Password reset link sent to your email.');
  })
);

// ── Reset Password ────────────────────────────────────────────────────────────
router.put(
  '/reset-password/:token',
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });
    if (!user) throw new AppError('Invalid or expired reset token', 400);

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return sendSuccess(res, null, 'Password reset successful. Please log in.');
  })
);

// ── Verify Email ───────────────────────────────────────────────────────────────
router.get(
  '/verify-email/:token',
  asyncHandler(async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });
    if (!user) throw new AppError('Invalid or expired verification token', 400);

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, null, 'Email verified successfully!');
  })
);

// ── Get current user (me) ─────────────────────────────────────────────────────
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-refreshTokens');
  return sendSuccess(res, { user });
}));

export default router;
