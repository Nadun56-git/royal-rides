/**
 * Royal Rides — Package Booking Model
 * Travel package reservations with guide selection and dynamic pricing.
 */

import mongoose from 'mongoose';
import { generateBookingRef } from '../utils/bookingRef.js';

const packageBookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, unique: true },

    // ── Parties ───────────────────────────────────────────────────────────────
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestInfo: { name: String, email: String, phone: String },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TravelPackage',
      required: true,
    },
    tourGuide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourGuide',
      default: null,
    },

    // ── Trip Details ──────────────────────────────────────────────────────────
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    groupSize: { type: Number, required: true, min: 1 },
    passengers: [
      {
        name: String,
        age: Number,
        passportNumber: String,
      },
    ],

    // ── Pricing ───────────────────────────────────────────────────────────────
    priceBreakdown: {
      basePricePerPerson: Number,
      groupSize: Number,
      baseTotal: Number,
      groupDiscount: Number,
      groupDiscountPercent: Number,
      soloSurcharge: Number,
      guideFeePerDay: Number,
      guideDays: Number,
      guideFeeTotal: Number,
      seasonalAdjustment: Number,
      addOns: Number,
      subtotal: Number,
      taxRate: Number,
      taxAmount: Number,
      totalLKR: { type: Number, required: true },
      currencyUsed: { type: String, enum: ['LKR', 'USD'], default: 'LKR' },
      exchangeRateUsed: { type: Number, default: 1 },
      totalInCurrency: Number,
    },

    // ── Add-ons ───────────────────────────────────────────────────────────────
    addOns: [{ name: String, priceLKR: Number }],

    // ── Special Requests ──────────────────────────────────────────────────────
    specialRequests: String,
    dietaryRequirements: String,

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    cancelledAt: Date,
    cancellationReason: String,
    refundAmount: Number,

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: String,

    // ── Admin ─────────────────────────────────────────────────────────────────
    internalNotes: String,
    emailSentAt: Date,
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

packageBookingSchema.index({ bookingRef: 1 });
packageBookingSchema.index({ user: 1, status: 1 });
packageBookingSchema.index({ package: 1, startDate: 1 });
packageBookingSchema.index({ status: 1, createdAt: -1 });

packageBookingSchema.pre('save', function (next) {
  if (this.isNew && !this.bookingRef) {
    this.bookingRef = generateBookingRef('PK');
  }
  next();
});

const PackageBooking = mongoose.model('PackageBooking', packageBookingSchema);
export default PackageBooking;
