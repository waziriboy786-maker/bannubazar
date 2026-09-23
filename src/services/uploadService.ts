import fs from "fs";
import path from "path";
import { env } from "../config/env";

// Minimal storage abstraction: local disk for dev, swap the implementation
// for S3/GCS/Supabase Storage in production without touching callers.
export const uploadService = {
  ensureDir: () => {
    if (!fs.existsSync(env.storage.localPath)) {
      fs.mkdirSync(env.storage.localPath, { recursive: true });
    }
  },

  publicUrlFor: (filename: string) => `${env.storage.publicUrl}/${filename}`,

  // Private files (CNIC images, liveness refs) should use a driver that
  // supports signed URLs (S3 presigned GET) rather than the public bucket —
  // stubbed here since Phase 1 doesn't wire up seller/rider verification UI yet.
  privateUrlFor: (filename: string) => `${env.storage.publicUrl}/private/${filename}`,
};
