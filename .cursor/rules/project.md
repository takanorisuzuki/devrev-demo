# Cursor Project Rules - DevRev Demo

## 重要な学習事項とルール

### 🔴 CRITICAL: PR作成とレビュー対応のルール

#### PRの基本ワークフロー
- **必須**: PRは必ずdevelopブランチに向けて作成（mainへの直接PRは絶対禁止）
- **順序**: feature → develop → main のワークフローを厳守
- **命名**: ブランチ名は `feature/機能名` の形式

#### Gemini Code Assistレビュー対応
- **完全対応必須**: PRのオープンコメントは全て対応しないとマージ不可
- **Resolve Conversation**: 技術的対応完了後、必ずGUIから「Resolve Conversation」実行
- **対応報告**: レビュー対応後にGeminiにコメントで報告し、resolve依頼

#### CIチェック完了確認
- **必須チェック**: Backend Tests & Build, Backend Code Quality v2, Code Security Scan
- **全CI完了**: 全てのCIが完了するまでマージしない
- **ステータス確認**: `gh pr checks [PR番号]` で詳細確認

### 🟡 重要な技術的学習

#### ブランチ保護ルールの管理
- **名前の整合性**: GitHub Actionsのジョブ名とブランチ保護の必須チェック名は完全一致が必要
- **設定確認**: `gh api "repos/:owner/:repo/branches/main/protection"` で現在設定確認
- **安全な更新**: 保護ルールは削除せず、包括的な設定で更新

#### Dependabotセキュリティ設定
- **Docker監視必須**: package-ecosystem: "docker" の設定は削除してはいけない
- **セキュリティラベル**: 依存関係更新には "security" ラベル付与
- **定期実行**: 週次スケジュールでセキュリティ更新を監視

#### 緊急時の対応手順
- **段階的解決**: 問題特定 → 一時的設定緩和 → マージ → 完全復旧
- **DELETE禁止**: `gh api --method DELETE` での保護ルール削除は危険
- **検証実行**: 設定変更後は必ず検証スクリプト実行

### 🟢 ベストプラクティス

#### ファイル組織
- **スクリプト**: `scripts/` ディレクトリに実行可能ファイル
- **ドキュメント**: `docs/` ディレクトリに保守運用ガイド
- **ワークフロー**: `.github/workflows/` に監視・自動化システム

#### エラー処理とロバスト性
- **動的検出**: ハードコードではなく動的なファイル検出
- **フォールバック**: yq未使用時のawk/grep代替ロジック
- **エラーハンドリング**: 想定外の状況への適切な対応

#### セキュリティ重視
- **最小権限**: 必要最小限の権限での操作
- **設定保持**: 既存のセキュリティ設定を必ず保持
- **定期監視**: 自動化による継続的なセキュリティチェック

### 🛠️ 実用的なコマンド集

#### PR管理
```bash
# PRのベースブランチ確認・変更
gh pr view [PR番号] --json baseRefName,headRefName
gh pr edit [PR番号] --base develop

# CI状況とマージ状態確認
gh pr checks [PR番号]
gh pr view [PR番号] --json mergeable,mergeStateStatus,reviewDecision

# Auto-merge設定
gh pr merge [PR番号] --squash --auto
```

#### ブランチ保護管理
```bash
# 現在の保護設定確認
gh api "repos/:owner/:repo/branches/main/protection"

# 安全な設定更新（全設定保持）
gh api --method PUT "repos/:owner/:repo/branches/main/protection" \
  --field required_status_checks='{"strict":true,"contexts":["チェック名1","チェック名2"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field restrictions=null
```

#### デバッグとトラブルシューティング
```bash
# ワークフロー実行履歴確認
gh run list --branch [ブランチ名] --limit 5

# 失敗したワークフローの詳細
gh run view [実行ID] --log-failed

# リポジトリの基本情報確認
gh repo view --json nameWithOwner,defaultBranch
```

### 📝 今回の具体的な修正事例

#### 1. 危険なコマンドの修正
```bash
# ❌ 危険: 保護ルール削除
gh api --method DELETE "repos/:owner/:repo/branches/main/protection"

# ✅ 安全: 包括的設定更新
gh api --method PUT "repos/:owner/:repo/branches/main/protection" \
  --field required_status_checks='...' \
  --field enforce_admins=true \
  # その他の全設定を含む
```

#### 2. 動的ファイル検出の実装
```bash
# ❌ ハードコード
WORKFLOW_FILES=(".github/workflows/ci.yml" ".github/workflows/quality.yml")

# ✅ 動的検出
WORKFLOW_FILES=($(find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null))
```

#### 3. 適切なエラーハンドリング
```bash
# 条件分岐での安全な処理
if [[ ${#WORKFLOW_FILES[@]} -eq 0 ]]; then
    echo "⚠️  ワークフローファイルが見つかりません"
    exit 1
fi
```

### 🎯 次回への教訓

1. **PR作成時**: 即座にベースブランチがdevelopか確認
2. **レビュー受信時**: 技術対応だけでなく、必ずResolve Conversation実行
3. **CI失敗時**: ログを詳細確認し、根本原因を特定してから修正
4. **セキュリティ設定**: 削除ではなく、包括的な更新で対応
5. **検証スクリプト**: 動的検出とフォールバック処理を含む堅牢な実装

これらのルールに従うことで、今回のようなPRの適切な管理とマージが可能になります。