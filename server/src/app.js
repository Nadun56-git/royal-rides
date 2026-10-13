/**
 * Royal Rides — Express Application Setup
 * Registers all middleware, routes, and error handlers.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import logger from './config/logger.js';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Route imports ─────────────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import vehicleBookingRoutes from './routes/vehicleBookingRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import hotelBookingRoutes from './routes/hotelBookingRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import packageBookingRoutes from './routes/packageBookingRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';
import tourGuideRoutes from './routes/tourGuideRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import currencyRoutes from './routes/currencyRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'https://res.cloudinary.com',
          'https://*.tile.openstreetmap.org',
          'https://images.unsplash.com',
          'https://unpkg.com',
        ],
        connectSrc: ["'self'", 'https://api.exchangerate-api.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        mediaSrc: ["'self'", 'https://*.ufs.sh', 'https://*.cloudinary.com', 'blob:'],
        frameSrc: ["'self'", 'https://www.youtube.com', 'https://youtube.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...configuredOrigins,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev to prevent broken requests
      }
    },
    credentials: true, // Allow cookies (refresh tokens)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── General Rate Limiter ──────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', generalLimiter);

// ── Body Parsing & Cookie Parser ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Data Sanitization (Prevent NoSQL Injection) ──────────────────────────────
const cleanNoSql = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      cleanNoSql(obj[key]);
    }
  }
};
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') cleanNoSql(req.body);
  if (req.params && typeof req.params === 'object') cleanNoSql(req.params);
  next();
});
app.use(hpp({             // Prevent HTTP parameter pollution
  whitelist: ['sort', 'fields', 'category', 'amenities', 'transmission'],
}));

// ── HTTP Request Logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // In production, stream Morgan logs through Winston
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ── API Version Prefix ────────────────────────────────────────────────────────
const API = '/api/v1';

// ── Mount Routes ──────────────────────────────────────────────────────────────
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/vehicles`, vehicleRoutes);
app.use(`${API}/vehicle-bookings`, vehicleBookingRoutes);
app.use(`${API}/hotels`, hotelRoutes);
app.use(`${API}/hotel-bookings`, hotelBookingRoutes);
app.use(`${API}/packages`, packageRoutes);
app.use(`${API}/package-bookings`, packageBookingRoutes);
app.use(`${API}/destinations`, destinationRoutes);
app.use(`${API}/facilities`, facilityRoutes);
app.use(`${API}/tour-guides`, tourGuideRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/wishlist`, wishlistRoutes);
app.use(`${API}/currency`, currencyRoutes);
app.use(`${API}/contact`, contactRoutes);
app.use(`${API}/upload`, uploadRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/settings`, settingRoutes);

// ── Swagger API Documentation ─────────────────────────────────────────────────
// (Swagger YAML will be added in Step 9; placeholder for now)
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'API documentation available at /api-docs once swagger spec is added.',
    apiVersion: 'v1',
    baseUrl: `${req.protocol}://${req.get('host')}/api/v1`,
  });
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Royal Rides API' });
});

// ── Serve React Frontend (Production / Standalone) ───────────────────────────
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/api-docs')
    ) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
