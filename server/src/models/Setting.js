/**
 * Royal Rides — Setting Model
 * Key-value store for admin-editable site settings.
 * Each setting has a key, value, type, and group for UI organization.
 */

import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'image'],
      default: 'string',
    },
    group: {
      type: String,
      enum: ['general', 'contact', 'social', 'seo', 'booking', 'currency', 'email', 'banner'],
      default: 'general',
    },
    label: String,       // Human-readable label for admin UI
    description: String, // Help text for admin UI
    isPublic: {
      type: Boolean,
      default: false, // If true, exposed via public API endpoint
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

settingSchema.index({ key: 1 });
settingSchema.index({ group: 1, isPublic: 1 });

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
