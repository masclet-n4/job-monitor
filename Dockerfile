FROM node:20-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/server.js ./
COPY --from=builder /app/frontend/dist ./public
EXPOSE 3000
CMD ["node", "server.js"]
