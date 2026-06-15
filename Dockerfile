# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────
# Stage 1 · build the React/TypeScript frontend
# ─────────────────────────────────────────────
FROM node:20-alpine AS web
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2 · build the TypeScript backend
# ─────────────────────────────────────────────
FROM node:20-alpine AS server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3 · lean production runtime
# ─────────────────────────────────────────────
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/server

# production dependencies only
COPY server/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# compiled backend + built frontend (served statically by the API)
COPY --from=server /app/server/dist ./dist
COPY --from=web /app/web/dist /app/web/dist

# non-root user
RUN addgroup -S soc && adduser -S soc -G soc && chown -R soc:soc /app
USER soc

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=4s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1

CMD ["node", "dist/index.js"]
