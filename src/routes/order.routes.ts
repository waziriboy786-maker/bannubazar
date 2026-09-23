import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/orderValidators";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), validate(createOrderSchema), orderController.create);
router.get("/", authenticate, authorize("CUSTOMER", "SELLER"), orderController.listMine);
router.get("/:id", authenticate, orderController.get);
router.patch("/:id/status", authenticate, authorize("SELLER", "ADMIN", "SUPER_ADMIN"), validate(updateOrderStatusSchema), orderController.updateStatus);

export default router;
