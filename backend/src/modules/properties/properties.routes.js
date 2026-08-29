import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { PropertyController } from './properties.controller.js';
import { PropertyService } from './properties.service.js';
import { PropertyRepository } from './properties.repository.js';
import * as propertiesSchema from './properties.schema.js';

import { AiService } from '../ai/ai.service.js';
import { UserRepository } from '../users/users.repository.js';
import { NotificationService } from '../notifications/notifications.service.js';
import { NotificationRepository } from '../notifications/notifications.repository.js';

// Dependency Injection Setup
const propertyRepository = new PropertyRepository();
const notificationService = new NotificationService(new NotificationRepository());
const aiService = new AiService(new UserRepository()); 
const propertyService = new PropertyService(propertyRepository, aiService, notificationService);
const propertyController = new PropertyController(propertyService);


const router = express.Router();

// Public routes
router.get('/', validate(propertiesSchema.getPropertiesSchema), propertyController.getListings);
router.get('/:id', validate(propertiesSchema.getPropertyByIdSchema), propertyController.getListingById);
router.get('/:id/calendar', propertyController.getPropertySchedule);


// Protected routes (Landlords & Admins)
router.use(protect);

router.get('/my-stats', authorize('landlord'), propertyController.getMyStats);

router.post(
  '/',
  authorize('landlord', 'admin'),
  validate(propertiesSchema.createPropertySchema),
  propertyController.createListing
);

router.put(
  '/:id',
  authorize('landlord', 'admin'),
  validate(propertiesSchema.updatePropertySchema),
  propertyController.updateListing
);

router.delete(
  '/:id',
  authorize('landlord', 'admin'),
  propertyController.deleteListing
);

// Admin only route
router.put(
  '/:id/approve',
  authorize('admin'),
  validate(propertiesSchema.approvePropertySchema),
  propertyController.approveListing
);

export default router;
