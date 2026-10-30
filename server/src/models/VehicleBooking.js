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
    baseFee:          { type: Number, default: 0 },
    distanceKm:       { type: Number, default: 0 },
    perKmRate:        { type: Number, default: 0 },
    distanceCharge:   { type: Number, default: 0 },
    driverFee:        { type: Number, default: 0 },
    extraDays:        { type: Number, default: 0 },
    dailyRateCharge:  { type: Number, default: 0 },
    extras:           { type: Number, default: 0 },
    subtotal:         { type: Number, default: 0 },
    taxRate:          { type: Number, default: 0 },
    taxAmount:        { type: Number, default: 0 },
    totalLKR:         { type: Number, required: true },
    currencyUsed:     { type: String, enum: ['LKR', 'USD'], default: 'LKR' },
    exchangeRateUsed: { type: Number, default: 1 },
    totalInCurrency:  { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Embedded: Rental Period ────────────────────────────────────────────────────
const rentalPeriodSchema = new mongoose.Schema(
  {
    start:     { type: Date, required: true },
    end:       { type: Date, required: true },
    totalDays: { type: Number, default: 1 },
  },
  { _id: false }
);

// ── Embedded: Location ─────────────────────────────────────────────────────────
const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

// ── Embedded: Extras Selected ─────────────────────────────────────────────────
const extrasSelectedSchema = new mongoose.Schema(
  {
    childSeat: { type: Boolean, default: false },
    gps:       { type: Boolean, default: false },
    wifi:      { type: Boolean, default: false },
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
      default: null,
    },
    guestInfo: {
      name:  String,
      email: String,
      phone: String,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },

    // ── Trip Details ──────────────────────────────────────────────────────────
    pickupLocation:       { type: locationSchema, required: true },
    dropoffLocation:      { type: locationSchema, required: true },
    rentalPeriod:         { type: rentalPeriodSchema, required: true },
    rentalType:           { type: String, enum: ['with_driver', 'self_drive'], default: 'with_driver' },
    driverRequested:      { type: Boolean, default: true },
    passengerCount:       { type: Number, default: 1, min: 1 },
    estimatedDistanceKm:  { type: Number, default: 0 },
    extrasSelected:       { type: extrasSelectedSchema, default: () => ({}) },
    specialRequests:      String,

    // ── Pricing ───────────────────────────────────────────────────────────────
    priceBreakdown: { type: priceBreakdownSchema, required: true },

    // ── Status Lifecycle ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    cancelledAt:        Date,
    cancelledBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
    confirmedAt:        Date,
    completedAt:        Date,

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: String,

    // ── Admin ─────────────────────────────────────────────────────────────────
    internalNotes:  String,
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emailSentAt:    Date,

    // ── Review ────────────────────────────────────────────────────────────────
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },

    // ── Legacy / compat fields ────────────────────────────────────────────────
    totalBookings: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
vehicleBookingSchema.index({ bookingRef: 1 });
vehicleBookingSchema.index({ user: 1, status: 1 });
vehicleBookingSchema.index({ vehicle: 1, 'rentalPeriod.start': 1, 'rentalPeriod.end': 1 });
vehicleBookingSchema.index({ status: 1, createdAt: -1 });

// ── Pre-save: Generate booking reference ──────────────────────────────────────
vehicleBookingSchema.pre('save', function () {
  if (this.isNew && !this.bookingRef) {
    this.bookingRef = generateBookingRef('VH');
  }
});

// ── Virtual: Duration in days ─────────────────────────────────────────────────
vehicleBookingSchema.virtual('durationDays').get(function () {
  if (!this.rentalPeriod?.start || !this.rentalPeriod?.end) return 0;
  const ms = this.rentalPeriod.end - this.rentalPeriod.start;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
});

const VehicleBooking = mongoose.model('VehicleBooking', vehicleBookingSchema);
export default VehicleBooking;
