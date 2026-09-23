import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.API_PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? "30d",
  storage: {
    driver: process.env.STORAGE_DRIVER ?? "local",
    localPath: process.env.STORAGE_LOCAL_PATH ?? "./uploads",
    publicUrl: process.env.STORAGE_PUBLIC_URL ?? "http://localhost:4000/uploads",
  },
};
