import prisma from '../../config/prisma.js';
import { Booking } from '../../domain/entities/Booking.js';

export class BookingRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async createBooking(bookingData) {
    const { studentId, propertyId, unitId, checkinDate, checkoutDate, rentalType } = bookingData;
    
    // Fetch a unit if propertyId is provided but no unitId
    let targetUnitId = unitId;
    if (!targetUnitId && propertyId) {
      const unit = await this.prisma.unit.findFirst({
        where: { property_id: BigInt(propertyId) }
      });
      if (unit) targetUnitId = unit.unit_id;
    }

    if (!targetUnitId) throw new Error('Unit ID is required for booking');

    const booking = await this.prisma.booking.create({
      data: {
        student_id: BigInt(studentId),
        unit_id: BigInt(targetUnitId),
        checkin_date: new Date(checkinDate),
        checkout_date: checkoutDate ? new Date(checkoutDate) : null,
        status: 'Pending', // Step: Receive Booking Request (Diagram 4.0.27)
        rental_type: rentalType || 'monthly'
      }
    });

    return this._mapToDomain(booking);
  }

  async updateBookingStatus(id, status) {
    // Step: Accept Booking? Yes/No (Diagram 4.0.27)
    let dbStatus = status;
    if (status === 'confirmed' || status === 'approved' || status === 'Approved') {
      dbStatus = 'Approved';
    } else if (status === 'rejected' || status === 'Rejected') {
      dbStatus = 'Rejected';
    } else if (status === 'pending' || status === 'Pending') {
      dbStatus = 'Pending';
    }
    const updated = await this.prisma.booking.update({
      where: { booking_id: BigInt(id) },
      data: { status: dbStatus }
    });
    return this._mapToDomain(updated);
  }

  async cancelBooking(id) {

    const updated = await this.prisma.booking.update({
      where: { booking_id: BigInt(id) },
      data: { status: 'cancelled' }
    });
    return this._mapToDomain(updated);
  }

  async getBookingById(id) {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_id: BigInt(id) },
      include: {
        unit: { include: { property: { include: { landlord: { include: { user: true } } } } } },
        student: { include: { user: true } },
        payment: true
      }
    });
    if (!booking) return null;
    return this._mapToDomain(booking);
  }

  async getBookingsByUser(userId, role) {
    let bookings = [];
    let studentReviews = [];
    if (role === 'student') {
      bookings = await this.prisma.booking.findMany({
        where: { student_id: BigInt(userId) },
        include: { 
          unit: { include: { property: { include: { landlord: { include: { user: true } } } } } },
          student: { include: { user: true } },
          payment: true
        }
      });
      studentReviews = await this.prisma.review.findMany({
        where: { student_id: BigInt(userId) }
      });
    } else if (role === 'landlord') {
      bookings = await this.prisma.booking.findMany({
        where: { unit: { property: { landlord_id: BigInt(userId) } } },
        include: { 
          unit: { include: { property: { include: { landlord: { include: { user: true } } } } } },
          student: { include: { user: true } },
          payment: true
        }
      });
    } else {
      bookings = await this.prisma.booking.findMany({
        include: { 
          unit: { include: { property: { include: { landlord: { include: { user: true } } } } } },
          student: { include: { user: true } },
          payment: true
        }
      });
    }

    return bookings.map(b => this._mapToDomain(b, studentReviews));
  }

  _mapToDomain(record, studentReviews = []) {
    const booking = new Booking({
      bookingID: record.booking_id.toString(),
      bookingDate: record.booking_date,
      checkInDate: record.checkin_date,
      checkoutDate: record.checkout_date,
      rentalType: record.unit?.rental_type || 'monthly',
      status: record.status
    });
    // Set standard properties for backward compatibility
    booking.id = booking.bookingID;
    booking.studentId = record.student_id ? record.student_id.toString() : null;
    booking.unitId = record.unit_id ? record.unit_id.toString() : null;

    // Check if student has already rated this unit
    const hasRated = studentReviews.some(
      r => r.unit_id && record.unit_id && r.unit_id.toString() === record.unit_id.toString()
    );
    booking.hasRated = hasRated;

    if (record.student) {
      booking.student = {
        student_id: record.student.student_id.toString(),
        university_name: record.student.university_name,
        major: record.student.major,
        gender: record.student.gender,
        academic_year: record.student.academic_year,
        user: record.student.user ? {
          user_id: record.student.user.user_id.toString(),
          name: record.student.user.name,
          email: record.student.user.email,
          phone_number: record.student.user.phone_number,
          role: record.student.user.role,
        } : null
      };
    }

    if (record.unit) {
      booking.unit = {
        unit_id: record.unit.unit_id.toString(),
        property_id: record.unit.property_id.toString(),
        type: record.unit.type,
        price: parseFloat(record.unit.price.toString()),
        rental_type: record.unit.rental_type,
        availability_status: record.unit.availability_status,
        property: record.unit.property ? {
          property_id: record.unit.property.property_id.toString(),
          landlord_id: record.unit.property.landlord_id.toString(),
          title: record.unit.property.title,
          description: record.unit.property.description,
          address: record.unit.property.address,
          properties_image: record.unit.property.properties_image,
          propertiesImage: record.unit.property.properties_image,
          landlord: record.unit.property.landlord ? {
            landlord_id: record.unit.property.landlord.landlord_id.toString(),
            national_id: record.unit.property.landlord.national_id,
            business_name: record.unit.property.landlord.business_name,
            user: record.unit.property.landlord.user ? {
              user_id: record.unit.property.landlord.user.user_id.toString(),
              name: record.unit.property.landlord.user.name,
              email: record.unit.property.landlord.user.email,
              phone_number: record.unit.property.landlord.user.phone_number,
              role: record.unit.property.landlord.user.role,
            } : null
          } : null
        } : null
      };
    }

    if (record.payment) {
      booking.payment = {
        payment_id: record.payment.payment_id.toString(),
        booking_id: record.payment.booking_id.toString(),
        transaction_id: record.payment.transaction_id,
        amount: parseFloat(record.payment.amount.toString()),
        payment_date: record.payment.payment_date,
        payment_method: record.payment.payment_method
      };
    }

    return booking;
  }


  async getUnitStatus(unitId) {
    return await this.prisma.unit.findUnique({
      where: { unit_id: BigInt(unitId) },
      include: { property: true }
    });
  }

  async updateUnitStatus(unitId, status) {
    await this.prisma.unit.update({
      where: { unit_id: BigInt(unitId) },
      data: { availability_status: status }
    });
  }
}

