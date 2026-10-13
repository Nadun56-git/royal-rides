/**
 * Royal Rides — Facility Model
 * Police stations, hospitals, sanitary facilities, and emergency contacts
 * with GeoJSON locations for geospatial queries ($near).
 */

import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['police', 'hospital', 'sanitary', 'emergency', 'pharmacy', 'atm', 'petrol'],
    },
    description: String,
    address: String,
    phone: String,
    operatingHours: String,  // e.g., "24/7" or "8am–5pm Mon–Fri"

    // ── GeoJSON Location ──────────────────────────────────────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],  // [longitude, latitude]
        required: true,
      },
    },

    // ── Association ───────────────────────────────────────────────────────────
    nearestDestination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
    },
    district: String,
    province: String,

    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ── Geospatial Index ──────────────────────────────────────────────────────────
facilitySchema.index({ location: '2dsphere' });
facilitySchema.index({ type: 1, isActive: 1 });
facilitySchema.index({ nearestDestination: 1, type: 1 });

const Facility = mongoose.model('Facility', facilitySchema);
export default Facility;
