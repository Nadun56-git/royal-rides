/**
 * Royal Rides — Contact Routes & Controller
 * POST  /api/v1/contact (Public inquiry submission)
 * GET   /api/v1/contact (Admin list)
 * PATCH /api/v1/contact/:id/status (Admin status update)
 */

import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Contact from '../models/Contact.js';
import { sendSuccess, sendCreated, sendPaginated, buildPaginationMeta } from '../utils/apiResponse.js';
import { protect, restrict } from '../middleware/authMiddleware.js';
import { sendContactConfirmation, sendContactNotification } from '../utils/mailer.js';
import logger from '../config/logger.js';

const router = express.Router();

// POST /api/v1/contact - Public contact submission
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message, inquiryType } = req.body;

    if (!name || !email || !subject || !message) {
      throw new AppError('Name, email, subject, and message are required', 400);
    }

    const contact = await Contact.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      subject,
      message,
      inquiryType: inquiryType || 'general',
      ipAddress: req.ip,
    });

    // Send emails in parallel — failures are logged but do NOT break the 201 response
    const emailPayload = {
      name,
      email: email.toLowerCase().trim(),
      phone,
      subject,
      message,
      inquiryType: inquiryType || 'general',
      contactId: contact._id.toString(),
    };

    Promise.allSettled([
      sendContactConfirmation(emailPayload),
      sendContactNotification(emailPayload),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          logger.error(`Contact email [${i === 0 ? 'confirmation' : 'notification'}] failed: ${r.reason?.message}`);
        }
      });
    });

    sendCreated(res, contact, 'Thank you! Your inquiry has been received. Our team will contact you shortly.');
  })
);

// GET /api/v1/contact - Admin list inquiries
router.get(
  '/',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [inquiries, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Contact.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);
    sendPaginated(res, inquiries, pagination);
  })
);

// PATCH /api/v1/contact/:id/status - Admin update inquiry status
router.patch(
  '/:id/status',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    const { status, replyText } = req.body;
    const inquiry = await Contact.findById(req.params.id);
    if (!inquiry) throw new AppError('Inquiry not found', 404);

    if (status) inquiry.status = status;
    if (replyText) {
      inquiry.replyText = replyText;
      inquiry.repliedAt = new Date();
      inquiry.repliedBy = req.user._id;
    }
    await inquiry.save();

    sendSuccess(res, inquiry, 'Inquiry updated successfully');
  })
);

// DELETE /api/v1/contact/:id - Admin delete inquiry
router.delete(
  '/:id',
  protect,
  restrict('admin', 'superadmin', 'manager'),
  asyncHandler(async (req, res) => {
    const inquiry = await Contact.findByIdAndDelete(req.params.id);
    if (!inquiry) throw new AppError('Inquiry not found', 404);

    sendSuccess(res, null, 'Inquiry deleted successfully');
  })
);

export default router;
