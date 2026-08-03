# KaliSoft AI Marketplace

E-commerce marketplace for industrial packaging and AI solutions. Built with React + FastAPI + PostgreSQL.

## Architecture Overview

```
Client (React SPA)  ──HTTP──▶  API (FastAPI on Cloud Run)  ──▶  PostgreSQL (Neon)
      │                                    │
      │                                    └── Google OAuth (login)
      └── Images served from /images (bundled in Docker image)
```

- **Frontend**: React 19 + Vite 6 + TypeScript + Tailwind CSS 4 + Zustand + React Router 7
- **Backend**: FastAPI + SQLAlchemy 2.0 (async) + JWT auth + Google OAuth
- **Database**: Neon (serverless PostgreSQL, **NOT Cloud SQL**)
- **Hosting**: Google Cloud Run (2 services) + Cloud Build

## Production Deployment

### Cloud Run Services

| Service | URL | Image |
|---|---|---|
| API | `https://kalisoft-api-19782268668.us-central1.run.app` | `gcr.io/$PROJECT_ID/kalisoft-api` |
| Web | `https://kalisoft-web-19782268668.us-central1.run.app` | `gcr.io/$PROJECT_ID/kalisoft-web` |

- Project: `gen-lang-client-0132243782`
- Region: `us-central1`
- Repo: `github.com/aisolutions-hash/Commercial-eCommerce-Site`
- Branches: `feat-allagents-view` (working) → `uat` (production)

### Deploy

```bash
git push origin feat-allagents-view:uat --force
gcloud builds submit \
  --substitutions=_REGION=us-central1,_VITE_API_BASE_URL=https://kalisoft-api-19782268668.us-central1.run.app/api
```

`cloudbuild.yaml` at repo root builds + deploys both images.

### Backend Env Vars (set on Cloud Run, not in Dockerfile)

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRE_MINUTES` | Default `1440` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth login |
| `APP_URL` | Frontend URL (for OAuth redirect) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `USE_CLOUD_SQL` | `false` (using Neon) |

## Authentication

- **Email/password**: register/login endpoints, bcrypt hashed
- **Google OAuth**: `/api/auth/google/login` → callback → JWT. Redirect URIs registered in Google Cloud Console:
  - `https://kalisoft-api-19782268668.us-central1.run.app/api/auth/google/callback`
  - `http://localhost:8000/api/auth/google/callback` (local dev)
- **JWT payload**: `sub` (user ID) + `role` (customer/admin)
- **Roles**: stored in DB only (`users.role` column, default `customer`)

## Admin Panel

- URL: `/admin` (link shows in navbar for admin users only)
- Backend guards every admin route with `require_admin` dependency
- Manage: products, categories, orders (status), contact inquiries, users
- Make a user admin:
  ```bash
  cd server && python make_admin.py user@example.com
  ```

## Database Schema

Tables: `categories`, `products`, `reviews`, `users`, `orders`, `wishlists`, `contact_inquiries`

- Schema auto-created + light auto-migration (`ADD COLUMN IF NOT EXISTS`) on server startup — no manual migration needed for simple column adds
- Seed: `server/seed.py` imports products/categories from `client/src/data.ts`. **Skipped if DB already seeded** — use `update_images.py` / `make_admin.py` style scripts for updates instead.

## Local Development

### Backend

```bash
cd server
pip install -r requirements.txt
cp .env.example .env    # edit DB URL + JWT secret
python seed.py          # seed DB (only if empty)
uvicorn app.main:app --reload --port 8000
```

API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd client
npm install
npm run dev   # :3000, proxies /api -> :8000
```

### Local .env

Mirror the production env vars above — same names, local values (local Postgres or your Neon URL).

## Project Structure

```
├── client/               React SPA (Vite)
│   ├── public/images/    All product/category images (served locally, no CDN)
│   └── src/
│       ├── pages/        Route pages (Home, Category, Product, Admin, ...)
│       ├── components/   Shared components (Navbar, ProductCard, AdminLayout, ...)
│       ├── data.ts       Seed source for products/categories
│       ├── store.ts      Zustand state (cart, wishlist, auth)
│       └── lib/api.ts    API client (with 60s GET cache)
├── server/               FastAPI backend
│   ├── app/
│   │   ├── models/       SQLAlchemy ORM
│   │   ├── schemas/      Pydantic v2
│   │   ├── routers/      Route handlers
│   │   ├── services/     Business logic
│   │   ├── main.py       App entry, CORS, lifespan migrations
│   │   └── config.py     Settings (env-driven)
│   ├── seed.py           DB seeder
│   ├── make_admin.py     Promote user to admin
│   └── requirements.txt
├── cloudbuild.yaml       CI/CD (build + deploy both services)
└── gcp-config.md         GCP patterns reference
```

## Useful Scripts (server/)

| Script | Purpose |
|---|---|
| `seed.py` | Initial DB seed from `data.ts` |
| `make_admin.py <email>` | Set user role to admin |
| `update_images.py` | Update product image paths in DB |
| `delete_product.py` | Delete product by ID from DB |
| `reset_password.py <email> <pass>` | Reset user password |

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | - | Health check |
| GET | `/api/categories` | - | All categories |
| GET | `/api/products` | - | List products |
| GET | `/api/products/{id}` | - | Product detail + reviews |
| POST | `/api/auth/register` / `/login` | - | Auth → JWT |
| GET | `/api/users/profile` | JWT | Current user (+ role) |
| POST/GET | `/api/orders` | JWT | Place / list orders |
| GET/POST/DELETE | `/api/wishlist` | JWT | Wishlist |
| POST | `/api/products/{id}/reviews` | JWT | Submit review |
| POST | `/api/contact` | - | Contact form |
| GET | `/api/admin/*` | Admin | Products, categories, orders, inquiries, users |
