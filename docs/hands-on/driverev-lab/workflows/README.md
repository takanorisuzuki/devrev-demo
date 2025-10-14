# DevRev Workflow Skills テンプレート

このディレクトリには、DriveRev 用の DevRev Workflow Skills の定義ファイル（JSON）が含まれています。

## 📋 含まれるワークフロー

### ⚠️ 現状と課題

**重要**: このディレクトリの 15 個の JSON ファイルは**参照システム（Demo-PetStore）からコピーしたテンプレート**です。DriveRev 用に修正されていません。

| #   | ファイル                      | 説明                      | 参照システム名      | DriveRev 対応状況 |
| --- | ----------------------------- | ------------------------- | ------------------- | ----------------- |
| 1   | `get-api-key.json`            | ユーザーの API Key を取得 | `Getapikey`         | ❌ 未修正         |
| 2   | `get-user-info.json`          | ユーザー情報を取得        | `Getuserinfo`       | ❌ 未修正         |
| 3   | `book-reservation.json`       | 予約を作成                | `Bookappointment`   | ❌ 未修正         |
| 4   | `get-appointments.json`       | 予約一覧取得              | `Getappointments`   | ❌ 未修正         |
| 5   | `get-available-slots.json`    | 空き時間検索              | `Getavailableslots` | ❌ 未修正         |
| 6   | `get-available-vehicles.json` | 利用可能車両検索          | `Getavailablestaff` | ❌ 未修正         |
| 7   | `get-all-vehicles.json`       | 車両一覧                  | `Getallpets`        | ❌ 未修正         |
| 8   | `get-all-services.json`       | サービス一覧取得          | `Getallservices`    | ❌ 未修正         |
| 9   | `get-all-stores.json`         | 店舗一覧取得              | `Getallstaff`       | ❌ 未修正         |
| 10  | `get-order-status.json`       | 注文状況確認              | `Getorderstatus`    | ❌ 未修正         |
| 11  | `get-tracking-info.json`      | 追跡情報取得              | `Gettrackinginfo`   | ❌ 未修正         |
| 12  | `assign-conversation.json`    | 会話の担当者アサイン      | `Assignconvo`       | ❌ 未修正         |
| 13  | `resolve-conversation.json`   | 会話のクローズ            | `Resolveconvo`      | ❌ 未修正         |
| 14  | `create-ticket.json`          | チケット作成              | `Createticket`      | ❌ 未修正         |
| 15  | `register-account.json`       | アカウント登録            | `Registeraccount`   | ❌ 未修正         |

**テンプレートコピー済み**: 15/15（100%）  
**DriveRev 用に修正済み**: 0/15（0%）

#### 🌐 DriveRev の現在の URL

| サービス         | URL                                     | 説明                     |
| ---------------- | --------------------------------------- | ------------------------ |
| **Frontend**     | `http://34.182.56.160:3000`             | Next.js アプリケーション |
| **Backend API**  | `http://34.182.56.160:8000/api/v1`      | FastAPI エンドポイント   |
| **参照システム** | `https://petstore.devrev.community/api` | PetStore（修正前の URL） |

#### 📊 実装可能性の分析結果

**詳細な分析は [WORKFLOW_MAPPING.md](./WORKFLOW_MAPPING.md) を参照してください。**

| カテゴリ                    | 実装可能 | 代替実装 | 削除推奨 | DevRev API | 合計 |
| --------------------------- | -------- | -------- | -------- | ---------- | ---- |
| **DriveRev Backend 対応**   | 10       | 1        | 1        | -          | 12   |
| **DevRev API 直接呼び出し** | -        | -        | -        | 3          | 3    |
| **合計**                    | 10       | 1        | 1        | 3          | 15   |

**✅ 実装可能 (10 個)**: Phase 1 で実装

- `get-user-token.json` ← **新規実装（DevRev User ID → JWT Token）**
- `get-user-info.json`, `book-reservation.json`, `get-appointments.json`
- `get-available-slots.json`, `get-available-vehicles.json`
- `get-all-vehicles.json`, `get-all-stores.json`
- `get-order-status.json`, `register-account.json`

**⚠️ 要検討 (1 個)**:

- `get-all-services.json` → 車両カテゴリで代替可能

**❌ 実装不可・削除推奨 (5 個)**:

- `get-api-key.json` → JWT 認証に置き換え
- `get-tracking-info.json` → レンタカーには不要
- `assign-conversation.json`, `resolve-conversation.json`, `create-ticket.json` → DevRev API 直接呼び出し

> **重要**: DevRev 統合機能（会話アサイン、会話クローズ、チケット作成）は DriveRev Backend ではなく、**DevRev API** (`https://api.devrev.ai/`) を直接呼び出す必要があります。

> **次のステップ**: Phase 1 で実装可能な 9 個の Workflow を優先的に修正します。詳細は [WORKFLOW_MAPPING.md](./WORKFLOW_MAPPING.md) を参照。

### 参照システム（Demo-PetStore）との比較

