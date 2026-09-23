import { prisma } from "../config/prisma";

export const cartRepository = {
  getOrCreateCart: async (customerId: string) => {
    const existing = await prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
    if (existing) return existing;
    return prisma.cart.create({
      data: { customerId },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
  },

  upsertItem: (cartId: string, productId: string, quantity: number, price: number) =>
    prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { quantity, price },
      create: { cartId, productId, quantity, price },
    }),

  updateItemQuantity: (cartItemId: string, quantity: number) =>
    prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } }),

  removeItem: (cartItemId: string) => prisma.cartItem.delete({ where: { id: cartItemId } }),

  findItemById: (cartItemId: string) => prisma.cartItem.findUnique({ where: { id: cartItemId } }),

  clearCart: (cartId: string) => prisma.cartItem.deleteMany({ where: { cartId } }),
};
