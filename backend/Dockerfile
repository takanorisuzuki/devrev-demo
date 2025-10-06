# DriveRev Backend - FastAPI Dockerfile (Multi-stage optimized)
# Build stage for dependencies
FROM python:3.12.7-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.12.7-slim

# Build metadata arguments with defaults
ARG BUILD_ID=unknown
ARG GIT_COMMIT=unknown

# Add metadata labels for version tracking
LABEL build_id="$BUILD_ID"
LABEL git_commit="$GIT_COMMIT"

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    libpq-dev \
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
RUN echo "Build ID: ${BUILD_ID:-unknown}" > /app/build-info.txt && \
    echo "Git Commit: ${GIT_COMMIT:-unknown}" >> /app/build-info.txt && \
    echo "Build Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> /app/build-info.txt

# ヘルスチェック
# start-period を延長: entrypoint.sh でのDB待機、マイグレーション、シード実行を考慮
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# アプリケーション実行（entrypoint.shでマイグレーションとシード実行）
CMD ["./entrypoint.sh"]