参照システムには **15 個**の Workflow Skills があります。DriveRev でも同等の機能を実装する必要があります。

| #   | 参照システム        | DriveRev 対応                 | 説明                                        | Phase      |
| --- | ------------------- | ----------------------------- | ------------------------------------------- | ---------- |
| 1   | `Getapikey`         | `get-api-key.json`            | API Key 取得                                | ✅ Phase 1 |
| 2   | `Getuserinfo`       | `get-user-info.json`          | ユーザー情報取得                            | ✅ Phase 1 |
| 3   | `Bookappointment`   | `book-reservation.json`       | 予約作成（Appointment → Reservation）       | ✅ Phase 1 |
| 4   | `Getappointments`   | `get-reservations.json`       | 予約一覧取得                                | 📝 Phase 5 |
| 5   | `Getavailableslots` | `get-available-slots.json`    | 空き時間検索                                | 📝 Phase 5 |
| 6   | `Getavailablestaff` | `get-available-vehicles.json` | 利用可能車両検索（Staff → Vehicle）         | 📝 Phase 5 |
| 7   | `Getallpets`        | `get-all-vehicles.json`       | 車両一覧（Pets → Vehicles）                 | 📝 Phase 5 |
| 8   | `Getallservices`    | `get-all-services.json`       | サービス一覧取得                            | 📝 Phase 5 |
| 9   | `Getallstaff`       | `get-all-stores.json`         | 店舗一覧取得（Staff → Store）               | 📝 Phase 5 |
| 10  | `Getorderstatus`    | `get-reservation-status.json` | 予約状況確認（Order → Reservation）         | 📝 Phase 5 |
| 11  | `Gettrackinginfo`   | `get-vehicle-location.json`   | 車両位置情報（Tracking → Vehicle Location） | 📝 Phase 5 |
| 12  | `Assignconvo`       | `assign-conversation.json`    | 会話の担当者アサイン                        | 📝 Phase 5 |
| 13  | `Resolveconvo`      | `resolve-conversation.json`   | 会話のクローズ                              | 📝 Phase 5 |
| 14  | `Createticket`      | `create-ticket.json`          | チケット作成                                | 📝 Phase 5 |
| 15  | `Registeraccount`   | `register-account.json`       | アカウント登録                              | 📝 Phase 5 |

**現在の実装率**: 3/15（20%）

> **重要**: Issue #4（[05_IMPLEMENTATION_ANALYSIS.md](../05_IMPLEMENTATION_ANALYSIS.md#🔴-issue-4-決済注文管理のgapが完全に欠落)）で詳しく分析されているように、決済・注文管理に関連する Workflow Skills が完全に欠落しています。セルフラーニングとして完全な体験を提供するには、Phase 5 で残り 12 個の実装が必要です。

---

## 🚀 使い方

### 1. DevRev コンソールでのインポート

#### ステップ 1: DevRev にログイン

1. [DevRev Console](https://app.devrev.ai) にアクセス
2. 自分の組織を選択

#### ステップ 2: Agent Settings に移動

1. Settings → **Agents** → 使用する Agent を選択
2. **Skills** タブをクリック

#### ステップ 3: Skill のインポート

1. "**Create Skill**" ボタンをクリック
2. "**Import from JSON**" を選択
3. このディレクトリの JSON ファイルを選択してアップロード
4. **Base URL** を設定:
   - ローカル開発: `http://localhost:8000`
   - 本番環境: `https://your-driverev-domain.com`
5. "**Save**" をクリック

#### ステップ 4: 認証設定

各 Skill に認証ヘッダーを追加:

```json
{
  "headers": {
    "Authorization": "Bearer ${user_jwt_token}"
  }
}
```

または API Key 認証の場合:

```json
{
  "headers": {
    "X-API-Key": "${user_api_key}"
  }
}
```

---

### 2. ローカル環境での使用

DriveRev Backend が起動していることを確認してください。

#### API Key 取得 Workflow のテスト

```bash
# JWT トークンを取得（ログイン）
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# API Key 取得
curl -X POST http://localhost:8000/api/v1/users/me/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Test Key"}'
```

#### ユーザー情報取得 Workflow のテスト

```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 予約作成 Workflow のテスト

```bash
curl -X POST http://localhost:8000/api/v1/reservations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "start_date": "2025-10-20",
    "end_date": "2025-10-22",
    "pickup_store_id": 1,
    "return_store_id": 1
  }'
