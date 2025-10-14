# Workflow → DriveRev Backend API マッピング分析

## 📊 概要

参照システム（Demo-PetStore）の 15 個の Workflow Skills を DriveRev Backend API にマッピングし、実装可能性を評価します。

生成日: 2025-10-13
Backend URL: `http://34.182.56.160:8000/api/v1`

---

## ✅ 実装可能な Workflow (12/15)

### 1. `get-api-key.json` → ❌ **実装不可**

**参照システム**: `GET /api/admin/users/api-key?devrev_revuser_id={userid}`  
**DriveRev 対応**: **該当エンドポイントなし**

**理由**:

- DriveRev には「API Key」の概念が存在しない
- 認証は JWT ベース（Access Token / Refresh Token）
- 参照システムの「API Key」は DevRev 統合用の特殊な概念

**代替案**:

- JWT トークン取得エンドポイントに変更: `POST /api/v1/auth/login` または `POST /api/v1/auth/token`

---

### 2. `get-user-info.json` → ✅ **実装可能**

**参照システム**: `GET /api/users/{user_id}`  
**DriveRev 対応**: `GET /api/v1/auth/me`

**修正内容**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/auth/me",
  "method": "GET",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {実際のAAT}"
    }
  ]
}
```

**必要なパラメータ調整**:

- ❌ 削除: `user_id` パラメータ（DriveRev は JWT から自動取得）
- ✅ 追加: `Authorization` ヘッダーに実際の AAT

---

### 3. `book-reservation.json` → ✅ **実装可能**

**参照システム**: `POST /api/appointments`  
**DriveRev 対応**: `POST /api/v1/reservations`

**修正内容**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/reservations",
  "method": "POST",
  "body": {
    "vehicle_id": "uuid",
    "pickup_store_id": "uuid",
    "return_store_id": "uuid",
    "pickup_datetime": "2025-10-14T08:00:00",
    "return_datetime": "2025-10-14T14:00:00",
    "options": [],
    "special_requests": ""
  }
}
```

**必要なパラメータ調整**:

- `appointment` → `reservation`
- `pet_id` → `vehicle_id`
- `staff_id` → `pickup_store_id`, `return_store_id`（車両レンタルでは店舗が 2 つ必要）

---

### 4. `get-appointments.json` → ✅ **実装可能**

**参照システム**: `GET /api/appointments?user_id={user_id}`  
**DriveRev 対応**: `GET /api/v1/reservations`

**修正内容**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/reservations",
  "method": "GET",
  "query_params": [
    { "key": "status", "value": "confirmed" },
    { "key": "limit", "value": "50" },
    { "key": "skip", "value": "0" }
  ]
}
```

**必要なパラメータ調整**:

- ❌ 削除: `user_id` パラメータ（JWT から自動取得）
- ✅ 追加: `status`, `limit`, `skip` などのフィルタパラメータ

---

### 5. `get-available-slots.json` → ✅ **実装可能**

**参照システム**: `GET /api/appointments/available-slots?date={date}&staff_id={staff_id}`  
**DriveRev 対応**: `POST /api/v1/vehicles/availability`

**修正内容**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/vehicles/availability",
  "method": "POST",
  "body": {
    "start_date": "2025-10-14",
    "end_date": "2025-10-14",
    "store_id": "uuid",
    "category": "suv"
  }
}
```

**必要なパラメータ調整**:

- `GET` → `POST` メソッド変更
- `staff_id` → `store_id`（店舗単位の空き検索）
- `date` → `start_date`, `end_date`（期間検索）

---

### 6. `get-available-vehicles.json` → ✅ **実装可能**

**参照システム**: `GET /api/staff/available?date={date}&service_id={service_id}`  
**DriveRev 対応**: `POST /api/v1/vehicles/availability`

**修正内容**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/vehicles/availability",
  "method": "POST",
  "body": {
    "start_date": "2025-10-14",
    "end_date": "2025-10-14",
    "category": "suv",
    "make": "Toyota"
  }
}
```

**必要なパラメータ調整**:

- `staff` → `vehicles`（スタッフではなく車両）
- `service_id` → `category`, `make`（車両カテゴリとメーカー）

---

### 7. `get-all-vehicles.json` → ✅ **実装可能**

**参照システム**: `GET /api/pets`  
**DriveRev 対応**: `GET /api/v1/vehicles`

**修正内容**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/vehicles",
  "method": "GET",
  "query_params": [
    { "key": "is_available", "value": "true" },
    { "key": "limit", "value": "100" }
  ]
}
```

