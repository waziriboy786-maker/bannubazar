import { prisma } from "../config/prisma";
import { productRepository, ListProductsParams } from "../repositories/productRepository";
import { AppError, Errors } from "../utils/AppError";

async function assertOwnsProductOrThrow(userId: string, productId: string) {
  const product = await productRepository.findById(productId);
  if (!product) throw Errors.notFound("Product");

  const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!sellerProfile || product.sellerId !== sellerProfile.id) {
    throw Errors.forbidden("You can only modify your own products.");
  }
  return product;
}

export const productService = {
  list: async (params: ListProductsParams) => {
    const [items, total] = await Promise.all([productRepository.list(params), productRepository.count(params)]);
    return { items, total };
  },

  get: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product) throw Errors.notFound("Product");
    return product;
  },

  create: async (userId: string, data: any) => {
    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sellerProfile || sellerProfile.verificationStatus !== "VERIFIED") {
      throw new AppError(403, "SELLER_NOT_VERIFIED", "Your seller account must be verified to list products.");
    }

    const shop = await prisma.shop.findUnique({ where: { id: data.shopId } });
    if (!shop || shop.sellerId !== sellerProfile.id) {
      throw Errors.forbidden("You can only add products to your own shop.");
    }

    return productRepository.create(sellerProfile.id, data);
  },

  update: async (userId: string, productId: string, data: Record<string, unknown>) => {
    await assertOwnsProductOrThrow(userId, productId);
    // Sellers can't self-approve — only admins can move status to ACTIVE from PENDING.
    if ((data as any).status === "ACTIVE") delete (data as any).status;
    return productRepository.update(productId, data);
  },

  remove: async (userId: string, productId: string) => {
    await assertOwnsProductOrThrow(userId, productId);
    return productRepository.remove(productId);
  },

  listMine: async (userId: string, page: number, limit: number) => {
    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sellerProfile) throw new AppError(403, "NOT_A_SELLER", "You need a seller account to do this.");
    return productRepository.list({ page, limit, statusOverride: undefined as any, shopId: undefined } as any).then(() =>
      prisma.product.findMany({
        where: { sellerId: sellerProfile.id },
        include: { images: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      })
    );
  },
};
