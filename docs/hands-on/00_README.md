# DriveRev ハンズオンラボ - DevRev AI Agent 開発実践ガイド

## 🎯 目的

このハンズオンラボは、**日本のお客様とパートナー**が DevRev の AI Agent 機能を実践的に学ぶための環境です。DriveRev（レンタカーサイト）を題材に、自身の DevRev Trial 組織を使って、実際に公開されているサイトで AI Agent の開発、テスト、デプロイメントを体験できます。

### DriveRev セルフラーニングサイトの利用モード（Living Docs）

- **ゲストモード（未ログイン）**  
  DriveRev ではゲストユーザーが即座に体験できるよう、運営側で用意した固定 App ID / AAT / PAT を Global 設定として保持しています。ゲストが PLuG チャットを開くと、この共有アカウントで DevRev と連携したサポート体験が得られます。実際のトークン値は社内管理のため公開しません。

- **パーソナルモード（ログイン済み）**  
  DriveRev にユーザー登録したあとは、プロフィール画面で自分の DevRev App ID / PAT / AAT を登録できます。`個人設定を有効化` をオンにすると、以後はご自身の DevRev 組織の PLuG チャットが表示され、カスタマイズ内容（Workflow、Knowledge、Branding）をそのまま DriveRev でセルフテストできます。

- **運用上の注意**  
  固定トークンや内部運用の詳細は公開せず、Git リポジトリではマスキングしたサンプル値のみを管理します。非機能要件（リトライ、監視など）は内部ガイドラインに従い、本ドキュメントには必要最小限のみ記載します。実際のトークンや認証情報が必要な場合はプロジェクト管理者に個別に問い合わせてください。

---

## 🚀 まずはここから（3 ステップで始める）

**初めての方へ**: 以下の 3 ステップで、あなたに最適な学習ルートが見つかります。

### ステップ 1: あなたの目的を選ぶ

| 目的                                    | おすすめドキュメント                                                                                             | 所要時間 |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| **🎯 とりあえず動かしてみたい**         | [07_LAB_GUIDE_JA.md](./07_LAB_GUIDE_JA.md) → 環境構築から PLuG 動作まで体験                                      | 2-3 時間 |
| **👨‍💻 実装を担当する（開発者）**         | [05_IMPLEMENTATION_ANALYSIS.md](./05_IMPLEMENTATION_ANALYSIS.md) ⭐ → [03 実装計画](./03_IMPLEMENTATION_PLAN.md) | 3-4 時間 |
| **🏗️ 設計を理解したい（アーキテクト）** | [05_IMPLEMENTATION_ANALYSIS.md](./05_IMPLEMENTATION_ANALYSIS.md) ⭐ → [01 アーキテクチャ](./01_ARCHITECTURE.md)  | 2-3 時間 |
| **📊 プロジェクトを管理する（PM）**     | [05_IMPLEMENTATION_ANALYSIS.md](./05_IMPLEMENTATION_ANALYSIS.md) ⭐ → [03 実装計画](./03_IMPLEMENTATION_PLAN.md) | 2-3 時間 |

### ステップ 2: 用語を確認する（必要に応じて）

