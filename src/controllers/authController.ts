import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { userRepository } from "../repositories/userRepository";
import { ok, fail } from "../utils/response";
import { Errors } from "../utils/AppError";

const REFRESH_COOKIE = "bannu_refresh_token";
const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, maxAge: 30 * 24 * 60 * 60 * 1000 };

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = await authService.register(req.body);
      res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOpts);
      ok(res, { accessToken: tokens.accessToken }, 201);
    } catch (e) { next(e); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, password } = req.body;
      const tokens = await authService.login(identifier, password);
      res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOpts);
      ok(res, { accessToken: tokens.accessToken });
    } catch (e) { next(e); }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[REFRESH_COOKIE] ?? req.body.refreshToken;
      if (!token) return fail(res, 401, "NO_REFRESH_TOKEN", "No refresh token provided.");
      const tokens = await authService.refresh(token);
      res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOpts);
      ok(res, { accessToken: tokens.accessToken });
    } catch (e) { next(e); }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[REFRESH_COOKIE] ?? req.body.refreshToken;
      if (token) await authService.logout(token);
      res.clearCookie(REFRESH_COOKIE);
      ok(res, { loggedOut: true });
    } catch (e) { next(e); }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const user = await userRepository.findById(req.user.id);
      if (!user) throw Errors.unauthorized();
      const { passwordHash, ...safeUser } = user;
      ok(res, safeUser);
    } catch (e) { next(e); }
  },
};
