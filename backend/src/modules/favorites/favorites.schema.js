import { z } from 'zod';

export const toggleFavoriteSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
  }),
});
