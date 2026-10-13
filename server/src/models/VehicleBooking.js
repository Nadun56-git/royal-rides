/**
 * Royal Rides — Vehicle Booking Model
 * Records vehicle reservations with distance-based price breakdown,
 * driver options, and full status lifecycle.
 */

import mongoose from 'mongoose';
import { generateBookingRef } from '../utils/bookingRef.js';

// ── Embedded: Price Breakdown ──────────────────────────────────────────────────
const priceBreakdownSchema = new mongoose.Schema(
  {
    baseFee: { type: Number, required: true },
    distanceKm: { type: Number, default: 0 },
    perKmRate: { type: Number, default: 0 },
    distanceCharge: { type: Number, default: 0 },
    driverFee: { type: Number, default: 0 },
    extraDays: { type: Number, default: 0 },
    dailyRateCharge: { type: Number, default: 0 },
    extras: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalLKR: { type: Number, required: true },
    currencyUsed: { type: String, enum: ['LKR', 'USD'], default: 'LKR' },
    exchangeRateUsed: { type: Number, default: 1 },
    totalInCurrency: { type: Number, required: true },
  },
  { _id: false }
);

const vehicleBookingSchema = new mongoose.Schema(
  {
    // ── Reference ─────────────────────────────────────────────────────────────
    bookingRef: {
      type: String,
      unique: true,
    },

    // ── Parties ───────────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = guest checkout
    },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },

    // ── Trip Details ──────────────────────────────────────────────────────────
    pickupLocation: {
      address: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    dropoffLocation: {
      address: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    pickupDateTime: { type: Date, required: true },
    dropoffDateTime: { type: Date, required: true },
    distanceKm: { type: Number, default: 0 },

    // ── Options ───────────────────────────────────────────────────────────────
    withDriver: { type: Boolean, default: true },
    driverLicenseInfo: {
      licenseNumber: String,
      expiryDate: Date,
      licenseImageUrl: String,
    },
    passengers: { type: Number, default: 1, min: 1 },
    additionalRequests: String,

    // ── Extras ────────────────────────────────────────────────────────────────
    extras: [
      {
        name: String,
        priceLKR: Number,
      },
    ],

    // ── Pricing ───────────────────────────────────────────────────────────────
    priceBreakdown: { type: priceBreakdownSchema, required: true },

    // ── Status Lifecycle ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
    confirmedAt: Date,
    completedAt: Date,

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: String,
    depositPaidAt: Date,
    fullyPaidAt: Date,

    // ── Admin ─────────────────────────────────────────────────────────────────
    internalNotes: String,
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emailSentAt: Date,

    // ── Review ────────────────────────────────────────────────────────────────
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
vehicleBookingSchema.index({ bookingRef: 1 });
vehicleBookingSchema.index({ user: 1, status: 1 });
vehicleBookingSchema.index({ vehicle: 1, pickupDateTime: 1, dropoffDateTime: 1 });
vehicleBookingSchema.index({ status: 1, createdAt: -1 });

// ── Pre-save: Generate booking reference ──────────────────────────────────────
vehicleBookingSchema.pre('save', function (next) {
  if (this.isNew && !this.bookingRef) {
    this.bookingRef = generateBookingRef('VH');
  }
  next();
});

// ── Virtual: Duration in days ─────────────────────────────────────────────────
vehicleBookingSchema.virtual('durationDays').get(function () {
  if (!this.pickupDateTime || !this.dropoffDateTime) return 0;
  const ms = this.dropoffDateTime - this.pickupDateTime;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
});

const VehicleBooking = mongoose.model('VehicleBooking', vehicleBookingSchema);
export default VehicleBooking;
