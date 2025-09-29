# DevRev Demo - 保守運用ガイド

## 🔒 ブランチ保護設定の管理

### 概要
このリポジトリには、ブランチ保護設定とCI/CDワークフローの整合性を自動検証する仕組みが組み込まれています。

### 自動監視システム

#### 1. 検証スクリプト
**ファイル**: `scripts/validate-branch-protection.sh`

**機能**:
- ブランチ保護ルールの必須ステータスチェック名を取得
- CI/CDワークフローの実際のジョブ名を解析
- 名前の不整合を検出・報告

**実行方法**:
```bash
./scripts/validate-branch-protection.sh
```

#### 2. 自動監視ワークフロー
**ファイル**: `.github/workflows/branch-protection-monitor.yml`

**実行タイミング**:
- 毎日午前9時（JST）に自動実行
- 手動トリガー可能（Actions タブから）

**機能**:
- 定期的な設定検証
- 不整合検出時のissue自動作成
- 修正確認後のissue自動クローズ

### 設定不整合の対処法

#### 問題が検出された場合

1. **アーティファクトの確認**
   - GitHub ActionsのBranch Protection Monitor実行結果を確認
   - `branch-protection-validation-report` アーティファクトをダウンロード

2. **根本原因の特定**
   ```bash
   # ローカルで検証実行
   ./scripts/validate-branch-protection.sh
   ```

3. **修正方法**

   **Option A: ワークフロー名の修正**
   ```yaml
   # .github/workflows/*.yml
   jobs:
     job-name:
       name: "正しいステータスチェック名"
   ```

   **Option B: ブランチ保護ルールの更新**
   ```bash
   # GitHub CLI使用
   gh api --method PUT "repos/:owner/:repo/branches/main/protection" \
     --field required_status_checks='{"strict":true,"contexts":["正しいチェック名1","正しいチェック名2"]}'
   ```

4. **修正確認**
   ```bash
   # 再検証実行
   ./scripts/validate-branch-protection.sh
   ```

### 現在の正しい設定

#### 必須ステータスチェック名
- `Backend Tests & Build`
- `Backend Code Quality v2`
- `Code Security Scan`

#### 対応するワークフロー
- **CI/CD Pipeline** (`.github/workflows/ci.yml`)
  - `Backend Tests & Build`
- **Code Quality Checks v2** (`.github/workflows/quality.yml`)
  - `Backend Code Quality v2`
- **Security Scan** (`.github/workflows/security.yml`)
  - `Code Security Scan`

### 予防策

#### 1. ワークフロー変更時の注意点
- ジョブ名を変更する際は、ブランチ保護ルールも同時に更新
- PRレビューでワークフロー変更を重点確認

#### 2. 定期確認項目
- 月次でブランチ保護設定の手動確認
- 新規ワークフロー追加時の整合性チェック
- リポジトリ設定変更時の検証スクリプト実行

#### 3. 監視アラート
- 自動作成されるissueの迅速な対応
- GitHub Actionsの実行ログ定期確認

### トラブルシューティング

#### よくある問題

**Q: 検証スクリプトが "対応するジョブが見つかりません" エラーを出す**
```
A: 以下を確認してください:
1. ワークフローファイルのjob名とname属性
2. ブランチ保護ルールの必須チェック名
3. 大文字小文字、スペース、特殊文字の違い
```

**Q: GitHub Actionsで "permission denied" エラー**
```
A: 以下を確認してください:
1. GITHUB_TOKENの権限設定
2. リポジトリのActions権限設定
3. ワークフローファイルのpermissions設定
```

**Q: jq/yqコマンドエラー**
```
A: 依存関係を確認してください:
# ローカル環境
brew install jq yq

# CI環境では自動インストール済み
```

### 緊急時対応

#### ブランチ保護ルールが原因でマージできない場合

**⚠️ 注意**: 以下は緊急時のみ実行。保護ルールを削除せず、一時的に設定を緩和

1. **設定確認と問題特定**
   ```bash
   # 現在の保護設定を確認
   gh api "repos/:owner/:repo/branches/main/protection"
   # 失敗している具体的なチェックを特定
   gh pr checks [PR番号]
   ```

2. **安全な設定更新（削除しない）**
   ```bash
   # 問題のあるチェック名のみを一時的に除外
   gh api --method PUT "repos/:owner/:repo/branches/main/protection" \
     --field required_status_checks='{"strict":true,"contexts":["Backend Tests & Build","Backend Code Quality v2"]}' \
     --field enforce_admins=true \
     --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"restrict_dismissal_reviews":false}' \
     --field allow_force_pushes=false \
     --field allow_deletions=false \
     --field restrictions=null
   ```

3. **マージ実行**
   ```bash
   gh pr merge [PR番号] --squash
   ```

5. **完全な保護ルールの復旧**
   ```bash
   # 全ての正しい設定で復旧（包括的な保護設定）
   gh api --method PUT "repos/:owner/:repo/branches/main/protection" \
     --field required_status_checks='{"strict":true,"contexts":["Backend Tests & Build","Backend Code Quality v2","Code Security Scan"]}' \
     --field enforce_admins=true \
     --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"restrict_dismissal_reviews":false}' \
     --field allow_force_pushes=false \
     --field allow_deletions=false \
     --field block_creations=false \
     --field restrictions=null
   ```

6. **検証実行**

### 問い合わせ先

設定に関する問題や改善提案は、以下の方法でご連絡ください：

- **自動生成issue**: 検出時に自動作成されるissueにコメント
- **手動issue**: "branch-protection", "maintenance" ラベルでissue作成
- **緊急時**: @takanorisuzukiにmentionで即座に通知
