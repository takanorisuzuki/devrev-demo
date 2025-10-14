# DriveRev アーキテクチャ・設計ドキュメント

このディレクトリには、DriveRev プロジェクトのアーキテクチャ、設計決定、実装計画に関するドキュメントが含まれています。

## 📚 ドキュメント一覧

### 1. [システムアーキテクチャ概要](./overview.md)

**元ファイル**: `01_ARCHITECTURE.md`

- システム全体のアーキテクチャ設計
- コンポーネント構成
- 技術スタック
- データフロー

**対象読者**: アーキテクト、テックリード、開発者全般

---

### 2. [機能比較分析](./feature-comparison.md)

**元ファイル**: `02_FEATURE_COMPARISON.md`

- PetStore vs DriveRev の機能比較
- ドメイン特有の要件分析
- 機能マッピング

**対象読者**: プロダクトマネージャー、アーキテクト

---

### 3. [実装計画](./implementation-plan.md)

**元ファイル**: `03_IMPLEMENTATION_PLAN.md`

- 実装ステップの詳細
- フェーズ分け
- タスク優先順位
- リソース計画

**対象読者**: プロジェクトマネージャー、開発リード

---

### 4. [DevRev 統合設計](./devrev-integration.md)

**元ファイル**: `04_DEVREV_INTEGRATION.md`

- DevRev PLuG 統合アーキテクチャ
- AI Agent 設定
- Workflow 設計
- Knowledge Base 構成

**対象読者**: DevRev 管理者、統合担当者

---

### 5. [実装分析](./implementation-analysis.md)

**元ファイル**: `05_IMPLEMENTATION_ANALYSIS.md`

- 実装済み機能の詳細分析
- コードベース構造
- 設計パターン
- ベストプラクティス

**対象読者**: 開発者、コードレビュアー

---

## 🗺️ ドキュメントナビゲーション

### 初めて読む方へ

1. [システムアーキテクチャ概要](./overview.md) → プロジェクト全体の理解
2. [機能比較分析](./feature-comparison.md) → ドメイン理解
3. [DevRev 統合設計](./devrev-integration.md) → PLuG 統合の理解

### 開発者向け

1. [実装分析](./implementation-analysis.md) ⭐ → コードベース理解
2. [実装計画](./implementation-plan.md) → 開発ロードマップ
3. [システムアーキテクチャ概要](./overview.md) → 技術スタック

### PM/アーキテクト向け

1. [実装計画](./implementation-plan.md) ⭐ → プロジェクト管理
2. [機能比較分析](./feature-comparison.md) → 要件定義
3. [システムアーキテクチャ概要](./overview.md) → システム設計

---

## 🔗 関連ドキュメント

- **[ハンズオンラボ](../hands-on/)** - 実際に動かして学ぶ
- **[Knowledge Base](../knowledge-base/)** - FAQ、店舗情報、車両ガイド
- **[メイン README](../../README.md)** - プロジェクト概要

---

## 📝 Living Document

これらのドキュメントは **Living Document** として管理されています：

- 実装の進捗に応じて継続的に更新
- 設計変更は必ず反映
- 各ドキュメントに最終更新日を記載

**最終更新**: 2024 年 10 月 14 日

---

## ❓ サポート

ドキュメントに関する質問や提案は、GitHub Issue またはプロジェクトチャネルでお知らせください。
