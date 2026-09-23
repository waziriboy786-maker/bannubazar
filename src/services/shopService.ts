import { prisma } from "../config/prisma";
import { shopRepository } from "../repositories/shopRepository";
import { AppError, Errors } from "../utils/AppError";

async function getSellerProfileOrThrow(userId: string) {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError(403, "NOT_A_SELLER", "You need a seller account to do this.");
  return profile;
}

export const shopService = {
  create: async (userId: string, data: Record<string, unknown>) => {
    const sellerProfile = await getSellerProfileOrThrow(userId);
    if (sellerProfile.verificationStatus !== "VERIFIED") {
      throw new AppError(403, "SELLER_NOT_VERIFIED", "Your seller account must be verified before creating a shop.");
    }
    return shopRepository.create(sellerProfile.id, data);
  },

  update: async (userId: string, shopId: string, data: Record<string, unknown>) => {
    const shop = await shopRepository.findById(shopId);
    if (!shop) throw Errors.notFound("Shop");

    // Ownership check against the DB record, not the request body.
    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sellerProfile || shop.sellerId !== sellerProfile.id) {
      throw Errors.forbidden("You can only edit your own shop.");
    }

    return shopRepository.update(shopId, data);
  },

  get: async (shopId: string) => {
    const shop = await shopRepository.findById(shopId);
    if (!shop) throw Errors.notFound("Shop");
    return shop;
  },

  list: (params: { city?: string; page: number; limit: number }) =>
    Promise.all([shopRepository.list({ ...params, status: "ACTIVE" }), shopRepository.count({ ...params, status: "ACTIVE" })]),
};