初めて DevRev や DriveRev に触れる方は、下の [📖 用語集](#用語集) を先に確認すると理解がスムーズです。

### ステップ 3: ドキュメントを読み進める

選んだドキュメントから読み始めましょう。各ドキュメントは相互にリンクされているので、必要に応じて関連ページに移動できます。

---

**💡 よくある質問**:

- **「どのドキュメントから読めばいいかわからない」** → [読者別学習パス](#読者別学習パス) で詳細なガイドを確認
- **「エラーが出た」** → [よくあるエラーと解決方法](#よくあるエラーと解決方法) を確認
- **「環境構築の手順が知りたい」** → [クイックスタート](#クイックスタート) で 10 分でセットアップ

---

## 📖 用語集

このプロジェクトで使用される専門用語の説明です。初めての方はまずこちらをご確認ください。

### DevRev 関連

| 用語                | 正式名称                          | 説明                                                                                                |
| ------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| **PLuG**            | PLuG Chat Widget                  | DevRev が提供するチャットウィジェット。Web サイトに埋め込んでカスタマーサポートを提供               |
| **AAT**             | Application Access Token          | DevRev API にアクセスするためのアプリケーション認証トークン。サーバーサイドで使用                   |
| **PAT**             | Personal Access Token             | ユーザー個人の DevRev API アクセストークン。開発・テスト用                                          |
| **Session Token**   | User Session Token                | PLuG Chat で特定ユーザーを識別するための一時トークン。AAT から生成され、有効期限あり（通常 1 時間） |
| **RevUser**         | DevRev User                       | DevRev 上のユーザーアカウント。Session Token に紐づくユーザー ID                                    |
| **Workflow Skills** | DevRev Agent Skills               | AI Agent が実行できるアクション（API 呼び出し、データ取得など）の定義                               |
| **Agent**           | AI Agent / Conversational Support | DevRev の AI チャットボット。ユーザーの質問に自動応答                                               |
| **Knowledge Base**  | Knowledge Articles                | Agent が参照する FAQ、マニュアルなどのドキュメント                                                  |

### DriveRev 関連

| 用語                   | 説明                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| **参照システム**       | このプロジェクトのベースとなったサンプルシステム（旧称: PetStore）。アーキテクチャと DevRev 統合パターンの参考 |
| **Global 設定**        | 全ユーザー共通の DevRev 設定。ゲストユーザーはこの設定を使用                                                   |
| **Personal 設定**      | ログイン済みユーザーが自分の DevRev 組織を使うための個人設定                                                   |
| **Session Token 管理** | ユーザーごとに Session Token を DB で管理する仕組み。キャッシュとして機能し、有効期限内は再利用                |

---

## 🌟 学習目標

このハンズオンラボを完了すると、以下のスキルが習得できます：

1. **DevRev PLuG 統合**: 実際の Web アプリケーションに PLuG チャットを統合（ゲスト／個人設定双方に対応）
2. **ユーザー ID マネジメント**: Session Token を使った安全なユーザー認証
3. **API 連携**: DriveRev の API を使った DevRev Workflow 開発
4. **Knowledge Base**: DevRev KB と AI Agent の連携
5. **予約システム**: カレンダー機能を使った実践的なユースケース
6. **セルフラーニング**: ドキュメントとハンズオンガイドで自己学習可能

---

## 🏗️ システムアーキテクチャ概要

DriveRev と DevRev Platform の関係を理解するための全体図です。

```
┌─────────────────────────────────────────────────────────────┐
│                      DriveRev System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐         ┌─────────────┐                     │
│  │  Frontend   │◄───────►│  Backend    │                     │
│  │  (Next.js)  │         │  (FastAPI)  │                     │
│  └──────┬──────┘         └──────┬──────┘                     │
│         │                       │                             │
│         │ PLuG Widget           │ API Calls                   │
│         │                       │                             │
└─────────┼───────────────────────┼─────────────────────────────┘
          │                       │
          │                       │
          ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      DevRev Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  PLuG Chat   │    │  AI Agent    │    │  Knowledge   │   │
│  │  (Widget)    │◄──►│  (Workflows) │◄──►│  Base        │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 認証フロー

1. User → DriveRev Frontend (ログイン)
2. Frontend → Backend (`/devrev/session-token` API)
3. Backend → DevRev (AAT 使用で Session Token 生成)
4. Backend → Frontend (Session Token 返却)
5. Frontend → PLuG SDK (Session Token 使用で初期化)
6. PLuG Widget 表示

### DevRev 連携の 2 つのモード

- **Global 設定**: 全ユーザー共通の AAT（ゲストユーザー向け）
- **Personal 設定**: ユーザー個別の AAT（自分の DevRev 組織を使用）

---

## 📚 ドキュメント構成

### 設計ドキュメント

1. **[01_ARCHITECTURE.md](./01_ARCHITECTURE.md)** - アーキテクチャ比較と設計方針

   - 参照システムと DriveRev の技術スタック比較
   - Flask vs FastAPI/Next.js
   - セッション認証 vs JWT 認証
   - 設計上の重要な決定事項

2. **[02_FEATURE_COMPARISON.md](./02_FEATURE_COMPARISON.md)** - 機能比較と実装ギャップ

   - 参照システムの全機能リスト
   - DriveRev の現状機能
   - 実装が必要な機能の優先順位
   - 参照システムと DriveRev の機能対応表

3. **[03_IMPLEMENTATION_PLAN.md](./03_IMPLEMENTATION_PLAN.md)** - 段階的実装計画（12 週間）

   - Phase 1: DevRev PLuG 基盤 + Global Config（Week 1-2）
   - Phase 2: API Key 管理（Week 3）
   - Phase 3: 予約カレンダー基盤（Week 4-5）
   - Phase 4: 決済統合 API 強化（Week 4-5）
   - Phase 5: Workflow Skills 15 個（Week 7-10）
   - Phase 6: Knowledge Base 統合

4. **[04_DEVREV_INTEGRATION.md](./04_DEVREV_INTEGRATION.md)** - DevRev 統合詳細設計

   - PLuG SDK 初期化
   - Session Token 生成とライフサイクル
   - RevUser ID 管理
   - API Key 生成とセキュリティ
   - Workflow Skill の実装パターン

5. **[05_IMPLEMENTATION_ANALYSIS.md](./05_IMPLEMENTATION_ANALYSIS.md)** - 実装分析レポート ⭐ **重要**

   - **13 の Critical/High/Medium Issues** の詳細分析
   - 参照システムと DriveRev の GAP 分析
   - 推奨される実装ロードマップ（12 週間）
   - セキュリティ・パフォーマンス・テスト戦略
   - **実装前に必読**のドキュメント

<!-- 将来の拡張予定
6. **[05_RESERVATION_SYSTEM.md](./05_RESERVATION_SYSTEM.md)** - 予約システム設計（Phase 3実装時に作成）
   - カレンダーコンポーネント設計
   - 車両在庫管理
   - 予約 API エンドポイント
   - スタッフスケジュール管理
   - 空き時間検索アルゴリズム

7. **[06_API_DESIGN.md](./06_API_DESIGN.md)** - API 設計（Phase 2実装時に作成）
   - エンドポイント一覧
   - リクエスト/レスポンス仕様
   - 認証方法（JWT, API Key, DevRev AAT）
   - エラーハンドリング
   - Rate Limiting
-->

### 実践ガイド

6. **[07_LAB_GUIDE_JA.md](./07_LAB_GUIDE_JA.md)** - ハンズオンラボガイド（日本語）
   - 環境セットアップ
   - ステップバイステップの演習
   - トラブルシューティング
   - 検証方法

### サンプルコード

7. **[workflows/](./workflows/)** - DevRev Workflow テンプレート
   - `get-api-key.json` - API Key 取得 Workflow
   - `get-user-info.json` - ユーザー情報取得
   - `book-reservation.json` - 予約作成
   - 使い方は [workflows/README.md](./workflows/README.md) を参照

---

## 👥 読者別学習パス

あなたの目的に応じて、最適な読み方を選んでください。

### 🎯 とりあえず動かしてみたい方

1. [07_LAB_GUIDE_JA.md](./07_LAB_GUIDE_JA.md) - ハンズオンラボガイド
   - **所要時間**: 2-3 時間
   - **前提知識**: なし
   - **成果**: DriveRev で PLuG Chat を動かせる

### 🏗️ システムアーキテクチャを理解したい方

1. [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) - アーキテクチャ比較
2. [02_FEATURE_COMPARISON.md](./02_FEATURE_COMPARISON.md) - 機能比較
3. [05_IMPLEMENTATION_ANALYSIS.md](./05_IMPLEMENTATION_ANALYSIS.md) - 実装分析
   - **所要時間**: 1-2 時間
   - **前提知識**: Web 開発の基礎
   - **成果**: システム全体の設計思想を理解

### 👨‍💻 実装を担当する開発者向け

1. **[05_IMPLEMENTATION_ANALYSIS.md](./05_IMPLEMENTATION_ANALYSIS.md) - 最初に必読** ⭐
   - 13 の Critical/High/Medium Issues を把握
   - 推奨される実装順序を確認
2. [03_IMPLEMENTATION_PLAN.md](./03_IMPLEMENTATION_PLAN.md) - 実装計画
   - Phase 1 から順に実装
   - タスク依存関係を確認
3. [04_DEVREV_INTEGRATION.md](./04_DEVREV_INTEGRATION.md) - DevRev 統合詳細
   - 実装時のリファレンス
   - **所要時間**: 3-4 時間
   - **前提知識**: Python/TypeScript, FastAPI/Next.js
   - **成果**: Phase 1 実装を開始できる

### 📊 プロジェクト管理者・アーキテクト向け

1. **[05_IMPLEMENTATION_ANALYSIS.md](./05_IMPLEMENTATION_ANALYSIS.md) - 最初に必読** ⭐
   - Critical Issues の把握と意思決定
   - セキュリティ・パフォーマンスリスクの確認
2. [03_IMPLEMENTATION_PLAN.md](./03_IMPLEMENTATION_PLAN.md) - 実装計画
   - 12 週間のロードマップ、工数見積もり
3. [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) + [02_FEATURE_COMPARISON.md](./02_FEATURE_COMPARISON.md)
   - 設計レビュー用
   - **所要時間**: 2-3 時間
   - **前提知識**: システム設計の経験
   - **成果**: Phase 0 計画承認ができる

---

## 🚀 クイックスタート

### 前提条件

**必要なソフトウェア**:

- Python 3.11 以上
- Node.js 18 以上
- PostgreSQL 14 以上（または SQLite for 開発）
- Git

**DevRev 関連**:

1. **DevRev Trial 組織**: [https://app.devrev.ai](https://app.devrev.ai) でサインアップ
2. **PLuG App 作成**: DevRev コンソールで PLuG Chat アプリを作成
3. **Application Access Token (AAT)**: DevRev API アクセス用トークン

### セットアップ手順（10 分）

**1. リポジトリのクローン**

```bash
git clone https://github.com/takanorisuzuki/devrev-demo.git
cd devrev-demo
```

**2. Backend セットアップ**

```bash
cd backend

# Python仮想環境の作成
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp env.example .env
# .envファイルを編集してDATABASE_URL、JWT_SECRET_KEYなどを設定

# データベースの初期化
alembic upgrade head

# サンプルデータの投入（オプション）
python -m app.scripts.seed_data
```

**3. Frontend セットアップ**

```bash
cd ../frontend

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localファイルを編集してNEXT_PUBLIC_API_URLを設定
```

**4. 起動**

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

**5. 動作確認**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs (Swagger UI)
- ログイン: `test@example.com` / `password123`

**6. DevRev 設定（オプション）**

1. DriveRev にログイン
2. User Profile → DevRev Integration
3. PLuG App ID と AAT を入力
4. 「個人設定を有効化」をオン
5. Session Token 生成を確認

---

## 🔧 よくあるエラーと解決方法

### Backend 起動時のエラー

| エラーメッセージ                                                            | 原因                          | 解決方法                                             |
| --------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------- |
| `ModuleNotFoundError: No module named 'fastapi'`                            | 依存関係未インストール        | `pip install -r requirements.txt`                    |
| `sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) no such table` | DB マイグレーション未実行     | `alembic upgrade head`                               |
| `Address already in use`                                                    | ポート 8000 が使用中          | `lsof -ti:8000 \| xargs kill -9` (Mac/Linux)         |
| `ImportError: No module named venv`                                         | Python の venv 未インストール | `python3.11 -m ensurepip` → `pip install virtualenv` |

### DevRev 統合のエラー

| エラーメッセージ                       | 原因                 | 解決方法                                      |
| -------------------------------------- | -------------------- | --------------------------------------------- |
| `DevRev API returned 401 Unauthorized` | AAT 無効/期限切れ    | DevRev コンソールで新しい AAT を生成          |
| `Session Token generation failed`      | AAT 設定なし         | Admin UI で Global DevRev 設定を登録          |
| `PLuG launcher not showing`            | Session Token 未取得 | ブラウザコンソールでエラー確認                |
| `Error: AAT validation failed`         | AAT フォーマット不正 | AAT が `drt_` または `eyJ` で始まることを確認 |

### Frontend 起動時のエラー

| エラーメッセージ                                                  | 原因                     | 解決方法                                                                                    |
| ----------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| `EADDRINUSE: address already in use :::3000`                      | ポート 3000 が使用中     | `lsof -ti:3000 \| xargs kill -9` (Mac/Linux)                                                |
| `Failed to fetch`                                                 | Backend 未起動           | Backend (port 8000)を先に起動                                                               |
| `Cannot find module next/babel`                                   | node_modules 破損        | `rm -rf node_modules && npm install`                                                        |
| `Error: ENOSPC: System limit for number of file watchers reached` | Linux のファイル監視制限 | `echo fs.inotify.max_user_watches=524288 \| sudo tee -a /etc/sysctl.conf && sudo sysctl -p` |

**詳細なトラブルシューティング**: [07_LAB_GUIDE_JA.md - トラブルシューティング](./07_LAB_GUIDE_JA.md) を参照

---

## 📖 学習パス（詳細）

### 初級（2-3 時間）

1. **環境セットアップ** → [07_LAB_GUIDE_JA.md](./07_LAB_GUIDE_JA.md) Section 1
2. **PLuG 統合** → [04_DEVREV_INTEGRATION.md](./04_DEVREV_INTEGRATION.md) + Lab Guide Section 2
3. **最初の Workflow** → Lab Guide Section 3

### 中級（4-6 時間）

4. **API Key 管理** → [04_DEVREV_INTEGRATION.md](./04_DEVREV_INTEGRATION.md) Section 3
5. **予約 Workflow 作成** → Lab Guide Section 4
6. **Knowledge Base 連携** → Lab Guide Section 5

### 上級（8-10 時間）

7. **高度な Workflow** → Lab Guide Section 6
8. **カスタム Agent 開発** → Lab Guide Section 7
9. **本番デプロイメント** → Lab Guide Section 8

---

## 📞 サポート

- **質問**: DevRev Community フォーラム
- **バグ報告**: [GitHub Issues](https://github.com/takanorisuzuki/devrev-demo/issues)
- **フィードバック**: プロジェクトメンテナーに連絡

---

## 🔄 バージョン履歴

- **v2.0.0** (2025-10-13): 大幅アップデート
  - 05_IMPLEMENTATION_ANALYSIS.md 追加（13 Issues の詳細分析）
  - 12 週間実装ロードマップに更新
  - Workflow Skills を 7 個 →15 個に拡張
  - 用語集・学習パス・エラー解決ガイド追加
- **v1.0.0** (2025-01-16): 初版リリース
  - 参照システムベースの機能分析
  - 基本的な DevRev 統合設計
  - ハンズオンラボガイド（日本語）

---

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

**次のステップ**:

- 🎯 **すぐ動かしたい**: [07_LAB_GUIDE_JA.md](./07_LAB_GUIDE_JA.md)
- 👨‍💻 **実装する**: [05_IMPLEMENTATION_ANALYSIS.md](./05_IMPLEMENTATION_ANALYSIS.md) ⭐ **必読**
- 🏗️ **設計を理解**: [01_ARCHITECTURE.md](./01_ARCHITECTURE.md)


