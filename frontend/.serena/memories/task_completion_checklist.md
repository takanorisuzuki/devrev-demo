# タスク完了時のチェックリスト

## コード品質チェック

### 1. フォーマット
```bash
# Prettier でコードフォーマット
npm run format
```

### 2. Linting
```bash
# ESLint でコードチェック
npm run lint

# エラーがあれば修正
npx eslint --fix app/ components/ lib/
```

### 3. 型チェック
```bash
# TypeScript 型チェック
npm run type-check

# エラーがあれば修正
```

### 4. テスト実行
```bash
# ユニットテスト
npm run test

# カバレッジ確認
npm run test:coverage

# E2Eテスト（必要に応じて）
npm run test:e2e

# テストが全て成功することを確認
```

## 動作確認

### 5. ローカル開発サーバー
```bash
# 開発サーバー起動
npm run dev

# http://localhost:3000 にアクセスして動作確認
# - 変更した機能が正常動作するか
# - UIに崩れがないか
# - コンソールにエラーがないか
```

### 6. 本番ビルド
```bash
# 本番ビルドが成功するか確認
npm run build

# ビルドサイズ確認
ls -lh .next/

# 本番モードで起動確認
npm run start
```

### 7. レスポンシブ確認
- モバイル表示確認（Chrome DevTools）
- タブレット表示確認
- デスクトップ表示確認

## API統合

### 8. API呼び出し確認
- バックエンドAPIと正しく通信できているか
- エラーハンドリングが適切か
- ローディング状態が表示されるか

### 9. 認証フロー
- ログイン/ログアウトが正常に動作するか
- トークンが適切に保存・削除されるか
- 認証が必要なページで保護されているか

## UI/UX

### 10. アクセシビリティ
- キーボード操作可能か
- フォーカス状態が視覚的に分かるか
- スクリーンリーダー対応（必要に応じて）

### 11. エラー表示
- バリデーションエラーが適切に表示されるか
- APIエラーがユーザーフレンドリーに表示されるか

### 12. ローディング状態
- データフェッチ中にスケルトンorスピナー表示
- 長時間の処理に対するフィードバック

## 国際化（i18n）

### 13. 多言語対応
- 日本語表示確認
- 英語表示確認
- `messages/ja.json`, `messages/en.json` に翻訳追加

## セキュリティ

### 14. セキュリティチェック
- 機密情報（API Key等）が環境変数で管理されているか
- XSS対策（ユーザー入力のサニタイズ）
- CSRF対策（Next.js標準で対応）

### 15. 依存関係の脆弱性
```bash
# npm audit でセキュリティチェック
npm audit

# 自動修正可能なものは修正
npm audit fix
```

## ドキュメント

### 16. コメント・ドキュメント
- 複雑なロジックにコメント追加
- 新しいAPI関数にJSDoc追加
- 必要に応じてREADME更新

## Git

### 17. コミット前確認
```bash
# 変更ファイル確認
git status

# 差分確認
git diff

# 不要なファイルが含まれていないか確認
# - console.log の削除
# - デバッグコードの削除
# - コメントアウトコードの削除
```

### 18. コミットメッセージ
Conventional Commits形式を推奨：
```bash
# 機能追加
git commit -m "feat(reservations): 予約キャンセル機能追加"

# バグ修正
git commit -m "fix(auth): ログイン時のトークン保存エラー修正"

# スタイル変更
git commit -m "style(ui): ボタンのスタイル調整"

# リファクタリング
git commit -m "refactor(api): API呼び出しロジック共通化"

# テスト追加
git commit -m "test(vehicles): 車両一覧コンポーネントのテスト追加"

# ドキュメント
git commit -m "docs(readme): セットアップ手順更新"
```

## まとめコマンド

タスク完了前に一括実行：
```bash
# フォーマット → Lint → 型チェック → テスト
npm run format && \
npm run lint && \
npm run type-check && \
npm run test && \
npm run build
```

全てパスすればタスク完了！✅

## デプロイ前の最終確認

### 19. 環境変数
- `.env.local` に必要な変数が設定されているか
- 本番環境の環境変数が正しく設定されているか

### 20. Docker確認（オプション）
```bash
# Dockerイメージビルド
docker build -t driverev-frontend .

# コンテナ起動と動作確認
docker run -p 3000:3000 driverev-frontend

# ヘルスチェック確認
curl http://localhost:3000
```