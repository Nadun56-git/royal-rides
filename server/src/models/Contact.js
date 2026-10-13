/**
 * Royal Rides — Contact / Inquiry Model
 * Stores messages from the contact form.
 */

import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 3000 },
    inquiryType: {
      type: String,
      enum: ['general', 'vehicle_booking', 'hotel_booking', 'package', 'complaint', 'feedback', 'partnership'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'closed'],
      default: 'new',
    },
    ipAddress: String,
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repliedAt: Date,
    replyText: String,
  },
  { timestamps: true }
);

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
