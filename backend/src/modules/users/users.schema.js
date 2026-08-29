import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    bio: z.string().optional(),
    phoneNumber: z.string().optional(),
    profile_image: z.string().optional(),
    gender: z.string().optional(),
    year: z.string().optional(),
    semester: z.string().optional(),
    major: z.string().optional(),
    password: z.string().min(6).optional(),
    bankName: z.string().optional(),
    bankAccountHolderName: z.string().optional(),
  }),
});

