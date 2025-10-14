# タスク完了時のチェックリスト

## コード品質チェック

### 1. フォーマット
```bash
# Blackでコードフォーマット
black app/ tests/

# Import文整理
isort app/ tests/
```

### 2. Linting
```bash
# Flake8でコードチェック
flake8 app/ tests/

# エラーがあれば修正する
```

### 3. 型チェック
```bash
# mypyで型チェック
mypy app/

# 型ヒントの追加・修正
```

### 4. テスト実行
```bash
# 全テスト実行
pytest

# カバレッジ確認
pytest --cov=app --cov-report=term-missing

# テストが失敗していないことを確認
```

## データベース関連

### 5. マイグレーション確認
- モデルを変更した場合は必ずマイグレーション作成
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### 6. シードデータ
- 必要に応じてシードスクリプト実行
```bash
python -m app.scripts.init_database
```

## ドキュメント

### 7. Docstring追加
- 新しい関数・クラスにドキュメント文字列追加
- 複雑なロジックにはコメント追加

### 8. OpenAPI確認
- FastAPIの自動生成ドキュメント確認
- `http://localhost:8000/docs` にアクセスして動作確認

## セキュリティ

### 9. セキュリティチェック
- 機密情報が環境変数で管理されているか確認
- パスワードがハッシュ化されているか確認
- 適切な認証・認可が実装されているか確認

## Git

### 10. コミット前
```bash
# 変更ファイル確認
git status

# コミットメッセージは明確に
git commit -m "feat: 新機能の説明"
# または
git commit -m "fix: バグ修正の説明"
```

## 統合確認

### 11. ローカル動作確認
```bash
# アプリケーション起動
uvicorn app.main:app --reload

# Health Check確認
curl http://localhost:8000/health

# 主要エンドポイント動作確認
```

### 12. Docker確認（オプション）
```bash
# Dockerイメージビルド
docker build -t driverev-backend .

# コンテナ起動と動作確認
docker run -p 8000:8000 driverev-backend
```

## まとめコマンド
タスク完了前に以下を一括実行：
```bash
black app/ tests/ && \
isort app/ tests/ && \
flake8 app/ tests/ && \
mypy app/ && \
pytest --cov=app
```

全てパスすればタスク完了！✅