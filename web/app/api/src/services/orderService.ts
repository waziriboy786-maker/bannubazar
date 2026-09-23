import { prisma } from "../config/prisma";
import { productRepository } from "../repositories/productRepository";
import { orderRepository } from "../repositories/orderRepository";
import { AppError, Errors } from "../utils/AppError";

const FLAT_DELIVERY_FEE = 150; // PKR — placeholder; replace with distance/zone based calc later.

interface CreateOrderInput {
  customerId: string;
  shopId: string;
  addressId?: string;
  deliveryAddress?: Record<string, unknown>;
  paymentMethod: string;
  items: { productId: string; quantity: number }[];
}

export const orderService = {
  // Every dollar amount here is computed from the database, never from the
  // request body. The client only supplies product ids + quantities + where
  // to deliver.
  create: async (input: CreateOrderInput) => {
    const productIds = input.items.map((i) => i.productId);
    const products = await productRepository.findManyByIds(productIds);

    if (products.length !== productIds.length) {
      throw Errors.badRequest("One or more products in your cart no longer exist.", "PRODUCT_NOT_FOUND");
    }

    // All items in one order must belong to the same shop (single-shop checkout).
    const mismatched = products.find((p) => p.shopId !== input.shopId);
    if (mismatched) {
      throw Errors.badRequest("All items must belong to the same shop.", "MULTI_SHOP_CHECKOUT");
    }

    let subtotal = 0;
    const orderItems = input.items.map((reqItem) => {
      const product = products.find((p) => p.id === reqItem.productId)!;

      if (product.status !== "ACTIVE") {
        throw new AppError(409, "PRODUCT_UNAVAILABLE", `${product.name} is not currently available.`);
      }
      if (product.stockQuantity < reqItem.quantity) {
        throw new AppError(409, "INSUFFICIENT_STOCK", `Not enough stock for ${product.name}.`);
      }

      const unitPrice = Number(product.discountPrice ?? product.price);
      const lineSubtotal = unitPrice * reqItem.quantity;
      subtotal += lineSubtotal;

      return {
        productId: product.id,
        sellerId: product.sellerId,
        productName: product.name,
        quantity: reqItem.quantity,
        price: unitPrice,
        subtotal: lineSubtotal,
      };
    });

    let deliveryAddress = input.deliveryAddress;
    if (input.addressId) {
      const address = await prisma.address.findUnique({ where: { id: input.addressId } });
      if (!address || address.userId !== input.customerId) {
        throw Errors.forbidden("Invalid delivery address.");
      }
      deliveryAddress = address as any;
    }
    if (!deliveryAddress) {
      throw Errors.badRequest("A delivery address is required.", "ADDRESS_REQUIRED");
    }

    const deliveryFee = FLAT_DELIVERY_FEE;
    const discount = 0; // Placeholder for future promo/coupon logic — always server-computed.
    const total = subtotal + deliveryFee - discount;

    const order = await orderRepository.createWithItems({
      customerId: input.customerId,
      shopId: input.shopId,
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod: input.paymentMethod,
      deliveryAddress,
      items: orderItems,
    });

    // Clear the customer's cart items for this shop after a successful order.
    const cart = await prisma.cart.findUnique({ where: { customerId: input.customerId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: { in: productIds } } });
    }

    return order;
  },

  get: async (userId: string, role: string, orderId: string) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw Errors.notFound("Order");

    if (role === "CUSTOMER" && order.customerId !== userId) throw Errors.forbidden();
    if (role === "SELLER") {
      const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
      const shop = await prisma.shop.findUnique({ where: { id: order.shopId } });
      if (!sellerProfile || shop?.sellerId !== sellerProfile.id) throw Errors.forbidden();
    }
    return order;
  },

  listForCustomer: (customerId: string, page: number, limit: number) =>
    orderRepository.listForCustomer(customerId, page, limit),

  listForSeller: async (userId: string, page: number, limit: number) => {
    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId }, include: { shops: true } });
    if (!sellerProfile) throw new AppError(403, "NOT_A_SELLER", "You need a seller account to do this.");
    const shopIds = sellerProfile.shops.map((s) => s.id);
    return prisma.order.findMany({
      where: { shopId: { in: shopIds } },
      include: { items: true, customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  },

  updateStatus: async (userId: string, role: string, orderId: string, status: string) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw Errors.notFound("Order");

    if (role === "SELLER") {
      const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
      const shop = await prisma.shop.findUnique({ where: { id: order.shopId } });
      if (!sellerProfile || shop?.sellerId !== sellerProfile.id) throw Errors.forbidden();
    } else if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      throw Errors.forbidden();
    }

    return orderRepository.updateStatus(orderId, status as any);
  },
};
