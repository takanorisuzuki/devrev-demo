# 🏗️ DriveRev - アーキテクチャガイド（Living Document）

> **Living Document**: このドキュメントはプロジェクトの成長とともに継続的に更新されます。  
> **最終更新**: 2025-10-09

---

## 📋 目次

1. [概要](#概要)
2. [設計原則](#設計原則)
3. [システムアーキテクチャ](#システムアーキテクチャ)
4. [フロントエンドアーキテクチャ](#フロントエンドアーキテクチャ)
5. [バックエンドアーキテクチャ](#バックエンドアーキテクチャ)
6. [既知の問題と改善計画](#既知の問題と改善計画)

---

## 概要

DriveRev は、Next.js（フロントエンド）と FastAPI（バックエンド）で構築されたレンタカーサービスのデモアプリケーションです。

### 主要技術スタック

| レイヤー          | 技術                     | 目的                                      |
| ----------------- | ------------------------ | ----------------------------------------- |
| フロントエンド    | Next.js 14 + TypeScript  | SSR/CSR 対応の React フレームワーク       |
| UI コンポーネント | Tailwind CSS + shadcn/ui | モダンな UI デザインシステム              |
| 状態管理          | Zustand                  | 軽量な状態管理                            |
| API 通信          | Axios                    | HTTP クライアント（認証トークン自動付与） |
| バックエンド      | FastAPI + Python         | 高パフォーマンス API フレームワーク       |
| データベース      | PostgreSQL + SQLAlchemy  | リレーショナル DB + ORM                   |
| 認証              | JWT                      | トークンベース認証                        |

---

## 設計原則

### 1. DRY (Don't Repeat Yourself)

**原則**: コードの重複を避け、再利用可能なコンポーネントや関数を作成する。

#### ✅ 良い例

```typescript
// ❌ Bad: 各コンポーネントで直接fetch
const response = await fetch(`http://localhost:8000/api/v1/vehicles/${id}`);

// ✅ Good: 共通のAPIクライアント関数を使用
import { getVehicle } from "@/lib/api/vehicles";
const vehicle = await getVehicle(id);
```

#### 適用箇所

- **API クライアント**: すべての API 呼び出しは `lib/api/` の関数を使用
- **共通 UI**: 繰り返し使用される UI は `components/shared/` に配置
- **ユーティリティ関数**: 日付フォーマット、価格計算などは `lib/utils/` に配置

### 2. Tidy First

**原則**: 新機能追加や修正を行う前に、まず既存コードを整理する。

#### プロセス

1. **整理（Tidy）**: コードの重複削除、構造の改善
2. **機能追加（Feature）**: 整理されたコードベースに新機能を追加
3. **リファクタリング**: 必要に応じてさらに改善

#### 実践例

```typescript
// Phase 1: Tidy - 既存の直接fetchを特定・整理
// Phase 2: Feature - apiClient関数に置き換え
// Phase 3: Refactor - エラーハンドリングを統一
```

### 3. 責任の分離 (Separation of Concerns)

**原則**: 各層が明確な責任を持ち、疎結合を保つ。

#### レイヤー構成

```
UI Components (Presentation)
    ↓
API Client Layer (Data Access)
    ↓
Backend API (Business Logic)
    ↓
Database (Persistence)
```

---

## システムアーキテクチャ

### コンテナ構成

```
┌─────────────────┐
│   Frontend      │ :3000
│   (Next.js)     │
└────────┬────────┘
         │
         ↓ HTTP
┌─────────────────┐
│   Backend       │ :8000
│   (FastAPI)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────┐
│  DB    │ │Redis │
│(Postgres)│ │:6379│
└────────┘ └──────┘
```

### 環境別 URL 設定

| 環境             | Frontend → Backend          | Browser → Backend        |
| ---------------- | --------------------------- | ------------------------ |
| **ローカル開発** | `http://backend:8000` (SSR) | `http://localhost:8000`  |
| **本番環境**     | `http://backend:8000` (SSR) | `${NEXT_PUBLIC_API_URL}` |

---

## フロントエンドアーキテクチャ

### ディレクトリ構造

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx            # ホームページ
│   ├── vehicles/           # 車両検索・予約
│   ├── reservations/       # 予約管理
│   ├── admin/              # 管理画面
│   └── auth/               # 認証関連
├── components/             # UIコンポーネント
│   ├── shared/             # 共通コンポーネント
│   ├── cards/              # カード系
│   ├── forms/              # フォーム系
│   ├── admin/              # 管理画面専用
│   └── ui/                 # shadcn/ui components
├── lib/                    # ユーティリティ・ロジック
│   ├── api/                # ✅ API Client Layer (重要)
│   ├── stores/             # Zustand状態管理
│   ├── hooks/              # カスタムフック
│   ├── types/              # TypeScript型定義
│   ├── utils/              # ユーティリティ関数
│   └── validations/        # バリデーション
└── public/                 # 静的ファイル
```

### API Client Layer（最重要）

#### 設計原則

**すべての API 呼び出しは `lib/api/` を経由する**

```typescript
// lib/api/client.ts - 基本クライアント
export const apiClient = axios.create({
  baseURL: API_BASE_URL, // 環境変数から自動取得
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ✅ JWTトークン自動付与
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 統一エラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logError(parseAxiosError(error), "API Request");
    handleAuthenticationError(error);
    return Promise.reject(error);
  }
);
```

#### API クライアント関数の構成

```
lib/api/
├── client.ts           # ✅ 基本クライアント（すべての起点）
├── vehicles.ts         # 車両API（統一済み）
├── reservations.ts     # 予約API
├── stores.ts           # 店舗API
├── auth.ts             # 認証API
├── payments.ts         # 決済API
├── admin.ts            # 管理者API（ユーザー管理）
├── admin-vehicles.ts   # 管理者API（車両管理）
├── admin-stores.ts     # 管理者API（店舗管理）
└── system-settings.ts  # システム設定API
```

#### 標準的な実装パターン

```typescript
// lib/api/vehicles.ts
import { apiClient } from "./client";
import { Vehicle } from "../types/vehicle";

/**
 * 車両詳細を取得
 */
export async function getVehicle(vehicleId: string): Promise<Vehicle> {
  try {
    const response = await apiClient.get(`/api/v1/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error(`車両詳細の取得に失敗 (ID: ${vehicleId}):`, error);
    throw error;
  }
}
```

#### コンポーネントでの使用例

```typescript
// app/vehicles/[id]/reserve/page.tsx
import { getVehicle } from "@/lib/api/vehicles";

useEffect(() => {
  const fetchVehicle = async () => {
    try {
      const data = await getVehicle(vehicleId);
      setVehicle(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "不明なエラーが発生しました";
      setError(message);
    }
  };
  fetchVehicle();
}, [vehicleId]);
```

---

## バックエンドアーキテクチャ

### ディレクトリ構造

```
backend/
├── app/
│   ├── main.py             # FastAPIエントリーポイント
│   ├── api/                # APIエンドポイント
│   │   └── v1/             # APIバージョン1
│   │       ├── vehicles.py
│   │       ├── reservations.py
│   │       ├── auth.py
│   │       └── admin_*.py
│   ├── core/               # 設定・認証
│   │   ├── config.py       # 環境設定
│   │   ├── auth.py         # JWT認証
│   │   └── security.py     # セキュリティ
│   ├── db/                 # データベース
│   │   ├── database.py     # DB接続
│   │   └── models/         # SQLAlchemyモデル
│   ├── schemas/            # Pydanticスキーマ（入出力検証）
│   ├── services/           # ビジネスロジック
│   └── utils/              # ユーティリティ
├── alembic/                # DBマイグレーション
└── tests/                  # テストコード
```

### レイヤー構成

```
API Layer (FastAPI)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database Layer (PostgreSQL)
```

---

## 既知の問題と改善計画

### 🔴 Critical - API 呼び出しの一貫性

**問題**: ハードコードされた `http://localhost:8000` が 13 箇所に存在

**詳細**: [Issue #143](https://github.com/takanorisuzuki/devrev-demo/issues/143)

#### 影響範囲

| カテゴリ                   | ファイル数 | 影響                  |
| -------------------------- | ---------- | --------------------- |
| 予約機能                   | 1          | 🔴 本番環境で動作不可 |
| 管理画面（車両）           | 4          | 🔴 CRUD 操作が失敗    |
| 管理画面（ユーザー）       | 3          | 🔴 CRUD 操作が失敗    |
| 管理画面（店舗）           | 3          | 🔴 CRUD 操作が失敗    |
| 管理画面（ダッシュボード） | 2          | 🔴 データ取得失敗     |

#### 問題の根本原因

```typescript
// ❌ アンチパターン: 直接fetchを使用
const response = await fetch(
  `http://localhost:8000/api/v1/vehicles/${vehicleId}`
);
```

**なぜ問題か？**

1. **環境依存**: 本番環境で localhost は存在しない
2. **認証欠如**: JWT トークンが自動付与されない
3. **エラーハンドリング**: 統一されたエラー処理が適用されない
4. **保守性**: URL 変更時に 13 箇所を修正する必要がある
5. **DRY 違反**: 同じパターンが重複している

#### 修正計画

**Phase 1: Tidy（整理）** ✅ **完了**

1. ✅ 既存の API 関数を確認・整理
2. ✅ 重複している車両 API 関数を統合
   - `lib/api/vehicle-api.ts` を削除（未使用のため）
   - `lib/api/vehicles.ts` を統一された車両 API として使用

**Phase 2: Replace（置換）**

優先順位順に置換：

1. ✅ **最優先**: 予約ページ（`app/vehicles/[id]/reserve/page.tsx`）
2. 🔴 **高**: 管理画面モーダル（13 箇所）
3. 🟡 **中**: ダッシュボード

**Phase 3: Verify（検証）**

- ローカル環境でのテスト
- 本番環境デプロイ前の検証
- E2E テストの実施

#### 推奨される実装パターン

```typescript
// ✅ 正しいパターン
import { getVehicle } from "@/lib/api/vehicles";

const vehicle = await getVehicle(vehicleId);
```

**利点**:

- 🔐 JWT 認証が自動付与
- 🌍 環境変数から正しい URL を取得
- 🛡️ 統一されたエラーハンドリング
- 🔧 1 箇所の修正で全体に反映

### 🟡 中優先度 - API 関数の重複 ✅ **解決済み**

**問題**: 車両 API 関数が 2 ファイルに重複していた

**解決策**: Phase 1 で統合完了
- ✅ `lib/api/vehicle-api.ts` を削除（未使用のため）
- ✅ `lib/api/vehicles.ts` を統一された車両 API として使用

### 🟢 低優先度 - 改善提案

1. **型安全性の向上**: すべての API 関数に TypeScript 型を完全適用
2. **テストカバレッジ**: API クライアント層のユニットテスト追加
3. **キャッシュ戦略**: React Query や SWR の導入検討

---

## 開発ガイドライン

### 新しい API 呼び出しを追加する場合

1. **`lib/api/` に関数を追加**（直接 fetch は使わない）
2. **TypeScript 型を定義**（`lib/types/` に配置）
3. **エラーハンドリングを実装**
4. **JSDoc でドキュメント化**

### コンポーネント開発時

1. **責任の分離**: UI ロジックとビジネスロジックを分離
2. **再利用性**: 3 回以上使う場合は共通コンポーネント化
3. **アクセシビリティ**: WAI-ARIA ガイドラインに準拠

### Pull Request 提出前のチェックリスト

- [ ] DRY 原則に違反していないか？
- [ ] 直接`fetch`を使っていないか？（`apiClient`を使用）
- [ ] 型定義が完全か？
- [ ] このドキュメント（ARCHITECTURE.md）を更新したか？

---

## 更新履歴

| 日付       | 変更内容                                                             |
| ---------- | -------------------------------------------------------------------- |
| 2025-10-09 | Phase 1 完了 - 車両 API クライアントの統合（vehicle-api.ts 削除）    |
| 2025-10-09 | 初版作成 - API 層の問題分析、DRY/Tidy First 原則の追加               |

---

**このドキュメントは継続的に更新されます。変更があれば必ずこのドキュメントも更新してください。**
