/**
 * Royal Rides — Hotel Model
 * Represents accommodations with room types, amenities, and policies.
 */

import mongoose from 'mongoose';

// ── Embedded: Room Type ────────────────────────────────────────────────────────
const roomTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },             // e.g., "Deluxe Sea View"
    description: String,
    category: {
      type: String,
      enum: ['Standard', 'Deluxe', 'Superior', 'Suite', 'Villa', 'Penthouse'],
      default: 'Standard',
    },
    maxGuests: { type: Number, required: true, min: 1 },
    bedType: {
      type: String,
      enum: ['Single', 'Twin', 'Double', 'King', 'Queen', 'Triple'],
      default: 'Double',
    },
    totalRooms: { type: Number, required: true, min: 1 },
    availableRooms: { type: Number, required: true, min: 0 },
    pricePerNightLKR: { type: Number, required: true, min: 0 },
    images: [
      {
        url: String,
        publicId: String,
        alt: String,
      },
    ],
    amenities: [String],
    hasBalcony: { type: Boolean, default: false },
    hasOceanView: { type: Boolean, default: false },
    hasMountainView: { type: Boolean, default: false },
    size: Number,  // in m²
    isActive: { type: Boolean, default: true },
    blockedDates: [
      {
        from: Date,
        to: Date,
        reason: String,
      },
    ],
  },
  { _id: true, timestamps: true }
);

// ── Embedded: Cancellation Policy ─────────────────────────────────────────────
const cancellationPolicySchema = new mongoose.Schema(
  {
    freeCancellationDays: { type: Number, default: 3 }, // days before check-in
    partialRefundDays: { type: Number, default: 1 },
    partialRefundPercent: { type: Number, default: 50 },
    description: String,
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, maxlength: 3000 },
    shortDescription: { type: String, maxlength: 300 },
    starRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // ── Location ──────────────────────────────────────────────────────────────
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // ── Images ───────────────────────────────────────────────────────────────
    images: [
      {
        url: String,
        publicId: String,
        alt: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    coverImage: String,

    // ── Rooms ─────────────────────────────────────────────────────────────────
    rooms: [roomTypeSchema],

    // ── Amenities ─────────────────────────────────────────────────────────────
    amenities: [
      {
        type: String,
        enum: [
          'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking',
          'Airport Shuttle', 'Room Service', 'Laundry', 'Conference Room',
          'Kids Club', 'Beach Access', 'Yoga', 'Bicycle Rental', 'Pet Friendly',
        ],
      },
    ],
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '12:00' },

    // ── Policies ──────────────────────────────────────────────────────────────
    cancellationPolicy: { type: cancellationPolicySchema, default: {} },
    taxRate: { type: Number, default: 10 },      // percentage
    serviceCharge: { type: Number, default: 10 }, // percentage

    // ── Status ────────────────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // ── Meta ──────────────────────────────────────────────────────────────────
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    website: String,
    phone: String,
    email: String,
    tags: [String],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Geospatial Index ──────────────────────────────────────────────────────────
hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ slug: 1 });
hotelSchema.index({ destination: 1, isActive: 1 });
hotelSchema.index({ starRating: 1, averageRating: -1 });
hotelSchema.index({ name: 'text', description: 'text', city: 'text' });

// ── Pre-save: Auto-generate slug ──────────────────────────────────────────────
hotelSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
      '-' + Date.now();
  }
  next();
});

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
