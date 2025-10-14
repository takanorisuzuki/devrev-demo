# プロジェクト構造

## ディレクトリツリー

```
backend/
├── alembic/                    # データベースマイグレーション
│   ├── versions/              # マイグレーションスクリプト（11ファイル）
│   ├── env.py                 # Alembic環境設定
│   └── script.py.mako         # マイグレーションテンプレート
│
├── app/                       # メインアプリケーション
│   ├── __init__.py
│   ├── main.py               # ⭐ FastAPIエントリーポイント
│   │
│   ├── api/                  # APIレイヤー
│   │   └── v1/               # API v1エンドポイント
│   │       ├── router.py     # ルーター統合
│   │       ├── auth.py       # 認証（ログイン/登録）
│   │       ├── vehicles.py   # 車両管理
│   │       ├── stores.py     # 店舗管理
│   │       ├── reservations.py       # 予約管理
│   │       ├── payments.py           # 決済処理
│   │       ├── admin_users.py        # 管理者: ユーザー管理
│   │       ├── admin_reservations.py # 管理者: 予約管理
│   │       ├── admin_stats.py        # 管理者: 統計情報
│   │       ├── admin_stores.py       # 管理者: 店舗管理
│   │       └── system_settings.py    # システム設定
│   │
│   ├── core/                 # コア機能
│   │   ├── auth.py           # JWT認証ロジック
│   │   ├── config.py         # ⭐ アプリケーション設定（Pydantic Settings）
│   │   ├── enums.py          # 列挙型定義（UserRole, VehicleCategory等）
│   │   └── security.py       # セキュリティユーティリティ
│   │
│   ├── db/                   # データベース
│   │   ├── database.py       # DB接続とセッション管理
│   │   └── init.sql/         # 初期SQLスクリプト
│   │
│   ├── models/               # SQLAlchemy ORM モデル
│   │   ├── user.py           # ユーザーモデル
│   │   ├── vehicle.py        # 車両モデル
│   │   ├── store.py          # 店舗モデル
│   │   ├── reservation.py    # 予約モデル
│   │   ├── system_settings.py # システム設定モデル
│   │   └── user_lock.py      # ユーザーロックモデル
│   │
│   ├── schemas/              # Pydantic スキーマ
│   │   ├── user.py           # ユーザースキーマ
│   │   ├── vehicle.py        # 車両スキーマ
│   │   ├── store.py          # 店舗スキーマ
│   │   ├── reservation.py    # 予約スキーマ
│   │   ├── payment.py        # 決済スキーマ
│   │   ├── availability.py   # 空き状況スキーマ
│   │   ├── store_hours_policy.py
│   │   ├── system_settings.py
│   │   ├── reservation_stats.py
│   │   ├── error.py          # エラースキーマ
│   │   └── webhook_receipt.py
│   │
│   ├── services/             # ビジネスロジック層
│   │   ├── user.py           # ユーザー操作
│   │   ├── vehicle.py        # 車両操作
│   │   ├── store.py          # 店舗操作
│   │   ├── reservation.py    # 予約ロジック
│   │   ├── payment.py        # 決済処理
│   │   ├── availability.py   # 車両空き状況
│   │   ├── price_calculator.py # 料金計算
│   │   ├── store_hours_policy.py
│   │   ├── system_settings.py
│   │   ├── reservation_stats.py
│   │   ├── user_lock.py
│   │   └── webhook_receipt.py
│   │
│   ├── scripts/              # データベースセットアップスクリプト
│   │   ├── init_database.py          # ⭐ DB初期化メインスクリプト
│   │   ├── create_sample_users.py
│   │   ├── create_sample_vehicles.py
│   │   ├── create_sample_stores.py
│   │   ├── create_sample_reservations.py
│   │   ├── create_demo_vehicles.py
│   │   ├── create_past_reservations.py
│   │   ├── reset_and_seed_demo_vehicles.py
│   │   ├── cleanup_duplicate_reservations.py
│   │   ├── assign_stores_to_vehicles.py
│   │   ├── update_vehicle_images.py
│   │   └── fix_customer1_password.py
│   │
│   ├── utils/                # ユーティリティ
│   │   ├── store_mapping.py  # 店舗マッピング
│   │   └── validators.py     # カスタムバリデーター
│   │
│   └── middleware/           # ミドルウェア（現在空）
│
├── tests/                    # テストスイート
│   ├── conftest.py           # ⭐ Pytestフィクスチャ定義
│   └── test_main.py          # メインテスト
│
├── assets/                   # 静的アセット
├── .serena/                  # Serena設定
│   └── project.yml           # Serenaプロジェクト設定
│
├── alembic.ini               # ⭐ Alembic設定ファイル
├── requirements.txt          # ⭐ Python依存関係
├── Dockerfile                # ⭐ Docker Multi-stage build
├── entrypoint.sh             # ⭐ コンテナエントリーポイント
├── test.db                   # SQLiteテストDB
└── .trivyignore              # Trivyセキュリティスキャン除外設定
```

## 重要ファイル

| ファイル | 説明 |
|---------|------|
| `app/main.py` | FastAPIアプリケーションのメインエントリーポイント |
| `app/core/config.py` | 環境変数ベースの設定管理 |
| `app/api/v1/router.py` | 全エンドポイントの統合ルーター |
| `alembic/versions/` | データベースマイグレーション履歴 |
| `requirements.txt` | Python依存パッケージ一覧 |
| `Dockerfile` | Alpine Linux ベースのMulti-stage build |
| `entrypoint.sh` | DB待機、マイグレーション、シード実行後にuvicorn起動 |
| `tests/conftest.py` | テスト用フィクスチャ（TestClient等） |

## データフロー

```
Request → FastAPI Router (api/v1/*.py)
    ↓
Pydantic Schema (schemas/*.py) ← バリデーション
    ↓
Service Layer (services/*.py) ← ビジネスロジック
    ↓
ORM Model (models/*.py) ← データアクセス
    ↓
Database (PostgreSQL)
    ↓
Response ← FastAPI Router ← Pydantic Schema (シリアライゼーション)
```