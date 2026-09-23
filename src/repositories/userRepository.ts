import { prisma } from "../config/prisma";
import { Role } from "@prisma/client";

export const userRepository = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  findByEmailOrPhone: (identifier: string) =>
    prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    }),

  create: (data: { name: string; email?: string; phone?: string; passwordHash: string; role: Role }) =>
    prisma.user.create({ data }),

  updateProfile: (id: string, data: Partial<{ name: string; profileImage: string }>) =>
    prisma.user.update({ where: { id }, data }),

  createSellerProfile: (userId: string, businessName: string) =>
    prisma.sellerProfile.create({ data: { userId, businessName } }),

  createDeliveryProfile: (userId: string) =>
    prisma.deliveryProfile.create({ data: { userId } }),

  saveRefreshToken: (userId: string, tokenHash: string, expiresAt: Date) =>
    prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } }),

  findValidRefreshToken: (userId: string, tokenHash: string) =>
    prisma.refreshToken.findFirst({
      where: { userId, tokenHash, revoked: false, expiresAt: { gt: new Date() } },
    }),

  revokeRefreshToken: (tokenHash: string) =>
    prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } }),
};
