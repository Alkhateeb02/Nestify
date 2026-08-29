import cron from 'node-cron';
import prisma from './prisma.js';
import { NotificationService } from '../modules/notifications/notifications.service.js';
import { NotificationRepository } from '../modules/notifications/notifications.repository.js';

const notificationService = new NotificationService(new NotificationRepository());

// Helper to get exactly 2 days from now (start and end range)
function getTwoDaysRange() {
  const start = new Date();
  start.setDate(start.getDate() + 2);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setDate(end.getDate() + 2);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// 1. Payment Reminders (Runs daily at midnight)
export async function sendPaymentReminders() {
  console.log('[CRON] Payment Reminders Job is disabled in this database schema version.');
}

// 2. Stay Ends Reminders (Runs daily at midnight)
export async function sendCheckoutReminders() {
  console.log('[CRON] Stay Ends Reminders Job is disabled in this database schema version.');
}

// 3. Auto-Cancel Unpaid Daily Bookings (> 24 hours)
export async function enforceDailyBookingExpirations() {
  console.log('[CRON] Daily Booking Expiration Job is disabled in this database schema version.');
}

// 4. Overdue Payment Suspension (Status to 'suspended')
export async function enforcePaymentSuspensions() {
  console.log('[CRON] Payment Suspension Job is disabled in this database schema version.');
}

// Initialize all cron schedules
export function initCronJobs() {
  // Run daily at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Scheduled jobs skipped.');
  });

  console.log('[CRON] Background schedulers registered successfully.');
}
