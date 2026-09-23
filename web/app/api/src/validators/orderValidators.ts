import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    shopId: z.string().uuid(),
    addressId: z.string().uuid().optional(),
    // Fallback inline address if the customer hasn't saved one yet.
    deliveryAddress: z
      .object({
        recipientName: z.string(),
        phone: z.string(),
        address: z.string(),
        area: z.string().optional(),
        city: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
      .optional(),
    paymentMethod: z.enum(["COD"]).default("COD"),
    // Note: quantities/product ids only — price is NEVER accepted from client.
    items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "CONFIRMED", "PROCESSING", "PACKED", "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "FAILED",
    ]),
  }),
});
