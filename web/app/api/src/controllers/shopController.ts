import { Request, Response, NextFunction } from "express";
import { shopService } from "../services/shopService";
import { ok } from "../utils/response";

export const shopController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);
      const [items, total] = await shopService.list({ city: req.query.city as string | undefined, page, limit });
      ok(res, items, 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (e) { next(e); }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await shopService.get(req.params.id)); } catch (e) { next(e); }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await shopService.create(req.user!.id, req.body), 201); } catch (e) { next(e); }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await shopService.update(req.user!.id, req.params.id, req.body)); } catch (e) { next(e); }
  },
};
