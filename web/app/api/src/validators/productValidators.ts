import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    shopId: z.string().uuid(),
    categoryId: z.string().uuid(),
    name: z.string().min(2).max(200),
    description: z.string().min(5).max(5000),
    price: z.number().positive(),
    discountPrice: z.number().positive().optional(),
    stockQuantity: z.number().int().min(0),
    sku: z.string().optional(),
    brand: z.string().optional(),
    condition: z.string().optional(),
    images: z.array(z.string().url()).max(8).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial().extend({
    status: z.enum(["DRAFT", "PENDING", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]).optional(),
  }),
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    shopId: z.string().uuid().optional(),
    city: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    sort: z.enum(["newest", "price_asc", "price_desc", "popular"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});
