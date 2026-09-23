import { Router } from "express";
import { shopController } from "../controllers/shopController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createShopSchema, updateShopSchema } from "../validators/shopValidators";

const router = Router();

router.get("/", shopController.list);
router.get("/:id", shopController.get);
router.post("/", authenticate, authorize("SELLER"), validate(createShopSchema), shopController.create);
router.patch("/:id", authenticate, authorize("SELLER"), validate(updateShopSchema), shopController.update);

export default router;
