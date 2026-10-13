/**
 * Royal Rides — Settings Routes & Controller
 * GET /api/v1/settings (Public settings)
 * GET /api/v1/settings/admin/all (Admin all settings)
 * PUT /api/v1/settings (Admin update setting)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Setting from '../models/Setting.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

const DEFAULT_SETTINGS = {
  site_phone: '0718282758',
  site_email: 'Info@uncage.lk',
  emergency_police: '119',
  emergency_tourist_police: '1912',
  emergency_ambulance: '1990',
  emergency_fire: '110',
  company_name: 'Royal Rides Sri Lanka',
  company_address: 'No. 45, Galle Face Terrace, Colombo 03, Sri Lanka',
  whatsapp_number: '+94718282758',
  social_facebook: 'https://facebook.com/royalrides',
  social_instagram: 'https://instagram.com/royalridessl',
};

// GET /api/v1/settings - Public settings dictionary
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const settingsList = await Setting.find({ isPublic: true });
    const settingsMap = { ...DEFAULT_SETTINGS };

    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    sendSuccess(res, settingsMap);
  })
);

// GET /api/v1/settings/admin/all - Admin full settings
router.get(
  '/admin/all',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const settings = await Setting.find().sort({ group: 1, key: 1 });
    sendSuccess(res, settings);
  })
);

// PUT /api/v1/settings - Admin update a setting
router.put(
  '/',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const { key, value, label, group = 'general', isPublic = true } = req.body;

    if (!key || value === undefined) {
      throw new AppError('Setting key and value are required', 400);
    }

    const updated = await Setting.findOneAndUpdate(
      { key: key.toLowerCase().trim() },
      {
        key: key.toLowerCase().trim(),
        value,
        label: label || key,
        group,
        isPublic,
        updatedBy: req.user._id,
      },
      { upsert: true, new: true }
    );

    sendSuccess(res, updated, 'Setting saved successfully');
  })
);

export default router;
