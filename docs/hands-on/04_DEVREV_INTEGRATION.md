# DevRev 統合詳細設計

## 📋 目次

1. [DevRev PLuG 統合の全体像](#devrev-plug統合の全体像)
2. [Session Token 管理](#session-token管理)
3. [API Key 管理](#api-key管理)
4. [Workflow Skill 実装パターン](#workflow-skill実装パターン)
5. [セキュリティ考慮事項](#セキュリティ考慮事項)

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
