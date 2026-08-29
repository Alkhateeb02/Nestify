export class FavoriteService {
  constructor(favoriteRepository) {
    this.favoriteRepo = favoriteRepository;
  }

  async toggleFavorite(studentId, propertyId) {
    return await this.favoriteRepo.toggleFavorite(studentId, propertyId);
  }

  async getFavorites(studentId) {
    return await this.favoriteRepo.getFavorites(studentId);
  }
}
