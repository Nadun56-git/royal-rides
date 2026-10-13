/**
 * Royal Rides — Auth Middleware
 * protect: Verify JWT access token and attach user to req
 * restrict: Role-based access control
 */

import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ── Protect: require valid JWT access token ────────────────────────────────
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header (Bearer scheme)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Authentication required. Please log in.', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new AppError(
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token.',
      401
    );
  }

  const user = await User.findById(decoded.id).select('-password -refreshTokens');
  if (!user) throw new AppError('User no longer exists.', 401);
  if (user.isBanned) throw new AppError('Your account has been suspended.', 403);

  req.user = user;
  next();
});

// ── Restrict: require specific roles ──────────────────────────────────────
export const restrict = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Requires one of: ${roles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }
    next();
  };
};

// ── Optional Auth: attach user if token provided, but don't block ─────────
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (user && !user.isBanned) {
      req.user = user;
    }
  } catch {
    // Invalid token — just ignore and continue as guest
  }
  next();
});

// ── Admin shorthand ───────────────────────────────────────────────────────
export const adminOnly = [protect, restrict('super_admin', 'manager')];
export const superAdminOnly = [protect, restrict('super_admin')];
