# DriveRev Backend - FastAPI Dockerfile (Multi-stage optimized)
# Build stage for dependencies
# Use latest python:3.12-slim to get the most recent Debian 12 base with updated packages
FROM python:3.12-slim as builder

# Install build dependencies and apply security updates
# Explicitly install specific versions to address CVEs
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    &&  apt-get install -y \
    libsqlite3-0=3.40.1-2+deb12u2 \
    libc-bin=2.36-9+deb12u11 \
    libc6=2.36-9+deb12u11 \
    libgnutls30=3.7.9-2+deb12u5 \
    liblzma5=5.4.1-1 \
    perl-base=5.36.0-7+deb12u3 \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Production stage
# Use latest python:3.12-slim to get the most recent Debian 12 base with updated packages
FROM python:3.12-slim

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

# Install runtime dependencies and apply security updates
# Explicitly install specific versions to address CVEs
RUN apt-get update && apt-get install -y \
    curl \
    libpq-dev \
    && apt-get install -y \
    libsqlite3-0=3.40.1-2+deb12u2 \
    libc-bin=2.36-9+deb12u11 \
    libc6=2.36-9+deb12u11 \
    libgnutls30=3.7.9-2+deb12u5 \
    liblzma5=5.4.1-1 \
    perl-base=5.36.0-7+deb12u3 \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

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
    echo "Build Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> /app/build-info.txt

# ヘルスチェック
# start-period を延長: entrypoint.sh でのDB待機、マイグレーション、シード実行を考慮
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# アプリケーション実行（entrypoint.shでマイグレーションとシード実行）
CMD ["./entrypoint.sh"]
