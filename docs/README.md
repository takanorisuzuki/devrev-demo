# DriveRev ドキュメント

**DriveRev** - DevRev PLuG 統合を備えたレンタカーサービスのデモアプリケーション

このディレクトリには、DriveRev プロジェクトに関する全てのドキュメントが含まれています。

---

## 📚 ドキュメント構造

```
docs/
├── README.md (このファイル)              # ドキュメント全体マップ
│
├── architecture/                          # 🏗️ アーキテクチャ・設計ドキュメント
│   ├── README.md                         # アーキテクチャドキュメント案内
│   ├── overview.md                       # システムアーキテクチャ概要
│   ├── feature-comparison.md             # 機能比較分析
│   ├── implementation-plan.md            # 実装計画（12週間）
│   ├── devrev-integration.md             # DevRev統合設計
│   └── implementation-analysis.md        # 実装分析（13の重要課題）
│
├── hands-on/                              # 🎓 ハンズオンラボ
│   ├── README.md                         # ハンズオンラボ案内
│   ├── driverev-lab/                     # DriveRev ラボ
│   │   ├── README.md                     # ラボガイド（日本語）
│   │   └── workflows/                    # DevRev Workflow定義
│   │       ├── README.md
│   │       ├── *.json                    # Workflowテンプレート
│   │       └── WORKFLOW_MAPPING.md
│   │
│   └── The PetStore Lab Guide.md         # 参照システムラボガイド
│
├── knowledge-base/                        # 📖 Knowledge Base
│   ├── faq.md                            # よくある質問
│   ├── store-locations.md                # 店舗情報
│   └── vehicle-types-guide.md            # 車両タイプガイド
│
├── ARCHITECTURE.md                        # プロジェクト全体アーキテクチャ
├── CICD_REFACTORING.md                   # CI/CDリファクタリング
├── CI_ANALYSIS_2025.md                   # CI分析レポート
└── MAINTENANCE.md                        # 保守運用ガイド
```

---

## 🎯 目的別クイックナビゲーション

### 🚀 すぐに動かしたい

→ **[ハンズオンラボガイド](./hands-on/driverev-lab/README.md)**

- 環境構築から PLuG 動作まで体験
- 所要時間: 2-3 時間

### 👨‍💻 実装を担当する（開発者）

1. **[実装分析](./architecture/implementation-analysis.md)** ⭐ 必読
   - 13 の重要課題を把握
2. **[実装計画](./architecture/implementation-plan.md)**
   - Phase 1 から順に実装
3. **[DevRev 統合設計](./architecture/devrev-integration.md)**
   - 実装時のリファレンス

### 🏗️ 設計を理解したい（アーキテクト）

1. **[アーキテクチャ概要](./architecture/overview.md)**
   - システム全体の設計
2. **[機能比較分析](./architecture/feature-comparison.md)**
   - ドメイン理解
3. **[実装分析](./architecture/implementation-analysis.md)**
   - 技術的深堀り

### 📊 プロジェクトを管理する（PM）

1. **[実装分析](./architecture/implementation-analysis.md)** ⭐ 必読
   - リスクと優先順位
2. **[実装計画](./architecture/implementation-plan.md)**
   - 12 週間のロードマップ
3. **[保守運用ガイド](./MAINTENANCE.md)**
   - 運用設計

---

## 📁 各ディレクトリの詳細

### 🏗️ [architecture/](./architecture/)

**アーキテクチャ・設計ドキュメント**

DriveRev のシステム設計、技術スタック、実装計画に関するドキュメント。

**主なドキュメント:**

- `overview.md` - システム全体のアーキテクチャ
- `implementation-analysis.md` ⭐ - 13 の重要課題分析
- `implementation-plan.md` - 12 週間の実装ロードマップ
- `devrev-integration.md` - DevRev PLuG 統合設計
- `feature-comparison.md` - 参照システムとの機能比較

**対象読者**: 開発者、アーキテクト、プロジェクトマネージャー

---

### 🎓 [hands-on/](./hands-on/)

**ハンズオンラボ**

実際に手を動かして学ぶための実践的なガイド。

**主なコンテンツ:**

- `driverev-lab/README.md` - ステップバイステップのラボガイド
- `driverev-lab/workflows/` - DevRev Workflow テンプレート集

**対象読者**: 初学者、DevRev を初めて使う方

---

### 📖 [knowledge-base/](./knowledge-base/)

**Knowledge Base**

DevRev AI Agent が参照する FAQ、マニュアル、ガイド。

**主なコンテンツ:**

- `faq.md` - よくある質問
- `store-locations.md` - 店舗情報
- `vehicle-types-guide.md` - 車両タイプガイド

**対象読者**: カスタマーサポート、エンドユーザー

---

## 🗺️ 学習の順序

### 初めての方（0 日目）

```
hands-on/README.md → driverev-lab/README.md
```

### 開発者（1 日目〜）

```
architecture/implementation-analysis.md (必読)
↓
architecture/implementation-plan.md
↓
architecture/devrev-integration.md
↓
実装開始
```

### アーキテクト（1 日目）

```
architecture/overview.md
↓
architecture/feature-comparison.md
↓
architecture/implementation-analysis.md
```

### プロジェクトマネージャー（1 日目）

```
architecture/implementation-analysis.md (必読)
↓
architecture/implementation-plan.md
↓
MAINTENANCE.md
```

---

## 🔗 関連リソース

### プロジェクトルート

- **[README.md](../README.md)** - プロジェクト概要
- **[compose.yml](../compose.yml)** - Docker Compose 設定
- **[.env.example](../env.example)** - 環境変数テンプレート

### Backend

- **[backend/README.md](../backend/)** - バックエンド技術仕様
- **[backend/requirements.txt](../backend/requirements.txt)** - Python 依存関係

### Frontend

- **[frontend/README.md](../frontend/)** - フロントエンド技術仕様
- **[frontend/package.json](../frontend/package.json)** - npm 依存関係

---

## 📝 ドキュメント更新ルール

これらのドキュメントは **Living Document** として管理されています：

1. **実装の進捗に応じて更新**: 新機能追加時はドキュメントも同時更新
2. **設計変更は必ず反映**: アーキテクチャ変更時は該当ドキュメントを更新
3. **最終更新日を記載**: 各ドキュメントの最後に更新日を明記

---

## ❓ よくある質問

**Q: どのドキュメントから読めばいいですか？**
→ A: [目的別クイックナビゲーション](#-目的別クイックナビゲーション) を参照してください

**Q: ハンズオンラボはどれくらい時間がかかりますか？**
→ A: 環境構築込みで 2-3 時間です（[hands-on/driverev-lab/](./hands-on/driverev-lab/)）

**Q: DevRev 統合の実装方法は？**
→ A: [architecture/devrev-integration.md](./architecture/devrev-integration.md) を参照

**Q: 実装の優先順位は？**
→ A: [architecture/implementation-analysis.md](./architecture/implementation-analysis.md) の 13 の重要課題を確認

---

## 📞 サポート

- **質問・バグ報告**: [GitHub Issues](https://github.com/takanorisuzuki/devrev-demo/issues)
- **フィードバック**: プロジェクトメンテナーに連絡

---

**最終更新**: 2024 年 10 月 14 日

**ドキュメント構造**: v2.0（architecture/, hands-on/ 分離）
