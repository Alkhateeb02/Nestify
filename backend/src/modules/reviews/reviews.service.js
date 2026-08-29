export class ReviewService {
  constructor(reviewRepository) {
    this.reviewRepo = reviewRepository;
  }

  async createReview(data, studentId) {
    const newReview = { ...data, studentId };
    return await this.reviewRepo.createReview(newReview);
  }

  async getReviewsByProperty(propertyId) {
    return await this.reviewRepo.getReviewsByProperty(propertyId);
  }
}
