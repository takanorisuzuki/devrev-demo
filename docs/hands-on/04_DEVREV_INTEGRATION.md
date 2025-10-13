# DevRev 統合詳細設計

## 📋 目次

1. [DevRev PLuG 統合の全体像](#devrev-plug統合の全体像)
2. [Session Token 管理](#session-token管理)
3. [API Key 管理](#api-key管理)
4. [Workflow Skill 実装パターン](#workflow-skill実装パターン)
5. [DevRev User ID 連携](#devrev-user-id連携)
6. [セキュリティ考慮事項](#セキュリティ考慮事項)

---

## DevRev PLuG 統合の全体像

### アーキテクチャ図

```
┌─────────────────────┐
│   DriveRev User     │
│   (Browser)         │
└──────────┬──────────┘
           │
           ├─── 1. Login
           │
    ┌──────▼──────────────┐
    │  DriveRev Frontend  │
    │   (Next.js)         │
    └──────┬──────────────┘
           │
           ├─── 2. Get DevRev Config
           │
    ┌──────▼──────────────┐
    │  DriveRev Backend   │
    │   (FastAPI)         │
    └──────┬──────────────┘
           │
           ├─── 3. Generate Session Token
           │
    ┌──────▼──────────────┐
    │  DevRev API         │
    │  auth-tokens.create │
    └──────┬──────────────┘
           │
           ├─── 4. Return Session Token
           │
    ┌──────▼──────────────┐
    │  PLuG SDK           │
    │  (Widget)           │
    └─────────────────────┘
```

### データフロー

1. **ユーザー認証** → DriveRev にログイン
2. **DevRev 設定取得** → User Profile から設定を取得
3. **Session Token 生成** → DevRev API にリクエスト
4. **PLuG 初期化** → Session Token を使って PLuG SDK を初期化
5. **ユーザー識別** → PLuG がユーザー情報を認識

---

## Session Token 管理

### Session Token とは

DevRev Session Token は、PLuG SDK がユーザーを識別するための**一時的な認証トークン**です。

**特徴**:

- 有効期限: 1 時間
- 用途: PLuG Widget 認証
- スコープ: 特定ユーザーのみ
- 更新可能: 期限切れ時に再生成

### Session Token 生成フロー

#### 1. DevRev API リクエスト

**Endpoint**: `POST https://api.devrev.ai/auth-tokens.create`

**Headers**:

```json
{
  "authorization": "<Application_Access_Token>",
  "content-type": "application/json"
}
```

**Request Body**:

```json
{
  "requested_token_type": "urn:devrev:params:oauth:token-type:session",
  "rev_info": {
    "user_ref": "user@example.com",
    "account_ref": "driverev.local",
    "workspace_ref": "DriveRev",
    "user_traits": {
      "email": "user@example.com",
      "display_name": "John Doe",
      "phone_numbers": ["+81-90-1234-5678"]
    }
  }
}
```

**Response**:

```json
{
  "access_token": "drt_session_...",
  "token_type": "session",
  "expires_in": 3600,
  "subject": "don:identity:dvrv-us-1:devo/xxx:revu/yyy"
}
```

#### 利用モード別の設定切り替え（Living Docs）

- **ゲストアクセス**: ログインしていない場合は `GlobalConfig` に登録された共有 App ID / AAT / PAT でセッションを生成する。メールアドレスは `guest@driverev.dev` のようなダミー識別子を使い、RevUser ID は共有アカウントに紐づく。
- **ログインユーザー**: プロフィールで `devrev_use_personal_config` をオンにすると、個人の App ID / AAT を暗号化保存し、以降の PLuG 初期化はその設定で行う。Session Token は個別に発行し、`devrev_session_token` へ暗号化保存する。
- **フォールバック**: 個人設定が未入力の場合は 400 を返し、PLuG を初期化しない。個人設定をオフにした場合はゲストと同じ Global 設定を利用する。

#### 非同期 DevRev サービス（例）

```python
class DevRevService:
    def __init__(self, aat: str):
        self.aat = aat
        self.base_url = "https://api.devrev.ai"

    async def verify_aat_and_get_revuser(self) -> dict | None:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{self.base_url}/dev-users.self",
                headers={"Authorization": self.aat, "Content-Type": "application/json"},
            )
            response.raise_for_status()
            data = response.json()
            return {
                "revuser_id": data.get("id"),
                "email": data.get("email"),
                "display_name": data.get("display_name"),
            }
```

#### 2. RevUser ID 保存

**重要**: `subject`フィールドが**RevUser ID**です。これを保存しておくことで、将来的に DevRev Workflow Skill からユーザー API を呼び出す際に使用できます。

```python
# Backend処理
token_data = response.json()
session_token = token_data.get('access_token')

# RevUser ID保存
if 'subject' in token_data:
    current_user.devrev_revuser_id = token_data['subject']
    db.commit()
```

> メモ: `devrev_session_token` と `devrev_session_expires_at` は User テーブルに保存する。トークン値は `crypto_service.encrypt()` で暗号化し、失効済みのレコードは定期的に削除する。

### Session Token 更新戦略

#### オプション 1: 期限切れ時に再生成（推奨）

```typescript
useEffect(() => {
  const checkAndRefreshToken = async () => {
    const status = await devrevApi.getSessionStatus();

    if (status.is_expired) {
      const newToken = await devrevApi.generateSessionToken();
      reinitializePlug(newToken.session_token);
    }
  };

  // 30分ごとにチェック
  const interval = setInterval(checkAndRefreshToken, 30 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

#### オプション 2: サーバー側セッション管理

```python
# Flask Session (参照システム<!-- 旧称: PetStore -->方式)
session['devrev_session_token'] = session_token
session['devrev_token_expires_at'] = time.time() + 3600

# 次回リクエスト時にチェック
if time.time() > session.get('devrev_token_expires_at', 0):
    # 再生成
```

#### 最終方針（DriveRev）

- **Session Token は DB に暗号化保存**し、`devrev_session_expires_at` で失効判定する
- **バックエンドが単一の生成窓口**となり、PLuG 初期化前に `/devrev/session-token` を呼び出す
- **期限切れトークンのクリーンアップ**は定期ジョブまたは DB TTL で実施する
- DevRev API 呼び出しには `httpx.AsyncClient` などの非同期クライアントを採用し、FastAPI のイベントループブロッキングを避ける

### PLuG SDK 初期化

```typescript
// frontend/lib/plug-sdk.ts

export const initializePlug = (sessionToken: string, appId: string) => {
  if (!window.plugSDK) {
    console.error("PLuG SDK not loaded");
    return;
  }

  window.plugSDK.init({
    app_id: appId,
    session_token: sessionToken,
    enable_default_launcher: false,
    custom_launcher_selector: "#plug-launcher",
    widget_alignment: "right",
    spacing: {
      bottom: "20px",
      side: "20px",
    },
  });

  setupPlugEventListeners();
};

const setupPlugEventListeners = () => {
  window.plugSDK.on("widget_opened", () => {
    console.log("PLuG widget opened");
  });

  window.plugSDK.on("widget_closed", () => {
    console.log("PLuG widget closed");
  });

  window.plugSDK.on("conversation_started", (data) => {
    console.log("Conversation started:", data);
  });
};
```

---

## API Key 管理

### API Key の目的

**DevRev Workflow Skill**が DriveRev API を呼び出す際に使用する認証トークンです。

### API Key 生成

```python
import secrets

def generate_api_key() -> str:
    """Generate a new API key with prefix"""
    prefix = "drv_live_"
    key = secrets.token_urlsafe(32)
    return f"{prefix}{key}"
```

**フォーマット**:

- Prefix: `drv_live_`
- Length: 43 文字
- Entropy: 256 ビット

### API Key 認証ミドルウェア

```python
# backend/app/core/auth.py

async def get_user_by_api_key(
    api_key: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db)
) -> User:
    """
    Authenticate user by API key.

    Expected header: Authorization: drv_live_abc123...
    """
    if not api_key.startswith('drv_live_'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format"
        )

    user = db.query(User).filter(User.api_key == api_key).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )

    # Update last used timestamp
    user.api_key_last_used = datetime.utcnow()
    db.commit()

    return user
```

### DevRev AAT から API Key 取得

**目的**: DevRev Workflow Skill が RevUser ID を使ってユーザーの API Key を取得する。

```python
@router.post("/devrev/get-api-key", response_model=ApiKeyResponse)
async def get_api_key_with_aat(
    request: GetApiKeyRequest,
    devrev_aat: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db)
):
    """
    Get user's API key using DevRev AAT and RevUser ID.

    This endpoint is used by DevRev Workflow Skills to retrieve
    the user's DriveRev API key for making subsequent API calls.
    """
    devrev_service = DevRevService(devrev_aat)
    revuser_info = await devrev_service.verify_aat_and_get_revuser()

    if not revuser_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Application Access Token"
        )

    if revuser_info["revuser_id"] != request.revuser_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RevUser ID mismatch"
        )

    user = db.query(User).filter(
        User.devrev_revuser_id == revuser_info["revuser_id"]
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user.api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User has no active API key"
        )

    return ApiKeyResponse(
        api_key=user.api_key,
        user_info={
            "email": user.email,
            "full_name": user.full_name,
            "revuser_id": user.devrev_revuser_id,
        }
    )
```

---

## Workflow Skill 実装パターン

### パターン 1: API Key 取得

**Workflow 名**: `GetApiKey`
**用途**: ユーザーの API Key を取得し、後続の Skill で使用

**Skill Structure**:

```json
{
  "description": "Retrieve the API Key for the registered user",
  "steps": [
    {
      "name": "Agent Skill Trigger",
      "operation": "ai_agent_skill_trigger",
      "inputValues": [
        {
          "fields": [
            {
              "name": "schema",
              "value": {
                "fields": [
                  {
                    "name": "userid",
                    "field_type": "id",
                    "id_type": ["rev_user"],
                    "description": "The user_ID of the user"
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "HTTP",
      "operation": "http",
      "inputValues": [
        {
          "fields": [
            {
              "name": "url",
              "value": "https://driverev.example.com/api/v1/devrev/get-api-key"
            },
            {
              "name": "method",
              "value": "POST"
            },
            {
              "name": "headers",
              "value": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{DEVREV_AAT}}"
                }
              ]
            },
            {
              "name": "body",
              "value": {
                "revuser_id": "{{userid}}"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Set Skill Output",
      "operation": "set_ai_agent_skill_output",
      "inputValues": [
        {
          "fields": [
            {
              "name": "outputs",
              "value": [
                {
                  "key": "api_key",
                  "value": "{{http_1.output.body.api_key}}"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### パターン 2: 予約作成

**Workflow 名**: `CreateReservation`
**用途**: ユーザーに代わってレンタカー予約を作成

**前提条件**:

1. API Key が取得済み（GetApiKey Workflow で取得）
2. 車両 ID（SearchAvailableVehicles Workflow で選択）
3. 予約期間（開始日、終了日）

**Skill Structure**:

```json
{
  "description": "Create a reservation",
  "steps": [
    {
      "name": "Agent Skill Trigger",
      "operation": "ai_agent_skill_trigger",
      "inputValues": [
        {
          "fields": [
            {
              "name": "schema",
              "value": {
                "fields": [
                  {
                    "name": "apikey",
                    "field_type": "text",
                    "description": "The API Key of the user"
                  },
                  {
                    "name": "vehicle_id",
                    "field_type": "text",
                    "description": "The vehicle ID"
                  },
                  {
                    "name": "start_date",
                    "field_type": "text",
                    "description": "Start date in YYYY-MM-DD format"
                  },
                  {
                    "name": "end_date",
                    "field_type": "text",
                    "description": "End date in YYYY-MM-DD format"
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "HTTP",
      "operation": "http",
      "inputValues": [
        {
          "fields": [
            {
              "name": "url",
              "value": "https://driverev.example.com/api/v1/reservations"
            },
            {
              "name": "method",
              "value": "POST"
            },
            {
              "name": "headers",
              "value": [
                {
                  "key": "Authorization",
                  "value": "{{apikey}}"
                }
              ]
            },
            {
              "name": "body",
              "value": {
                "vehicle_id": "{{vehicle_id}}",
                "start_date": "{{start_date}}",
                "end_date": "{{end_date}}"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Set Skill Output",
      "operation": "set_ai_agent_skill_output",
      "inputValues": [
        {
          "fields": [
            {
              "name": "outputs",
              "value": [
                {
                  "key": "reservation",
                  "value": "{{http_1.output.body}}"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### パターン 3: 空き車両検索

**Workflow 名**: `SearchAvailableVehicles`
**用途**: 指定期間・車両タイプで利用可能な車両を検索

**入力パラメータ**:

- start_date: 利用開始日（YYYY-MM-DD）
- end_date: 利用終了日（YYYY-MM-DD）
- vehicle_type: 車両タイプ（sedan, suv, compact 等）[オプション]
- store_id: 店舗 ID [オプション]

**Skill Structure**:

```json
{
  "description": "Search available vehicles for specified period and type",
  "steps": [
    {
      "name": "Agent Skill Trigger",
      "operation": "ai_agent_skill_trigger",
      "inputValues": [
        {
          "fields": [
            {
              "name": "schema",
              "value": {
                "fields": [
                  {
                    "name": "start_date",
                    "field_type": "text",
                    "description": "Start date in YYYY-MM-DD format"
                  },
                  {
                    "name": "end_date",
                    "field_type": "text",
                    "description": "End date in YYYY-MM-DD format"
                  },
                  {
                    "name": "vehicle_type",
                    "field_type": "text",
                    "description": "Vehicle type (sedan, suv, etc.)"
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "HTTP",
      "operation": "http",
      "inputValues": [
        {
          "fields": [
            {
              "name": "url",
              "value": "https://driverev.example.com/api/v1/vehicles/search-available"
            },
            {
              "name": "method",
              "value": "GET"
            },
            {
              "name": "query_params",
              "value": [
                {
                  "key": "start_date",
                  "value": "{{start_date}}"
                },
                {
                  "key": "end_date",
                  "value": "{{end_date}}"
                },
                {
                  "key": "vehicle_type",
                  "value": "{{vehicle_type}}"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Set Skill Output",
      "operation": "set_ai_agent_skill_output",
      "inputValues": [
        {
          "fields": [
            {
              "name": "outputs",
              "value": [
                {
                  "key": "available_vehicles",
                  "value": "{{http_1.output.body}}"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## DevRev User ID 連携

### 📋 セクションサマリー

このセクションでは、DevRev Agent が DriveRev API を呼び出す際の**ユーザー認証の仕組み**を設計します。

**🎯 実装する機能**:

1. **User モデル拡張**: DevRev User ID と AAT フィールドを追加
2. **新規エンドポイント**: `POST /api/v1/auth/token-from-devrev` で JWT Token を取得
3. **Workflow Skills**: 12 個の Workflow を実装（10 個実装可能、1 個代替、1 個削除）

**📊 実装状況**:

- User モデル拡張: ❌ 未実装 → Phase 1 (Week 3)
- 新規エンドポイント: ❌ 未実装 → Phase 2 (Week 3-4)
- Workflow Skills: ❌ 未実装 → Phase 3 (Week 4)
- E2E テスト: ❌ 未実装 → Phase 4 (Week 4)

**📖 読み方ガイド**:

- **設計を理解したい**: [概要](#概要) → [設計方針](#設計方針)
- **実装を開始したい**: [User モデルの拡張](#user-モデルの拡張) → [新規エンドポイント設計](#新規エンドポイント設計)
- **Workflow を作成したい**: [Workflow Skill との連携](#workflow-skill-との連携)
- **テストを実施したい**: [テストシナリオ](#テストシナリオ)

---

### 概要

DevRev Agent が Workflow Skills を実行する際、DevRev User ID（`rev_user`）に基づいて DriveRev ユーザーを識別し、そのユーザーとして API を実行する必要があります。

**参照システム（Demo-PetStore）の実装**:

- PetStore では、各ユーザーに **PetStore API Key** が発行される
- Workflow Skill `GetApiKey` で DevRev User ID → PetStore API Key を取得
- 以降の API 呼び出しでこの API Key を使用してユーザー認証

**DriveRev の課題**:

- DriveRev は **JWT 認証**を採用（API Key の概念なし）
- DevRev User ID と DriveRev User の紐づけが未実装
- Workflow Skills がユーザー固有の JWT Token を取得する仕組みが必要

### 現状の GAP 分析

| 項目                           | PetStore（参照システム）                      | DriveRev（現状）                   | GAP                             |
| ------------------------------ | --------------------------------------------- | ---------------------------------- | ------------------------------- |
| **ユーザー識別子の保存**       | `User.devrev_revuser_id` (String, Unique)     | ❌ フィールドなし                  | User モデル拡張が必要           |
| **認証トークンの保存**         | `User.devrev_application_access_token` (Text) | ❌ フィールドなし                  | User モデル拡張が必要           |
| **API Key 取得エンドポイント** | `GET /api/admin/users/api-key`                | ❌ エンドポイントなし              | 新規エンドポイント実装が必要    |
| **認証方式**                   | PetStore API Key                              | JWT (Access Token / Refresh Token) | 既存の JWT 認証を流用可能       |
| **Workflow Skill**             | `GetApiKey` → API Key 返却                    | ❌ 未実装                          | `GetUserToken` Skill を新規実装 |

### 設計方針

#### 1. PetStore 互換の実装パターンを採用

PetStore の設計思想を尊重し、以下のパターンを踏襲します：

**メリット**:

- 参照システムとの整合性が高い
- DevRev Agent からの呼び出しパターンが同じ
- 実装の検証が容易（PetStore と比較可能）

**実装方針**:

1. User モデルに DevRev User ID フィールドを追加
2. DevRev User ID → JWT Token 取得エンドポイントを実装
3. Workflow Skill `get-user-token.json` を作成（`get-api-key.json` の代替）

#### 2. セキュリティの強化

PetStore の実装をベースに、以下のセキュリティ強化を追加：

- ✅ AAT の暗号化保存（Fernet）
- ✅ DevRev User ID の一意性制約
- ✅ JWT Token の短い有効期限（15 分）+ Refresh Token 発行
- ✅ Rate Limiting（ブルートフォース攻撃対策）

---

### User モデルの拡張

#### 現在の User モデル

```python
# backend/app/models/user.py

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### 拡張後の User モデル

```python
# backend/app/models/user.py

from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum, UUID
from app.core.crypto import encrypt_aat, decrypt_aat

class User(Base):
    __tablename__ = "users"

    # ===== 既存フィールド =====
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ===== DevRev 統合フィールド（新規追加） =====
    devrev_revuser_id = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
        comment="DevRev User ID (e.g., don:identity:dvrv-us-1:devo/xxx:revu/123)"
    )

    devrev_application_access_token = Column(
        Text,
        nullable=True,
        comment="Encrypted DevRev Application Access Token (AAT)"
    )

    # ===== プロパティ: AAT の暗号化・復号 =====
    @property
    def decrypted_devrev_aat(self) -> str | None:
        """暗号化された AAT を復号して返す"""
        if not self.devrev_application_access_token:
            return None
        return decrypt_aat(self.devrev_application_access_token)

    @decrypted_devrev_aat.setter
    def decrypted_devrev_aat(self, plain_aat: str):
        """AAT を暗号化して保存"""
        if plain_aat:
            self.devrev_application_access_token = encrypt_aat(plain_aat)
        else:
            self.devrev_application_access_token = None
```

#### Alembic Migration

```python
# backend/alembic/versions/YYYYMMDD_add_devrev_user_id.py

"""Add DevRev User ID and AAT fields to User model

Revision ID: abc123def456
Revises: previous_revision_id
Create Date: 2025-10-14 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = 'abc123def456'
down_revision = 'previous_revision_id'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # DevRev User ID フィールドを追加
    op.add_column('users', sa.Column(
        'devrev_revuser_id',
        sa.String(),
        nullable=True,
        comment='DevRev User ID (e.g., don:identity:...)'
    ))

    # AAT フィールドを追加
    op.add_column('users', sa.Column(
        'devrev_application_access_token',
        sa.Text(),
        nullable=True,
        comment='Encrypted DevRev Application Access Token'
    ))

    # devrev_revuser_id に一意性制約とインデックスを追加
    op.create_unique_constraint(
        'uq_users_devrev_revuser_id',
        'users',
        ['devrev_revuser_id']
    )
    op.create_index(
        'ix_users_devrev_revuser_id',
        'users',
        ['devrev_revuser_id']
    )

def downgrade() -> None:
    op.drop_index('ix_users_devrev_revuser_id', table_name='users')
    op.drop_constraint('uq_users_devrev_revuser_id', 'users', type_='unique')
    op.drop_column('users', 'devrev_application_access_token')
    op.drop_column('users', 'devrev_revuser_id')
```

---

### 新規エンドポイント設計

#### エンドポイント: `POST /api/v1/auth/token-from-devrev`

**用途**: DevRev User ID から JWT Access Token を取得する

**認証**: DevRev Application Access Token (AAT) を Authorization ヘッダーで検証

**リクエスト**:

```http
POST /api/v1/auth/token-from-devrev HTTP/1.1
Host: driverev.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "devrev_user_id": "don:identity:dvrv-us-1:devo/xxx:revu/123"
}
```

**レスポンス（成功）**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,
  "refresh_token": "def502004e7b8a...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "山田太郎",
    "role": "customer"
  }
}
```

**レスポンス（エラー）**:

```json
// 404 - DevRev User ID に紐づくユーザーが見つからない
{
  "detail": "DevRev User ID に紐づくユーザーが見つかりません"
}

// 401 - AAT 検証失敗
{
  "detail": "DevRev Application Access Token の検証に失敗しました"
}
```

#### 実装コード

```python
# backend/app/api/v1/auth.py

from datetime import timedelta
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import Token, UserResponse
from pydantic import BaseModel

router = APIRouter()

class DevRevTokenRequest(BaseModel):
    """DevRev User ID から JWT Token を取得するリクエスト"""
    devrev_user_id: str

@router.post("/token-from-devrev", response_model=Token)
def get_token_by_devrev_user_id(
    request: DevRevTokenRequest,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
) -> Token:
    """
    DevRev User ID から JWT Access Token を取得する

    - **devrev_user_id**: DevRev User ID (don:identity:...)
    - **Authorization Header**: DevRev Application Access Token (AAT)

    **認証フロー**:
    1. Authorization Header から AAT を取得
    2. DevRev User ID でユーザーを検索
    3. ユーザーの保存された AAT と一致するか検証
    4. JWT Access Token と Refresh Token を生成して返却

    **セキュリティ**:
    - AAT は DB に暗号化して保存されている
    - JWT Token の有効期限は 15 分（Refresh Token: 7 日）
    - Rate Limiting により brute force 攻撃を防止
    """
    # Authorization Header から AAT を取得
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization Header が必要です"
        )

    provided_aat = authorization.replace("Bearer ", "").strip()

    # DevRev User ID でユーザーを検索
    user = db.query(User).filter(
        User.devrev_revuser_id == request.devrev_user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DevRev User ID に紐づくユーザーが見つかりません"
        )

    # AAT 検証
    if user.decrypted_devrev_aat != provided_aat:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="DevRev Application Access Token の検証に失敗しました"
        )

    # ユーザーがアクティブか確認
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このアカウントは無効化されています"
        )

    # JWT Access Token 生成
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires,
    )

    # Refresh Token 生成
    refresh_token = create_refresh_token(user.email, user.role.value)

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )
```

---

### Workflow Skill との連携

#### Workflow Skill: `get-user-token.json`

PetStore の `get-api-key.json` に相当する Workflow Skill です。

**参照システム（PetStore）の実装**:

```json
{
  "url": "https://petstore.devrev.community/api/admin/users/api-key",
  "method": "GET",
  "query_params": [
    {
      "key": "devrev_revuser_id",
      "value": "{% expr $get('ai_agent_skill_trigger_1', 'output').userid %}"
    }
  ],
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {固定の Admin AAT}"
    }
  ]
}
```

**DriveRev の実装**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/auth/token-from-devrev",
  "method": "POST",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {実際の DevRev AAT}"
    },
    {
      "key": "Content-Type",
      "value": "application/json"
    }
  ],
  "body": {
    "devrev_user_id": "{% expr $get('ai_agent_skill_trigger_1', 'output').userid %}"
  }
}
```

**出力**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": { ... }
}
```

#### 他の Workflow Skills での利用

取得した `access_token` を使って、以降の API 呼び出しを実行します。

**例: 予約作成 Workflow**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/reservations",
  "method": "POST",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {% expr $get('get_user_token_1', 'output').body.access_token %}"
    },
    {
      "key": "Content-Type",
      "value": "application/json"
    }
  ],
  "body": {
    "vehicle_id": "...",
    "pickup_store_id": "...",
    "return_store_id": "...",
    "pickup_datetime": "...",
    "return_datetime": "..."
  }
}
```

#### 全 Workflow Skills の実装パターン一覧

DevRev 専用の 3 個（会話管理、チケット作成）を除く **12 個**の Workflow Skills の実装パターンを示します。

##### パターン分類

| パターン                       | 個数 | 説明                                |
| ------------------------------ | ---- | ----------------------------------- |
| **パターン A: JWT Token 必須** | 9    | `get-user-token` → JWT Token 利用   |
| **パターン B: 認証不要**       | 1    | 直接 API 呼び出し（アカウント登録） |
| **パターン C: 代替実装**       | 1    | 車両カテゴリで代替（サービス一覧）  |
| **パターン D: 削除推奨**       | 1    | レンタカーには概念なし（配送追跡）  |

---

##### パターン A: JWT Token が必要な Workflow (9 個)

すべて同じフローで実装できます：

**Step 1**: `get-user-token` で JWT Token を取得  
**Step 2**: JWT Token を使って DriveRev API を呼び出し

| #   | Workflow Skill                | DriveRev Endpoint                       | Method | 説明             |
| --- | ----------------------------- | --------------------------------------- | ------ | ---------------- |
| 1   | `get-user-info.json`          | `/api/v1/auth/me`                       | GET    | ユーザー情報取得 |
| 2   | `book-reservation.json`       | `/api/v1/reservations`                  | POST   | 予約作成         |
| 3   | `get-appointments.json`       | `/api/v1/reservations`                  | GET    | 予約一覧取得     |
| 4   | `get-available-slots.json`    | `/api/v1/vehicles/availability`         | POST   | 空き時間検索     |
| 5   | `get-available-vehicles.json` | `/api/v1/vehicles/availability`         | POST   | 空き車両検索     |
| 6   | `get-all-vehicles.json`       | `/api/v1/vehicles`                      | GET    | 車両一覧取得     |
| 7   | `get-all-stores.json`         | `/api/v1/stores`                        | GET    | 店舗一覧取得     |
| 8   | `get-order-status.json`       | `/api/v1/reservations/{reservation_id}` | GET    | 予約状況確認     |
| 9   | `get-user-token.json`         | `/api/v1/auth/token-from-devrev`        | POST   | JWT Token 取得   |

**実装例（汎用テンプレート）**:

```json
{
  "description": "{Workflow の説明}",
  "steps": [
    {
      "name": "Agent Skill Trigger",
      "operation": "ai_agent_skill_trigger",
      "inputValues": [
        {
          "fields": [
            {
              "name": "schema",
              "value": {
                "fields": [
                  {
                    "name": "userid",
                    "field_type": "id",
                    "id_type": ["rev_user"],
                    "description": "DevRev User ID"
                  }
                  // 必要に応じて追加パラメータ
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Get User Token",
      "operation": "http",
      "inputValues": [
        {
          "fields": [
            {
              "name": "url",
              "value": "http://34.182.56.160:8000/api/v1/auth/token-from-devrev"
            },
            {
              "name": "method",
              "value": "POST"
            },
            {
              "name": "headers",
              "value": [
                {
                  "key": "Authorization",
                  "value": "Bearer {実際の DevRev AAT}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ]
            },
            {
              "name": "body",
              "value": {
                "devrev_user_id": "{% expr $get('ai_agent_skill_trigger_1', 'output').userid %}"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Call DriveRev API",
      "operation": "http",
      "inputValues": [
        {
          "fields": [
            {
              "name": "url",
              "value": "http://34.182.56.160:8000/api/v1/{endpoint}"
            },
            {
              "name": "method",
              "value": "GET/POST/PUT/DELETE"
            },
            {
              "name": "headers",
              "value": [
                {
                  "key": "Authorization",
                  "value": "Bearer {% expr $get('get_user_token_1', 'output').body.access_token %}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ]
            }
            // 必要に応じて body パラメータ
          ]
        }
      ]
    },
    {
      "name": "Set Skill Output",
      "operation": "set_ai_agent_skill_output",
      "inputValues": [
        {
          "fields": [
            {
              "name": "outputs",
              "value": [
                {
                  "key": "result",
                  "value": "{% expr $get('http_2', 'output').body %}"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**個別実装例**:

###### 1. `get-user-info.json`

```json
{
  "url": "http://34.182.56.160:8000/api/v1/auth/me",
  "method": "GET",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {% expr $get('get_user_token_1', 'output').body.access_token %}"
    }
  ]
}
```

###### 2. `get-appointments.json` (予約一覧)

```json
{
  "url": "http://34.182.56.160:8000/api/v1/reservations",
  "method": "GET",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {% expr $get('get_user_token_1', 'output').body.access_token %}"
    }
  ],
  "query_params": [
    {
      "key": "status",
      "value": "confirmed"
    },
    {
      "key": "limit",
      "value": "50"
    }
  ]
}
```

###### 3. `get-available-slots.json` (空き時間検索)

```json
{
  "url": "http://34.182.56.160:8000/api/v1/vehicles/availability",
  "method": "POST",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {% expr $get('get_user_token_1', 'output').body.access_token %}"
    },
    {
      "key": "Content-Type",
      "value": "application/json"
    }
  ],
  "body": {
    "start_date": "{% expr $get('ai_agent_skill_trigger_1', 'output').start_date %}",
    "end_date": "{% expr $get('ai_agent_skill_trigger_1', 'output').end_date %}",
    "store_id": "{% expr $get('ai_agent_skill_trigger_1', 'output').store_id %}"
  }
}
```

###### 4. `get-all-vehicles.json` (車両一覧)

```json
{
  "url": "http://34.182.56.160:8000/api/v1/vehicles",
  "method": "GET",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {% expr $get('get_user_token_1', 'output').body.access_token %}"
    }
  ],
  "query_params": [
    {
      "key": "is_available",
      "value": "true"
    },
    {
      "key": "limit",
      "value": "100"
    }
  ]
}
```

###### 5. `get-all-stores.json` (店舗一覧)

```json
{
  "url": "http://34.182.56.160:8000/api/v1/stores",
  "method": "GET",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {% expr $get('get_user_token_1', 'output').body.access_token %}"
    }
  ],
  "query_params": [
    {
      "key": "is_active",
      "value": "true"
    }
  ]
}
```

###### 6. `get-order-status.json` (予約状況確認)

```json
{
  "url": "http://34.182.56.160:8000/api/v1/reservations/{% expr $get('ai_agent_skill_trigger_1', 'output').reservation_id %}",
  "method": "GET",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {% expr $get('get_user_token_1', 'output').body.access_token %}"
    }
  ]
}
```

---

##### パターン B: 認証不要な Workflow (1 個)

| #   | Workflow Skill          | DriveRev Endpoint       | Method | 説明           |
| --- | ----------------------- | ----------------------- | ------ | -------------- |
| 10  | `register-account.json` | `/api/v1/auth/register` | POST   | アカウント登録 |

**実装例**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/auth/register",
  "method": "POST",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json"
    }
  ],
  "body": {
    "email": "{% expr $get('ai_agent_skill_trigger_1', 'output').email %}",
    "password": "{% expr $get('ai_agent_skill_trigger_1', 'output').password %}",
    "full_name": "{% expr $get('ai_agent_skill_trigger_1', 'output').full_name %}",
    "phone": "{% expr $get('ai_agent_skill_trigger_1', 'output').phone %}"
  }
}
```

---

##### パターン C: 代替実装が必要な Workflow (1 個)

| #   | Workflow Skill          | 代替方法                            | 説明                                                        |
| --- | ----------------------- | ----------------------------------- | ----------------------------------------------------------- |
| 11  | `get-all-services.json` | `GET /api/v1/vehicles?category=all` | DriveRev には「サービス」の概念がないため車両カテゴリで代替 |

**背景**:

- **PetStore**: ペットのグルーミング、トレーニングなどの「サービス」を提供
- **DriveRev**: レンタカーなので「車両カテゴリ」（compact, suv, premium など）が該当

**実装例（暫定）**:

```json
{
  "url": "http://34.182.56.160:8000/api/v1/vehicles",
  "method": "GET",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {% expr $get('get_user_token_1', 'output').body.access_token %}"
    }
  ],
  "query_params": [
    {
      "key": "category",
      "value": "all"
    }
  ]
}
```

**代替案**:

- 新規エンドポイント `GET /api/v1/services` を追加実装し、車両カテゴリを「サービス」として返却
- フロントエンドで車両カテゴリをサービスとして表示

---

##### パターン D: 削除推奨な Workflow (1 個)

| #   | Workflow Skill           | 理由                               |
| --- | ------------------------ | ---------------------------------- |
| 12  | `get-tracking-info.json` | レンタカーには配送追跡の概念がない |

**背景**:

- **PetStore**: 商品配送の追跡情報（配送業者、トラッキング番号、配送状況）
- **DriveRev**: 車両レンタルなので配送追跡は不要

**代替案（もし必要なら）**:

- 「車両の現在位置」機能として新規エンドポイント `GET /api/v1/vehicles/{vehicle_id}/location` を追加実装
- ただし、GPS 連携などの追加機能が必要

---

#### Workflow Skills の実装優先度

| 優先度   | Workflow Skills                                                                                           | 理由                     |
| -------- | --------------------------------------------------------------------------------------------------------- | ------------------------ |
| **高**   | `get-user-token`, `get-user-info`, `book-reservation`, `get-appointments`                                 | 予約フローの基本機能     |
| **中**   | `get-available-slots`, `get-available-vehicles`, `get-all-vehicles`, `get-all-stores`, `get-order-status` | 検索・一覧表示機能       |
| **低**   | `register-account`, `get-all-services`                                                                    | 補助機能、代替実装が必要 |
| **削除** | `get-tracking-info`                                                                                       | レンタカーには不要       |

---

#### 実装時の注意点

1. **JWT Token の有効期限**:

   - Access Token: 15 分
   - Workflow 実行中に期限切れになる可能性あり
   - 長時間実行される Workflow では Refresh Token の利用を検討

2. **エラーハンドリング**:

   - 401 Unauthorized: JWT Token 期限切れ → Refresh Token で再取得
   - 404 Not Found: リソースが見つからない → ユーザーにエラー通知
   - 500 Internal Server Error: サーバーエラー → リトライまたはフォールバック

3. **Rate Limiting**:

   - DevRev Agent からの連続呼び出しに対する Rate Limiting を設定
   - 推奨: 10 req/min per DevRev User ID

4. **パラメータバリデーション**:

   - Workflow からの入力パラメータを必ずバリデーション
   - 不正な値（未来日時、負の金額など）を拒否

5. **ロギング**:
   - DevRev Agent からの API 呼び出しを構造化ログで記録
   - DevRev User ID、Workflow 名、実行時間を含める

---

### 実装手順（Phase）

#### Phase 1: User モデル拡張 (Week 3)

**タスク**:

1. ✅ User モデルに `devrev_revuser_id` と `devrev_application_access_token` フィールドを追加
2. ✅ `@property` で AAT の暗号化・復号メソッドを実装
3. ✅ Alembic Migration スクリプトを作成・実行
4. ✅ Unit Test: 暗号化・復号の正常動作を検証

**成果物**:

- `backend/app/models/user.py` (更新)
- `backend/alembic/versions/YYYYMMDD_add_devrev_user_id.py` (新規)
- `backend/tests/test_user_devrev_integration.py` (新規)

#### Phase 2: 新規エンドポイント実装 (Week 3-4)

**タスク**:

1. ✅ `POST /api/v1/auth/token-from-devrev` エンドポイントを実装
2. ✅ AAT 検証ロジックを実装
3. ✅ Rate Limiting を追加（例: 10 req/min per DevRev User ID）
4. ✅ Integration Test: 正常系・異常系のテストケースを実装

**成果物**:

- `backend/app/api/v1/auth.py` (更新)
- `backend/app/schemas/user.py` (DevRevTokenRequest スキーマ追加)
- `backend/tests/test_auth_devrev.py` (新規)

#### Phase 3: Workflow Skill 作成 (Week 4)

**タスク**:

1. ✅ `get-user-token.json` を作成
2. ✅ DevRev Console で Workflow Skill を登録
3. ✅ Test Console で動作確認
4. ✅ 他の Workflow Skills（予約作成など）を `access_token` 利用に修正

**成果物**:

- `docs/hands-on/workflows/get-user-token.json` (新規)
- `docs/hands-on/workflows/book-reservation.json` (更新)

#### Phase 4: E2E テスト (Week 4)

**タスク**:

1. ✅ DevRev Agent → DriveRev Backend の E2E フローをテスト
2. ✅ 複数ユーザーでの並行実行テスト
3. ✅ AAT 不一致時のエラーハンドリング確認
4. ✅ JWT Token 有効期限切れ時の動作確認

**成果物**:

- `backend/tests/e2e/test_devrev_agent_workflow.py` (新規)
- Test Report (Markdown)

---

### テストシナリオ

#### Unit Test

```python
# backend/tests/test_user_devrev_integration.py

import pytest
from app.models.user import User
from app.core.crypto import encrypt_aat, decrypt_aat

def test_devrev_aat_encryption_decryption():
    """AAT の暗号化・復号が正しく動作するか"""
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed"
    )

    # AAT を設定
    original_aat = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test.signature"
    user.decrypted_devrev_aat = original_aat

    # 暗号化されて保存されているか確認
    assert user.devrev_application_access_token is not None
    assert user.devrev_application_access_token != original_aat

    # 復号して元の AAT と一致するか確認
    assert user.decrypted_devrev_aat == original_aat

def test_devrev_revuser_id_uniqueness(db_session):
    """DevRev User ID の一意性制約が機能するか"""
    devrev_id = "don:identity:dvrv-us-1:devo/xxx:revu/123"

    # 1人目のユーザーを作成
    user1 = User(
        email="user1@example.com",
        full_name="User 1",
        hashed_password="hashed",
        devrev_revuser_id=devrev_id
    )
    db_session.add(user1)
    db_session.commit()

    # 2人目のユーザーに同じ DevRev User ID を設定
    user2 = User(
        email="user2@example.com",
        full_name="User 2",
        hashed_password="hashed",
        devrev_revuser_id=devrev_id
    )
    db_session.add(user2)

    # IntegrityError が発生するか確認
    with pytest.raises(IntegrityError):
        db_session.commit()
```

#### Integration Test

```python
# backend/tests/test_auth_devrev.py

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import User

client = TestClient(app)

def test_token_from_devrev_success(db_session, test_user_with_devrev_id):
    """DevRev User ID から JWT Token を正常に取得できるか"""
    response = client.post(
        "/api/v1/auth/token-from-devrev",
        headers={
            "Authorization": f"Bearer {test_user_with_devrev_id.decrypted_devrev_aat}"
        },
        json={
            "devrev_user_id": test_user_with_devrev_id.devrev_revuser_id
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user_with_devrev_id.email

def test_token_from_devrev_user_not_found(db_session):
    """存在しない DevRev User ID でエラーが返るか"""
    response = client.post(
        "/api/v1/auth/token-from-devrev",
        headers={
            "Authorization": "Bearer test_aat"
        },
        json={
            "devrev_user_id": "don:identity:dvrv-us-1:devo/xxx:revu/999"
        }
    )

    assert response.status_code == 404
    assert "DevRev User ID に紐づくユーザーが見つかりません" in response.json()["detail"]

def test_token_from_devrev_aat_mismatch(db_session, test_user_with_devrev_id):
    """AAT が一致しない場合にエラーが返るか"""
    response = client.post(
        "/api/v1/auth/token-from-devrev",
        headers={
            "Authorization": "Bearer wrong_aat"
        },
        json={
            "devrev_user_id": test_user_with_devrev_id.devrev_revuser_id
        }
    )

    assert response.status_code == 401
    assert "DevRev Application Access Token の検証に失敗しました" in response.json()["detail"]
```

#### E2E Test

```python
# backend/tests/e2e/test_devrev_agent_workflow.py

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_devrev_agent_full_workflow(db_session, test_user_with_devrev_id):
    """DevRev Agent のフルワークフロー（Token 取得 → 予約作成）をテスト"""

    # Step 1: DevRev User ID から JWT Token を取得
    token_response = client.post(
        "/api/v1/auth/token-from-devrev",
        headers={
            "Authorization": f"Bearer {test_user_with_devrev_id.decrypted_devrev_aat}"
        },
        json={
            "devrev_user_id": test_user_with_devrev_id.devrev_revuser_id
        }
    )

    assert token_response.status_code == 200
    access_token = token_response.json()["access_token"]

    # Step 2: 取得した JWT Token で予約を作成
    reservation_response = client.post(
        "/api/v1/reservations",
        headers={
            "Authorization": f"Bearer {access_token}"
        },
        json={
            "vehicle_id": "test-vehicle-id",
            "pickup_store_id": "test-store-id",
            "return_store_id": "test-store-id",
            "pickup_datetime": "2025-10-20T10:00:00",
            "return_datetime": "2025-10-21T10:00:00"
        }
    )

    assert reservation_response.status_code == 201
    assert "confirmation_number" in reservation_response.json()
```

---

### まとめ

**実装のポイント**:

1. ✅ **PetStore 互換**: 参照システムの設計パターンを踏襲し、DevRev Agent からの呼び出しフローを維持
2. ✅ **セキュリティ強化**: AAT の暗号化保存、JWT Token の短い有効期限、Rate Limiting
3. ✅ **段階的実装**: Phase 1-4 で段階的に実装し、各 Phase でテストを実施
4. ✅ **テスト充実**: Unit / Integration / E2E の 3 層でテストを実装

**次のステップ**:

👉 Phase 1（User モデル拡張）から実装を開始し、`03_IMPLEMENTATION_PLAN.md` のタスクリストに統合する

---

## セキュリティ考慮事項

### 1. Application Access Token (AAT) の保護

- AAT と Session Token は `app/core/crypto.py` の `crypto_service` で暗号化／復号する
- 暗号化キーは `.env` ではなく Secret Manager（本番）で管理し、`scripts/generate-encryption-key.sh` で生成する
- キーローテーション時は `LEGACY_ENCRYPTION_KEYS` を使って段階的に再暗号化し、`scripts/migrate_encryption.py` を実行する
<!--
旧記述:

```python
from cryptography.fernet import Fernet

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")  # 32バイトBase64
cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_aat(aat: str) -> str:
    """Encrypt Application Access Token"""
    return cipher_suite.encrypt(aat.encode()).decode()

def decrypt_aat(encrypted_aat: str) -> str:
    """Decrypt Application Access Token"""
    return cipher_suite.decrypt(encrypted_aat.encode()).decode()

# User model
@property
def decrypted_devrev_aat(self) -> str | None:
    if not self.devrev_application_access_token:
        return None
    return decrypt_aat(self.devrev_application_access_token)
```

-->

### 2. API Key 保護

**ベストプラクティス**:

- ✅ HTTPS のみ
- ✅ Rate Limiting
- ✅ 定期的なローテーション
- ✅ 使用統計ロギング

### 3. Session Token 保護

**注意点**:

- ✅ HTTPS のみで送信
- ✅ DB 保存時に暗号化・有効期限チェック
- ✅ 定期ジョブか TTL で失効トークンを削除
- ❌ ローカルストレージに保存しない（PLuG 初期化直前に取得）
<!-- 旧記述では HTTPOnly Cookie の検討や単純保存禁止など同趣旨の注意点を列挙していた。 -->

### 4. 非機能要件（Living Docs）

- **DevRev API 呼び出しポリシー**  
  `DevRevService` は `httpx.AsyncClient` を 10 秒タイムアウト・最大 3 回指数バックオフで再試行する。全失敗時は 502（Bad Gateway）を返し、呼び出し元は DevRev 連携を一時無効化する。<br>
  <!-- 旧運用: `requests` + 単発呼び出しで、タイムアウト・リトライなし。 -->

- **ロギングと観測性**  
  DevRev API へのリクエスト/レスポンス（ステータスコード、遅延）は構造化ログで出力し、オブザーバビリティ基盤（例: GCP Logging）で追跡する。5xx が閾値（連続 5 回）を超えたらアラートを発報する。

- **PLuG 初期化フロント挙動**  
  フロントエンドは `/devrev/session-token` から 204 を受け取ると PLuG を非表示にし、401/403/502 はトーストでユーザーに通知する。開発環境では console.warn を併用してデバッグを容易にする。

- **フェイルセーフ**  
  DevRev 統合が失敗しても DriveRev の予約・決済機能は動作する。セッション生成失敗時はバックエンド側でログを残し、再試行のためのメトリクス（成功率）を記録する。

- **ドキュメント更新ルール**  
  アーキテクチャ変更や非機能要件の見直しが発生した際は、本章と `01_ARCHITECTURE.md`・`05_IMPLEMENTATION_ANALYSIS.md` を同時に更新し、旧仕様は HTML コメントで残して変更履歴を可視化する。
- **実装タスクとの紐づけ**  
  具体的な作業手順は `03_IMPLEMENTATION_PLAN.md` の Phase 1 タスクリストにまとめている（例: `httpx` への移行、TypeScript 型定義追加、セッションクリーンアップジョブなど）。実装前に該当セクションを参照し、抜け漏れがないか確認する。

---

## 次のステップ

👉 [05_IMPLEMENTATION_ANALYSIS.md](./05_IMPLEMENTATION_ANALYSIS.md) でギャップ分析とリスク項目を確認
