/**
 * Royal Rides — API Response Helper
 * Provides consistent JSON response format across all endpoints.
 *
 * Successful: { success: true, message, data, meta }
 * Failed:     { success: false, message, errors }
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {any} data - Response payload
 * @param {string} [message='Success'] - Human-readable message
 * @param {number} [statusCode=200] - HTTP status code
 * @param {object} [meta] - Pagination meta, etc.
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200, meta = null) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Send a created (201) response.
 */
export const sendCreated = (res, data, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send a paginated list response.
 * @param {import('express').Response} res
 * @param {any[]} data
 * @param {object} pagination - { total, page, limit, totalPages }
 */
export const sendPaginated = (res, data, pagination, message = 'Success') => {
  return sendSuccess(res, data, message, 200, { pagination });
};

/**
 * Build a pagination meta object from query params.
 * @param {number} total - Total matching documents
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 */
export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
