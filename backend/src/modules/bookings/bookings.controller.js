import { asyncHandler } from '../../utils/asyncHandler.js';

export class BookingController {
  constructor(bookingService) {
    this.bookingService = bookingService;
  }

  createBooking = asyncHandler(async (req, res, next) => {
    const result = await this.bookingService.createBooking(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
  });

  cancelBooking = asyncHandler(async (req, res, next) => {
    const result = await this.bookingService.cancelBooking(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: result, message: 'Booking cancelled successfully' });
  });

  updateBookingStatus = asyncHandler(async (req, res, next) => {
    const result = await this.bookingService.updateBookingStatus(req.params.id, req.body.status, req.user.id);
    res.status(200).json({ success: true, data: result });
  });

   getMyBookings = asyncHandler(async (req, res, next) => {
    const result = await this.bookingService.getMyBookings(req.user.id, req.user.role);
    res.status(200).json({ success: true, count: result.length, data: result });
  });

  triggerAutoCancel = asyncHandler(async (req, res, next) => {
    const hours = req.query.hours ? parseFloat(req.query.hours) : 48;
    await this.bookingService.autoCancelExpiredBookings(hours);
    res.status(200).json({ success: true, message: `Auto-cancellation check executed for bookings older than ${hours} hours.` });
  });
}
