import prisma from '../../config/prisma.js';
import { PropertyRepository } from '../properties/properties.repository.js';

export class FavoriteRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
    this.propertyRepo = new PropertyRepository(prismaClient);
  }

  async toggleFavorite(studentId, propertyId) {
    try {
      const exists = await this.prisma.wishlist.findUnique({
        where: {
          student_id_property_id: {
            student_id: BigInt(studentId),
            property_id: BigInt(propertyId)
          }
        }
      });

      if (exists) {
        await this.prisma.wishlist.delete({
          where: {
            student_id_property_id: {
              student_id: BigInt(studentId),
              property_id: BigInt(propertyId)
            }
          }
        });
        return { status: 'removed', message: 'Removed from Favorites' };
      } else {
        await this.prisma.wishlist.create({
          data: {
            student_id: BigInt(studentId),
            property_id: BigInt(propertyId)
          }
        });
        return { status: 'added', message: 'Added to Favorites' };
      }
    } catch (error) {
      console.error('Error toggling favorite in repo:', error);
      throw error;
    }
  }

  async getFavorites(studentId) {
    try {
      const wishlists = await this.prisma.wishlist.findMany({
        where: { student_id: BigInt(studentId) },
        include: {
          property: {
            include: {
              units: {
                include: {
                  bookings: true
                }
              },
              location: true,
              landlord: { include: { user: true } },
              reviews: true
            }
          }
        }
      });
      
      const properties = [];
      for (const w of wishlists) {
        if (!w.property) continue;
        try {
          const mapped = this.propertyRepo._mapToDomain(w.property);
          if (mapped) {
            properties.push(mapped);
          }
        } catch (err) {
          console.error(`Failed to map property ID ${w.property_id}:`, err);
        }
      }
      return properties;
    } catch (error) {
      console.error('Error getting favorites in repo:', error);
      return [];
    }
  }
}
