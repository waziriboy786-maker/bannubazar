import { Request, Response, NextFunction } from "express";
import { categoryRepository } from "../repositories/categoryRepository";
import { ok } from "../utils/response";

export const categoryController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await categoryRepository.findAll()); } catch (e) { next(e); }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cat = await categoryRepository.findById(req.params.id);
      if (!cat) return next({ status: 404 });
      ok(res, cat);
    } catch (e) { next(e); }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await categoryRepository.create(req.body), 201); } catch (e) { next(e); }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await categoryRepository.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try { await categoryRepository.remove(req.params.id); ok(res, { deleted: true }); } catch (e) { next(e); }
  },
};
