import { Router } from "express";
import { cartController } from "../controllers/cartController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cartValidators";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));
router.get("/", cartController.get);
router.post("/items", validate(addCartItemSchema), cartController.addItem);
router.patch("/items/:id", validate(updateCartItemSchema), cartController.updateItem);
router.delete("/items/:id", cartController.removeItem);

export default router;
