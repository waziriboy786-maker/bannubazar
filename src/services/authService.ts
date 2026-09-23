import crypto from "crypto";
import { userRepository } from "../repositories/userRepository";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AppError, Errors } from "../utils/AppError";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const authService = {
  register: async (input: { name: string; email?: string; phone?: string; password: string; role: "CUSTOMER" | "SELLER" | "DELIVERY_PARTNER" }) => {
    const identifier = input.email ?? input.phone!;
    const existing = await userRepository.findByEmailOrPhone(identifier);
    if (existing) throw new AppError(409, "ACCOUNT_EXISTS", "An account with this email/phone already exists.");

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
    });

    if (input.role === "SELLER") {
      await userRepository.createSellerProfile(user.id, input.name);
    } else if (input.role === "DELIVERY_PARTNER") {
      await userRepository.createDeliveryProfile(user.id);
    }

    return authService.issueTokens(user.id, user.role);
  },

  login: async (identifier: string, password: string) => {
    const user = await userRepository.findByEmailOrPhone(identifier);
    if (!user || !user.passwordHash) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email/phone or password.");

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email/phone or password.");

    if (user.status !== "ACTIVE") throw new AppError(403, "ACCOUNT_SUSPENDED", "This account has been suspended.");

    return authService.issueTokens(user.id, user.role);
  },

  issueTokens: async (userId: string, role: string) => {
    const accessToken = signAccessToken({ sub: userId, role });
    const refreshToken = signRefreshToken({ sub: userId });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await userRepository.saveRefreshToken(userId, hashToken(refreshToken), expiresAt);

    return { accessToken, refreshToken };
  },

  refresh: async (refreshToken: string) => {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw Errors.unauthorized("Invalid or expired refresh token.");
    }

    const stored = await userRepository.findValidRefreshToken(payload.sub, hashToken(refreshToken));
    if (!stored) throw Errors.unauthorized("Refresh token has been revoked or expired.");

    const user = await userRepository.findById(payload.sub);
    if (!user) throw Errors.unauthorized();

    // Rotate: revoke the used token, issue a fresh pair.
    await userRepository.revokeRefreshToken(hashToken(refreshToken));
    return authService.issueTokens(user.id, user.role);
  },

  logout: async (refreshToken: string) => {
    await userRepository.revokeRefreshToken(hashToken(refreshToken));
  },

  me: (userId: string) => userRepository.findById(userId),
};
