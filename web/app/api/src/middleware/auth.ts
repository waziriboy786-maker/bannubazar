import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { Errors } from "../utils/AppError";

// Extends Express's Request with the authenticated user, derived from a
// verified JWT — never from anything the client claims in the body.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(Errors.unauthorized());
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(Errors.unauthorized("Invalid or expired token."));
  }
}

// Use on routes that behave differently for logged-in vs anonymous users
// but don't require auth (e.g. product listing with personalized flags).
export function attachUserIfPresent(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // ignore invalid token on optional-auth routes
    }
  }
  next();
}
