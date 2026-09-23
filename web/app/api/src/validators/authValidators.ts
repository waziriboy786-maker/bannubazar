import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().optional(),
    phone: z.string().min(7).max(20).optional(),
    password: z.string().min(8).max(100),
    role: z.enum(["CUSTOMER", "SELLER", "DELIVERY_PARTNER"]).default("CUSTOMER"),
  }).refine((data) => data.email || data.phone, {
    message: "Either email or phone is required.",
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(3), // email or phone
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10).optional(), // may also arrive via cookie
  }),
});
