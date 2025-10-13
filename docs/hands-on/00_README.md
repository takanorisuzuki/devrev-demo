# DriveRev ハンズオンラボ - DevRev AI Agent 開発実践ガイド

## 🎯 目的

このハンズオンラボは、**日本のお客様とパートナー**が DevRev の AI Agent 機能を実践的に学ぶための環境です。DriveRev（レンタカーサイト）を題材に、自身の DevRev Trial 組織を使って、実際に公開されているサイトで AI Agent の開発、テスト、デプロイメントを体験できます。

### DriveRev セルフラーニングサイトの利用モード（Living Docs）

- **ゲストモード（未ログイン）**  
  DriveRev ではゲストユーザーが即座に体験できるよう、運営側で用意した固定 App ID / AAT / PAT を Global 設定として保持しています。ゲストが PLuG チャットを開くと、この共有アカウントで DevRev と連携したサポート体験が得られます。実際のトークン値は社内管理のため公開しません。

- **パーソナルモード（ログイン済み）**  
  DriveRev にユーザー登録したあとは、プロフィール画面で自分の DevRev App ID / PAT / AAT を登録できます。`個人設定を有効化` をオンにすると、以後はご自身の DevRev 組織の PLuG チャットが表示され、カスタマイズ内容（Workflow、Knowledge、Branding）をそのまま DriveRev でセルフテストできます。

- **運用上の注意**  
  固定トークンや内部運用の詳細は公開せず、Git リポジトリではマスキングしたサンプル値のみを管理します。非機能要件（リトライ、監視など）は内部ガイドラインに従い、本ドキュメントには必要最小限のみ記載します。

## 🌟 学習目標

1. **DevRev PLuG 統合**: 実際の Web アプリケーションに PLuG チャットを統合（ゲスト／個人設定双方に対応）
2. **ユーザー ID マネジメント**: Session Token を使った安全なユーザー認証
3. **API 連携**: DriveRev の API を使った DevRev Workflow 開発
4. **Knowledge Base**: DevRev KB と AI Agent の連携
5. **予約システム**: カレンダー機能を使った実践的なユースケース
6. **セルフラーニング**: ドキュメントとハンズオンガイドで自己学習可能

## 📚 ドキュメント構成

### 設計ドキュメント

1. **[01_ARCHITECTURE.md](./01_ARCHITECTURE.md)** - アーキテクチャ比較と設計方針

   - 参照システムと DriveRev の技術スタック比較
   - Flask vs FastAPI/Next.js
    <!-- - セッション認証 vs JWT 認証 -->
   - セッション認証 vs JWT 認証
   - 設計上の重要な決定事項

2. **[02_FEATURE_COMPARISON.md](./02_FEATURE_COMPARISON.md)** - 機能比較と実装ギャップ

   - 参照システムの全機能リスト
   - DriveRev の現状機能
   - 実装が必要な機能の優先順位
   - 参照システムと DriveRev の機能対応表

3. **[03_IMPLEMENTATION_PLAN.md](./03_IMPLEMENTATION_PLAN.md)** - 段階的実装計画

   - Phase 1: DevRev PLuG 基盤（User Profile, Session Token）
   - Phase 2: API Key 管理と Workflow 連携
   - Phase 3: 予約カレンダーシステム
   - Phase 4: Knowledge Base 統合
   - Phase 5: 高度な Workflow（自動化、通知）

4. **[04_DEVREV_INTEGRATION.md](./04_DEVREV_INTEGRATION.md)** - DevRev 統合詳細設計

   - PLuG SDK 初期化
   - Session Token 生成とライフサイクル
   - RevUser ID 管理
   - API Key 生成とセキュリティ
   - Workflow Skill の実装パターン

5. **[05_RESERVATION_SYSTEM.md](./05_RESERVATION_SYSTEM.md)** - 予約システム設計

   - カレンダーコンポーネント設計
   - 車両在庫管理
   - 予約 API エンドポイント
   - スタッフスケジュール管理
   - 空き時間検索アルゴリズム

