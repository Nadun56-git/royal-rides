/**
 * Royal Rides — Wishlist Model
 * Stores user-saved items (vehicles, hotels, packages, destinations).
 */

import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,  // One wishlist per user
    },
    items: [
      {
        itemType: {
          type: String,
          enum: ['Vehicle', 'Hotel', 'TravelPackage', 'Destination'],
          required: true,
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: 'items.itemType',
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.itemType': 1, 'items.itemId': 1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
