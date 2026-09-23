import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { authenticate } from "../middleware/auth";
import { uploadController } from "../controllers/uploadController";
import { env } from "../config/env";
import { uploadService } from "../services/uploadService";

uploadService.ensureDir();

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

const storage = multer.diskStorage({
  destination: env.storage.localPath,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, or WEBP images are allowed."));
    }
    cb(null, true);
  },
});

const router = Router();

// Public product/shop image upload. Private KYC document upload would use a
// separate, private-bucket-backed route — not implemented in this MVP pass.
router.post("/image", authenticate, upload.single("file"), uploadController.single);

export default router;
