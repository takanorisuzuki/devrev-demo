#!/bin/bash
# GCE VM用の本番環境変数ファイルを生成
# 使用方法: ./generate-production-env.sh <EXTERNAL_IP>

set -euo pipefail

EXTERNAL_IP="${1:-}"

if [ -z "$EXTERNAL_IP" ]; then
  echo "❌ エラー: 外部IPアドレスが指定されていません"
  echo "使用方法: $0 <EXTERNAL_IP>"
  exit 1
fi

echo "🔧 外部IP: $EXTERNAL_IP で本番環境変数ファイルを生成中..."

# Generate secure passwords if not provided
GENERATED_DB_PASSWORD="${DB_PASSWORD:-postgres_prod_$(openssl rand -hex 16)}"
GENERATED_SECRET_KEY="${SECRET_KEY:-$(openssl rand -hex 32)}"

cat > .env << EOF
# ==============================================
# DriveRev - Production Environment (GCE VM)
# 自動生成 - $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# ==============================================

# --------------------------------
# Database Configuration
# --------------------------------
DB_HOST=postgres
DB_PORT=5432
DB_NAME=driverev_db
DB_USER=postgres
DB_PASSWORD=${GENERATED_DB_PASSWORD}

DATABASE_URL=postgresql://postgres:${GENERATED_DB_PASSWORD}@postgres:5432/driverev_db

# --------------------------------
# Redis Configuration
# --------------------------------
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://redis:6379/0

# --------------------------------
# JWT & Security Configuration
# --------------------------------
SECRET_KEY=${GENERATED_SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
BCRYPT_ROUNDS=12

# --------------------------------
# Application Configuration
# --------------------------------
APP_NAME=DriveRev
APP_VERSION=1.0.0
ENVIRONMENT=production
DEBUG=false

API_HOST=${EXTERNAL_IP}:8000
API_PREFIX=/api/v1
BASE_PATH=/

# CORS Settings - 動的に生成
ALLOWED_HOSTS=["localhost", "127.0.0.1", "0.0.0.0", "${EXTERNAL_IP}"]
CORS_ORIGINS=["http://${EXTERNAL_IP}:3000"]

# --------------------------------
# Email Configuration (optional)
# --------------------------------
EMAIL_HOST=${EMAIL_HOST:-smtp.gmail.com}
EMAIL_PORT=${EMAIL_PORT:-587}
EMAIL_USE_TLS=true
EMAIL_USE_SSL=false
EMAIL_USER=${EMAIL_USER:-}
EMAIL_PASSWORD=${EMAIL_PASSWORD:-}
EMAIL_FROM=${EMAIL_FROM:-noreply@driverev.jp}
EMAIL_FROM_NAME=DriveRev

# --------------------------------
# Frontend Configuration - 動的に生成
# --------------------------------
NEXT_PUBLIC_API_URL=http://${EXTERNAL_IP}:8000
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=DriveRev
NEXT_PUBLIC_DEFAULT_LOCALE=ja
NEXT_PUBLIC_SUPPORTED_LOCALES=["ja", "en"]
NEXT_PUBLIC_SHOW_TEST_ACCOUNTS=false

# --------------------------------
# Feature Flags (Production)
# --------------------------------
ENABLE_USER_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_LOYALTY_PROGRAM=true
ENABLE_MULTILINGUAL=true
ENABLE_PAYMENT_INTEGRATION=true
ENABLE_ADMIN_PANEL=true

# --------------------------------
# Business Logic Configuration
# --------------------------------
MIN_RESERVATION_HOURS=3
MAX_RESERVATION_DAYS=30
RESERVATION_BUFFER_MINUTES=30
BASE_DAILY_RATE=5000
PREMIUM_RATE_MULTIPLIER=1.5
WEEKEND_RATE_MULTIPLIER=1.2
LOYALTY_POINTS_PER_100_YEN=1

# --------------------------------
# Maintenance Mode
# --------------------------------
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=サイトメンテナンス中です。しばらくお待ちください。

# ==============================================
# 本番環境への注意事項:
# 1. DB_PASSWORDとSECRET_KEYは必ず安全な値に変更してください
# 2. EMAIL設定が必要な場合は適切な値を設定してください
# ==============================================
EOF

echo "✅ .env ファイルを生成しました"
echo "📍 外部IP: $EXTERNAL_IP"
echo "🌐 フロントエンド: http://${EXTERNAL_IP}:3000"
echo "🔌 バックエンドAPI: http://${EXTERNAL_IP}:8000"
echo ""
echo "⚠️  本番環境で使用する前に、DB_PASSWORDとSECRET_KEYを確認してください"

