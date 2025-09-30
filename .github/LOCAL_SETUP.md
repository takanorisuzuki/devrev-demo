# ローカル開発環境セットアップガイド

このガイドではDevRevプロジェクトのローカル開発環境をDocker/Podmanで構築する方法を説明します。

## 🐳 コンテナランタイムの選択

### Docker（推奨）

**メリット:**
- CI/CDとの完全互換性
- 豊富なドキュメントとコミュニティ
- GitHub Actionsとの親和性

**インストール:**

```bash
# macOS (Homebrew)
brew install --cask docker

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose-v2

# 起動と確認
docker --version
docker compose version
```

### Podman（軽量・rootless）

**メリット:**
- rootlessで動作
- システムリソース効率が良い
- Docker互換コマンド

**インストール:**

```bash
# macOS (Homebrew)
brew install podman podman-compose

# Ubuntu/Debian
sudo apt-get install podman podman-compose

# 起動と確認
podman --version
podman-compose --version
```

## 🚀 開発環境起動

### Docker使用の場合

```bash
# リポジトリクローン
git clone <your-repo-url>
cd devrev-demo

# 環境変数設定
cp env.example .env
# .envを編集して必要な値を設定

# サービス起動
docker compose up -d

# ログ確認
docker compose logs -f

# 停止
docker compose down
```

### Podman使用の場合

```bash
# リポジトリクローン
git clone <your-repo-url>
cd devrev-demo

# 環境変数設定
cp env.example .env
# .envを編集して必要な値を設定

# サービス起動
podman-compose up -d
# または新しいpodman compose
podman compose up -d

# ログ確認
podman-compose logs -f

# 停止
podman-compose down
```

## 📋 セットアップ確認

### サービス起動確認

```bash
# ヘルスチェック
curl http://localhost:8000/health  # Backend
curl http://localhost:3000         # Frontend
curl http://localhost:5432         # PostgreSQL (接続確認)
curl http://localhost:6379         # Redis (接続確認)
```

### 開発用コマンド

```bash
# フロントエンド
cd frontend
npm run dev          # 開発サーバー
npm run lint         # リント
npm run type-check   # 型チェック
npm test             # テスト

# バックエンド
cd backend
python -m pytest    # テスト
python -m flake8 app/  # リント
python -m black app/   # コード整形
```

## 🔧 トラブルシューティング

### ポート競合

```bash
# 使用中のポートを確認
lsof -i :3000  # フロントエンド
lsof -i :8000  # バックエンド
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# docker-compose.ymlのportsセクションを変更
ports:
  - "3001:3000"  # ローカル3001 -> コンテナ3000
```

### 権限問題（Podman on Linux）

```bash
# SELinux対応（CentOS/RHEL/Fedora）
sudo setsebool -P container_manage_cgroup true

# ファイル権限確認
ls -la .
# 必要に応じて所有者変更
sudo chown -R $USER:$USER .
```

### ボリューム同期問題

```bash
# ファイル変更が反映されない場合
docker compose down
docker compose up --build

# または個別サービス再構築
docker compose up --build frontend
docker compose up --build backend
```

### データベース初期化

```bash
# PostgreSQLボリュームリセット
docker compose down
docker volume rm devrev-demo_postgres_data
docker compose up -d postgres

# データベースマイグレーション
docker compose exec backend python -m alembic upgrade head
```

## ⚡ パフォーマンス最適化

### Docker Desktop（macOS/Windows）

```bash
# Docker Desktop設定での推奨値
# Memory: 6GB以上
# CPUs: 4コア以上
# Swap: 2GB
# Disk image size: 100GB以上

# .dockerignore活用
echo "node_modules" >> .dockerignore
echo "__pycache__" >> .dockerignore
echo ".git" >> .dockerignore
```

### Linux環境

```bash
# Docker Buildxでマルチプラットフォームビルド有効化
docker buildx create --use --name builder

# ビルドキャッシュ活用
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

## 🔄 CI/CDとの一貫性確保

### 環境変数確認

```bash
# CI環境と同じ変数を使用
export NODE_VERSION=20
export PYTHON_VERSION=3.12
export POSTGRES_PASSWORD=postgres123
export SECRET_KEY=test-secret-key
```

### テスト実行（CI相当）

```bash
# フロントエンド（CI相当テスト）
cd frontend
npm ci
npm run lint
npm run type-check
npm run test:coverage
npm run build

# バックエンド（CI相当テスト）
cd backend
pip install -r requirements.txt
flake8 app/ --max-line-length=88 --extend-ignore=E203,W503
black --check app/
isort --check-only --profile=black app/
pytest --cov=app --cov-report=xml
```

## 💡 開発効率化のヒント

### VSCode DevContainer（推奨）

```json
// .devcontainer/devcontainer.json
{
  "name": "DevRev Development",
  "dockerComposeFile": "../compose.yml",
  "service": "backend",
  "workspaceFolder": "/app",
  "shutdownAction": "stopCompose"
}
```

### ホットリロード確認

```bash
# ファイル変更監視が正しく動作するか確認
echo "console.log('test')" >> frontend/pages/index.tsx
# ブラウザで変更が即座に反映されることを確認
```

### デバッグ環境

```bash
# Python デバッガ
docker compose exec backend python -m pdb app/main.py

# Node.js デバッガ
docker compose exec frontend npm run dev:debug
```

---

## 📞 サポート

問題が解決しない場合：
1. [Issues](../issues)で既存の問題を確認
2. 新しいIssueを作成（環境情報を含める）
3. [SOLO_DEVELOPMENT.md](./SOLO_DEVELOPMENT.md)も参照