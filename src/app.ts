import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false })); // allow serving /uploads cross-origin to the web app
app.use(cors({ origin: env.webOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// General API rate limit; auth endpoints have their own stricter limiter.
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

// Serve uploaded product/shop images. In production this is replaced by a
// cloud storage + CDN URL — kept local here so the MVP runs with zero cloud setup.
app.use("/uploads", express.static(path.resolve(env.storage.localPath)));

app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
