import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService";
import { ok } from "../utils/response";

export const productController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query as any;
      const params = {
        q: q.q, categoryId: q.categoryId, shopId: q.shopId, city: q.city,
        minPrice: q.minPrice ? Number(q.minPrice) : undefined,
        maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
        sort: q.sort, page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      };
      const { items, total } = await productService.list(params);
      ok(res, items, 200, { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) });
    } catch (e) { next(e); }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await productService.get(req.params.id)); } catch (e) { next(e); }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await productService.create(req.user!.id, req.body), 201); } catch (e) { next(e); }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await productService.update(req.user!.id, req.params.id, req.body)); } catch (e) { next(e); }
  },
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try { await productService.remove(req.user!.id, req.params.id); ok(res, { deleted: true }); } catch (e) { next(e); }
  },
  mine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);
      ok(res, await productService.listMine(req.user!.id, page, limit));
    } catch (e) { next(e); }
  },
};
