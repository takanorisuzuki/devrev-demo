# DriveRev Branch Protection Configuration

## 🛡️ Branch Protection とは？

Branch Protection は、重要なブランチ（main、develop 等）を保護し、コードの品質とセキュリティを保つための GitHub の機能です。

### 🎯 主な機能

- **直接プッシュの禁止**: 保護されたブランチへの直接プッシュを防ぐ
- **プルリクエスト必須**: すべての変更をプルリクエスト経由で行う
- **レビュー必須**: 指定された人数の承認を必須とする
- **ステータスチェック**: CI/CD の成功を必須とする
- **署名済みコミット**: GPG 署名を必須とする

## 🏗️ DriveRev プロジェクトのブランチ戦略

### ブランチ構成

```
main (本番環境)
├── develop (開発環境)
├── feature/* (機能開発)
├── bugfix/* (バグ修正)
├── hotfix/* (緊急修正)
└── release/* (リリース準備)
```

### ブランチの役割

- **main**: 本番環境にデプロイされる安定版
- **develop**: 開発中の機能を統合するブランチ
- **feature/**: 新機能開発用ブランチ
- **bugfix/**: バグ修正用ブランチ
- **hotfix/**: 緊急修正用ブランチ
- **release/**: リリース準備用ブランチ

## 🔒 推奨保護設定

### 1. main ブランチ (最厳重)

- ✅ Require a pull request before merging
- ✅ Require approvals (2 人以上)
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require review from code owners
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Require signed commits
- ✅ Require linear history
- ✅ Include administrators
- ✅ Restrict pushes that create files
- ✅ Allow force pushes: ❌
- ✅ Allow deletions: ❌

### 2. develop ブランチ (厳重)

- ✅ Require a pull request before merging
- ✅ Require approvals (1 人以上)
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Require signed commits
- ✅ Include administrators
- ✅ Allow force pushes: ❌
- ✅ Allow deletions: ❌

### 3. release/\* ブランチ (中程度)

- ✅ Require a pull request before merging
- ✅ Require approvals (1 人以上)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators
- ✅ Allow force pushes: ❌
- ✅ Allow deletions: ❌

## 🚨 ステータスチェック設定

### 必須チェック

- **CI Pipeline**: すべてのテストが成功
- **Code Quality**: コード品質チェックが成功
- **Security Scan**: セキュリティスキャンが成功
- **Build**: ビルドが成功

### オプションチェック

- **Performance Test**: パフォーマンステスト
- **E2E Test**: エンドツーエンドテスト
- **Documentation**: ドキュメント生成

## 👥 Code Owners 設定

### CODEOWNERS ファイル

```
# Global owners
* @takanorisuzuki

# Frontend
/frontend/ @takanorisuzuki
*.tsx @takanorisuzuki
*.ts @takanorisuzuki

# Backend
/backend/ @takanorisuzuki
*.py @takanorisuzuki

# Database
/backend/alembic/ @takanorisuzuki
*.sql @takanorisuzuki

# Documentation
*.md @takanorisuzuki
/docs/ @takanorisuzuki

# CI/CD
/.github/ @takanorisuzuki
```

## 🔧 設定手順

### 1. GitHub Web UI での設定

1. リポジトリの「Settings」→「Branches」に移動
2. 「Add rule」をクリック
3. ブランチ名パターンを入力（例: `main`）
4. 保護設定を有効化
5. 「Create」をクリック

### 2. GitHub CLI での設定

```bash
# main ブランチの保護設定
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI Pipeline","Code Quality","Security Scan"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null

# develop ブランチの保護設定
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI Pipeline","Code Quality"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## ⚠️ 注意事項

### 管理者権限

- 管理者も保護ルールに従うことを推奨
- 緊急時のみ保護ルールをバイパス

### 緊急時の対応

- 緊急修正が必要な場合は、hotfix ブランチを使用
- 管理者権限で一時的に保護を解除（記録を残す）

### チーム設定

- レビュアーの権限を適切に設定
- コードオーナーの責任範囲を明確化

## 📊 効果

### 品質向上

- コードレビューの徹底
- 自動テストの実行
- セキュリティチェックの実施

### リスク軽減

- 直接プッシュによる事故の防止
- 未テストコードの本番投入防止
- セキュリティホールの早期発見

### チーム協力

- 知識共有の促進
- コード品質の統一
- 責任の明確化