**必要なパラメータ調整**:

- `pets` → `vehicles`
- 追加可能なフィルタ: `category`, `make`, `fuel_type`, `min_price`, `max_price`

---

### 8. `get-all-services.json` → ⚠️ **要検討**

**参照システム**: `GET /api/services`  
**DriveRev 対応**: **直接的なエンドポイントなし**

**代替案**:

- DriveRev では「サービス」ではなく「車両カテゴリ」が該当
- `GET /api/v1/vehicles?category={category}` を使用
- または、新規エンドポイント `GET /api/v1/services` を追加実装

**修正内容（暫定）**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/vehicles",
  "method": "GET",
  "query_params": [{ "key": "category", "value": "all" }]
}
```

---

### 9. `get-all-stores.json` → ✅ **実装可能**

**参照システム**: `GET /api/staff`  
**DriveRev 対応**: `GET /api/v1/stores`

**修正内容**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/stores",
  "method": "GET",
  "query_params": [
    { "key": "is_active", "value": "true" },
    { "key": "limit", "value": "100" }
  ]
}
```

**必要なパラメータ調整**:

- `staff` → `stores`（スタッフではなく店舗）
- 追加可能なフィルタ: `prefecture`, `city`, `is_airport`, `is_station`

---

### 10. `get-order-status.json` → ✅ **実装可能**

**参照システム**: `GET /api/orders/{order_id}/status`  
**DriveRev 対応**: `GET /api/v1/reservations/{reservation_id}`

**修正内容**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/reservations/{reservation_id}",
  "method": "GET"
}
```

**必要なパラメータ調整**:

- `order_id` → `reservation_id`
- レスポンスに `status` フィールドが含まれる

---

### 11. `get-tracking-info.json` → ❌ **実装不可**

**参照システム**: `GET /api/orders/{order_id}/tracking`  
**DriveRev 対応**: **該当エンドポイントなし**

**理由**:

- DriveRev はレンタカーサービスであり、配送追跡の概念がない
- 参照システムは商品配送を扱うため tracking が存在

**代替案**:

- 「車両の現在位置」に読み替えるなら、新規エンドポイント `GET /api/v1/vehicles/{vehicle_id}/location` を追加実装
- または Workflow 自体を削除

---

### 12. `assign-conversation.json` → ❌ **実装不可**

**参照システム**: `POST /api/devrev/conversations/{conversation_id}/assign`  
**DriveRev 対応**: **DevRev API への直接呼び出しが必要**

**理由**:

- これは DevRev の Conversation 管理機能
- DriveRev Backend ではなく、**DevRev API** (`https://api.devrev.ai/`) を直接呼び出す必要がある

**修正内容**:

```json
{
  "url": "https://api.devrev.ai/conversations/{conversation_id}/assign",
  "method": "POST",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {DevRev AAT}"
    }
  ],
  "body": {
    "assigned_to": "user_id"
  }
}
```

---

### 13. `resolve-conversation.json` → ❌ **実装不可**

**参照システム**: `POST /api/devrev/conversations/{conversation_id}/resolve`  
**DriveRev 対応**: **DevRev API への直接呼び出しが必要**

**理由**:

- 同様に DevRev の Conversation 管理機能
- **DevRev API** を直接呼び出す

**修正内容**:

```json
{
  "url": "https://api.devrev.ai/conversations/{conversation_id}/resolve",
  "method": "POST",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {DevRev AAT}"
    }
  ]
}
```

---

### 14. `create-ticket.json` → ❌ **実装不可**

**参照システム**: `POST /api/devrev/tickets`  
**DriveRev 対応**: **DevRev API への直接呼び出しが必要**

**理由**:

- DevRev のチケット作成機能
- **DevRev API** を直接呼び出す

**修正内容**:

