import { Router } from "express";
import { adminController } from "../controllers/adminController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"));

router.get("/dashboard", adminController.dashboard);
router.get("/users", adminController.listUsers);
router.patch("/users/:id/suspend", adminController.suspendUser);

router.get("/sellers", adminController.listSellerApplications);
router.patch("/sellers/:id/review", adminController.reviewSeller);

router.get("/delivery-partners", adminController.listDeliveryApplications);
router.patch("/delivery-partners/:id/review", adminController.reviewDeliveryPartner);

router.get("/products/pending", adminController.listPendingProducts);
router.patch("/products/:id/review", adminController.reviewProduct);

router.get("/orders", adminController.listOrders);

router.get("/reports", adminController.listReports);
router.patch("/reports/:id", adminController.updateReport);

export default router;
