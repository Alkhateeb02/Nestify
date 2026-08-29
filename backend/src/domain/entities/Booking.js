export class Booking {
  static STATUS = {
    PENDING_APPROVAL: 'pending_approval',
    PENDING_PAYMENT: 'pending_payment',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended'
  };

  constructor({ bookingID, bookingDate, checkInDate, checkoutDate, rentalType, status }) {
    this.bookingID = bookingID;
    this.bookingDate = bookingDate || new Date();
    this.checkInDate = new Date(checkInDate);
    this.checkoutDate = checkoutDate ? new Date(checkoutDate) : null;
    this.rentalType = rentalType || 'monthly';
    this.status = status || Booking.STATUS.PENDING_APPROVAL;
  }

  // Activity Diagram 4.0.27: Accept Booking?
  approve() {
    if (this.status !== Booking.STATUS.PENDING_APPROVAL) {
      throw new Error('Only pending requests can be approved');
    }
    this.status = Booking.STATUS.PENDING_PAYMENT;
  }

  reject() {
    this.status = Booking.STATUS.REJECTED;
  }

  confirmPayment() {
    this.status = Booking.STATUS.CONFIRMED;
  }

  // Sequence Diagram 4.0.12: Cancellation Policy check
  canCancel() {
    const now = new Date();
    const checkIn = new Date(this.checkInDate);
    const diffHours = (checkIn - now) / (1000 * 60 * 60);
    
    // Policy: Cannot cancel if less than 24 hours before check-in
    return diffHours >= 24 && this.status !== Booking.STATUS.CANCELLED;
  }

  cancel() {
    if (!this.canCancel()) {
      throw new Error('Cancellation policy violated: must cancel at least 24h before check-in');
    }
    this.status = Booking.STATUS.CANCELLED;
  }
}

