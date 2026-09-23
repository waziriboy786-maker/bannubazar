import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
      },
    });
  }

  // Prisma unique constraint violation, etc.
  if (typeof err === "object" && err !== null && "code" in err && (err as any).code === "P2002") {
    return res.status(409).json({
      success: false,
      error: { code: "DUPLICATE_ENTRY", message: "A record with these details already exists." },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, error: { code: "ROUTE_NOT_FOUND", message: `No route: ${req.method} ${req.path}` } });
}
