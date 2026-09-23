import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authController } from "../controllers/authController";

const router = Router();

// /users/me is an alias of /auth/me for REST-conventional clients.
router.get("/me", authenticate, authController.me);

export default router;
