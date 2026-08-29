import { asyncHandler } from '../../utils/asyncHandler.js';

export class FavoriteController {
  constructor(favoriteService) {
    this.favoriteService = favoriteService;
  }

  toggleFavorite = asyncHandler(async (req, res, next) => {
    const result = await this.favoriteService.toggleFavorite(req.user.id, req.body.propertyId);
    res.status(200).json({ success: true, data: result });
  });

  getFavorites = asyncHandler(async (req, res, next) => {
    const result = await this.favoriteService.getFavorites(req.user.id);
    res.status(200).json({ success: true, data: result });
  });
}
