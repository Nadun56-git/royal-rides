/**
 * Royal Rides — Tour Guide Model
 * Professional guides with language skills, ratings, and availability.
 */

import mongoose from 'mongoose';

const tourGuideSchema = new mongoose.Schema(
  {
    // ── Personal ─────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Guide name is required'],
      trim: true,
    },
    bio: { type: String, maxlength: 2000 },
    photo: String,    // Cloudinary URL
    email: String,
    phone: String,
    gender: { type: String, enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
    nationality: { type: String, default: 'Sri Lankan' },

    // ── Professional ─────────────────────────────────────────────────────────
    licenseNumber: String,
    licenseExpiry: Date,
    yearsExperience: { type: Number, default: 0 },
    specializations: [
      {
        type: String,
        enum: ['Cultural', 'Wildlife', 'Beach', 'Adventure', 'Pilgrimage', 'Birding', 'Trekking', 'History', 'Hill Country', 'Nature', 'Photography'],
      },
    ],
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
          default: 'Fluent',
        },
      },
    ],
    basedIn: String,  // City/region

    // ── Pricing (LKR per day) ─────────────────────────────────────────────────
    dailyRateLKR: {
      type: Number,
      required: [true, 'Daily rate is required'],
      min: 0,
    },
    halfDayRateLKR: { type: Number, default: 0 },

    // ── Availability ──────────────────────────────────────────────────────────
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    blockedDates: [
      {
        from: Date,
        to: Date,
        reason: String,
      },
    ],

    // ── Meta ──────────────────────────────────────────────────────────────────
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalTours: { type: Number, default: 0 },
    certifications: [String],

    // ── User Account Link (optional — guide can have login) ───────────────────
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

tourGuideSchema.index({ isAvailable: 1, isActive: 1 });
tourGuideSchema.index({ specializations: 1 });
tourGuideSchema.index({ dailyRateLKR: 1 });
tourGuideSchema.index({ name: 'text', bio: 'text' });

const TourGuide = mongoose.model('TourGuide', tourGuideSchema);
export default TourGuide;
