# コードスタイルと規約

## コードフォーマット

### Prettier
- 自動フォーマッター
- 設定: デフォルト設定を使用
- Tailwind CSS クラスの自動ソート有効

### ESLint
- ESLintルール: `eslint:recommended`
- Next.js公式設定を継承
- TypeScript対応

## TypeScript設定

### Strict Mode
- `strict: false` - 段階的な型安全性導入
- `noImplicitAny: false` - 明示的なany許可

### Path Mapping
```typescript
"@/*": ["./*"]
"@/components/*": ["./components/*"]
"@/lib/*": ["./lib/*"]
"@/app/*": ["./app/*"]
"@/public/*": ["./public/*"]
```

## 命名規則

### ファイル名
- **コンポーネント**: パスカルケース or ケバブケース
  - `VehicleCard.tsx`, `payment-success-modal.tsx`
- **ユーティリティ**: ケバブケース
  - `error-handler.ts`, `date-utils.ts`
- **API**: ケバブケース
  - `auth.ts`, `admin-vehicles.ts`

### コンポーネント名
- **パスカルケース**: `VehicleCard`, `LoginForm`, `AdminDashboard`
- **ファイル名とコンポーネント名を一致させる**

### 関数名・変数名
- **キャメルケース**: `getUserData`, `isLoading`, `vehicleList`
- **Boolean変数**: `is`, `has`, `should` で始める
  - `isAuthenticated`, `hasError`, `shouldRedirect`

### 定数
- **大文字スネークケース**: `API_BASE_URL`, `MAX_RETRY_COUNT`

### カスタムフック
- **use プレフィックス**: `useAuth`, `useVehicles`, `useLocalStorage`

## ディレクトリ構造の規約

```
frontend/
├── app/                    # Next.js App Router ページ
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   └── [route]/           # 各機能ルート
│
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/ui基本コンポーネント
│   ├── shared/           # 共有コンポーネント
│   ├── forms/            # フォームコンポーネント
│   ├── cards/            # カードコンポーネント
│   ├── admin/            # 管理者専用コンポーネント
│   └── layouts/          # レイアウトコンポーネント
│
├── lib/                   # ライブラリ・ユーティリティ
│   ├── api/              # API クライアント
│   ├── hooks/            # カスタムフック
│   ├── stores/           # Zustand ストア
│   ├── types/            # TypeScript型定義
│   ├── utils/            # ユーティリティ関数
│   └── validations/      # Zodスキーマ
│
├── messages/             # i18n翻訳ファイル
│   ├── ja.json          # 日本語
│   └── en.json          # 英語
│
└── public/               # 静的ファイル
    └── assets/           # 画像など
```

## インポート順序
1. React & Next.js
2. 外部ライブラリ
3. 内部モジュール（`@/` から始まるもの）
4. 相対パス
5. 型インポート（`import type`）

## React コンポーネント規約

### コンポーネント構造
```typescript
// 1. インポート
import React from 'react'
import { Button } from '@/components/ui/button'

// 2. 型定義
interface Props {
  title: string
  onSubmit: () => void
}

// 3. コンポーネント定義
export function MyComponent({ title, onSubmit }: Props) {
  // 4. カスタムフック
  const { data } = useMyHook()
  
  // 5. ローカル状態
  const [isOpen, setIsOpen] = useState(false)
  
  // 6. 副作用
  useEffect(() => {
    // ...
  }, [])
  
  // 7. イベントハンドラー
  const handleClick = () => {
    // ...
  }
  
  // 8. JSXレンダリング
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

### Server Component vs Client Component
- **デフォルト**: Server Component
- **"use client"**: 以下の場合に使用
  - useState, useEffect などのフック使用時
  - ブラウザAPIアクセス時
  - イベントハンドラー使用時

## API呼び出し

### 統一されたAPIクライアント使用
```typescript
// ❌ 直接axios使用禁止
import axios from 'axios'
const response = await axios.get('http://localhost:8000/api/v1/vehicles')

// ✅ 統一APIクライアント使用
import { getVehicles } from '@/lib/api/vehicles'
const vehicles = await getVehicles()
```

### エラーハンドリング
- `try-catch` で例外をキャッチ
- `getApiErrorMessage()` でエラーメッセージを取得

## スタイリング

### Tailwind CSS
- ユーティリティクラスを優先
- カスタムCSSは最小限に
- レスポンシブ: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

### CSS変数
- shadcn/uiのデザイントークン使用
- `hsl(var(--primary))` 形式

## 状態管理

### Zustand Store
- `lib/stores/` に配置
- `useXxxStore` 命名規則
- 例: `useAuthStore`, `useVehicleStore`

### React Query
- サーバー状態管理に使用
- `useQuery`, `useMutation` フック

## バリデーション

### Zod スキーマ
- `lib/validations/` に配置
- React Hook Form と統合
- サーバー/クライアント両方で使用可能

## テスト

### ファイル配置
- `__tests__/` ディレクトリ
- または `*.test.ts`, `*.spec.ts`

### テスト命名
- `describe` でグループ化
- `it` または `test` でテストケース

## コメント

### JSDoc
- 公開関数・コンポーネントに記載
- 型情報は TypeScript で表現（JSDocでの重複避ける）

### インラインコメント
- 複雑なロジックのみ
- 「なぜ」を説明（「何を」は不要）