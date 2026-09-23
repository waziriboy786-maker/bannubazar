import { prisma } from "../config/prisma";
import { OrderStatus } from "@prisma/client";

export const orderRepository = {
  // Creates the order, its line items, and decrements stock atomically —
  // all-or-nothing so a mid-checkout failure can never leave stock wrong.
  createWithItems: (data: {
    customerId: string;
    shopId: string;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: string;
    deliveryAddress: Record<string, unknown>;
    items: { productId: string; sellerId: string; productName: string; quantity: number; price: number; subtotal: number }[];
  }) =>
    prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId: data.customerId,
          shopId: data.shopId,
          subtotal: data.subtotal,
          deliveryFee: data.deliveryFee,
          discount: data.discount,
          total: data.total,
          paymentMethod: data.paymentMethod,
          paymentStatus: "COD_PENDING",
          orderStatus: "PENDING",
          deliveryAddress: data.deliveryAddress as any,
          items: { create: data.items },
        },
        include: { items: true },
      });

      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      return order;
    }),

  findById: (id: string) =>
    prisma.order.findUnique({ where: { id }, include: { items: true, shop: true } }),

  listForCustomer: (customerId: string, page: number, limit: number) =>
    prisma.order.findMany({
      where: { customerId },
      include: { items: true, shop: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),

  listForShop: (shopId: string, page: number, limit: number) =>
    prisma.order.findMany({
      where: { shopId },
      include: { items: true, customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),

  updateStatus: (id: string, status: OrderStatus) =>
    prisma.order.update({ where: { id }, data: { orderStatus: status } }),
};
