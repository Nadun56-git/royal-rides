/**
 * Royal Rides — Currency Routes
 * GET /api/v1/currency/rate
 * PUT /api/v1/currency/rate (Admin only)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import CurrencyRate from '../models/CurrencyRate.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fallback rates if no record in DB yet
const DEFAULT_USD_TO_LKR = 310.0;

// GET /api/v1/currency/rate - Public
router.get(
  '/rate',
  asyncHandler(async (req, res) => {
    let rateDoc = await CurrencyRate.findOne({
      fromCurrency: 'USD',
      toCurrency: 'LKR',
      isActive: true,
    });

    if (!rateDoc) {
      // Seed default rate in DB
      rateDoc = await CurrencyRate.create({
        fromCurrency: 'USD',
        toCurrency: 'LKR',
        rate: DEFAULT_USD_TO_LKR,
        source: 'manual',
        isActive: true,
      });
    }

    const usdToLkr = rateDoc.rate;
    const lkrToUsd = Number((1 / usdToLkr).toFixed(6));

    sendSuccess(res, {
      baseCurrency: 'LKR',
      rates: {
        LKR: 1,
        USD: lkrToUsd,
      },
      usdToLkr,
      updatedAt: rateDoc.updatedAt,
      source: rateDoc.source,
    });
  })
);

// PUT /api/v1/currency/rate - Admin only
router.put(
  '/rate',
  protect,
  restrict('admin', 'superadmin'),
  asyncHandler(async (req, res) => {
    const { usdToLkr, source = 'manual' } = req.body;

    if (!usdToLkr || isNaN(usdToLkr) || usdToLkr <= 0) {
      return res.status(400).json({ success: false, message: 'Valid usdToLkr number is required' });
    }

    const rateDoc = await CurrencyRate.findOneAndUpdate(
      { fromCurrency: 'USD', toCurrency: 'LKR' },
      {
        rate: Number(usdToLkr),
        source,
        updatedBy: req.user._id,
        lastFetchedAt: new Date(),
        isActive: true,
      },
      { upsert: true, new: true }
    );

    sendSuccess(res, {
      message: 'Currency exchange rate updated successfully',
      usdToLkr: rateDoc.rate,
      lkrToUsd: Number((1 / rateDoc.rate).toFixed(6)),
      updatedAt: rateDoc.updatedAt,
    });
  })
);

export default router;
