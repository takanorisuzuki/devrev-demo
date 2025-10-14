# 推奨コマンド一覧

## 開発コマンド

### アプリケーション起動
```bash
# ローカル開発サーバー起動
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Docker Compose で起動
docker-compose up -d backend
```

### データベース管理
```bash
# マイグレーション作成
alembic revision --autogenerate -m "description"

# マイグレーション実行
alembic upgrade head

# マイグレーションロールバック
alembic downgrade -1

# データベース初期化とシード実行
python -m app.scripts.init_database
```

### テスト
```bash
# 全テスト実行
pytest

# カバレッジ付きテスト
pytest --cov=app --cov-report=html

# 非同期テスト実行
pytest -v tests/

# 特定のテストファイル実行
pytest tests/test_main.py
```

### コード品質
```bash
# フォーマット（Black）
black app/ tests/

# Linting（Flake8）
flake8 app/ tests/

# Import整理（isort）
isort app/ tests/

# 型チェック（mypy）
mypy app/

# まとめて実行
black app/ tests/ && isort app/ tests/ && flake8 app/ tests/ && mypy app/
```

### データベーススクリプト
```bash
# サンプルユーザー作成
python -m app.scripts.create_sample_users

# サンプル車両作成
python -m app.scripts.create_sample_vehicles

# サンプル店舗作成
python -m app.scripts.create_sample_stores

# サンプル予約作成
python -m app.scripts.create_sample_reservations

# デモ車両リセットと再作成
python -m app.scripts.reset_and_seed_demo_vehicles
```

### システムユーティリティ（macOS/Darwin）
```bash
# ファイル検索
find . -name "*.py" -type f

# パターン検索（grep）
grep -r "FastAPI" app/

# ディレクトリ一覧
ls -la

# プロセス確認
ps aux | grep python

# ポート確認
lsof -i :8000

# ディレクトリ移動
cd /path/to/backend
```

### Docker操作
```bash
# イメージビルド
docker build -t driverev-backend .

# コンテナ起動
docker run -p 8000:8000 driverev-backend

# ログ確認
docker logs -f <container_id>

# コンテナ内でシェル実行
docker exec -it <container_id> sh
```