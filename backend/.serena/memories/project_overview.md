# プロジェクト概要

## プロジェクト名
**DriveRev Backend** - レンタカーサービスAPIバックエンド

## 目的
DriveRevは、レンタカーサービスを提供するためのREST APIバックエンドシステムです。顧客向けの予約機能と管理者向けの管理機能を提供します。

## 主要機能

### 1. 認証・認可システム
- JWTベースの認証（アクセストークン/リフレッシュトークン）
- ロールベースアクセス制御（Customer, Admin）
- パスワードハッシング（bcrypt）
- ユーザーロック機能

### 2. 車両管理
- 車両CRUD操作
- 画像管理
- 喫煙可否フラグ
- 店舗との紐付け
- 車両空き状況チェック

### 3. 店舗管理
- 店舗情報管理
- 営業時間ポリシー
- 地域マッピング

### 4. 予約システム
- 予約作成・更新・削除
- 車両空き状況の自動チェック
- 料金計算ロジック
- 予約統計情報
- 過去予約のサポート

### 5. 決済処理
- 決済API統合
- Webhook受信処理
- 決済履歴管理

### 6. 管理者機能
- ユーザー管理
- 予約管理
- 統計ダッシュボード
- 店舗管理

## アーキテクチャパターン
レイヤードアーキテクチャを採用：
- **API Layer**: FastAPIルーター（`app/api/v1/`）
- **Service Layer**: ビジネスロジック（`app/services/`）
- **Model Layer**: SQLAlchemy ORM（`app/models/`）
- **Schema Layer**: Pydanticバリデーション（`app/schemas/`）

## エントリーポイント
- `app/main.py` - FastAPIアプリケーションのメインファイル
- OpenAPI Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`