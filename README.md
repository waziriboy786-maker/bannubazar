# BannuBazaar — Bannu Local Marketplace (MVP)

A working local-marketplace platform for Bannu, Khyber Pakhtunkhwa: customers, sellers, and an admin panel share one backend, one PostgreSQL database, and one REST API. Built with **Next.js + TypeScript** (web), **Node.js/Express + TypeScript + Prisma** (API), and **PostgreSQL**.

## What's implemented (Phase 1 of the original spec)

- **Auth**: register/login (email or phone + password), JWT access + refresh tokens (rotated, revocable), `/auth/me`, logout
- **RBAC**: CUSTOMER / SELLER / DELIVERY_PARTNER / ADMIN / SUPER_ADMIN, enforced on every protected route + ownership checks in the service layer
- **Categories**: public listing, admin CRUD, 21 seeded categories
- **Shops**: seller creates/edits their own shop (requires verified seller status), public shop pages
- **Products**: seller CRUD, image upload, admin approval workflow (PENDING → ACTIVE/REJECTED), search + filters (query, category, price range, sort) with pagination
- **Cart & Checkout**: server-side price/stock verification, atomic order creation with stock decrement, Cash-on-Delivery
- **Orders**: customer order history, seller order list, status updates (seller/admin only)
- **Admin dashboard**: platform stats, seller/product approval queues, audit-logged actions
- **Frontend**: responsive (mobile-first) Next.js app — home, search/filter, product & shop pages, auth, cart, checkout, customer orders, seller dashboard + add-product flow, admin dashboard

## What's scaffolded in the database but not yet wired to endpoints (Phase 2/3)

Delivery jobs, real-time chat/messages, notifications, reviews, wishlists, addresses (partial), reports, CNIC/liveness verification workflow, Google OAuth, phone OTP, payment gateways, and the React Native mobile app. The Prisma schema already models these tables so adding them later is additive, not a rewrite — see `apps/api/prisma/schema.prisma`.

---

## Project structure

```
/apps
  /api   -> Express + TypeScript + Prisma backend
  /web   -> Next.js + TypeScript + Tailwind frontend
/packages
  /types -> Shared TypeScript types/enums used by api + web
```

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local install, Docker, or a managed instance e.g. Supabase/Neon/RDS)
- npm 9+

## 1. Install dependencies

From the repo root:

```bash
npm install
```

This installs all workspaces (`apps/api`, `apps/web`, `packages/types`) via npm workspaces.

## 2. Set up the database

Create a Postgres database, e.g.:

```bash
createdb bannu_marketplace
```

Or with Docker:

```bash
docker run --name bannu-postgres -e POSTGRES_USER=bannu -e POSTGRES_PASSWORD=bannu_password \
  -e POSTGRES_DB=bannu_marketplace -p 5432:5432 -d postgres:16
```

## 3. Configure environment variables

Copy the example env file and fill in real values:

```bash
cp .env.example apps/api/.env
```

Edit `apps/api/.env` — at minimum set `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` to real values (never commit this file).

For the frontend:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

## 4. Run migrations and seed data

```bash
cd apps/api
npm run prisma:generate
npm run prisma:migrate      # creates tables from schema.prisma
npm run prisma:seed         # admin account + categories + a demo shop/product
```

The seed script prints a default admin login (**change this password immediately outside of local dev**):
```
admin@bannumarketplace.pk / Admin@12345
```

## 5. Run the backend

```bash
npm run dev:api
```

API runs at `http://localhost:4000`. Health check: `GET http://localhost:4000/health`.

## 6. Run the frontend

In a second terminal:

```bash
npm run dev:web
```

Web app runs at `http://localhost:3000`.

## 7. Try it out

1. Visit `http://localhost:3000` — you should see the seeded categories and the demo product.
2. Register a new account as **Seller**, then log in as the seeded admin (`admin@bannumarketplace.pk`) at `/login`, go to **Admin → Pending seller applications**, and approve your new seller.
3. Log back in as the seller, create a shop from the Seller dashboard, copy its shop ID, and use **Add product** to submit a product (goes to PENDING).
4. Log in as admin again and approve the product from **Admin → Pending product approvals**.
5. Register/log in as a **Customer**, add the product to cart, and check out (Cash on Delivery).
6. View the order under **Orders**, and update its status from the seller dashboard's orders list via the API (`PATCH /orders/:id/status`) — a dedicated status-update UI button is a good next addition.

## API overview

Base URL: `http://localhost:4000/api/v1`

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Categories | `GET /categories`, `GET /categories/:id`, admin CRUD |
| Shops | `GET /shops`, `GET /shops/:id`, `POST /shops` (seller), `PATCH /shops/:id` (owner) |
| Products | `GET /products` (search/filter/paginate), `GET /products/:id`, `GET /products/mine` (seller), seller CRUD |
| Cart | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id` |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` |
| Uploads | `POST /uploads/image` (multipart, auth required) |
| Admin | `GET /admin/dashboard`, seller/delivery/product review queues, `GET /admin/orders`, `GET /admin/reports` |

Every response is `{ success: true, data, meta? }` or `{ success: false, error: { code, message } }`.

## Security notes baked into this codebase

- Prices, totals, `seller_id`, `customer_id`, and role are **never** trusted from the client — see `apps/api/src/services/orderService.ts`.
- Ownership (e.g. "is this seller's own product/shop") is re-checked against the database in the service layer on every mutation, not just gated by role.
- Passwords are hashed with bcrypt (12 rounds); refresh tokens are stored hashed and rotated on use.
- Auth endpoints have a stricter rate limiter than general API traffic.
- Uploaded images are validated by MIME type and size-limited.

## Known gaps / next steps

- Add a `GET /shops/mine` endpoint so the "Add product" form can list a seller's shops instead of requiring a pasted shop ID.
- Wire up delivery jobs, chat, and notifications (tables already exist).
- Add Google OAuth, phone OTP, and a real KYC/liveness provider (Phase 3).
- Swap local disk storage for S3/GCS/Supabase Storage in production (`apps/api/src/services/uploadService.ts` is the single place to change).
- Add the automated test suite described in the project's coding standards doc.
- Build the React Native/Expo mobile app against the same API.

## Deployment (outline)

1. Provision managed PostgreSQL; run `prisma migrate deploy`.
2. Deploy `apps/api` to any Node host (Render, Railway, Fly.io, ECS, etc.); set all env vars from `.env.example`.
3. Deploy `apps/web` to Vercel or any Node host; set `NEXT_PUBLIC_API_URL` to the deployed API URL.
4. Point `WEB_ORIGIN` on the API to the deployed frontend URL (for CORS).
5. Swap `STORAGE_DRIVER` to a cloud provider and update `uploadService.ts`.
6. Put both behind HTTPS (most hosts do this automatically); set secure cookie flags (already conditional on `NODE_ENV=production`).
