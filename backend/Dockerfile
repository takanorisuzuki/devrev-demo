# DriveRev Backend - FastAPI Dockerfile (Multi-stage optimized, Alpine Linux)
# Build stage for dependencies
FROM python:3.12-alpine as builder

# Install build dependencies (no security updates needed - Alpine is clean)
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    libffi-dev

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.12-alpine

# Build metadata arguments with defaults
ARG BUILD_ID=unknown
ARG GIT_COMMIT=unknown
ARG BUILD_DATE=1970-01-01T00:00:00Z
ARG SOURCE_URL=https://github.com/takanorisuzuki/devrev-demo

# Add metadata labels for version tracking (OCI Image Spec compliant)
LABEL org.opencontainers.image.version="$BUILD_ID" \
    org.opencontainers.image.revision="$GIT_COMMIT" \
    org.opencontainers.image.created="$BUILD_DATE" \
    org.opencontainers.image.source="$SOURCE_URL"

# Install runtime dependencies (PostgreSQL client library)
RUN apk add --no-cache \
    curl \
    libpq

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy application code (last to maximize cache efficiency)
COPY . .

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# ポート8000を露出
EXPOSE 8000

# Create build metadata file for version verification
RUN echo "Build ID: $BUILD_ID" > /app/build-info.txt && \
    echo "Git Commit: $GIT_COMMIT" >> /app/build-info.txt && \
    echo "Build Date: $(date -u +"%Y-%m-%d %H:%M:%S")" >> /app/build-info.txt

# ヘルスチェック
# start-period を延長: entrypoint.sh でのDB待機、マイグレーション、シード実行を考慮
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# アプリケーション実行（entrypoint.shでマイグレーションとシード実行）
CMD ["./entrypoint.sh"]
