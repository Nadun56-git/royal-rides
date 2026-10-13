/**
 * Royal Rides — Server Entry Point
 * Bootstraps the Express application and connects to MongoDB.
 */

import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import logger from './src/config/logger.js';

const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB then start server ──────────────────────────────────────
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(
      `🚀 Royal Rides API running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    logger.info(`📡 API: http://localhost:${PORT}/api/v1`);
    logger.info(`📖 Docs: http://localhost:${PORT}/api-docs`);
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully…`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // ── Unhandled promise rejections ───────────────────────────────────────────
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
