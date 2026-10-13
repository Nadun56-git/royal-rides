/**
 * Royal Rides — Destination Model
 * Sri Lankan tourism destinations with geospatial support.
 */

import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
      unique: true,
    },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, maxlength: 5000 },
    shortDescription: { type: String, maxlength: 500 },

    // ── Location ──────────────────────────────────────────────────────────────
    province: {
      type: String,
      enum: [
        'Western', 'Central', 'Southern', 'Northern', 'Eastern',
        'North Western', 'North Central', 'Uva', 'Sabaragamuwa',
      ],
    },
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
    address: String,

    // ── Media ─────────────────────────────────────────────────────────────────
    images: [
      {
        url: String,
        publicId: String,
        alt: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    coverImage: String,
    youtubeVideoId: String,  // e.g., "dQw4w9WgXcQ"

    // ── Tourism Info ──────────────────────────────────────────────────────────
    category: [
      {
        type: String,
        enum: ['Beach', 'Cultural', 'Wildlife', 'Adventure', 'Pilgrimage', 'Hill Country', 'City', 'Waterfall', 'Ruins'],
      },
    ],
    bestTimeToVisit: String,
    entryFee: {
      foreignerLKR: { type: Number, default: 0 },
      localLKR: { type: Number, default: 0 },
    },
    highlights: [String],
    thingsToDo: [String],

    // ── Emergency & Nearby ────────────────────────────────────────────────────
    emergencyNumbers: {
      police: { type: String, default: '119' },
      ambulance: { type: String, default: '1990' },
      touristPolice: { type: String, default: '1912' },
      fire: { type: String, default: '110' },
      localPolice: String,
    },

    // ── Status & Meta ─────────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    visitCount: { type: Number, default: 0 },
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

// ── Geospatial Index ──────────────────────────────────────────────────────────
destinationSchema.index({ location: '2dsphere' });
destinationSchema.index({ slug: 1 });
destinationSchema.index({ isActive: 1, isFeatured: -1 });
destinationSchema.index({ name: 'text', description: 'text' });

destinationSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
