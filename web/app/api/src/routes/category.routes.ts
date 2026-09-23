import { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/", categoryController.list);
router.get("/:id", categoryController.get);
router.post("/", authenticate, authorize("ADMIN", "SUPER_ADMIN"), categoryController.create);
router.patch("/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), categoryController.update);
router.delete("/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), categoryController.remove);

export default router;
