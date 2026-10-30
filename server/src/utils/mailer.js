/**
 * Royal Rides — Nodemailer Email Utility
 * Supports Gmail SMTP via App Password.
 *
 * Exports:
 *   sendMail(options)             – low-level send
 *   sendContactConfirmation(...)  – user confirmation email
 *   sendContactNotification(...)  – admin notification email
 */

import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

// ─── Transporter ─────────────────────────────────────────────────────────────

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: parseInt(process.env.SMTP_PORT || '465', 10) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_FROM,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
}

// ─── Low-level send ───────────────────────────────────────────────────────────

export async function sendMail({ to, subject, html, text }) {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Royal Rides'}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`📧 Email sent to ${to} — MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`❌ Email failed to ${to}: ${err.message}`);
    throw err;
  }
}

// ─── Shared HTML wrapper ──────────────────────────────────────────────────────

function emailWrapper(innerHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Royal Rides</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f1eb; font-family: 'Georgia', serif; }
    .wrap { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(10,31,68,0.10); }
    .header { background: linear-gradient(135deg, #0a1f44 0%, #1a3a6e 100%); padding: 36px 40px 28px; text-align: center; }
    .header h1 { margin: 0; color: #c9a84c; font-size: 26px; letter-spacing: 2px; text-transform: uppercase; }
    .header p  { margin: 6px 0 0; color: #d4c4a0; font-size: 12px; letter-spacing: 1px; }
    .body { padding: 36px 40px; color: #1a1a2e; }
    .body h2 { color: #0a1f44; font-size: 20px; margin: 0 0 12px; }
    .body p  { font-size: 14px; line-height: 1.8; color: #444; margin: 0 0 16px; }
    .detail-box { background: #f9f6f0; border-left: 4px solid #c9a84c; border-radius: 8px; padding: 20px 24px; margin: 20px 0; }
    .detail-box table { width: 100%; border-collapse: collapse; }
    .detail-box td { padding: 6px 0; font-size: 13px; vertical-align: top; }
    .detail-box td:first-child { color: #888; width: 130px; font-style: italic; }
    .detail-box td:last-child  { color: #0a1f44; font-weight: bold; }
    .footer { background: #0a1f44; padding: 24px 40px; text-align: center; }
    .footer p { margin: 0; color: #8899bb; font-size: 11px; line-height: 1.6; }
    .footer a { color: #c9a84c; text-decoration: none; }
    .badge { display: inline-block; background: #c9a84c; color: #0a1f44; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; border-radius: 20px; padding: 4px 14px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>Royal Rides</h1>
      <p>Premium Private Transport &amp; Concierge, Sri Lanka</p>
    </div>
    <div class="body">
      ${innerHtml}
    </div>
    <div class="footer">
      <p>
        Royal Rides &bull; No. 45, Galle Face Terrace, Colombo 03, Sri Lanka<br/>
        Hotline: <a href="tel:+94718282758">+94 71 828 2758</a> &bull;
        <a href="mailto:nadunekanayake56@gmail.com">nadunekanayake56@gmail.com</a>
      </p>
      <p style="margin-top:8px; color:#556;">&copy; ${new Date().getFullYear()} Royal Rides. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── User confirmation email ──────────────────────────────────────────────────

/**
 * Send a "we received your inquiry" confirmation to the customer.
 */
export async function sendContactConfirmation({ name, email, subject, inquiryType, message }) {
  const typeLabel = {
    general: 'General Travel Inquiry',
    vehicle_booking: 'Custom Fleet / Chauffeur Hire',
    hotel_booking: 'Boutique Hotel / Villa Reservation',
    package: 'Bespoke Multi-Day Island Circuit',
    partnership: 'Corporate / VIP Diplomatic Transport',
  }[inquiryType] || inquiryType;

  const html = emailWrapper(`
    <span class="badge">Inquiry Received</span>
    <h2>Thank you, ${name}!</h2>
    <p>
      We have received your inquiry and our Colombo operations team will
      review it and get back to you within <strong>2 hours</strong>.
    </p>

    <div class="detail-box">
      <table>
        <tr><td>Subject:</td><td>${subject}</td></tr>
        <tr><td>Type:</td><td>${typeLabel}</td></tr>
        <tr><td>Message:</td><td>${message}</td></tr>
      </table>
    </div>

    <p>
      If your matter is urgent, please call our 24/7 hotline at
      <strong>+94 71 828 2758</strong> or WhatsApp us directly.
    </p>
    <p style="color:#888; font-size:12px;">
      Please do not reply to this email. Use our contact channels above.
    </p>
  `);

  return sendMail({
    to: email,
    subject: `Royal Rides — We received your inquiry: "${subject}"`,
    html,
    text: `Hi ${name},\n\nThank you for contacting Royal Rides!\n\nWe have received your inquiry (${subject}) and will respond within 2 hours.\n\nFor urgent matters call: +94 71 828 2758\n\nRoyal Rides Team`,
  });
}

// ─── Admin notification email ─────────────────────────────────────────────────

/**
 * Send a new-inquiry notification to the business admin.
 */
export async function sendContactNotification({ name, email, phone, subject, inquiryType, message, contactId }) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM;

  const typeLabel = {
    general: 'General Travel Inquiry',
    vehicle_booking: 'Custom Fleet / Chauffeur Hire',
    hotel_booking: 'Boutique Hotel / Villa Reservation',
    package: 'Bespoke Multi-Day Island Circuit',
    partnership: 'Corporate / VIP Diplomatic Transport',
  }[inquiryType] || inquiryType;

  const html = emailWrapper(`
    <span class="badge">New Inquiry Alert</span>
    <h2>New Contact Form Submission</h2>
    <p>A visitor just submitted a new inquiry through the Royal Rides website.</p>

    <div class="detail-box">
      <table>
        <tr><td>Name:</td><td>${name}</td></tr>
        <tr><td>Email:</td><td><a href="mailto:${email}" style="color:#0a1f44;">${email}</a></td></tr>
        <tr><td>Phone:</td><td>${phone || '—'}</td></tr>
        <tr><td>Subject:</td><td>${subject}</td></tr>
        <tr><td>Type:</td><td>${typeLabel}</td></tr>
        <tr><td>Message:</td><td>${message}</td></tr>
        <tr><td>DB ID:</td><td style="font-size:11px; word-break:break-all;">${contactId}</td></tr>
        <tr><td>Received:</td><td>${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })} (IST)</td></tr>
      </table>
    </div>

    <p>
      Reply directly to the customer at <a href="mailto:${email}" style="color:#0a1f44;">${email}</a>
      or call them at <strong>${phone || 'N/A'}</strong>.
    </p>
  `);

  return sendMail({
    to: adminEmail,
    subject: `[Royal Rides] New Inquiry from ${name}: "${subject}"`,
    html,
    text: `NEW CONTACT INQUIRY\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nType: ${typeLabel}\nSubject: ${subject}\n\nMessage:\n${message}\n\nReceived: ${new Date().toISOString()}`,
  });
}

// ─── VEHICLE BOOKING emails ───────────────────────────────────────────────────

/**
 * Confirmation to guest after a vehicle booking.
 */
export async function sendVehicleBookingConfirmation({
  name, email, phone, bookingRef,
  vehicleName, pickupLocation, dropoffLocation,
  startDate, endDate, totalDays, totalLKR, rentalType,
}) {
  const html = emailWrapper(`
    <span class="badge">Booking Confirmed</span>
    <h2>Your Vehicle is Reserved, ${name}!</h2>
    <p>Thank you for booking with Royal Rides. Your chauffeur details will be sent to you 24 hours before pickup.</p>

    <div class="detail-box">
      <table>
        <tr><td>Reference:</td><td style="font-family:monospace;">${bookingRef}</td></tr>
        <tr><td>Vehicle:</td><td>${vehicleName}</td></tr>
        <tr><td>Service:</td><td>${rentalType === 'with_driver' ? 'With Chauffeur Driver' : 'Self-Drive'}</td></tr>
        <tr><td>Pickup:</td><td>${pickupLocation}</td></tr>
        <tr><td>Drop-off:</td><td>${dropoffLocation}</td></tr>
        <tr><td>Start Date:</td><td>${new Date(startDate).toDateString()}</td></tr>
        <tr><td>Return Date:</td><td>${new Date(endDate).toDateString()}</td></tr>
        <tr><td>Duration:</td><td>${totalDays} Day${totalDays !== 1 ? 's' : ''}</td></tr>
        <tr><td>Total Amount:</td><td style="font-size:16px; font-weight:bold;">LKR ${Number(totalLKR).toLocaleString()}</td></tr>
      </table>
    </div>

    <p>Free cancellation up to 48 hours prior to pickup. For urgent changes call <strong>+94 71 828 2758</strong>.</p>
  `);

  return sendMail({
    to: email,
    subject: `Royal Rides — Vehicle Booking Confirmed [${bookingRef}]`,
    html,
    text: `Hi ${name},\n\nYour vehicle booking is confirmed!\n\nRef: ${bookingRef}\nVehicle: ${vehicleName}\nPickup: ${pickupLocation}\nDrop-off: ${dropoffLocation}\nDates: ${new Date(startDate).toDateString()} → ${new Date(endDate).toDateString()}\nTotal: LKR ${Number(totalLKR).toLocaleString()}\n\nRoyal Rides | +94 71 828 2758`,
  });
}

/**
 * Admin alert for a new vehicle booking.
 */
export async function sendVehicleBookingNotification({
  name, email, phone, bookingRef,
  vehicleName, pickupLocation, dropoffLocation,
  startDate, endDate, totalDays, totalLKR, rentalType, bookingId,
}) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM;
  const html = emailWrapper(`
    <span class="badge">New Vehicle Booking</span>
    <h2>New Vehicle Reservation Received</h2>

    <div class="detail-box">
      <table>
        <tr><td>Reference:</td><td style="font-family:monospace;">${bookingRef}</td></tr>
        <tr><td>Guest Name:</td><td>${name}</td></tr>
        <tr><td>Email:</td><td><a href="mailto:${email}" style="color:#0a1f44;">${email}</a></td></tr>
        <tr><td>Phone:</td><td>${phone || '—'}</td></tr>
        <tr><td>Vehicle:</td><td>${vehicleName}</td></tr>
        <tr><td>Service:</td><td>${rentalType === 'with_driver' ? 'With Chauffeur' : 'Self-Drive'}</td></tr>
        <tr><td>Pickup:</td><td>${pickupLocation}</td></tr>
        <tr><td>Drop-off:</td><td>${dropoffLocation}</td></tr>
        <tr><td>Dates:</td><td>${new Date(startDate).toDateString()} → ${new Date(endDate).toDateString()} (${totalDays} days)</td></tr>
        <tr><td>Total:</td><td style="font-size:16px; font-weight:bold;">LKR ${Number(totalLKR).toLocaleString()}</td></tr>
        <tr><td>DB ID:</td><td style="font-size:11px;">${bookingId}</td></tr>
        <tr><td>Received:</td><td>${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })} (IST)</td></tr>
      </table>
    </div>
  `);

  return sendMail({
    to: adminEmail,
    subject: `[Royal Rides] New Vehicle Booking ${bookingRef} — ${name}`,
    html,
    text: `NEW VEHICLE BOOKING\n\nRef: ${bookingRef}\nGuest: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nVehicle: ${vehicleName}\nPickup: ${pickupLocation}\nDrop-off: ${dropoffLocation}\nDates: ${new Date(startDate).toDateString()} → ${new Date(endDate).toDateString()}\nTotal: LKR ${Number(totalLKR).toLocaleString()}`,
  });
}

// ─── HOTEL BOOKING emails ─────────────────────────────────────────────────────

/**
 * Confirmation to guest after a hotel booking.
 */
export async function sendHotelBookingConfirmation({
  name, email, phone, bookingRef,
  hotelName, hotelCity, roomTypeName, checkIn, checkOut,
  nights, rooms, guests, totalLKR,
}) {
  const html = emailWrapper(`
    <span class="badge">Stay Confirmed</span>
    <h2>Your Hotel Stay is Reserved, ${name}!</h2>
    <p>Thank you for choosing Royal Rides for your accommodation. We look forward to welcoming you.</p>

    <div class="detail-box">
      <table>
        <tr><td>Reference:</td><td style="font-family:monospace;">${bookingRef}</td></tr>
        <tr><td>Hotel:</td><td>${hotelName}</td></tr>
        <tr><td>Location:</td><td>${hotelCity}, Sri Lanka</td></tr>
        <tr><td>Room Type:</td><td>${roomTypeName}</td></tr>
        <tr><td>Check-In:</td><td>${new Date(checkIn).toDateString()}</td></tr>
        <tr><td>Check-Out:</td><td>${new Date(checkOut).toDateString()}</td></tr>
        <tr><td>Duration:</td><td>${nights} Night${nights !== 1 ? 's' : ''}</td></tr>
        <tr><td>Rooms / Guests:</td><td>${rooms} Room${rooms !== 1 ? 's' : ''} · ${guests} Guest${guests !== 1 ? 's' : ''}</td></tr>
        <tr><td>Total (Taxes Incl.):</td><td style="font-size:16px; font-weight:bold;">LKR ${Number(totalLKR).toLocaleString()}</td></tr>
      </table>
    </div>

    <p>For modifications or special requests call <strong>+94 71 828 2758</strong> or reply to our team.</p>
  `);

  return sendMail({
    to: email,
    subject: `Royal Rides — Hotel Booking Confirmed [${bookingRef}]`,
    html,
    text: `Hi ${name},\n\nYour hotel booking is confirmed!\n\nRef: ${bookingRef}\nHotel: ${hotelName}, ${hotelCity}\nRoom: ${roomTypeName}\nCheck-In: ${new Date(checkIn).toDateString()}\nCheck-Out: ${new Date(checkOut).toDateString()}\nNights: ${nights}\nTotal: LKR ${Number(totalLKR).toLocaleString()}\n\nRoyal Rides | +94 71 828 2758`,
  });
}

/**
 * Admin alert for a new hotel booking.
 */
export async function sendHotelBookingNotification({
  name, email, phone, bookingRef,
  hotelName, hotelCity, roomTypeName, checkIn, checkOut,
  nights, rooms, guests, totalLKR, bookingId,
}) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM;
  const html = emailWrapper(`
    <span class="badge">New Hotel Booking</span>
    <h2>New Hotel Reservation Received</h2>

    <div class="detail-box">
      <table>
        <tr><td>Reference:</td><td style="font-family:monospace;">${bookingRef}</td></tr>
        <tr><td>Guest Name:</td><td>${name}</td></tr>
        <tr><td>Email:</td><td><a href="mailto:${email}" style="color:#0a1f44;">${email}</a></td></tr>
        <tr><td>Phone:</td><td>${phone || '—'}</td></tr>
        <tr><td>Hotel:</td><td>${hotelName}, ${hotelCity}</td></tr>
        <tr><td>Room:</td><td>${roomTypeName}</td></tr>
        <tr><td>Check-In:</td><td>${new Date(checkIn).toDateString()}</td></tr>
        <tr><td>Check-Out:</td><td>${new Date(checkOut).toDateString()}</td></tr>
        <tr><td>Duration:</td><td>${nights} nights · ${rooms} room${rooms !== 1 ? 's' : ''} · ${guests} guest${guests !== 1 ? 's' : ''}</td></tr>
        <tr><td>Total:</td><td style="font-size:16px; font-weight:bold;">LKR ${Number(totalLKR).toLocaleString()}</td></tr>
        <tr><td>DB ID:</td><td style="font-size:11px;">${bookingId}</td></tr>
        <tr><td>Received:</td><td>${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })} (IST)</td></tr>
      </table>
    </div>
  `);

  return sendMail({
    to: adminEmail,
    subject: `[Royal Rides] New Hotel Booking ${bookingRef} — ${name} @ ${hotelName}`,
    html,
    text: `NEW HOTEL BOOKING\n\nRef: ${bookingRef}\nGuest: ${name}\nEmail: ${email}\nHotel: ${hotelName}, ${hotelCity}\nRoom: ${roomTypeName}\nDates: ${new Date(checkIn).toDateString()} → ${new Date(checkOut).toDateString()}\nTotal: LKR ${Number(totalLKR).toLocaleString()}`,
  });
}

// ─── PACKAGE BOOKING emails ───────────────────────────────────────────────────

/**
 * Confirmation to guest after a package tour booking.
 */
export async function sendPackageBookingConfirmation({
  name, email, phone, bookingRef,
  packageName, durationDays, durationNights, startDate, endDate,
  groupSize, totalLKR, hasGuide,
}) {
  const html = emailWrapper(`
    <span class="badge">Tour Confirmed</span>
    <h2>Your Sri Lanka Tour is Confirmed, ${name}!</h2>
    <p>Your bespoke island circuit has been secured. Our team will send a full day-by-day itinerary within 24 hours.</p>

    <div class="detail-box">
      <table>
        <tr><td>Reference:</td><td style="font-family:monospace;">${bookingRef}</td></tr>
        <tr><td>Package:</td><td>${packageName}</td></tr>
        <tr><td>Duration:</td><td>${durationDays} Days / ${durationNights || durationDays - 1} Nights</td></tr>
        <tr><td>Departure:</td><td>${new Date(startDate).toDateString()}</td></tr>
        <tr><td>Return:</td><td>${new Date(endDate).toDateString()}</td></tr>
        <tr><td>Travelers:</td><td>${groupSize} Person${groupSize !== 1 ? 's' : ''}</td></tr>
        <tr><td>Tour Guide:</td><td>${hasGuide ? 'Licensed National Guide Allocated' : 'Self-Guided'}</td></tr>
        <tr><td>Total (All In):</td><td style="font-size:16px; font-weight:bold;">LKR ${Number(totalLKR).toLocaleString()}</td></tr>
      </table>
    </div>

    <p>Questions? Call our 24/7 concierge at <strong>+94 71 828 2758</strong>.</p>
  `);

  return sendMail({
    to: email,
    subject: `Royal Rides — Tour Package Confirmed [${bookingRef}]`,
    html,
    text: `Hi ${name},\n\nYour tour package is confirmed!\n\nRef: ${bookingRef}\nPackage: ${packageName}\nDeparture: ${new Date(startDate).toDateString()}\nGroup Size: ${groupSize}\nTotal: LKR ${Number(totalLKR).toLocaleString()}\n\nRoyal Rides | +94 71 828 2758`,
  });
}

/**
 * Admin alert for a new package booking.
 */
export async function sendPackageBookingNotification({
  name, email, phone, bookingRef,
  packageName, durationDays, startDate, endDate,
  groupSize, totalLKR, hasGuide, bookingId,
}) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM;
  const html = emailWrapper(`
    <span class="badge">New Package Booking</span>
    <h2>New Tour Package Reservation</h2>

    <div class="detail-box">
      <table>
        <tr><td>Reference:</td><td style="font-family:monospace;">${bookingRef}</td></tr>
        <tr><td>Guest Name:</td><td>${name}</td></tr>
        <tr><td>Email:</td><td><a href="mailto:${email}" style="color:#0a1f44;">${email}</a></td></tr>
        <tr><td>Phone:</td><td>${phone || '—'}</td></tr>
        <tr><td>Package:</td><td>${packageName}</td></tr>
        <tr><td>Duration:</td><td>${durationDays} days</td></tr>
        <tr><td>Departure:</td><td>${new Date(startDate).toDateString()}</td></tr>
        <tr><td>Return:</td><td>${new Date(endDate).toDateString()}</td></tr>
        <tr><td>Travelers:</td><td>${groupSize}</td></tr>
        <tr><td>Guide:</td><td>${hasGuide ? 'Yes — guide allocated' : 'No guide'}</td></tr>
        <tr><td>Total:</td><td style="font-size:16px; font-weight:bold;">LKR ${Number(totalLKR).toLocaleString()}</td></tr>
        <tr><td>DB ID:</td><td style="font-size:11px;">${bookingId}</td></tr>
        <tr><td>Received:</td><td>${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })} (IST)</td></tr>
      </table>
    </div>
  `);

  return sendMail({
    to: adminEmail,
    subject: `[Royal Rides] New Package Booking ${bookingRef} — ${name} | ${packageName}`,
    html,
    text: `NEW PACKAGE BOOKING\n\nRef: ${bookingRef}\nGuest: ${name}\nEmail: ${email}\nPackage: ${packageName}\nDeparture: ${new Date(startDate).toDateString()}\nGroup: ${groupSize}\nTotal: LKR ${Number(totalLKR).toLocaleString()}`,
  });
}
