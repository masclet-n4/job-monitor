# Job Monitor

Aplicación para monitorizar trabajos con React, Express y PocketBase.

## Requisitos

- Node.js 20+
- Docker (para producción)
- PocketBase (instancia existente)

## Desarrollo

```bash
npm install
npm run dev
```

## Producción

```bash
docker compose up --build
```

## Variables de entorno

Crea `.env` basado en `.env.example` si existe.

```env
Pocketbase_URL=http://pocketbase:8090
```
