import { Router } from "express";
import { productController } from "../controllers/productController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "../validators/productValidators";

const router = Router();

router.get("/mine", authenticate, authorize("SELLER"), productController.mine);
router.get("/", productController.list);
router.get("/:id", productController.get);
router.post("/", authenticate, authorize("SELLER"), validate(createProductSchema), productController.create);
router.patch("/:id", authenticate, authorize("SELLER"), validate(updateProductSchema), productController.update);
router.delete("/:id", authenticate, authorize("SELLER"), productController.remove);

export default router;
