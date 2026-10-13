/**
 * Royal Rides — Audit Log Model
 * Tracks admin and critical user actions for security and compliance.
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      // e.g., 'CREATE_VEHICLE', 'UPDATE_HOTEL', 'CONFIRM_BOOKING', 'DELETE_USER'
    },
    resourceType: String,   // Model name: 'Vehicle', 'Hotel', etc.
    resourceId: mongoose.Schema.Types.ObjectId,
    changes: mongoose.Schema.Types.Mixed,  // { before: {}, after: {} }
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
    // TTL: auto-delete audit logs after 1 year (365 days)
    // Add to deployment: db.auditlogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 })
  }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
