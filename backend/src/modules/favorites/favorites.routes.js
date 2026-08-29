import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { FavoriteController } from './favorites.controller.js';
import { FavoriteService } from './favorites.service.js';
import { FavoriteRepository } from './favorites.repository.js';
import * as favoritesSchema from './favorites.schema.js';

// Dependency Injection Setup
const favoriteRepository = new FavoriteRepository();
const favoriteService = new FavoriteService(favoriteRepository);
const favoriteController = new FavoriteController(favoriteService);

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/', favoriteController.getFavorites);
router.post('/toggle', validate(favoritesSchema.toggleFavoriteSchema), favoriteController.toggleFavorite);

export default router;
