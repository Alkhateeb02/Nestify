import { z } from 'zod';

export const submitTicketSchema = z.object({
  body: z.object({
    unitId: z.union([z.string(), z.number()]).transform(val => val.toString()),
    issueDescription: z.string().min(10, 'Issue description must be at least 10 characters'),
  }),
});

export const updateTicketStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'processing', 'done', 'rejected', 'in_progress', 'completed', 'cancelled']),
  }),
});

export const rateTicketSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    feedback: z.string().optional(),
  }),
});
