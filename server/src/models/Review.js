/**
 * Royal Rides — Review Model
 * Verified reviews (only for completed bookings) with ratings.
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // ── Reviewer ──────────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Subject (polymorphic reference) ───────────────────────────────────────
    subjectType: {
      type: String,
      required: true,
      enum: ['Vehicle', 'Hotel', 'TravelPackage', 'TourGuide', 'Destination'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'subjectType',
    },

    // ── Booking verification ──────────────────────────────────────────────────
    bookingType: {
      type: String,
      enum: ['VehicleBooking', 'HotelBooking', 'PackageBooking'],
    },
    bookingId: { type: mongoose.Schema.Types.ObjectId },
    isVerified: { type: Boolean, default: false },  // True = confirmed booking

    // ── Content ────────────────────────────────────────────────────────────────
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: { type: String, maxlength: 100 },
    body: { type: String, maxlength: 2000 },
    images: [{ url: String, publicId: String }],

    // ── Aspect Ratings (optional sub-scores) ──────────────────────────────────
    aspects: {
      cleanliness: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
    },

    // ── Moderation ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
    },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date,
    moderationNote: String,

    // ── Helpful Votes ─────────────────────────────────────────────────────────
    helpfulVotes: { type: Number, default: 0 },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Response from owner ───────────────────────────────────────────────────
    ownerResponse: {
      text: String,
      respondedAt: Date,
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// ── Compound index prevents duplicate reviews from same user on same subject ──
reviewSchema.index({ user: 1, subjectType: 1, subjectId: 1 }, { unique: true });
reviewSchema.index({ subjectType: 1, subjectId: 1, status: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// ── Post-save: Update subject's averageRating ─────────────────────────────────
reviewSchema.post('save', async function () {
  await updateSubjectRating(this.subjectType, this.subjectId);
});

reviewSchema.post('remove', async function () {
  await updateSubjectRating(this.subjectType, this.subjectId);
});

async function updateSubjectRating(subjectType, subjectId) {
  const Model = mongoose.model(subjectType);
  const stats = await mongoose.model('Review').aggregate([
    {
      $match: {
        subjectType,
        subjectId,
        status: 'approved',
      },
    },
    {
      $group: {
        _id: '$subjectId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Model.findByIdAndUpdate(subjectId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await Model.findByIdAndUpdate(subjectId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
}

const Review = mongoose.model('Review', reviewSchema);
export default Review;
