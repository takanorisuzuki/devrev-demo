# プロジェクト構造

## ディレクトリツリー

```
frontend/
├── app/                           # Next.js App Router ページ
│   ├── layout.tsx                # ⭐ ルートレイアウト
│   ├── page.tsx                  # ⭐ ホームページ
│   ├── globals.css               # グローバルCSS
│   ├── en/                       # 英語ルート
│   │   └── page.tsx
│   ├── login/                    # ログインページ
│   │   └── page.tsx
│   ├── auth/                     # 認証関連
│   │   └── password-reset/
│   │       ├── page.tsx
│   │       └── [token]/page.tsx
│   ├── dashboard/                # ダッシュボード
│   │   └── page.tsx
│   ├── vehicles/                 # 車両
│   │   ├── page.tsx             # 一覧
│   │   └── [id]/page.tsx        # 詳細
│   ├── reservations/             # 予約
│   │   ├── page.tsx             # 一覧
│   │   └── [id]/page.tsx        # 詳細
│   ├── payments/                 # 決済
│   │   └── page.tsx
│   └── admin/                    # 管理者機能
│       ├── dashboard/
│       │   └── page.tsx
│       └── payments/
│           └── page.tsx
│
├── components/                    # Reactコンポーネント
│   ├── ui/                       # shadcn/ui 基本コンポーネント
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── tooltip.tsx
│   │   └── use-toast.ts
│   │
│   ├── shared/                   # 共有コンポーネント
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── LocaleSwitcher.tsx
│   │
│   ├── forms/                    # フォームコンポーネント
│   │   ├── LoginForm.tsx
│   │   └── ReservationForm.tsx
│   │
│   ├── cards/                    # カードコンポーネント
│   │   └── VehicleCard.tsx
│   │
│   ├── grids/                    # グリッドコンポーネント
│   │   └── VehicleGrid.tsx
│   │
│   ├── layouts/                  # レイアウトコンポーネント
│   │   └── AdminLayout.tsx
│   │
│   ├── admin/                    # 管理者専用コンポーネント
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── AdminNavigation.tsx
│   │   ├── AdminStats.tsx
│   │   ├── PaymentManagement.tsx
│   │   ├── ReservationList.tsx
│   │   ├── ReservationManagement.tsx
│   │   ├── StoreManagement.tsx
│   │   ├── UserManagement.tsx
│   │   └── VehicleManagement.tsx
│   │
│   ├── payment-success-modal.tsx  # 決済完了モーダル
│   └── reservation-detail-modal.tsx # 予約詳細モーダル
│
├── lib/                          # ライブラリ・ユーティリティ
│   ├── api/                      # ⭐ API クライアント
│   │   ├── client.ts            # ⭐ Axios設定・インターセプター
│   │   ├── auth.ts              # 認証API
│   │   ├── vehicles.ts          # 車両API
│   │   ├── reservations.ts      # 予約API
│   │   ├── stores.ts            # 店舗API
│   │   ├── payments.ts          # 決済API
│   │   ├── system-settings.ts   # システム設定API
│   │   ├── admin.ts             # 管理者API
│   │   ├── admin-vehicles.ts    # 管理者: 車両
│   │   └── admin-stores.ts      # 管理者: 店舗
│   │
│   ├── hooks/                    # カスタムフック
│   │   ├── useAuth.ts
│   │   ├── useVehicles.ts
│   │   ├── useReservations.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── stores/                   # Zustand ストア
│   │   └── auth.ts              # 認証ストア
│   │
│   ├── types/                    # TypeScript型定義
│   │   ├── api.ts               # API型
│   │   └── index.ts             # 共通型
│   │
│   ├── validations/              # Zodスキーマ
│   │   ├── auth.ts              # 認証バリデーション
│   │   └── reservation.ts       # 予約バリデーション
│   │
│   ├── utils/                    # ユーティリティ関数
│   │   ├── error-handler.ts     # エラーハンドリング
│   │   └── date-utils.ts        # 日付操作
│   │
│   ├── data/                     # 静的データ
│   │   └── vehicle-categories.ts
│   │
│   └── contexts/                 # React Context
│       └── VehicleSearchContext.tsx
│
├── messages/                     # i18n 翻訳ファイル
│   ├── ja.json                  # 日本語
│   └── en.json                  # 英語
│
├── public/                       # 静的ファイル
│   └── assets/                  # 画像・アイコン
│       └── [車両画像42枚]
│
├── __tests__/                    # テスト
│   └── basic.test.ts
│
├── coverage/                     # カバレッジレポート
│
├── .next/                        # Next.jsビルド出力（自動生成）
├── node_modules/                 # 依存関係（自動生成）
│
├── .serena/                      # Serena設定
│   └── project.yml
│
├── package.json                  # ⭐ npm設定・依存関係
├── package-lock.json             # 依存関係ロックファイル
├── tsconfig.json                 # ⭐ TypeScript設定
├── next.config.js                # ⭐ Next.js設定
├── tailwind.config.js            # ⭐ Tailwind CSS設定
├── postcss.config.js             # PostCSS設定
├── .eslintrc.json                # ESLint設定
├── .prettierignore               # Prettier除外設定
├── Dockerfile                    # ⭐ Docker Multi-stage build
├── next-env.d.ts                 # Next.js型定義（自動生成）
└── tsconfig.tsbuildinfo          # TypeScriptビルド情報（自動生成）
```

