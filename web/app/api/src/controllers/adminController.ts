import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok, fail } from "../utils/response";

// All admin actions write an audit log entry — who did what, to what,
// and when — so approvals/suspensions are traceable later.
async function logAction(actorId: string, action: string, entityType: string, entityId: string, metadata?: object) {
  await prisma.auditLog.create({ data: { actorId, action, entityType, entityId, metadata } });
}

export const adminController = {
  dashboard: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [totalUsers, activeSellers, activeShops, deliveryPartners, totalProducts, totalOrders, pendingOrders, pendingVerifications, openReports] =
        await Promise.all([
          prisma.user.count(),
          prisma.sellerProfile.count({ where: { verificationStatus: "VERIFIED" } }),
          prisma.shop.count({ where: { status: "ACTIVE" } }),
          prisma.deliveryProfile.count({ where: { verificationStatus: "VERIFIED" } }),
          prisma.product.count(),
          prisma.order.count(),
          prisma.order.count({ where: { orderStatus: "PENDING" } }),
          prisma.sellerProfile.count({ where: { verificationStatus: "SUBMITTED" } }),
          prisma.report.count({ where: { status: "OPEN" } }),
        ]);
      ok(res, { totalUsers, activeSellers, activeShops, deliveryPartners, totalProducts, totalOrders, pendingOrders, pendingVerifications, openReports });
    } catch (e) { next(e); }
  },

  listUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);
      const role = req.query.role as string | undefined;
      const users = await prisma.user.findMany({
        where: role ? { role: role as any } : undefined,
        select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
        skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      });
      ok(res, users);
    } catch (e) { next(e); }
  },

  suspendUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: "SUSPENDED" } });
      await logAction(req.user!.id, "SUSPEND_USER", "User", user.id);
      ok(res, { id: user.id, status: user.status });
    } catch (e) { next(e); }
  },

  listSellerApplications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = (req.query.status as string) ?? "SUBMITTED";
      const sellers = await prisma.sellerProfile.findMany({
        where: { verificationStatus: status as any },
        include: { user: { select: { name: true, email: true, phone: true, createdAt: true } } },
      });
      ok(res, sellers);
    } catch (e) { next(e); }
  },

  reviewSeller: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { decision } = req.body as { decision: "VERIFIED" | "REJECTED" };
      if (!["VERIFIED", "REJECTED"].includes(decision)) return fail(res, 400, "INVALID_DECISION", "decision must be VERIFIED or REJECTED.");
      const seller = await prisma.sellerProfile.update({ where: { id: req.params.id }, data: { verificationStatus: decision } });
      await logAction(req.user!.id, `SELLER_${decision}`, "SellerProfile", seller.id);
      ok(res, seller);
    } catch (e) { next(e); }
  },

  listDeliveryApplications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = (req.query.status as string) ?? "SUBMITTED";
      const riders = await prisma.deliveryProfile.findMany({
        where: { verificationStatus: status as any },
        include: { user: { select: { name: true, phone: true, createdAt: true } } },
      });
      ok(res, riders);
    } catch (e) { next(e); }
  },

  reviewDeliveryPartner: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { decision } = req.body as { decision: "VERIFIED" | "REJECTED" };
      if (!["VERIFIED", "REJECTED"].includes(decision)) return fail(res, 400, "INVALID_DECISION", "decision must be VERIFIED or REJECTED.");
      const rider = await prisma.deliveryProfile.update({ where: { id: req.params.id }, data: { verificationStatus: decision } });
      await logAction(req.user!.id, `DELIVERY_PARTNER_${decision}`, "DeliveryProfile", rider.id);
      ok(res, rider);
    } catch (e) { next(e); }
  },

  listPendingProducts: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await prisma.product.findMany({ where: { status: "PENDING" }, include: { images: true, shop: true } });
      ok(res, products);
    } catch (e) { next(e); }
  },

  reviewProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { decision } = req.body as { decision: "ACTIVE" | "REJECTED" };
      if (!["ACTIVE", "REJECTED"].includes(decision)) return fail(res, 400, "INVALID_DECISION", "decision must be ACTIVE or REJECTED.");
      const product = await prisma.product.update({ where: { id: req.params.id }, data: { status: decision } });
      await logAction(req.user!.id, `PRODUCT_${decision}`, "Product", product.id);
      ok(res, product);
    } catch (e) { next(e); }
  },

  listOrders: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);
      const orders = await prisma.order.findMany({
        include: { items: true, customer: { select: { name: true } }, shop: { select: { name: true } } },
        orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      });
      ok(res, orders);
    } catch (e) { next(e); }
  },

  listReports: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = (req.query.status as string) ?? "OPEN";
      const reports = await prisma.report.findMany({ where: { status: status as any }, orderBy: { createdAt: "desc" } });
      ok(res, reports);
    } catch (e) { next(e); }
  },

  updateReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await prisma.report.update({ where: { id: req.params.id }, data: { status: req.body.status } });
      await logAction(req.user!.id, "REPORT_UPDATE", "Report", report.id, { status: req.body.status });
      ok(res, report);
    } catch (e) { next(e); }
  },
};
