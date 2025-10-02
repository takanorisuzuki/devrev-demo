#!/bin/bash
set -e

echo "🚀 DriveRev Backend Container Starting..."

# データベース接続を待機
echo "⏳ データベース接続を待機中..."
python -c "
import time
import psycopg2
from app.core.config import settings

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
