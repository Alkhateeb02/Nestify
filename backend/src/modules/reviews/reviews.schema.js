import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    unitId: z.string().optional(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }),
});
export const getReviewsByPropertySchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
});
