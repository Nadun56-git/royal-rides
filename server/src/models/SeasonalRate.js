/**
 * Royal Rides — Seasonal Rate / Promotion Model
 * Configures time-based price adjustments applied to hotels and packages.
 */

import mongoose from 'mongoose';

const seasonalRateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Promotion name is required'],
      trim: true,
    },
    description: String,
    type: {
      type: String,
      required: true,
      enum: ['seasonal_discount', 'promo_code', 'early_bird', 'last_minute', 'flash_sale'],
    },

    // ── Applicability ─────────────────────────────────────────────────────────
    appliesTo: {
      type: String,
      required: true,
      enum: ['hotels', 'packages', 'vehicles', 'all'],
    },
    specificIds: [mongoose.Schema.Types.ObjectId],  // If empty, applies to all in category

    // ── Date Range ────────────────────────────────────────────────────────────
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },

    // ── Discount ──────────────────────────────────────────────────────────────
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_lkr'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: -100 },
    maxDiscountLKR: Number,   // Cap for percentage discounts
    minBookingValueLKR: { type: Number, default: 0 },

    // ── Promo Code ────────────────────────────────────────────────────────────
    promoCode: { type: String, uppercase: true, sparse: true },
    maxUsage: Number,    // Total usage limit
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },

    // ── Status ────────────────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },  // Higher = applied first when multiple match

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

seasonalRateSchema.index({ validFrom: 1, validTo: 1, isActive: 1 });
seasonalRateSchema.index({ promoCode: 1 }, { sparse: true });
seasonalRateSchema.index({ appliesTo: 1, isActive: 1 });

const SeasonalRate = mongoose.model('SeasonalRate', seasonalRateSchema);
export default SeasonalRate;
