import { asyncHandler } from '../../utils/asyncHandler.js';

export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  // Use arrow function to bind 'this' lexically for Express routing
  updateProfile = asyncHandler(async (req, res, next) => {
    const result = await this.userService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data: result });
  });

  getPreferences = asyncHandler(async (req, res, next) => {
    const result = await this.userService.getPreferences(req.user.id);
    res.status(200).json({ success: true, data: result });
  });

  updatePreferences = asyncHandler(async (req, res, next) => {
    const result = await this.userService.updatePreferences(req.user.id, req.body);
    res.status(200).json({ success: true, data: result });
  });
}

