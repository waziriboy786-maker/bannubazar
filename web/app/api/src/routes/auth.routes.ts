import { Router } from "express";
import { authController } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimit";
import { registerSchema, loginSchema } from "../validators/authValidators";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authRateLimiter, authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
