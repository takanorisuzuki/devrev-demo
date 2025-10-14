# 推奨コマンド一覧

## 開発コマンド

### アプリケーション起動
```bash
# 開発サーバー起動（ホットリロード有効）
npm run dev
# http://localhost:3000 でアクセス

# 本番モード起動
npm run build
npm run start
```

### ビルド
```bash
# 本番ビルド
npm run build

# バンドルサイズ分析
npm run build:analyze
```

### コード品質

#### フォーマット
```bash
# Prettier でコードフォーマット
npm run format

# 手動フォーマット（特定ファイル）
npx prettier --write "app/**/*.tsx"
```

#### Linting
```bash
# ESLint でコードチェック
npm run lint

# 自動修正
npx eslint --fix app/ components/ lib/
```

#### 型チェック
```bash
# TypeScript型チェック
npm run type-check

# Watch mode
tsc --noEmit --watch
```

### テスト

#### ユニットテスト（Vitest）
```bash
# テスト実行
npm run test

# カバレッジ付きテスト
npm run test:coverage

# Watch mode
npm run test -- --watch
```

#### E2Eテスト（Playwright）
```bash
# E2Eテスト実行
npm run test:e2e

# 特定のテストファイル実行
npx playwright test tests/example.spec.ts

# UI mode でデバッグ
npx playwright test --ui
```

### 依存関係管理
```bash
# 依存関係インストール
npm ci --frozen-lockfile

# パッケージ追加
npm install <package-name>

# 開発依存関係追加
npm install --save-dev <package-name>

# 依存関係の更新確認
npm outdated

# セキュリティ監査
npm audit
npm audit fix
```

### Docker操作
```bash
# イメージビルド
docker build -t driverev-frontend .

# コンテナ起動
docker run -p 3000:3000 driverev-frontend

# ログ確認
docker logs -f <container_id>

# Docker Compose起動
docker-compose up -d frontend
```

### システムユーティリティ（macOS/Darwin）
```bash
# ファイル検索
find . -name "*.tsx" -type f

# パターン検索（grep）
grep -r "useEffect" app/

# ディレクトリ一覧
ls -la

# プロセス確認
ps aux | grep node

# ポート確認
lsof -i :3000

# ノードプロセス停止
pkill -f "next dev"
```

### Next.js 固有
```bash
# キャッシュクリア
rm -rf .next

# node_modules 再インストール
rm -rf node_modules package-lock.json
npm install

# プロダクションビルドの検証
npm run build && npm run start
```

### Git
```bash
# 変更ファイル確認
git status

# ステージング
git add .

# コミット（Conventional Commits形式推奨）
git commit -m "feat(ui): 新しいダッシュボード追加"
git commit -m "fix(api): 認証エラーハンドリング修正"

# プッシュ
git push origin <branch-name>
```