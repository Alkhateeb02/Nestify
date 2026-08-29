import { asyncHandler } from '../../utils/asyncHandler.js';

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = asyncHandler(async (req, res, next) => {
    const result = await this.authService.registerUser(req.body);
    
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  login = asyncHandler(async (req, res, next) => {
    const result = await this.authService.loginUser(req.body);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  });


  googleLogin = asyncHandler(async (req, res, next) => {
    const { token, role, ...extraData } = req.body;
    const result = await this.authService.googleLogin(token, role, extraData);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  logout = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.logoutUser(req.user.id, token);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  forgotPassword = asyncHandler(async (req, res, next) => {
    await this.authService.forgotPassword(req.body.email);
    
    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link has been sent.',
    });
  });

  resetPassword = asyncHandler(async (req, res, next) => {
    await this.authService.resetPassword(req.body.token, req.body.password);
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  });

  getMe = asyncHandler(async (req, res, next) => {
    // User is already attached to req by auth.middleware
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  });

  checkEmail = asyncHandler(async (req, res, next) => {
    const exists = await this.authService.checkEmailExistence(req.body.email);
    
    res.status(200).json({
      success: true,
      data: { exists },
    });
  });

  checkPhone = asyncHandler(async (req, res, next) => {
    const exists = await this.authService.checkPhoneExistence(req.body.phoneNumber);
    
    res.status(200).json({
      success: true,
      data: { exists },
    });
  });

  verifyEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.query;
    await this.authService.verifyEmail(token);
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  });

  changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    await this.authService.changePassword(req.user.id, currentPassword, newPassword);
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  });
}