```

---

### 3. DevRev Agent でのテスト

DevRev の **Test Console**（Agent Settings → Test）で動作確認できます。

#### テストシナリオ例

**ユーザー**: 「私の API Key を取得して」  
**Agent**: （`get-api-key.json` Skill を実行）  
**レスポンス**: 「あなたの API Key は `drv_live_xxxxxxxxxxxx` です。」

**ユーザー**: 「2025 年 10 月 20 日から 22 日まで車を借りたいです」  
**Agent**: （`book-reservation.json` Skill を実行）  
**レスポンス**: 「予約が完了しました。予約番号は #12345 です。」

---

## 📝 Workflow Skills の構造

### 基本構造

```json
{
  "name": "get-user-info",
  "description": "DriveRevのユーザー情報を取得します",
  "input_schema": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "user_id": { "type": "integer" },
      "email": { "type": "string" },
      "full_name": { "type": "string" }
    }
  },
  "http_request": {
    "method": "GET",
    "url": "${base_url}/api/v1/users/me",
    "headers": {
      "Authorization": "Bearer ${jwt_token}"
    }
  }
}
```

### 重要なフィールド

- **name**: Skill の識別子（ケバブケース推奨）
- **description**: Agent が Skill を選択する際の判断材料
- **input_schema**: ユーザーから受け取るパラメータの定義
- **output_schema**: API レスポンスの構造
- **http_request**: 実際の API 呼び出しの詳細

---

## 🔧 カスタマイズ方法

### 新しい Workflow Skill の追加

1. 既存の JSON ファイルをコピー
2. `name`, `description` を変更
3. `input_schema` を必要なパラメータに合わせて修正
4. `http_request.url` と `method` を変更
5. DevRev Console でインポート

### パラメータのマッピング

ユーザーの発言からパラメータを抽出する例:

```json
{
  "input_schema": {
    "type": "object",
    "properties": {
      "start_date": {
        "type": "string",
        "format": "date",
        "description": "予約開始日（YYYY-MM-DD形式）"
      },
      "end_date": {
        "type": "string",
        "format": "date",
        "description": "予約終了日（YYYY-MM-DD形式）"
      },
      "vehicle_type": {
        "type": "string",
        "description": "希望する車両タイプ（compact/sedan/suv/luxury）"
      }
    },
    "required": ["start_date", "end_date"]
  }
}
```

---

## 🐛 トラブルシューティング

### よくある問題

| 問題                         | 原因                           | 解決方法                                      |
| ---------------------------- | ------------------------------ | --------------------------------------------- |
| Skill が実行されない         | Base URL が間違っている        | DevRev Console で Base URL を確認・修正       |
| `401 Unauthorized` エラー    | 認証トークンが無効             | JWT トークンまたは API Key を再生成           |
| `404 Not Found` エラー       | API エンドポイントが存在しない | Backend のルーティングを確認                  |
| Agent が Skill を選択しない  | description が不明確           | より具体的な説明に変更                        |
| パラメータが正しく渡されない | input_schema の定義が不足      | `description` を追加して Agent の理解を助ける |

### デバッグ方法

1. **DevRev Test Console** でログを確認
2. **Backend のログ**（`uvicorn` のコンソール出力）を確認
3. **Network タブ**（ブラウザの開発者ツール）で実際のリクエストを確認

---

## 📚 参考リソース

- **DevRev Workflow Skills ドキュメント**: [DevRev Docs](https://docs.devrev.ai)
- **DriveRev API ドキュメント**: http://localhost:8000/docs (Swagger UI)
- **実装計画**: [../03_IMPLEMENTATION_PLAN.md](../03_IMPLEMENTATION_PLAN.md)
- **詳細設計**: [../04_DEVREV_INTEGRATION.md](../04_DEVREV_INTEGRATION.md)

---

## 🚀 次のステップ

### Phase 5 実装ロードマップ（Week 7-10）

残り **12 個**の Workflow Skills を実装する必要があります。参照システムとの完全な機能パリティを実現します。

#### 優先度 High（Week 7-8）

1. `get-reservations.json` - 予約一覧取得
2. `get-available-slots.json` - 空き時間検索
3. `get-available-vehicles.json` - 利用可能車両検索
4. `get-all-vehicles.json` - 車両一覧
5. `get-reservation-status.json` - 予約状況確認

#### 優先度 Medium（Week 9）

6. `get-all-services.json` - サービス一覧取得
7. `get-all-stores.json` - 店舗一覧取得
8. `get-vehicle-location.json` - 車両位置情報
9. `register-account.json` - アカウント登録

#### 優先度 Low（Week 10）

10. `assign-conversation.json` - 会話の担当者アサイン
11. `resolve-conversation.json` - 会話のクローズ
12. `create-ticket.json` - チケット作成

### 実装ガイドライン

各 Workflow Skill の実装には以下が含まれます：

1. **Backend API の実装**（存在しない場合）
2. **JSON 定義ファイルの作成**（このディレクトリ）
3. **DevRev への登録**
4. **テストシナリオの作成**
5. **ドキュメント更新**

詳細は以下を参照:

- [../05_IMPLEMENTATION_ANALYSIS.md - Issue #4](../05_IMPLEMENTATION_ANALYSIS.md#🔴-issue-4-決済注文管理のgapが完全に欠落) - GAP 分析
- [../03_IMPLEMENTATION_PLAN.md - Phase 5](../03_IMPLEMENTATION_PLAN.md#phase-5-workflow-skill実装) - 実装計画
- [../04_DEVREV_INTEGRATION.md - Section 4](../04_DEVREV_INTEGRATION.md) - Workflow Skill 実装パターン
