/**
 * Royal Rides — Hotel Booking Model
 * Records hotel reservations with room selection, seasonal pricing,
 * tax/service charge, and cancellation terms.
 */

import mongoose from 'mongoose';
import { generateBookingRef } from '../utils/bookingRef.js';

const hotelBookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, unique: true },

    // ── Parties ───────────────────────────────────────────────────────────────
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    room: {
      roomTypeId: mongoose.Schema.Types.ObjectId,
      roomTypeName: String,
      pricePerNightLKR: Number,
    },

    // ── Dates ─────────────────────────────────────────────────────────────────
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    rooms: { type: Number, default: 1, min: 1 },
    guests: { type: Number, default: 1, min: 1 },

    // ── Pricing (all in LKR at booking time) ──────────────────────────────────
    priceBreakdown: {
      baseNightlyRate: Number,
      nights: Number,
      rooms: Number,
      baseTotal: Number,
      seasonalDiscount: Number,      // Amount discounted
      seasonalDiscountPercent: Number,
      promotionApplied: String,      // Promotion name
      subtotal: Number,
      taxRate: Number,
      taxAmount: Number,
      serviceChargeRate: Number,
      serviceChargeAmount: Number,
      totalLKR: { type: Number, required: true },
      currencyUsed: { type: String, enum: ['LKR', 'USD'], default: 'LKR' },
      exchangeRateUsed: { type: Number, default: 1 },
      totalInCurrency: Number,
    },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
    refundAmount: Number,

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: String,

    // ── Special Requests ──────────────────────────────────────────────────────
    specialRequests: String,
    arrivalTime: String,

    // ── Admin ─────────────────────────────────────────────────────────────────
    internalNotes: String,
    emailSentAt: Date,
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
hotelBookingSchema.index({ bookingRef: 1 });
hotelBookingSchema.index({ user: 1, status: 1 });
hotelBookingSchema.index({ hotel: 1, checkIn: 1, checkOut: 1 });
hotelBookingSchema.index({ 'room.roomTypeId': 1, checkIn: 1, checkOut: 1 });
hotelBookingSchema.index({ status: 1, createdAt: -1 });

// ── Pre-save: Generate booking reference ──────────────────────────────────────
hotelBookingSchema.pre('save', function (next) {
  if (this.isNew && !this.bookingRef) {
    this.bookingRef = generateBookingRef('HT');
  }
  next();
});

const HotelBooking = mongoose.model('HotelBooking', hotelBookingSchema);
export default HotelBooking;
