import { NextFunction, Request, Response } from "express";
import { Errors } from "../utils/AppError";

// Role-gate. Ownership (e.g. "is this seller's own product") is checked
// separately, inside the service layer, against the database record —
// never trust an id from the URL/body as proof of ownership.
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(Errors.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(Errors.forbidden());
    }
    next();
  };
}
