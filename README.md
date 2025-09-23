# 🚗 DriveRev - レンタカーサービス デモ

DriveRev は日本のレンタカーサービスのデモアプリケーションです。本格的なフルスタック Web アプリケーションの例として作成されました。

## 🚀 クイックスタート

### 前提条件

- Podman

### 起動方法

1. **リポジトリをクローン**

   ```bash
   git clone <このリポジトリのURL>
   cd devrev-demo
   ```

2. **環境変数ファイルをコピー**

   ```bash
   cp env.example .env
   ```

3. **アプリケーションを起動**

   ```bash
   podman compose up -d
   ```

4. **アクセス**
   - **Web アプリ**: http://localhost:3000
   - **API**: http://localhost:8000
   - **API ドキュメント (Swagger)**: http://localhost:8000/docs
   - **API ドキュメント (ReDoc)**: http://localhost:8000/redoc

## 🔑 デモアカウント

以下のアカウントでログインしてお試しいただけます：

### 管理者アカウント

- **Email**: admin@driverev.jp
- **Password**: AdminPass123!

### 顧客アカウント

- **Email**: customer1@example.com
- **Password**: Customer123!

- **Email**: customer2@example.com
- **Password**: Customer456!

## 🏗️ 技術スタック

### フロントエンド

- **Next.js 14** - React フレームワーク
- **TypeScript** - 型安全な JavaScript
- **Tailwind CSS** - ユーティリティファーストの CSS フレームワーク
- **shadcn/ui** - モダンな UI コンポーネント

### バックエンド

- **FastAPI** - 高パフォーマンス Python API フレームワーク
- **PostgreSQL** - リレーショナルデータベース
- **Redis** - キャッシュとセッション管理
- **SQLAlchemy** - Python ORM
- **JWT** - 認証システム

### インフラ

- **Podman** - コンテナ化
- **Podman Compose** - マルチコンテナ管理

### アーキテクチャ

このアプリケーションは以下の 4 つのコンテナで構成されています：

- **Frontend** (Next.js) - ポート 3000 で動作する Web アプリケーション
- **Backend** (FastAPI) - ポート 8000 で動作する API サーバー
- **PostgreSQL** - ポート 5432 で動作するデータベース
- **Redis** - ポート 6379 で動作するキャッシュサーバー

各コンテナは独立したネットワークで通信し、データは永続化ボリュームに保存されます。

## 📱 主な機能

### 🔐 認証・認可

- ユーザー登録・ログイン
- JWT トークンベース認証
- ロールベースアクセス制御（管理者・顧客）

### 🚗 車両管理

- 車両一覧・詳細表示
- 車種・タイプ別フィルター
- 車両在庫管理

### 📅 予約システム

- 日時・場所指定での予約
- 予約状況確認
- 予約変更・キャンセル

### 🏪 店舗管理

- 複数店舗対応
- 営業時間管理
- 店舗別在庫管理

### 👨‍💼 管理機能

- ダッシュボード
- ユーザー管理
- 車両管理
- 予約管理
- 統計情報

## 🛠️ 開発情報

### データベース初期化

アプリケーション起動時に自動的にサンプルデータが投入されます。

### ログ確認

```bash
# 全サービスのログ
podman compose logs

# 特定サービスのログ
podman compose logs backend
podman compose logs frontend
```

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 🤝 貢献

このプロジェクトはデモ目的で作成されています。フィードバックや改善提案は Issue または Pull Request でお気軽にお送りください。

---

**注意**: このアプリケーションはデモ目的で作成されており、本番環境での使用は想定されていません。セキュリティ設定やデータベース設定は開発・デモ用途に最適化されています。
