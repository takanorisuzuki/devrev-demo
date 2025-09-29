# DriveRev Frontend - Next.js Dockerfile (Multi-stage optimized)

# Dependencies stage
FROM node:22.20.0-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copy package files and install dependencies (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --frozen-lockfile

# Builder stage
FROM node:22.20.0-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application (disable telemetry)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM node:22.20.0-alpine AS runner

RUN apk add --no-cache curl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# ポート3000を露出
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# アプリケーション実行 (standalone)
CMD ["node", "server.js"]