```json
{
  "url": "https://api.devrev.ai/tickets",
  "method": "POST",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {DevRev AAT}"
    }
  ],
  "body": {
    "title": "チケットタイトル",
    "description": "説明"
  }
}
```

---

### 15. `register-account.json` → ✅ **実装可能**

**参照システム**: `POST /api/users/register`  
**DriveRev 対応**: `POST /api/v1/auth/register`

**修正内容**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/auth/register",
  "method": "POST",
  "body": {
    "email": "user@example.com",
    "password": "password",
    "full_name": "山田太郎",
    "phone": "090-1234-5678"
  }
}
```

**必要なパラメータ調整**:

- DriveRev のスキーマに合わせる（`full_name`, `phone` など）

---

## 📊 実装可能性サマリー

| カテゴリ                      | 実装可能 | 要修正 | 実装不可 | 合計 |
| ----------------------------- | -------- | ------ | -------- | ---- |
| **DriveRev Backend 呼び出し** | 9        | 1      | 2        | 12   |
| **DevRev API 呼び出し**       | 0        | 0      | 3        | 3    |
| **合計**                      | 9        | 1      | 5        | 15   |

### 詳細内訳

#### ✅ DriveRev Backend で実装可能 (9 個)

1. ✅ `get-user-info.json` → `GET /api/v1/auth/me`
2. ✅ `book-reservation.json` → `POST /api/v1/reservations`
3. ✅ `get-appointments.json` → `GET /api/v1/reservations`
4. ✅ `get-available-slots.json` → `POST /api/v1/vehicles/availability`
5. ✅ `get-available-vehicles.json` → `POST /api/v1/vehicles/availability`
6. ✅ `get-all-vehicles.json` → `GET /api/v1/vehicles`
7. ✅ `get-all-stores.json` → `GET /api/v1/stores`
8. ✅ `get-order-status.json` → `GET /api/v1/reservations/{id}`
9. ✅ `register-account.json` → `POST /api/v1/auth/register`

#### ⚠️ 要検討・代替実装が必要 (1 個)

1. ⚠️ `get-all-services.json` → 車両カテゴリで代替可能

#### ❌ 実装不可・削除推奨 (5 個)

1. ❌ `get-api-key.json` → DriveRev に API Key の概念なし（JWT 認証）
2. ❌ `get-tracking-info.json` → レンタカーに配送追跡の概念なし
3. ❌ `assign-conversation.json` → DevRev API 直接呼び出し
4. ❌ `resolve-conversation.json` → DevRev API 直接呼び出し
5. ❌ `create-ticket.json` → DevRev API 直接呼び出し

---

## 🎯 推奨アクション

### Phase 1: 即座に修正可能 (9 個)

上記「✅ 実装可能」の 9 個を優先的に修正：

- URL を `http://34.182.56.160:8000/api/v1/...` に変更
- パラメータを DriveRev のスキーマに合わせる
- Authorization ヘッダーに実際の AAT を設定

### Phase 2: DevRev API 統合 (3 個)

DevRev API を直接呼び出す Workflow を作成：

- `assign-conversation.json`
- `resolve-conversation.json`
- `create-ticket.json`

これらは `https://api.devrev.ai/` を呼び出す必要があります。

### Phase 3: 削除または新規実装 (3 個)

1. **削除推奨**:

   - `get-api-key.json` → JWT 認証に置き換え
   - `get-tracking-info.json` → レンタカーには不要

2. **新規実装検討**:
   - `get-all-services.json` → `GET /api/v1/services` エンドポイントを追加

---

## 📝 次のステップ

1. **workflows/README.md を更新**: この分析結果を反映
2. **Phase 1 の 9 個を修正**: URL とパラメータを DriveRev 用に変更
3. **DevRev API 用の AAT を取得**: Phase 2 の 3 個に必要
4. **テスト**: 各 Workflow を DevRev Console でテスト実行

---

## 📚 参考リンク

- [DriveRev Backend API (Swagger UI)](http://34.182.56.160:8000/docs)
- [DevRev API Documentation](https://docs.devrev.ai/)
- [../05_IMPLEMENTATION_ANALYSIS.md - Issue #4](../05_IMPLEMENTATION_ANALYSIS.md#🔴-issue-4-決済注文管理のgapが完全に欠落)
