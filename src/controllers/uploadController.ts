import { Request, Response, NextFunction } from "express";
import { uploadService } from "../services/uploadService";
import { ok, fail } from "../utils/response";

export const uploadController = {
  single: (req: Request, res: Response, _next: NextFunction) => {
    if (!req.file) return fail(res, 400, "NO_FILE", "No file uploaded.");
    ok(res, { url: uploadService.publicUrlFor(req.file.filename) }, 201);
  },
};
