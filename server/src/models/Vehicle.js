/**
 * Royal Rides — Vehicle Model
 * Represents bookable vehicles (cars, vans, luxury units, SUVs, buses).
 * Pricing: base fee + per-km rate + optional driver fee.
 */

import mongoose from 'mongoose';

// ── Embedded: Image ────────────────────────────────────────────────────────────
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,    // Cloudinary public ID for deletion
    alt: String,
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

// ── Embedded: Spec ────────────────────────────────────────────────────────────
const vehicleSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
      maxlength: [100, 'Vehicle name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ['Car', 'Van', 'Luxury Passenger Unit', 'SUV', 'Bus', 'Tuk Tuk'],
        message: '{VALUE} is not a valid vehicle category',
      },
    },

    // ── Images ───────────────────────────────────────────────────────────────
    images: {
      type: [imageSchema],
      validate: {
        validator: (v) => v.length <= 10,
        message: 'A vehicle can have at most 10 images',
      },
    },

    // ── Specs ─────────────────────────────────────────────────────────────────
    make: { type: String, required: true },          // e.g., Toyota
    model: { type: String, required: true },         // e.g., HiAce
    year: { type: Number, min: 1990, max: 2030 },
    color: String,
    licensePlate: { type: String, uppercase: true, trim: true },
    passengerCapacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
      max: [60, 'Capacity cannot exceed 60'],
    },
    luggageCapacity: Number,   // number of large bags
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual'],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
      default: 'Petrol',
    },
    hasAC: { type: Boolean, default: true },
    hasWifi: { type: Boolean, default: false },
    hasGPS: { type: Boolean, default: false },
    hasChildSeat: { type: Boolean, default: false },
    hasSunroof: { type: Boolean, default: false },

    // ── Pricing (all in LKR) ─────────────────────────────────────────────────
    baseFee: {
      type: Number,
      required: [true, 'Base fee is required'],
      min: 0,
    },
    perKmRate: {
      type: Number,
      required: [true, 'Per-km rate is required'],
      min: 0,
    },
    dailyRate: {
      type: Number,
      required: [true, 'Daily rate is required'],
      min: 0,
    },
    driverFeePerDay: {
      type: Number,
      default: 0,
    },
    depositRequired: {
      type: Number,
      default: 0,
    },

    // ── Availability & Status ─────────────────────────────────────────────────
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    blockedDates: [
      {
        from: Date,
        to: Date,
        reason: String,
      },
    ],

    // ── Options ────────────────────────────────────────────────────────────────
    withDriverAvailable: { type: Boolean, default: true },
    selfDriveAvailable: { type: Boolean, default: true },

    // ── Meta ──────────────────────────────────────────────────────────────────
    tags: [String],
    totalBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // ── Relations ─────────────────────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
vehicleSchema.index({ category: 1, isAvailable: 1, isActive: 1 });
vehicleSchema.index({ slug: 1 });
vehicleSchema.index({ baseFee: 1, dailyRate: 1 });
vehicleSchema.index({ '$**': 'text' }); // Full-text search

// ── Virtual: Primary image ────────────────────────────────────────────────────
vehicleSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary || this.images[0] || null;
});

// ── Pre-save: Auto-generate slug ──────────────────────────────────────────────
vehicleSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
