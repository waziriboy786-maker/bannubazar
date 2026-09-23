import { prisma } from "../config/prisma";
import { cartRepository } from "../repositories/cartRepository";
import { AppError, Errors } from "../utils/AppError";

export const cartService = {
  getCart: (customerId: string) => cartRepository.getOrCreateCart(customerId),

  addItem: async (customerId: string, productId: string, quantity: number) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw Errors.notFound("Product");
    if (product.status !== "ACTIVE") throw new AppError(409, "PRODUCT_UNAVAILABLE", "This product is not available.");

    const cart = await cartRepository.getOrCreateCart(customerId);
    // Price is captured server-side at add-to-cart time; re-verified again at checkout.
    const unitPrice = Number(product.discountPrice ?? product.price);
    await cartRepository.upsertItem(cart.id, productId, quantity, unitPrice);
    return cartRepository.getOrCreateCart(customerId);
  },

  updateItem: async (customerId: string, cartItemId: string, quantity: number) => {
    const item = await cartRepository.findItemById(cartItemId);
    if (!item) throw Errors.notFound("Cart item");
    const cart = await cartRepository.getOrCreateCart(customerId);
    if (item.cartId !== cart.id) throw Errors.forbidden();
    await cartRepository.updateItemQuantity(cartItemId, quantity);
    return cartRepository.getOrCreateCart(customerId);
  },

  removeItem: async (customerId: string, cartItemId: string) => {
    const item = await cartRepository.findItemById(cartItemId);
    if (!item) throw Errors.notFound("Cart item");
    const cart = await cartRepository.getOrCreateCart(customerId);
    if (item.cartId !== cart.id) throw Errors.forbidden();
    await cartRepository.removeItem(cartItemId);
    return cartRepository.getOrCreateCart(customerId);
  },
};
