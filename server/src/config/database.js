/**
 * Royal Rides — MongoDB Connection
 * Establishes a Mongoose connection with retry logic.
 */

import mongoose from 'mongoose';
import logger from './logger.js';

let memoryServer = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`⚠️ External MongoDB (${process.env.MONGO_URI}) not reachable: ${error.message}`);
    logger.info('🚀 Launching embedded in-memory MongoDB engine for zero-configuration operation…');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'royal_rides' },
      });
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      logger.info(`✅ Embedded MongoDB active at ${uri}`);

      // Auto-seed initial tourism dataset
      const { seedDatabase } = await import('../seeds/seed.js');
      logger.info('🌱 Auto-seeding Sri Lankan destinations, vehicles, hotels & packages…');
      await seedDatabase(false);
      logger.info('✨ Auto-seed complete. All fleet, hotels & packages are live in database.');
    } catch (memErr) {
      logger.error(`Failed to initialize embedded MongoDB: ${memErr.message}`);
    }
  }

  // ── Mongoose global settings ─────────────────────────────────────────────
  mongoose.set('debug', process.env.NODE_ENV === 'development');

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting to reconnect…');
  });
};

process.on('SIGINT', async () => {
  if (memoryServer) await memoryServer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (memoryServer) await memoryServer.stop();
  process.exit(0);
});

export default connectDB;
