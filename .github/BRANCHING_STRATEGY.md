# 🌿 DevRev ブランチ戦略ガイド

## 🎯 戦略の目標
- **効率性**: 不必要な複雑さを排除
- **品質保証**: リスクに応じた適切なレビュー
- **柔軟性**: 変更の種類に応じたフロー選択

## 📊 混合戦略アプローチ

### ✅ **Main直接マージ** (効率優先)
変更の影響が限定的で、リスクが低い場合

**対象:**
- 🔧 **Infrastructure**: `.github/`, CI/CD設定, ワークフロー
- 📦 **Dependencies**: Dependabot PR、セキュリティパッチ
- 🚨 **Hotfix**: 緊急修正、クリティカルバグフィックス
- 📝 **Documentation**: README、docs、コメント、型定義
- ⚙️ **Configuration**: 環境設定、ラベル、テンプレート
- 🎨 **Style**: コードフォーマット、linter設定

**フロー:**
```
feature/infrastructure-xxx → main (PR)
chore/deps-update → main (PR + 自動マージ)
hotfix/critical-bug → main (PR)
docs/update-readme → main (PR)
```

### 🔄 **Develop経由マージ** (品質優先)
ビジネスロジックに影響し、統合テストが必要な場合

**対象:**
- 🎮 **New Features**: 新機能、UI/UX変更
- 🔌 **API Changes**: エンドポイント変更、スキーマ変更
- 🗄️ **Database**: マイグレーション、データモデル変更
- 💰 **Business Logic**: 支払い、認証、予約システム
- 🚗 **Vehicle Management**: 車両管理、在庫システム
- 👤 **User Management**: ユーザー管理、権限システム

**フロー:**
```
feature/new-booking-flow → develop (PR) → main (PR)
feature/user-authentication → develop (PR) → main (PR)
feature/payment-integration → develop (PR) → main (PR)
```

## 🏷️ **ブランチ命名規則**

### Main直接マージ用
```bash
# Infrastructure
infra/github-actions-update
chore/dependabot-config
ci/improve-workflow

# Hotfix
hotfix/security-patch-v1.2.3
hotfix/critical-payment-bug

# Documentation
docs/api-documentation
docs/deployment-guide
```

### Develop経由マージ用
```bash
# Features
feature/advanced-search
feature/booking-calendar
feature/user-dashboard

# Bug fixes
bugfix/reservation-validation
bugfix/vehicle-availability
```

## 🎛️ **自動化ルール**

### 🤖 **Dependabot自動マージ**
- Patch版アップデート: 自動マージ
- 開発依存関係: 自動マージ
- 型定義: 自動マージ
- GitHub Actions minor/patch: 自動マージ

### 👤 **セルフレビュー対象**
- Infrastructure変更
- Documentation更新
- 設定ファイル変更
- 緊急修正（事後レビュー）

### 👥 **チームレビュー推奨**
- 新機能実装
- API変更
- データベース変更
- ビジネスロジック変更

## 🚦 **決断フローチャート**

```
変更を開始する前に:

┌─ 緊急性はあるか？
├─ YES → hotfix/xxx → main
└─ NO ↓

┌─ インフラ・設定・ドキュメントか？
├─ YES → chore/xxx or docs/xxx → main
└─ NO ↓

┌─ ユーザー機能・APIに影響するか？
├─ YES → feature/xxx → develop → main
└─ NO → main直接でOK
```

## 📈 **パフォーマンス測定**

### 効率性指標
- **PR作成〜マージ時間**: 24時間以内（85%）
- **レビュー待ち時間**: 4時間以内（90%）
- **CI/CD実行時間**: 15分以内

### 品質指標
- **Post-merge障害**: 月2件以下
- **Hotfixの頻度**: 月1件以下
- **セキュリティ脆弱性**: 24時間以内に修正

## 🔄 **移行計画**

### フェーズ1: ルール策定（完了）
- ✅ ブランチ戦略定義
- ✅ 自動化設定
- ✅ ガイドライン作成

### フェーズ2: テスト期間（1-2週間）
- 🔄 新ルールでの運用開始
- 📊 メトリクス収集
- 🔧 必要に応じた調整

### フェーズ3: 最適化（継続的）
- 📈 データに基づく改善
- 🤖 さらなる自動化
- 👥 チームフィードバック反映

## 🆘 **例外処理**

### 緊急時プロトコル
1. **セキュリティ脆弱性**: hotfix → main （即座）
2. **本番障害**: hotfix → main （レビュー並行）
3. **重要バグ**: 状況に応じてfeature → develop または hotfix → main

### ルール変更権限
- **プロジェクトリード**: 戦略全体の変更
- **テックリード**: 技術判断でのフロー選択
- **開発者**: ガイドライン内での柔軟な判断

---

> 💡 **Tips**: 迷った時は「この変更がユーザーに直接影響するか？」を基準に判断しましょう。影響するならdevelop経由、しないならmain直接でOKです。