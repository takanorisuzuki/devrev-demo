# 技術スタック

## コア技術

### フレームワーク & ランタイム
- **Node.js 22.12.0** - JavaScriptランタイム
- **Next.js 14** - Reactフレームワーク（App Router）
- **React 18.2** - UIライブラリ
- **TypeScript 5.2** - 型安全性

## UI & スタイリング

### スタイリング
- **Tailwind CSS 3.3** - ユーティリティファーストCSSフレームワーク
- **tailwindcss-animate** - アニメーション
- **tailwind-merge** - クラス名のマージ
- **class-variance-authority** - バリアント管理
- **clsx** - 条件付きクラス名

### コンポーネントライブラリ
- **shadcn/ui** - Radix UIベースのコンポーネント集
- **Radix UI** - アクセシブルなHeadlessコンポーネント:
  - Dialog, Dropdown Menu, Label, Select
  - Slot, Switch, Toast, Tooltip

### アイコン
- **lucide-react** - 美しいアイコンライブラリ

## 状態管理 & データフェッチング

### 状態管理
- **Zustand 4.4** - 軽量な状態管理ライブラリ

### データフェッチング
- **TanStack Query (React Query) 5.90** - サーバー状態管理
- **Axios 1.6** - HTTP クライアント

## フォーム & バリデーション

### フォーム
- **React Hook Form 7.47** - パフォーマンスの高いフォームライブラリ
- **@hookform/resolvers** - バリデーションスキーマ統合

### バリデーション
- **Zod 3.22** - TypeScript-firstスキーマバリデーション

## 国際化（i18n）

- **next-intl 3.0** - Next.js App Router対応の国際化ライブラリ
- サポート言語: 日本語（ja）、英語（en）

## ユーティリティ

- **date-fns 4.1** - 日付操作ライブラリ

## テストフレームワーク

### ユニットテスト
- **Vitest 3.2** - 高速ユニットテストランナー
- **@testing-library/react** - Reactテスティングライブラリ
- **@testing-library/jest-dom** - カスタムJestマッチャー
- **@testing-library/user-event** - ユーザーイベントシミュレーション
- **jsdom** - DOM環境シミュレーション
- **@vitest/coverage-v8** - カバレッジレポート

### E2Eテスト
- **Playwright 1.40** - ブラウザ自動化

## 開発ツール

### Linter & Formatter
- **ESLint 8.52** - JavaScriptリンター
- **eslint-config-next** - Next.js公式ESLint設定
- **@typescript-eslint/eslint-plugin** - TypeScript対応
- **Prettier 3.0** - コードフォーマッター
- **prettier-plugin-tailwindcss** - Tailwind CSS クラスソート

### ビルドツール
- **PostCSS 8.4** - CSS変換
- **Autoprefixer 10.4** - CSSベンダープレフィックス自動付与

## コンテナ化

- **Docker** - Multi-stage build with Node.js Alpine
- **Standalone Output** - 最小化されたプロダクションビルド

## Node.js バージョン要件

- **Node.js**: ^22.12.0
- **npm**: ^10.0.0