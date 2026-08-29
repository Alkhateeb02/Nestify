import express from 'express';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { UserRepository } from '../users/users.repository.js';
import { PropertyRepository } from '../properties/properties.repository.js';
import { protect } from '../../middlewares/auth.middleware.js';

import { NotificationService } from '../notifications/notifications.service.js';
import { NotificationRepository } from '../notifications/notifications.repository.js';

// Dependency Injection Setup
const userRepository = new UserRepository();
const propertyRepository = new PropertyRepository();
const notificationService = new NotificationService(new NotificationRepository());
const aiService = new AiService(userRepository, propertyRepository, notificationService);
const aiController = new AiController(aiService);

const router = express.Router();

router.post('/analyze-images', aiController.analyzeImages);
router.post('/generate-description', aiController.generateDescription);
router.post('/match-roommates', protect, aiController.matchRoommates);
router.get('/roommate-match', protect, aiController.getRoommateMatch);
router.post('/pair-roommate', protect, aiController.pairRoommates);
router.post('/unpair-roommate', protect, aiController.unpairRoommates);
router.post('/roommate-request/send', protect, aiController.sendRoommateRequest);
router.post('/roommate-request/cancel', protect, aiController.cancelRoommateRequest);
router.post('/roommate-request/accept', protect, aiController.acceptRoommateRequest);
router.post('/roommate-request/reject', protect, aiController.rejectRoommateRequest);
router.get('/roommate-requests', protect, aiController.getRoommateRequests);
router.post('/tag-property', aiController.tagProperty);
router.post('/chat', aiController.chat);

export default router;
