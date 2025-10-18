# QR Code Ordering System

A modern restaurant ordering system where customers can order directly via QR code at their table. Built with **Next.js 13+**, **Bun backend**, **PostgreSQL**, **Redis**, and **MinIO**.

---

## Features

- Scan QR code to open table-specific menu.
- Browse available menu items with images.
- Add/remove items from cart and adjust quantity.
- Submit orders with optional notes.
- Manage menus, tables, and orders in backend.
- Image storage via **MinIO** with presigned URLs.
- Backend caching with **Redis**.

---

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript, Tailwind CSS
- **Backend**: Bun + Hono framework
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Storage**: MinIO
- **State Management**: Zustand (cart store)
- **Icons**: lucide-react
- **UI Components**: shadcn/ui

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js / Bun (depending on environment)
- Optional: bun or yarn

### Clone Repository

```bash
git clone https://github.com/yourusername/qr-code-ordering.git
cd qr-code-ordering
```

---

## Running with Docker

The project includes a `docker-compose.yml` to run **PostgreSQL**, **Redis**, and **MinIO**.

```bash
docker-compose up -d
```

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO API: `localhost:9000`
- MinIO Console: `localhost:9001` (login with `minioadmin:minioadmin`)

---

## Backend

1. Navigate to backend folder:

```bash
cd backend
```

2. Install dependencies (if using Bun):

```bash
bun install
```

3. Run development server:

```bash
bun run --hot src/index.ts
```

4. Seed database (optional):

```bash
bun run src/utils/seed.ts
```

---

## Frontend

1. Navigate to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
bun install
# or npm install / yarn install
```

3. Run development server:

```bash
bun dev
# or npm run dev / yarn dev
```

- Frontend default: `http://localhost:3000`
- API backend default: `http://localhost:3001/api/v1`

---

## Environment Variables

Create `.env` files for frontend and backend:

**Frontend** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Backend** (`.env`):

```env
DATABASE_URL=postgresql://root:password@localhost:5432/qrcode-order
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## API Endpoints (Summary)

**Auth**

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `PATCH /auth/change-password`

**Menu**

- `GET /menus`
- `GET /menus/:id`
- `POST /menus`
- `PUT /menus/:id`
- `DELETE /menus/:id`

**Order**

- `GET /orders`
- `GET /orders/:id`
- `GET /orders/table/:tableId`
- `POST /orders`
- `PATCH /orders/:id/status`
- `DELETE /orders/:id`

**Table**

- `GET /tables`
- `POST /tables`
- `PUT /tables/:id`
- `PATCH /tables/:id/toggle`
- `DELETE /tables/:id`

**User**

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

**Presign URL**

- `GET /presign/:key`

---

## Folder Structure

```
frontend/
  ├─ app/                  # Next.js pages & layouts
  ├─ components/           # UI components
  ├─ lib/                  # API utils, fetch presigned URL
  ├─ store/                # Zustand cart store
  └─ public/

backend/
  ├─ src/
      ├─ api/              # Hono routes
      ├─ config/           # Database & MinIO config
      ├─ utils/            # Helpers, seeding
      └─ index.ts          # Entry point
```

---

## Notes

- **MinIO Images**: Use presigned URLs to serve images securely in frontend.
- **Cart State**: Stored in frontend using Zustand; no backend persistence until order submission.
- **Redis**: Can be used to cache menu or frequently accessed data.
- **Docker**: Everything required (DB, Redis, MinIO) is included in `docker-compose.yml`.
