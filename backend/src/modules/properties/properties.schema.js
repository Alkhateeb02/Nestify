import { z } from 'zod';

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title too short'),
    description: z.string().min(10, 'Description too short'),
    price: z.number().positive('Price must be positive'),
    address: z.string().min(5, 'Valid address required'),
    type: z.enum(['Studio', 'Apartment', 'Shared Room', 'Villa']).default('Apartment'),
    capacity: z.number().int().min(1).default(1),
    features: z.array(z.string()).optional(),
    properties_image: z.string().optional().nullable(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: z.string().optional(),
    area: z.union([z.number(), z.string()]).optional().nullable(),
    google_place_id: z.string().optional().nullable(),
    formatted_address: z.string().optional().nullable(),
    locationLink: z.string().optional().nullable(),
    rules: z.array(z.string()).optional().nullable(),
    nearby: z.record(z.any()).optional().nullable(),
    images: z.array(z.string()).optional().nullable(),
    listingType: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    currency: z.string().optional().nullable(),
    rentalPeriod: z.string().optional().nullable(),
  }),
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    address: z.string().optional(),
    features: z.array(z.string()).optional(),
    properties_image: z.string().optional().nullable(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: z.string().optional(),
    area: z.union([z.number(), z.string()]).optional().nullable(),
    google_place_id: z.string().optional().nullable(),
    formatted_address: z.string().optional().nullable(),
    locationLink: z.string().optional().nullable(),
    rules: z.array(z.string()).optional().nullable(),
    nearby: z.record(z.any()).optional().nullable(),
    images: z.array(z.string()).optional().nullable(),
    listingType: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    currency: z.string().optional().nullable(),
    rentalPeriod: z.string().optional().nullable(),
  }),
});

export const getPropertiesSchema = z.object({
  query: z.object({
    type: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    landlord_id: z.string().optional(),
    search: z.string().optional(),
  }).optional(),
});

export const getPropertyByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const approvePropertySchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
  }),
});

