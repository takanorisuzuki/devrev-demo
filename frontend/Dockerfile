# DriveRev Frontend - Next.js Dockerfile (Multi-stage optimized)

# Dependencies stage
FROM node:22.20.0-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies for build)
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Builder stage
FROM node:22.20.0-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time arguments for Next.js public environment variables
# These will be embedded into the JavaScript bundle during build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV=production
ARG NEXT_PUBLIC_APP_NAME=DriveRev
ARG NEXT_PUBLIC_DEFAULT_LOCALE=ja
ARG NEXT_PUBLIC_SUPPORTED_LOCALES='["ja", "en"]'
ARG BUILD_ID
ARG GIT_COMMIT

# Set environment variables for build (Next.js reads these during build)
# Combining ENV instructions reduces image layers and improves build efficiency
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV} \
    NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME} \
    NEXT_PUBLIC_DEFAULT_LOCALE=${NEXT_PUBLIC_DEFAULT_LOCALE} \
    NEXT_PUBLIC_SUPPORTED_LOCALES=${NEXT_PUBLIC_SUPPORTED_LOCALES} \
    NEXT_PUBLIC_BUILD_ID=${BUILD_ID:-unknown} \
    NEXT_PUBLIC_GIT_COMMIT=${GIT_COMMIT:-unknown} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
RUN npm run build

# Production image
FROM node:22.20.0-alpine AS runner

RUN apk add --no-cache curl
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0

# Copy build metadata for version verification
ARG BUILD_ID=unknown
ARG GIT_COMMIT=unknown
ARG BUILD_DATE
ARG SOURCE_URL=https://github.com/takanorisuzuki/devrev-demo

# Add metadata labels for version tracking (OCI Image Spec compliant)
LABEL org.opencontainers.image.version="$BUILD_ID" \
    org.opencontainers.image.revision="$GIT_COMMIT" \
    org.opencontainers.image.created="$BUILD_DATE" \
    org.opencontainers.image.source="$SOURCE_URL"
RUN echo "Build ID: $BUILD_ID" > /app/build-info.txt && \
    echo "Git Commit: $GIT_COMMIT" >> /app/build-info.txt && \
    echo "Build Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> /app/build-info.txt

# Install only production dependencies for minimal image size
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --frozen-lockfile && npm cache clean --force

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
