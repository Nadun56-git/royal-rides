/**
 * Royal Rides — Error Handling Middleware
 * Centralizes all error responses with proper logging and sanitization.
 * Never leaks stack traces or implementation details in production.
 */

import logger from '../config/logger.js';
import AppError from '../utils/AppError.js';

// ── 404 Handler ───────────────────────────────────────────────────────────────
export const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// ── Mongoose CastError (invalid ObjectId) ─────────────────────────────────────
const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

// ── Mongoose Duplicate Key ────────────────────────────────────────────────────
const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue).join(', ');
  const value = Object.values(err.keyValue).join(', ');
  return new AppError(`Duplicate value for field '${field}': ${value}`, 409);
};

// ── Mongoose Validation Error ─────────────────────────────────────────────────
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Validation failed', 422, { errors });
};

// ── JWT Errors ────────────────────────────────────────────────────────────────
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your session has expired. Please log in again.', 401);

// ── Global Error Handler ──────────────────────────────────────────────────────
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // ── Transform known error types ──────────────────────────────────────────
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // ── Log the error ─────────────────────────────────────────────────────────
  if (error.statusCode >= 500) {
    logger.error({
      message: error.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      user: req.user?.id,
    });
  } else {
    logger.warn(`[${error.statusCode}] ${error.message} — ${req.method} ${req.originalUrl}`);
  }

  // ── Send response ─────────────────────────────────────────────────────────
  const isDev = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    status: error.status || 'error',
    message: error.message || 'Something went wrong',
  };

  // Include extra data (e.g., validation field errors) if present
  if (error.data) response.data = error.data;

  // In development, include the stack trace for easier debugging
  if (isDev) {
    response.stack = err.stack;
  }

  return res.status(error.statusCode).json(response);
};
