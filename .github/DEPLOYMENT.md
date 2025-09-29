# 🚀 GCP デプロイメントガイド

DevRevアプリケーションのGoogle Cloud Platform (GCP)へのデプロイメント設定と運用手順

## 🏗️ デプロイメント戦略

### ブランチベースデプロイメント

| ブランチ | 環境 | VM名 | 自動デプロイ | 目的 |
|---------|------|------|------------|------|
| `main` | Production | `free-vm01` | ✅ 自動 | 本番リリース |

### デプロイメントフロー

```mermaid
graph LR
    A[develop push] --> B[CI/CD Tests]
    B --> C[Docker Build]
    C --> D[Tests Complete]

    E[main push] --> F[CI/CD Tests]
    F --> G[Docker Build]
    G --> H[Deploy to Production]

    D --> I[Manual Review]
    I --> J[Create PR main ← develop]
    J --> H
```

## ⚙️ GCP環境セットアップ

### 必要なリソース

#### 1. Compute Engine インスタンス

```bash
# Production VM作成 (必要な場合)
gcloud compute instances create free-vm01 \
  --zone=us-west1-b \
  --machine-type=e2-standard-2 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --boot-disk-type=pd-standard \
  --tags=http-server,https-server
```

#### 2. ファイアウォール設定

```bash
# HTTP/HTTPS トラフィック許可
gcloud compute firewall-rules create allow-http-https \
  --allow tcp:80,tcp:443,tcp:3000,tcp:8000 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server,https-server
```

#### 3. サービスアカウント設定

```bash
# CI/CD用サービスアカウント作成
gcloud iam service-accounts create devrev-ci-deployer \
  --display-name="DevRev CI/CD Deployer"

# 必要な権限付与
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:devrev-ci-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.instanceAdmin.v1"

# サービスアカウントキー生成（GitHub Secretsに設定）
gcloud iam service-accounts keys create key.json \
  --iam-account=devrev-ci-deployer@$PROJECT_ID.iam.gserviceaccount.com
```

## 🔐 GitHub Secrets設定

以下のシークレットをGitHubリポジトリに設定：

| Secret Name | 説明 | 例 |
|-------------|------|-----|
| `GCP_SA_KEY` | サービスアカウントキー（JSON） | `{"type": "service_account",...}` |
| `GCP_PROJECT_ID` | GCPプロジェクトID | `devrev-project-123456` |
| `GCE_USER` | VM SSH接続ユーザー名 | `ubuntu` または `your-username` |
| `GCE_SSH_KEY` | VM SSH秘密鍵 | `-----BEGIN OPENSSH PRIVATE KEY-----` |

### SSH鍵の設定

```bash
# SSH鍵ペア生成
ssh-keygen -t ed25519 -f ~/.ssh/devrev-deploy -C "devrev-ci-cd"

# 公開鍵をVMに追加
gcloud compute instances add-metadata free-vm01 \
  --metadata ssh-keys="ubuntu:$(cat ~/.ssh/devrev-deploy.pub)"

# 秘密鍵をGitHub Secretsに設定
cat ~/.ssh/devrev-deploy  # この内容をGCE_SSH_KEYに設定
```

## 🖥️ VM初期セットアップ

各VMで以下のセットアップを実行：

### Docker インストール

```bash
# Docker公式インストールスクリプト
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# ユーザーをdockerグループに追加
sudo usermod -aG docker $USER

# Docker Compose プラグインインストール
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 確認
docker --version
docker compose version
```

### アプリケーションディレクトリ準備

```bash
# アプリケーション用ディレクトリ作成
mkdir -p ~/app

# 権限設定
sudo chown -R $USER:$USER ~/app
```

### システムサービス設定（オプション）

```bash
# Docker自動起動設定
sudo systemctl enable docker

# ファイアウォール設定（必要に応じて）
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw --force enable
```

## 🚦 デプロイメント監視・運用

### ヘルスチェック

```bash
# Production環境確認
curl http://PRODUCTION_VM_IP:8000/health
curl http://PRODUCTION_VM_IP:3000
```

### ログ監視

```bash
# SSH接続
ssh -i ~/.ssh/devrev-deploy ubuntu@VM_IP

# コンテナログ確認
docker compose -p devrev-production logs -f

# システムリソース確認
docker stats
df -h
free -h
```

### 障害対応

```bash
# サービス再起動
cd ~/app
docker compose -p devrev-production restart

# 完全再デプロイ
docker compose -p devrev-production down
docker compose -p devrev-production up -d --force-recreate

# 前バージョンへのロールバック（手動）
docker images | grep driverev  # 利用可能なイメージ確認
# GitHub Actionsからの再デプロイを推奨
```

## 📊 パフォーマンス監視

### リソース使用量確認

```bash
#!/bin/bash
# monitoring.sh - VM監視スクリプト

echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//'

echo "Memory Usage:"
free -h

echo "Disk Usage:"
df -h /

echo "=== Docker Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "=== Container Resources ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### アラート設定（推奨）

```yaml
# .github/workflows/monitoring.yml
name: Production Health Check
on:
  schedule:
    - cron: '*/15 * * * *'  # 15分ごと

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Production Health
        run: |
          curl -f http://PRODUCTION_IP:8000/health || exit 1
          curl -f http://PRODUCTION_IP:3000 || exit 1
```

## 🔄 CI/CD ワークフローカスタマイズ

### デプロイメントスキップ

```bash
# 緊急時にデプロイメントを一時停止
gh workflow run optimized-ci.yml \
  --ref develop \
  -f skip_deploy=true
```

### 手動デプロイメント

```bash
# 特定ブランチの手動デプロイ
gh workflow run optimized-ci.yml \
  --ref feature/emergency-fix \
  -f branch=feature/emergency-fix
```

## 💡 ベストプラクティス

### 1. ゼロダウンタイムデプロイ

```bash
# ヘルスチェック待機付きデプロイ
docker compose -p devrev-production up -d --wait --wait-timeout 300
```

### 2. 設定の外部化

```bash
# 環境変数ファイル管理
echo "DATABASE_URL=production-db-url" >> ~/app-production/.env
echo "REDIS_URL=production-redis-url" >> ~/app-production/.env
```

### 3. バックアップ戦略

```bash
# データベースダンプ（定期実行推奨）
docker compose -p devrev-production exec postgres pg_dump -U postgres driverev_db > backup-$(date +%Y%m%d).sql
```

### 4. SSL/TLS設定（推奨）

```bash
# Let's Encrypt証明書取得
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

---

## 🆘 トラブルシューティング

### よくある問題

| 問題 | 原因 | 対処法 |
|------|------|--------|
| SSH接続失敗 | VM停止/IP変更 | `gcloud compute instances start VM_NAME` |
| コンテナ起動失敗 | イメージ破損 | `docker system prune -f && 再デプロイ` |
| ヘルスチェック失敗 | アプリエラー | `docker compose logs`でエラー確認 |
| ディスク容量不足 | ログ肥大化 | `docker system prune -a` |

### サポート

問題解決しない場合：
1. GitHub Actionsログを確認
2. VM SSH接続してコンテナログ確認
3. [Issues](../issues)で報告