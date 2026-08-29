import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { UserController } from './users.controller.js';
import { UserService } from './users.service.js';
import { UserRepository } from './users.repository.js';
import * as usersSchema from './users.schema.js';

// Dependency Injection Setup
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = express.Router();

router.use(protect);
router.put('/profile', validate(usersSchema.updateProfileSchema), userController.updateProfile);
router.get('/preferences', userController.getPreferences);
router.put('/preferences', userController.updatePreferences);

export default router;

