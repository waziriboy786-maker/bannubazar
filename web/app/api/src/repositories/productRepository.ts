import { prisma } from "../config/prisma";
import { Prisma, ProductStatus } from "@prisma/client";

export interface ListProductsParams {
  q?: string;
  categoryId?: string;
  shopId?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page: number;
  limit: number;
  statusOverride?: ProductStatus; // used by seller/admin views
}

function buildWhere(params: ListProductsParams): Prisma.ProductWhereInput {
  return {
    status: params.statusOverride ?? "ACTIVE",
    categoryId: params.categoryId,
    shopId: params.shopId,
    price: {
      gte: params.minPrice,
      lte: params.maxPrice,
    },
    shop: params.city ? { city: params.city } : undefined,
    OR: params.q
      ? [
          { name: { contains: params.q, mode: "insensitive" } },
          { description: { contains: params.q, mode: "insensitive" } },
          { brand: { contains: params.q, mode: "insensitive" } },
        ]
      : undefined,
  };
}

function buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export const productRepository = {
  list: (params: ListProductsParams) =>
    prisma.product.findMany({
      where: buildWhere(params),
      orderBy: buildOrderBy(params.sort),
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: { images: true, shop: { select: { id: true, name: true, city: true } } },
    }),

  count: (params: ListProductsParams) => prisma.product.count({ where: buildWhere(params) }),

  findById: (id: string) =>
    prisma.product.findUnique({
      where: { id },
      include: { images: true, shop: true, category: true },
    }),

  // Used internally at checkout — authoritative price/stock source.
  findManyByIds: (ids: string[]) => prisma.product.findMany({ where: { id: { in: ids } } }),

  create: (sellerId: string, data: any) =>
    prisma.product.create({
      data: {
        sellerId,
        shopId: data.shopId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        stockQuantity: data.stockQuantity,
        sku: data.sku,
        brand: data.brand,
        condition: data.condition,
        status: "PENDING",
        images: data.images?.length
          ? { create: data.images.map((url: string, i: number) => ({ imageUrl: url, sortOrder: i })) }
          : undefined,
      },
      include: { images: true },
    }),

  update: (id: string, data: Record<string, unknown>) =>
    prisma.product.update({ where: { id }, data: data as any }),

  decrementStock: (id: string, quantity: number) =>
    prisma.product.update({ where: { id }, data: { stockQuantity: { decrement: quantity } } }),

  remove: (id: string) => prisma.product.delete({ where: { id } }),
};
