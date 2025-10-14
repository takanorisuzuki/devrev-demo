# コードスタイルと規約

## コードフォーマット
- **Black** - 公式Pythonコードフォーマッター
- **isort** - Import文の自動整理

## Linting
- **Flake8** - PEP 8準拠のLinter

## 型チェック
- **mypy** - 静的型チェック
- 型ヒントを可能な限り使用

## 命名規則

### ファイル名
- スネークケース: `user_service.py`, `admin_users.py`
- 明確で説明的な名前

### クラス名
- パスカルケース: `Settings`, `UserService`, `VehicleModel`
- Pydanticスキーマ: `UserCreate`, `VehicleResponse`, `ReservationUpdate`

### 関数名・変数名
- スネークケース: `get_user_by_id()`, `current_user`, `access_token`
- 動詞 + 名詞の組み合わせ

### 定数
- 大文字のスネークケース: `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`

## ドキュメント文字列（Docstrings）
```python
"""
関数の簡潔な説明

詳細な説明（必要に応じて）

Args:
    param1: パラメータ1の説明
    param2: パラメータ2の説明

Returns:
    戻り値の説明

Raises:
    ExceptionType: 例外の説明
"""
```

- モジュールの先頭に日本語でドキュメント文字列を記載
- 例: `"""DriveRev FastAPI メインアプリケーション"""`

## ディレクトリ構造の規約
```
app/
├── main.py              # エントリーポイント
├── api/v1/              # APIエンドポイント（バージョン管理）
├── core/                # コア機能（設定、認証、セキュリティ）
├── models/              # SQLAlchemy ORM モデル
├── schemas/             # Pydantic スキーマ
├── services/            # ビジネスロジック層
├── db/                  # データベース設定
├── scripts/             # ユーティリティスクリプト
└── utils/               # 汎用ユーティリティ
```

## インポート順序（isort設定）
1. 標準ライブラリ
2. サードパーティライブラリ
3. ローカルアプリケーション/ライブラリ

## エラーハンドリング
- 適切な HTTPException を使用
- カスタムエラースキーマ (`schemas/error.py`) を活用

## 非同期関数
- 可能な限り `async`/`await` を使用
- データベース操作は非同期対応

## セキュリティ
- パスワードは必ずハッシュ化
- JWTトークンによる認証
- CORS設定は明示的に管理
- 環境変数で機密情報を管理 (`.env`ファイル)

## データベース
- Alembicでマイグレーション管理
- モデル変更時は必ずマイグレーション作成
- シード データは `scripts/` ディレクトリで管理

## テスト
- `tests/` ディレクトリにテストコード配置
- `conftest.py` でフィクスチャ定義
- テストクライアントは `TestClient` を使用
- カバレッジ80%以上を目標