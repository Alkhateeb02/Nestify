import { asyncHandler } from '../../utils/asyncHandler.js';

export class ReviewController {
  constructor(reviewService) {
    this.reviewService = reviewService;
  }

  createReview = asyncHandler(async (req, res, next) => {
    // Only students can create reviews based on our routes
    const result = await this.reviewService.createReview(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
  });

  getReviewsByProperty = asyncHandler(async (req, res, next) => {
    const result = await this.reviewService.getReviewsByProperty(req.params.propertyId);
    res.status(200).json({ success: true, count: result.length, data: result });
  });
}
