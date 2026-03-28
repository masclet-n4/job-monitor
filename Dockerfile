# ── Stage: desarrollo ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app

RUN npm install -g concurrently

# Dependencias del frontend
COPY package*.json ./
RUN npm install

# Dependencias del backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# El código fuente se monta como volumen en docker-compose.dev.yml
# CMD arranca backend (puerto 3000) y Vite dev server (puerto 5173) en paralelo
CMD ["concurrently", \
     "--names", "api,web", \
     "--prefix-colors", "cyan,magenta", \
     "node --watch backend/server.js", \
     "vite --host"]

# ── Stage: build del frontend ────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ── Stage: producción ────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/server.js ./
COPY --from=frontend-builder /frontend/dist ./public
EXPOSE 3000
CMD ["node", "server.js"]
