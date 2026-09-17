# Nutrifit

Proyecto full-stack: React (frontend) + Spring Boot (backend) + PostgreSQL (base de datos).

## Estructura

- `frontend/` — React + TypeScript + Vite
- `backend/` — Spring Boot 4 (Maven, Java 21)

## Requisitos

- Node.js 20+
- JDK 21+
- Docker (para levantar PostgreSQL) o una instancia de PostgreSQL propia

## Levantar el proyecto

### 1. Base de datos

```bash
cd backend
cp .env.example .env
docker compose up -d
```

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

Corre en `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Corre en `http://localhost:5173`.
