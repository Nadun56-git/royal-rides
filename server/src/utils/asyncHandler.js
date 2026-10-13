/**
 * Royal Rides — Async Handler Wrapper
 * Eliminates try/catch boilerplate in async route controllers.
 * Any thrown error is passed to Express's next() error handler.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => {
 *     const data = await SomeModel.find();
 *     res.json({ success: true, data });
 *   }));
 */

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
