# QR Code Ordering System

This is a full-stack QR code ordering system using:

- **Frontend:** Next.js
- **Backend:** Bun (with Oven Docker image)
- **Database:** PostgreSQL
- **Cache:** Redis
- **File Storage:** MinIO
- **Containerization:** Docker & Docker Compose

---

## Folder Structure

```
project-root/
├─ backend/
│  ├─ src/
│  │  └─ index.ts
│  ├─ package.json
│  └─ Dockerfile
├─ frontend/
│  ├─ pages/
│  ├─ package.json
│  └─ Dockerfile
└─ docker-compose.yml
```

---

## Prerequisites

- Docker & Docker Compose installed
- Node.js & Bun (optional for local dev)
- Internet connection (for pulling Docker images)

---

## Setup

### 1. Build Docker Images

```bash
docker compose build
```

### 2. Run All Services

```bash
docker compose up -d
```

This will start:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MinIO API: [http://localhost:9000](http://localhost:9000)
- MinIO Console: [http://localhost:9001](http://localhost:9001)
  - Username: `minioadmin`
  - Password: `minioadmin`

---

### 3. Stop Services

```bash
docker compose down
```

> Persistent data in volumes will be kept.

---

### 4. Seed Database (Optional)

If you have a seed script:

```bash
docker compose exec backend bun run src/utils/seed.ts
```

---

## Docker Configuration

### Backend (Bun)

Uses Oven Docker image for Bun runtime.

**Dockerfile example (`backend/Dockerfile`):**

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]
```

### Frontend (Next.js)

**Dockerfile example (`frontend/Dockerfile`):**

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json package-lock.json ./
RUN bun install
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

---

### Docker Compose (`docker-compose.yml`)

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    container_name: qr_backend
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
    networks:
      - qr_network
    depends_on:
      - postgres
      - redis
      - minio

  frontend:
    build: ./frontend
    container_name: qr_frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    networks:
      - qr_network
    depends_on:
      - backend

  postgres:
    image: postgres:16
    container_name: qr_postgres
    restart: always
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: password
      POSTGRES_DB: qrcode_order
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - qr_network

  redis:
    image: redis:7.2
    container_name: qr_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - qr_network

  minio:
    image: minio/minio:latest
    container_name: qr_minio
    restart: always
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    networks:
      - qr_network

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  qr_network:
    driver: bridge
```

---

## Usage

- Access frontend: `http://localhost:3000`
- Access backend API: `http://localhost:3001`
- Access MinIO Console: `http://localhost:9001`

---

## Development Tips

- **Frontend hot reload:** `npm run dev` locally or adjust Dockerfile to mount volumes
- **Backend hot reload:** `bun run --hot src/index.ts` inside container

---
