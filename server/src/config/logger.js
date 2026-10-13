/**
 * Royal Rides — Winston Logger Configuration
 * Provides structured logging for development and production.
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ── Custom log format for console (development) ────────────────────────────
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// ── Determine log level from environment ───────────────────────────────────
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

const logger = winston.createLogger({
  level: logLevel,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    // ── Console transport ──────────────────────────────────────────────────
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        devFormat
      ),
    }),

    // ── Error log file ─────────────────────────────────────────────────────
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: json(),
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),

    // ── Combined log file ──────────────────────────────────────────────────
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: json(),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log'),
    }),
  ],
});

// ── Add http level for Morgan stream ──────────────────────────────────────
logger.http = (message) => logger.log('http', message);

export default logger;
