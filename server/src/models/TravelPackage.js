/**
 * Royal Rides — Travel Package Model
 * Day-by-day itineraries with inclusions, guide options, and seasonal pricing.
 */

import mongoose from 'mongoose';

// ── Embedded: Itinerary Day ────────────────────────────────────────────────────
const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
    activities: [String],
    meals: {
      breakfast: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      dinner: { type: Boolean, default: false },
    },
    accommodation: String,
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    image: String,
  },
  { _id: false }
);

const travelPackageSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    slug: { type: String, unique: true, lowercase: true },
    tagline: { type: String, maxlength: 200 },
    description: { type: String, maxlength: 5000 },
    category: {
      type: String,
      required: true,
      enum: ['Cultural', 'Beach', 'Wildlife', 'Adventure', 'Honeymoon', 'Hill Country', 'Pilgrimage', 'Family'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging'],
      default: 'Easy',
    },
    durationDays: { type: Number, required: true, min: 1 },
    durationNights: { type: Number, required: true, min: 0 },

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

    // ── Destinations ──────────────────────────────────────────────────────────
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    startLocation: String,
    endLocation: String,
    mapRouteCoordinates: [
      {
        lat: Number,
        lng: Number,
      },
    ],

    // ── Itinerary ─────────────────────────────────────────────────────────────
    itinerary: [itineraryDaySchema],

    // ── Inclusions / Exclusions ───────────────────────────────────────────────
    inclusions: [String],
    exclusions: [String],
    highlights: [String],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],

    // ── Pricing (LKR per person, base) ────────────────────────────────────────
    basePricePerPersonLKR: {
      type: Number,
      required: true,
      min: 0,
    },
    minGroupSize: { type: Number, default: 1 },
    maxGroupSize: { type: Number, default: 20 },
    groupDiscountThreshold: { type: Number, default: 5 },  // persons
    groupDiscountPercent: { type: Number, default: 10 },
    soloSurchargePercent: { type: Number, default: 0 },

    // ── Guide Options ─────────────────────────────────────────────────────────
    tourGuideRequired: { type: Boolean, default: false },
    tourGuideOptional: { type: Boolean, default: true },
    availableGuides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TourGuide' }],

    // ── Status ────────────────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },

    // ── Meta ──────────────────────────────────────────────────────────────────
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    tags: [String],
    seoTitle: String,
    seoDescription: String,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
travelPackageSchema.index({ slug: 1 });
travelPackageSchema.index({ category: 1, isActive: 1 });
travelPackageSchema.index({ basePricePerPersonLKR: 1 });
travelPackageSchema.index({ isFeatured: 1, isPopular: 1 });
travelPackageSchema.index({ name: 'text', description: 'text', tagline: 'text' });

// ── Pre-save: Auto-generate slug ──────────────────────────────────────────────
travelPackageSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
      '-' + Date.now();
  }
  next();
});

const TravelPackage = mongoose.model('TravelPackage', travelPackageSchema);
export default TravelPackage;
