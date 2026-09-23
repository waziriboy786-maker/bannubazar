import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/orderService";
import { ok } from "../utils/response";

export const orderController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.create({ customerId: req.user!.id, ...req.body });
      ok(res, order, 201);
    } catch (e) { next(e); }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await orderService.get(req.user!.id, req.user!.role, req.params.id)); } catch (e) { next(e); }
  },
  listMine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);
      const role = req.user!.role;
      const items = role === "SELLER"
        ? await orderService.listForSeller(req.user!.id, page, limit)
        : await orderService.listForCustomer(req.user!.id, page, limit);
      ok(res, items, 200, { page, limit });
    } catch (e) { next(e); }
  },
  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await orderService.updateStatus(req.user!.id, req.user!.role, req.params.id, req.body.status)); } catch (e) { next(e); }
  },
};