## 重要ファイル

| ファイル | 説明 |
|---------|------|
| `app/layout.tsx` | ルートレイアウト、フォント設定、メタデータ |
| `app/page.tsx` | ホームページ（ランディングページ） |
| `lib/api/client.ts` | Axios設定、JWT自動付与、エラーハンドリング |
| `lib/stores/auth.ts` | Zustand認証ストア |
| `package.json` | npm依存関係、スクリプト定義 |
| `tsconfig.json` | TypeScript設定、パスマッピング |
| `next.config.js` | Next.js設定、API Proxy、セキュリティヘッダー |
| `tailwind.config.js` | Tailwind CSS設定、カスタムカラー |
| `.eslintrc.json` | ESLint設定 |
| `Dockerfile` | Alpine Linuxベース、Standalone Output |

## データフロー

### 一般的なデータフロー（Client Component）
```
User Action
    ↓
Component (app/ or components/)
    ↓
Custom Hook (lib/hooks/) または Direct API Call
    ↓
API Client (lib/api/*.ts)
    ↓
Axios Instance (lib/api/client.ts)
    ↓ [JWT自動付与、エラーハンドリング]
Backend API (FastAPI)
    ↓
Response
    ↓
Component State Update or Zustand Store Update
    ↓
UI Re-render
```

### 認証フロー
```
Login Form
    ↓
lib/api/auth.ts: login()
    ↓
lib/api/client.ts: apiClient.post('/api/v1/auth/login')
    ↓
Backend Response (JWT Token)
    ↓
lib/stores/auth.ts: setAuth()
    ↓
LocalStorage に保存
    ↓
以降のリクエストに自動的にトークン付与（Interceptor）
```

## App Router vs Pages Router

このプロジェクトは **Next.js 14 App Router** を使用しています：
- ファイルベースルーティング（`app/` ディレクトリ）
- Server Components がデフォルト
- `layout.tsx` でレイアウト共有
- `page.tsx` でページ定義
- `loading.tsx`, `error.tsx` で特殊ケース対応

## API呼び出しのベストプラクティス

❌ **禁止**: 直接URLハードコード
```typescript
const res = await fetch('http://localhost:8000/api/v1/vehicles')
```

✅ **推奨**: 統一APIクライアント使用
```typescript
import { getVehicles } from '@/lib/api/vehicles'
const vehicles = await getVehicles()
```

これにより以下が自動化：
- 環境変数からのURL取得
- JWT認証トークン自動付与
- 統一されたエラーハンドリング
- 型安全性