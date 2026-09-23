import { z } from "zod";

export const createShopSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    description: z.string().max(2000).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    deliveryAvailable: z.boolean().optional(),
  }),
});

export const updateShopSchema = z.object({
  body: createShopSchema.shape.body.partial(),
});
