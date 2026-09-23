import { prisma } from "../config/prisma";
import { ShopStatus } from "@prisma/client";

export const shopRepository = {
  findById: (id: string) => prisma.shop.findUnique({ where: { id }, include: { seller: true } }),

  findBySellerProfileId: (sellerProfileId: string) =>
    prisma.shop.findMany({ where: { sellerId: sellerProfileId } }),

  create: (sellerId: string, data: Record<string, unknown>) =>
    prisma.shop.create({ data: { ...data, sellerId } as any }),

  update: (id: string, data: Record<string, unknown>) =>
    prisma.shop.update({ where: { id }, data: data as any }),

  list: (params: { city?: string; status?: ShopStatus; page: number; limit: number }) =>
    prisma.shop.findMany({
      where: { city: params.city, status: params.status ?? "ACTIVE" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),

  count: (params: { city?: string; status?: ShopStatus }) =>
    prisma.shop.count({ where: { city: params.city, status: params.status ?? "ACTIVE" } }),
};
