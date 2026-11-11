/**
 * Royal Rides — MongoDB Connection
 * Establishes a Mongoose connection with retry logic.
 */

import mongoose from 'mongoose';
import logger from './logger.js';

let memoryServer = null;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const maskedUri = (process.env.MONGO_URI || '').replace(/:([^:@]+)@/, ':****@');

  if (!process.env.MONGO_URI) {
    logger.error('❌ MONGO_URI environment variable is not set. Set it in your Render dashboard.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    logger.warn(`⚠️ External MongoDB (${maskedUri}) not reachable: ${error.message}`);

    if (isProduction) {
      // In production, never fall back — crash loudly so the env var gets fixed
      logger.error('❌ Cannot connect to MongoDB in production. Fix MONGO_URI on Render and redeploy.');
      process.exit(1);
    }

    // Development only: fall back to in-memory MongoDB
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
