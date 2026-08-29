import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    propertyId: z.string().optional(),
    unitId: z.string().optional(),
    checkinDate: z.string().min(1, 'Check-in date is required'),
    checkoutDate: z.string().optional(),
    numberOfDays: z.union([z.number(), z.string()]).optional(),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['pending_approval', 'confirmed', 'rejected', 'cancelled', 'completed', 'suspended', 'Pending', 'Approved', 'Rejected']),
  }),
});
