# 技術スタック

## プログラミング言語
- **Python 3.12** (Alpine Linux base)

## Webフレームワーク
- **FastAPI 0.104+** - 高性能な非同期Webフレームワーク
- **Uvicorn** - ASGI サーバー

## データベース
- **PostgreSQL** - メインデータベース
- **SQLite** - テスト用データベース
- **SQLAlchemy 2.0+** - ORM
- **Alembic 1.12+** - データベースマイグレーション
- **asyncpg** - 非同期PostgreSQLドライバ
- **psycopg2-binary** - 同期PostgreSQLドライバ

## 認証・セキュリティ
- **python-jose[cryptography]** - JWT処理
- **PyJWT 2.8+** - JWTトークン生成・検証
- **passlib[bcrypt] 1.7.4** - パスワードハッシング
- **bcrypt 4.0.1** - 暗号化（passlib 1.7.4との互換性のために固定）

## バリデーション
- **Pydantic 2.5+** - データバリデーション
- **pydantic-settings 2.1+** - 環境変数管理
- **email-validator 2.1+** - メールアドレス検証

## 非同期処理・HTTP
- **httpx 0.25+** - 非同期HTTPクライアント
- **aiofiles 23.2+** - 非同期ファイルI/O

## キャッシュ
- **Redis 5.0+** - キャッシング
- **aioredis 2.0+** - 非同期Redisクライアント

## テストフレームワーク
- **pytest 7.4+** - テストフレームワーク
- **pytest-asyncio 0.21+** - 非同期テスト対応
- **pytest-cov 4.1+** - カバレッジ計測

## 開発ツール
- **black 23.11+** - コードフォーマッター
- **flake8 6.1+** - Linter
- **mypy 1.7+** - 型チェッカー
- **isort 5.12+** - Import文整理

## ロギング・モニタリング
- **structlog 23.2+** - 構造化ロギング

## その他
- **python-dateutil 2.8+** - 日時処理
- **python-dotenv 1.0+** - 環境変数読み込み
- **click 8.1+** - CLIツール
- **celery 5.3+** - バックグラウンドタスク
- **fastapi-mail 1.4+** - メール送信（オプション）

## コンテナ化
- **Docker** - Multi-stage build with Alpine Linux
- **Docker Compose** - オーケストレーション