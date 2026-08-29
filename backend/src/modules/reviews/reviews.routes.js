import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { ReviewController } from './reviews.controller.js';
import { ReviewService } from './reviews.service.js';
import { ReviewRepository } from './reviews.repository.js';
import * as reviewsSchema from './reviews.schema.js';

// Dependency Injection Setup
const reviewRepository = new ReviewRepository();
const reviewService = new ReviewService(reviewRepository);
const reviewController = new ReviewController(reviewService);

const router = express.Router();

router.get(
  '/property/:propertyId',
  validate(reviewsSchema.getReviewsByPropertySchema),
  reviewController.getReviewsByProperty
);

router.post(
  '/',
  protect,
  authorize('student'), // Only students can leave reviews
  validate(reviewsSchema.createReviewSchema),
  reviewController.createReview
);

export default router;
