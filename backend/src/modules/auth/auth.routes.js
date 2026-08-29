import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import * as authSchema from './auth.schema.js';

// Dependency Injection Setup
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

const router = express.Router();

router.post('/register', validate(authSchema.registerSchema), authController.register);
router.post('/login', validate(authSchema.loginSchema), authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', validate(authSchema.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(authSchema.resetPasswordSchema), authController.resetPassword);
router.post('/check-email', validate(authSchema.checkEmailSchema), authController.checkEmail);
router.post('/check-phone', validate(authSchema.checkPhoneSchema), authController.checkPhone);
router.get('/verify-email', authController.verifyEmail);
router.get('/me', protect, authController.getMe);
router.post('/change-password', protect, authController.changePassword);


export default router;
