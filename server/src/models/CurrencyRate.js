/**
 * Royal Rides — Currency Rate Model
 * Stores and manages LKR ↔ USD exchange rates with auto-fetch support.
 */

import mongoose from 'mongoose';

const currencyRateSchema = new mongoose.Schema(
  {
    fromCurrency: { type: String, required: true, uppercase: true },
    toCurrency: { type: String, required: true, uppercase: true },
    rate: { type: Number, required: true, min: 0 },     // 1 fromCurrency = rate toCurrency
    source: {
      type: String,
      enum: ['manual', 'api_auto'],
      default: 'manual',
    },
    apiProvider: String,    // e.g., "exchangerate-api.com"
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastFetchedAt: Date,
    nextFetchAt: Date,
  },
  { timestamps: true }
);

currencyRateSchema.index({ fromCurrency: 1, toCurrency: 1 }, { unique: true });
currencyRateSchema.index({ isActive: 1 });

const CurrencyRate = mongoose.model('CurrencyRate', currencyRateSchema);
export default CurrencyRate;
