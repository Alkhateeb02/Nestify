import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string()
      .min(2, 'Name must be at least 2 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Full name must only contain letters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phoneNumber: z.string()
      .regex(/^07[789]\d{7}$/, 'Phone number must be 10 digits and start with 077, 078, or 079'),
    role: z.enum(['student', 'landlord', 'admin']).default('student'),

    // Landlord specific fields (Diagram 4.0.30)
    nationalID: z.string().optional(),
    businessName: z.string().optional(),
    bankName: z.string().optional(),
    bankAccountHolderName: z.string().optional(),
  }),
}).refine(data => {
  if (data.body.role === 'landlord') {
    return !!data.body.bankName && !!data.body.bankAccountHolderName;
  }
  return true;
}, {
  message: "Bank Name and Bank Account Holder Name are required for landlords",
  path: ["body", "bankName"]
});


export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['student', 'landlord', 'admin']).optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const checkEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const checkPhoneSchema = z.object({
  body: z.object({
    phoneNumber: z.string()
      .regex(/^07[789]\d{7}$/, 'Phone number must be 10 digits and start with 077, 078, or 079'),
  }),
});
