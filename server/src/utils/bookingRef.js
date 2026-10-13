/**
 * Royal Rides — Booking Reference Generator
 * Generates human-readable, unique booking reference IDs.
 * Format: RR-{TYPE}-{YEAR}-{6-digit-zero-padded-random}
 * Example: RR-VH-2026-000123
 */

import { randomInt } from 'crypto';

/**
 * @param {'VH' | 'HT' | 'PK'} type - Booking type prefix
 * @returns {string} Booking reference ID
 */
export function generateBookingRef(type) {
  const year = new Date().getFullYear();
  const num = String(randomInt(1, 999999)).padStart(6, '0');
  return `RR-${type}-${year}-${num}`;
}
