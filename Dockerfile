# ============================================================
# Frontend Dockerfile — Estrategia 365 (Next.js Multi-Stage)
# ============================================================
# Cloud Run ready: dynamic $PORT, exec CMD, non-root user
# Requires next.config.mjs: output: "standalone"

# ── Stage 1: Dependencies ────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies with cache mount
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# ── Stage 2: Builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars
# NEXT_PUBLIC_API_URL is baked into the JS bundle at build time
# Override at build: docker build --build-arg NEXT_PUBLIC_API_URL=https://...
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ── Stage 3: Runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# PORT is injected dynamically by Cloud Run (default 8080)
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build (minimal runtime — no node_modules needed)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

# Cloud Run health check via HTTP
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:${PORT:-8080}/ || exit 1

EXPOSE 8080

# Cloud Run injects $PORT — use exec form with shell to expand it
CMD exec node server.js
