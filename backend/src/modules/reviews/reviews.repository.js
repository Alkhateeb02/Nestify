import prisma from '../../config/prisma.js';
import { Review } from '../../domain/entities/Review.js';

export class ReviewRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async createReview(reviewData) {
    const { studentId, propertyId, unitId, rating, comment } = reviewData;

    const review = await this.prisma.review.create({
      data: {
        student_id: BigInt(studentId),
        property_id: BigInt(propertyId),
        unit_id: unitId ? BigInt(unitId) : null,
        rating_value: rating,
        comment: comment || null
      }
    });

    return this._mapToDomain(review);
  }

  async getReviewsByProperty(propertyId) {
    const reviews = await this.prisma.review.findMany({
      where: { property_id: BigInt(propertyId) },
      include: { student: { include: { user: true } } },
      orderBy: { created_at: 'desc' }
    });

    return reviews.map(r => this._mapToDomain(r));
  }

  _mapToDomain(record) {
    const review = new Review({
      reviewID: record.review_id.toString(),
      ratingValue: record.rating_value,
      comment: record.comment
    });
    // Add additional properties for the API response
    review.id = review.reviewID;
    review.studentId = record.student_id ? record.student_id.toString() : null;
    review.propertyId = record.property_id ? record.property_id.toString() : null;
    review.unitId = record.unit_id ? record.unit_id.toString() : null;
    if (record.student && record.student.user) {
      review.studentName = record.student.user.name;
    }
    return review;
  }
}
