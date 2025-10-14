# プロジェクト概要

## プロジェクト名
**DriveRev Frontend** - レンタカーサービス Next.js/React フロントエンド

## 目的
DriveRevは、レンタカーサービスのWebアプリケーションフロントエンドです。顧客向けの予約システムと管理者向けのダッシュボードを提供します。

## 主要機能

### 1. 認証システム
- ログイン/ログアウト
- パスワードリセット
- JWT トークンベース認証
- Zustand によるグローバル状態管理

### 2. 車両管理
- 車両一覧表示
- 車両詳細表示
- 車両検索・フィルタリング
- 管理者向け車両CRUD

### 3. 予約システム
- 予約作成
- 予約一覧・詳細表示
- 予約キャンセル
- 予約履歴

### 4. 店舗管理
- 店舗一覧表示
- 店舗詳細情報
- 営業時間表示

### 5. 決済
- オンライン決済統合
- 決済完了モーダル

### 6. 管理者機能
- ダッシュボード（統計情報）
- ユーザー管理
- 予約管理
- 店舗管理
- システム設定

### 7. 多言語対応
- 日本語・英語サポート
- next-intl による国際化（i18n）

## 技術的特徴

### アーキテクチャ
- **Next.js 14 App Router** - React Server Components
- **TypeScript** - 型安全性
- **レイヤードアーキテクチャ**:
  - UI Layer: `components/`, `app/`
  - API Layer: `lib/api/`
  - State Management: `lib/stores/`
  - Business Logic: `lib/hooks/`, `lib/utils/`

### レスポンシブデザイン
- モバイルファーストアプローチ
- Tailwind CSS による柔軟なスタイリング
- shadcn/ui による一貫性のあるUI

### パフォーマンス最適化
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Image Optimization (next/image)
- Code Splitting
- Standalone Output for Docker

## エントリーポイント
- `app/layout.tsx` - ルートレイアウト
- `app/page.tsx` - ホームページ
- Development: `http://localhost:3000`
- API Proxy: `/api/*` → Backend API