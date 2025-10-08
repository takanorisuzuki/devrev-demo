#!/bin/bash
set -e

echo "🚀 DriveRev Backend Container Starting..."

# データベース接続を待機
echo "⏳ データベース接続を待機中..."
python -c "
import time
import psycopg2
import traceback
import sys

# デバッグ: 環境変数の確認
import os
print(f'DEBUG: CORS_ORIGINS env = {os.environ.get(\"CORS_ORIGINS\", \"NOT_SET\")}')
print(f'DEBUG: ALLOWED_HOSTS env = {os.environ.get(\"ALLOWED_HOSTS\", \"NOT_SET\")}')

try:
    from app.core.config import settings
    print(f'DEBUG: CORS_ORIGINS parsed = {settings.CORS_ORIGINS}')
    print(f'DEBUG: ALLOWED_HOSTS parsed = {settings.ALLOWED_HOSTS}')
except Exception as e:
    print(f'❌ Config loading error: {e}')
    traceback.print_exc()
    sys.exit(1)

max_attempts = 30
attempt = 0

while attempt < max_attempts:
    try:
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        conn.close()
        print('✅ データベース接続成功')
        break
    except psycopg2.OperationalError as e:
        attempt += 1
        print(f'⏳ データベース接続待機中... ({attempt}/{max_attempts})')
        time.sleep(2)
else:
    print('❌ データベース接続タイムアウト')
    exit(1)
"

# データベースマイグレーション実行
echo "🔄 データベースマイグレーション実行中..."
alembic upgrade head

# 初期化スクリプト実行
echo "📝 データベース初期化実行中..."
python -m app.scripts.init_database

# FastAPIアプリケーション起動
echo "🚀 FastAPIアプリケーション起動中..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
