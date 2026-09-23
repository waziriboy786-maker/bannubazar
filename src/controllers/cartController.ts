import { Request, Response, NextFunction } from "express";
import { cartService } from "../services/cartService";
import { ok } from "../utils/response";

export const cartController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await cartService.getCart(req.user!.id)); } catch (e) { next(e); }
  },
  addItem: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await cartService.addItem(req.user!.id, req.body.productId, req.body.quantity), 201); } catch (e) { next(e); }
  },
  updateItem: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await cartService.updateItem(req.user!.id, req.params.id, req.body.quantity)); } catch (e) { next(e); }
  },
  removeItem: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await cartService.removeItem(req.user!.id, req.params.id)); } catch (e) { next(e); }
  },
};
