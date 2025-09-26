# 🚀 Solo Development Quick Guide

**DevRev リポジトリでのソロ開発向けクイックリファレンス**

## ⚡ 日常開発フロー

### 🛠️ 基本ワークフロー（推奨）

```bash
# 1. 最新のdevelopをベースに機能ブランチ作成
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. 開発・テスト・コミット
# ... コード作成 ...
npm test                    # フロントエンド
python -m pytest          # バックエンド

git add .
git commit -m "feat: add new feature"

# 3. developに直接マージ（高速）
git checkout develop
git merge feature/your-feature-name
git push origin develop

# 4. 機能ブランチ削除
git branch -d feature/your-feature-name
```

### 🎯 本番リリースフロー

```bash
# 1. developからmainへプルリクエスト作成
gh pr create --base main --head develop \
  --title "Release: v1.2.0" \
  --body "新機能とバグ修正のリリース"

# 2. CI/CDチェック完了を待つ
gh pr checks

# 3. 自己承認してマージ（承認者0人設定）
gh pr merge --squash

# 4. リリースタグ作成
git checkout main && git pull
git tag v1.2.0
git push origin v1.2.0
```

## 🔧 設定済み保護ルール

### **main ブランチ**（適度に厳格）
- ✅ プルリクエスト必須
- ✅ **承認者0人**（自己承認可）
- ✅ CI/CDチェック必須
- ✅ 会話解決必須

### **develop ブランチ**（高速開発）
- ✅ **直接プッシュ可**
- ✅ CI基本チェックのみ
- ✅ strict設定なし（柔軟）

## 🛡️ 自動セキュリティ機能

- 🔒 **Secret Scanning**: 機密情報の自動検出
- 🔒 **Push Protection**: コミット前ブロック
- 🔒 **Dependabot**: 脆弱性の自動修正

## 📋 クイックコマンド

### **開発開始**
```bash
git checkout develop && git pull origin develop
git checkout -b feature/new-feature
```

### **緊急修正**
```bash
git checkout main && git pull origin main
git checkout -b hotfix/critical-fix
# 修正後
gh pr create --base main --head hotfix/critical-fix
```

### **依存関係更新**
```bash
# ⚠️ 注意: 手動更新はDependabotの安定性戦略と競合する可能性があります
# 基本的にはDependabotの自動PRを利用することを推奨

# フロントエンド（パッチレベルのみ）
cd frontend && npm update --save --save-exact

# バックエンド（セキュリティアップデートのみ）
cd backend && pip install --upgrade --upgrade-strategy only-if-needed -r requirements.txt

# Dependabotが管理する更新を確認
gh pr list --label "dependencies"
```

### **品質チェック**
```bash
# フロントエンド
npm run lint && npm run type-check && npm test

# バックエンド
python -m flake8 && python -m pytest
```

## 🎛️ 効率化のコツ

### ✅ **やること**
- developへの直接プッシュを活用
- CI/CDによる自動品質チェックに依存
- 自己承認でmainへの迅速なリリース
- Dependabot PRの自動マージを利用

### ❌ **やらないこと**
- 複雑なブランチ戦略
- 過度なドキュメント作成
- 不必要なレビュープロセス
- 手動での品質チェック

## 🆘 トラブルシューティング

### **CI/CDが失敗する**
```bash
# ローカルで同じチェックを実行
npm run lint && npm run type-check && npm test
python -m flake8 && python -m pytest
```

### **プッシュが拒否される**
```bash
# ブランチ保護を確認
gh api repos/:owner/:repo/branches/main/protection

# 最新に更新してから再試行
git pull origin main
```

### **マージコンフリクト**
```bash
# developの最新を取得
git checkout develop && git pull origin develop

# 機能ブランチに反映
git checkout feature/your-branch
git merge develop
# コンフリクト解決後
git add . && git commit
```

## 📊 パフォーマンス指標

### **目標値**
- PR作成〜マージ: **30分以内**
- CI/CD実行時間: **15分以内**
- 緊急修正: **1時間以内**

### **品質指標**
- テストカバレッジ: **80%以上**
- セキュリティスキャン: **クリア必須**
- 型チェック: **エラーゼロ**

---

💡 **Tips**: 迷った時は`develop`に直接プッシュ。品質はCI/CDが保証し、効率を最大化できます。
