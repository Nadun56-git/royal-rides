/**
 * Royal Rides — Custom API Error Class
 * Extends the native Error with an HTTP status code and optional data payload.
 * Used throughout controllers to throw structured errors.
 */

export class AppError extends Error {
  /**
   * @param {string} message - Error message (user-facing)
   * @param {number} statusCode - HTTP status code
   * @param {any} [data] - Optional additional data
   */
  constructor(message, statusCode, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = true; // Distinguishes known operational errors from bugs
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
