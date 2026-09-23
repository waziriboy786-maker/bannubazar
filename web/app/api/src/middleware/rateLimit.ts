import rateLimit from "express-rate-limit";

// Stricter limiter for auth endpoints (login, OTP, password reset) —
// general API traffic uses a looser limiter in app.ts.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts. Try again later." } },
});
