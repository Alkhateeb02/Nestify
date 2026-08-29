import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { BookingController } from './bookings.controller.js';
import { BookingService } from './bookings.service.js';
import { BookingRepository } from './bookings.repository.js';
import { NotificationService } from '../notifications/notifications.service.js';
import { NotificationRepository } from '../notifications/notifications.repository.js';
import { PaymentRepository } from '../payments/payments.repository.js';
import * as bookingsSchema from './bookings.schema.js';

// Dependency Injection Setup
const bookingRepository = new BookingRepository();
const notificationService = new NotificationService(new NotificationRepository());
const paymentRepository = new PaymentRepository();
const bookingService = new BookingService(bookingRepository, notificationService, paymentRepository);
const bookingController = new BookingController(bookingService);

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('student', 'admin'),
  validate(bookingsSchema.createBookingSchema),
  bookingController.createBooking
);

router.get(
  '/my-bookings',
  bookingController.getMyBookings
);

router.put(
  '/:id/cancel',
  validate(bookingsSchema.cancelBookingSchema),
  bookingController.cancelBooking
);

router.put(
  '/:id/status',
  validate(bookingsSchema.updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

router.post(
  '/trigger-auto-cancel',
  bookingController.triggerAutoCancel
);

export default router;