6. **[06_API_DESIGN.md](./06_API_DESIGN.md)** - API 設計
   - エンドポイント一覧
   - リクエスト/レスポンス仕様
   - 認証方法（JWT, API Key, DevRev AAT）
   - エラーハンドリング
   - Rate Limiting

### 実践ガイド

7. **[07_LAB_GUIDE_JA.md](./07_LAB_GUIDE_JA.md)** - ハンズオンラボガイド（日本語）
   - 環境セットアップ
   - ステップバイステップの演習
   - トラブルシューティング
   - 検証方法

### サンプルコード

8. **[workflows/](./workflows/)** - DevRev Workflow テンプレート
   - `get-api-key.json` - API Key 取得 Workflow
   - `get-user-info.json` - ユーザー情報取得
   - `book-reservation.json` - 予約作成
   - `get-available-slots.json` - 空き時間検索
   - `get-all-vehicles.json` - 車両一覧取得

## 🚀 クイックスタート

### 前提条件

1. **DevRev Trial 組織**: [https://app.devrev.ai](https://app.devrev.ai) でサインアップ
2. **PLuG App 作成**: DevRev コンソールで PLuG Chat アプリを作成
3. **Application Access Token (AAT)**: DevRev API アクセス用トークン

### セットアップ手順

1. **DriveRev のローカル環境構築**

   ```bash
   git clone <repository-url>
   cd devrev-demo

   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Frontend
   cd ../frontend
   npm install
   ```

2. **環境変数設定**

   ```bash
   # backend/.env
   DATABASE_URL=postgresql://user:pass@localhost/driverev
   JWT_SECRET_KEY=your-secret-key

   # frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **データベース初期化**

   ```bash
   cd backend
   alembic upgrade head
   python -m app.scripts.init_data
   ```

4. **アプリケーション起動**

   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn app.main:app --reload --port 8000

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

5. **DevRev 設定**
   - DriveRev にログイン
   - User Profile → DevRev Integration
   - PLuG App ID と AAT を入力
   - Session Token 生成を確認

## 📖 学習パス

### 初級（2-3 時間）

1. **環境セットアップ** → [07_LAB_GUIDE_JA.md](./07_LAB_GUIDE_JA.md) Section 1
2. **PLuG 統合** → [04_DEVREV_INTEGRATION.md](./04_DEVREV_INTEGRATION.md) + Lab Guide Section 2
3. **最初の Workflow** → Lab Guide Section 3

### 中級（4-6 時間）

4. **API Key 管理** → [04_DEVREV_INTEGRATION.md](./04_DEVREV_INTEGRATION.md) Section 3
5. **予約 Workflow 作成** → [05_RESERVATION_SYSTEM.md](./05_RESERVATION_SYSTEM.md) + Lab Guide Section 4
6. **Knowledge Base 連携** → Lab Guide Section 5

### 上級（8-10 時間）

7. **高度な Workflow** → Lab Guide Section 6
8. **カスタム Agent 開発** → Lab Guide Section 7
9. **本番デプロイメント** → Lab Guide Section 8

## 🎓 学習成果

このハンズオンラボを完了すると、以下のスキルが習得できます：

- ✅ DevRev PLuG SDK の統合方法
- ✅ Session Token を使った安全なユーザー認証
- ✅ DevRev Workflow と External API の連携
- ✅ AI Agent のカスタマイズとトレーニング
- ✅ Knowledge Base の構築と活用
- ✅ 実践的なカスタマーサポートシステムの構築

## 📞 サポート

- **質問**: DevRev Community フォーラム
- **バグ報告**: GitHub Issues
- **フィードバック**: プロジェクトメンテナーに連絡

## 🔄 バージョン履歴

- **v1.0.0** (2025-01-16): 初版リリース
  - 参照システム<!-- 旧称: PetStore --> ベースの機能分析
  - 基本的な DevRev 統合設計
  - ハンズオンラボガイド（日本語）

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

**次のステップ**: [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) でアーキテクチャ設計を確認しましょう。
