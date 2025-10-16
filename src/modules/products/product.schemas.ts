import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(3),
    price: z.number({ required_error: 'Price is required' }).positive(),
    description: z.string().optional(),
    stock: z.number().int().positive().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    price: z.number().positive().optional(),
    description: z.string().optional(),
    stock: z.number().int().positive().optional(),
  }),
});
