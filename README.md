# KaliSoft AI Marketplace

E-commerce marketplace for industrial packaging and AI solutions. Built with React + FastAPI + PostgreSQL.

## Tech Stack

**Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS 4, Zustand, React Router 7
**Backend:** FastAPI, SQLAlchemy 2.0 (async), PostgreSQL, Alembic, JWT auth
**AI:** Google Gemini SDK

## Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 16+
- npm or yarn

## Setup

### 1. Database

```bash
createdb kalisoft_ecommerce
```

### 2. Backend

```bash
cd server
pip install -r requirements.txt
cp .env.example .env    # edit DB URL + JWT secret
alembic upgrade head    # create tables
python seed.py          # import products/categories from frontend data
uvicorn app.main:app --reload --port 8000
```

API docs at `http://localhost:8000/docs`

### 3. Frontend

```bash
cd client
npm install
npm run dev   # :3000, proxies /api -> :8000
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | - | Health check |
| GET | `/api/categories` | - | All categories |
| GET | `/api/products` | - | List products (?categoryId=&search=&page=&per_page=) |
| GET | `/api/products/{id}` | - | Product detail + reviews |
| POST | `/api/auth/register` | - | Create user → JWT |
| POST | `/api/auth/login` | - | Login → JWT |
| GET | `/api/users/profile` | JWT | Current user |
| POST | `/api/orders` | JWT | Place order `{items: [{product_id, quantity}]}` |
| GET | `/api/orders` | JWT | Order history |
| GET | `/api/wishlist` | JWT | Wishlist items |
| POST | `/api/wishlist/{productId}` | JWT | Add to wishlist |
| DELETE | `/api/wishlist/{productId}` | JWT | Remove from wishlist |

## Database Schema

6 tables: `categories`, `products`, `reviews`, `users`, `orders`, `wishlists`. Migrations via Alembic (`server/alembic/versions/`).

## Seed Data

Seed script (`server/seed.py`) extracts products and categories from `client/src/data.ts` via tsx and inserts into PostgreSQL. Run `python seed.py` after `alembic upgrade head`.

## Project Structure

```
├── client/          React SPA (Vite)
│   ├── src/
│   │   ├── pages/       11 route pages
│   │   ├── components/  6 shared components
│   │   ├── data.ts      Hardcoded products/categories
│   │   ├── types.ts     TypeScript interfaces
│   │   └── store.ts     Zustand state (cart, wishlist, auth)
│   └── vite.config.ts   Proxy /api → :8000
├── server/          FastAPI backend
│   ├── app/
│   │   ├── models/      SQLAlchemy ORM (6 models)
│   │   ├── schemas/     Pydantic v2 request/response
│   │   ├── routers/     Route handlers (6 routers)
│   │   ├── services/    Business logic (auth, product, order)
│   │   ├── main.py      App entry + CORS
│   │   └── config.py    Settings (DB, JWT)
│   ├── alembic/         Migrations
│   └── seed.py          Database seeder
└── README.md
```
