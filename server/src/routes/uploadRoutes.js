/**
 * Royal Rides — Image Upload Routes
 * Multer-powered local disk storage for uploading vehicle photos,
 * hotel imagery, and tour packages from client computer.
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Multer Disk Storage Setup ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `${cleanBase || 'photo'}_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WebP, etc.) are permitted', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// ── POST /api/v1/upload - Upload from computer ──────────────────────────────
router.post(
  '/',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Maximum allowed size is 15MB.', 400));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    // If files were uploaded via multipart form data
    if (req.files && req.files.length > 0) {
      const host = req.get('host');
      const protocol = req.protocol;

      const uploadedFiles = req.files.map((file) => {
        // Return full URL and relative URL
        const fullUrl = `${protocol}://${host}/uploads/${file.filename}`;
        const relativeUrl = `/uploads/${file.filename}`;
        return {
          url: fullUrl,
          relativePath: relativeUrl,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        };
      });

      const primary = uploadedFiles[0];

      return sendSuccess(
        res,
        {
          url: primary.url,
          relativePath: primary.relativePath,
          filename: primary.filename,
          files: uploadedFiles,
        },
        `${uploadedFiles.length} photo(s) uploaded successfully`
      );
    }

    // Fallback if URL was passed in JSON body
    if (req.body?.url) {
      return sendSuccess(
        res,
        {
          url: req.body.url,
          filename: `external_${Date.now()}`,
          files: [{ url: req.body.url }],
        },
        'Photo URL registered successfully'
      );
    }

    throw new AppError('Please select an image file from your computer to upload', 400);
  })
);

export default router;
