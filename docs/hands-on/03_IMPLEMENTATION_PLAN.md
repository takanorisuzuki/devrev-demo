# 実装計画 - 段階的アプローチ

## 📋 目次

1. [実装フェーズ概要](#実装フェーズ概要)
2. [Phase 1: DevRev PLuG 基盤](#phase-1-devrev-plug基盤)
3. [Phase 2: API Key 管理](#phase-2-api-key管理)
4. [Phase 3: 予約カレンダー](#phase-3-予約カレンダー)
5. [Phase 4: Global Configuration](#phase-4-global-configuration)
6. [Phase 5: Workflow Skill 実装](#phase-5-workflow-skill実装)
7. [テスト計画](#テスト計画)
8. [デプロイ計画](#デプロイ計画)

---

## 実装フェーズ概要

### Timeline (8 週間)

| Week | Phase            | 主要成果物     | 状態      |
| ---- | ---------------- | -------------- | --------- |
| 1-2  | Phase 1          | PLuG 基盤      | 📝 計画中 |
| 3    | Phase 2          | API Key 管理   | 📝 計画中 |
| 4-5  | Phase 3          | 予約カレンダー | 📝 計画中 |
| 6    | Phase 4          | Global Config  | 📝 計画中 |
| 7    | Phase 5          | Workflow 集    | 📝 計画中 |
| 8    | Testing & Deploy | 本番リリース   | 📝 計画中 |

---

## Phase 1: DevRev PLuG 基盤

### 目標

ユーザーが DevRev PLuG Chat を自分の設定で利用できるようにする。

### 1-1: Backend - User Model 拡張

**ファイル**: `backend/app/models/user.py`

**変更内容**:

```python
class User(Base):
    # ... 既存フィールド ...

    # DevRev Integration (新規追加)
    devrev_app_id: str | None = Column(String(500), nullable=True)
    devrev_application_access_token: str | None = Column(String(500), nullable=True)
    devrev_revuser_id: str | None = Column(String(200), nullable=True, index=True)
    use_global_devrev_config: bool = Column(Boolean, default=False, nullable=False)

    # API Key Management (新規追加)
    api_key: str | None = Column(String(100), nullable=True, unique=True, index=True)
    api_key_name: str | None = Column(String(100), default='User API Key')
    api_key_created_at: datetime | None = Column(DateTime, nullable=True)
    api_key_last_used: datetime | None = Column(DateTime, nullable=True)

    def get_effective_devrev_config(self) -> dict[str, Any]:
        """Get effective DevRev configuration (personal or global)"""
        if self.use_global_devrev_config:
            from app.models.system_settings import SystemSettings
            global_config = SystemSettings.get_devrev_config()
            return {
                'app_id': global_config.get('app_id'),
                'aat': global_config.get('aat'),
                'source': 'global'
            }
        else:
            return {
                'app_id': self.devrev_app_id,
                'aat': self.devrev_application_access_token,
                'source': 'personal'
            }

    def has_complete_devrev_config(self) -> bool:
        """Check if user has all required DevRev configuration"""
        config = self.get_effective_devrev_config()
        return bool(config['app_id'] and config['aat'])
```

**Alembic マイグレーション**:

```bash
cd backend
alembic revision -m "add_devrev_integration_fields_to_users"
# Edit migration file
alembic upgrade head
```

**工数**: 0.5 日

### 1-2: Backend - Pydantic Schemas

**ファイル**: `backend/app/schemas/devrev.py` (新規作成)

```python
from pydantic import BaseModel, Field
from typing import Optional

class DevRevIntegrationUpdate(BaseModel):
    """DevRev integration settings update"""
    devrev_app_id: Optional[str] = Field(None, max_length=500)
    devrev_application_access_token: Optional[str] = Field(None, max_length=500)
    use_global_devrev_config: bool = False

class DevRevSessionTokenRequest(BaseModel):
    """Request body for session token generation"""
    user_id: Optional[str] = None  # Admin only

class DevRevSessionTokenResponse(BaseModel):
    """Response for session token generation"""
    session_token: str
    expires_at: int
    user_info: dict

class DevRevSessionStatusResponse(BaseModel):
    """Response for session status check"""
    has_session_token: bool
    session_token: Optional[str]
    expires_at: int
    is_expired: bool
    has_aat: bool
    message: str
```

**工数**: 0.5 日

### 1-3: Backend - API Endpoints

**ファイル**: `backend/app/api/v1/devrev.py` (新規作成)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import requests
import time

router = APIRouter(prefix="/devrev", tags=["DevRev Integration"])

@router.post("/session-token", response_model=DevRevSessionTokenResponse)
async def generate_session_token(
    request: DevRevSessionTokenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate DevRev session token for authenticated user.

    This endpoint creates a session token that can be used to initialize
    the DevRev PLuG SDK with proper user identity.
    """
    # Get effective DevRev configuration
    config = current_user.get_effective_devrev_config()
    devrev_aat = config['aat']

    if not devrev_aat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DevRev Application Access Token not configured"
        )

    # Build DevRev session token request
    devrev_payload = {
        "requested_token_type": "urn:devrev:params:oauth:token-type:session",
        "rev_info": {
            "user_ref": current_user.email,
            "account_ref": "driverev.local",
            "workspace_ref": "DriveRev",
            "user_traits": {
                "email": current_user.email,
                "display_name": current_user.full_name,
                "phone_numbers": [current_user.phone_number] if current_user.phone_number else []
            }
        }
    }

    # Make request to DevRev API
    headers = {
        'authorization': devrev_aat,
        'content-type': 'application/json'
    }

    try:
        response = requests.post(
            'https://api.devrev.ai/auth-tokens.create',
            headers=headers,
            json=devrev_payload,
            timeout=10
        )
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate session token: {str(e)}"
        )

    token_data = response.json()
    session_token = token_data.get('access_token')
    expires_in = 3600  # 1 hour

    # Store RevUser ID if present
    if 'subject' in token_data:
        current_user.devrev_revuser_id = token_data['subject']
        db.commit()

    return DevRevSessionTokenResponse(
        session_token=session_token,
        expires_at=int(time.time()) + expires_in,
        user_info={
            'user_id': str(current_user.id),
            'user_ref': current_user.email,
            'display_name': current_user.full_name
        }
    )

@router.get("/session-status", response_model=DevRevSessionStatusResponse)
async def get_session_status(
    current_user: User = Depends(get_current_user)
):
    """
    Check current session token status.
    """
    has_aat = current_user.has_complete_devrev_config()

    return DevRevSessionStatusResponse(
        has_session_token=False,  # TODO: Implement session storage
        session_token=None,
        expires_at=0,
        is_expired=True,
        has_aat=has_aat,
        message="Session token needs to be generated" if has_aat else "DevRev not configured"
    )
```

**ルート登録** (`backend/app/main.py`):

```python
from app.api.v1 import devrev

app.include_router(devrev.router, prefix="/api/v1")
```

**工数**: 1 日

### 1-4: Frontend - API Client

**ファイル**: `frontend/lib/api/devrev.ts` (新規作成)

```typescript
import { apiClient } from "./client";

export interface DevRevIntegrationUpdate {
  devrev_app_id?: string;
  devrev_application_access_token?: string;
  use_global_devrev_config: boolean;
}

export interface DevRevSessionToken {
  session_token: string;
  expires_at: number;
  user_info: {
    user_id: string;
    user_ref: string;
    display_name: string;
  };
}

export interface DevRevSessionStatus {
  has_session_token: boolean;
  session_token?: string;
  expires_at: number;
  is_expired: boolean;
  has_aat: boolean;
  message: string;
}

export const devrevApi = {
  // Update DevRev integration settings
  async updateIntegration(data: DevRevIntegrationUpdate): Promise<void> {
    await apiClient.put("/auth/profile/devrev", data);
  },

  // Generate new session token
  async generateSessionToken(): Promise<DevRevSessionToken> {
    const response = await apiClient.post<DevRevSessionToken>(
      "/devrev/session-token"
    );
    return response.data;
  },

  // Check session token status
  async getSessionStatus(): Promise<DevRevSessionStatus> {
    const response = await apiClient.get<DevRevSessionStatus>(
      "/devrev/session-status"
    );
    return response.data;
  },
};
```

**工数**: 0.5 日

### 1-5: Frontend - Profile Page UI

**ファイル**: `frontend/app/profile/page.tsx` (新規作成)

```typescript
"use client";

import { useState } from "react";
import { devrevApi } from "@/lib/api/devrev";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProfilePage() {
  const [appId, setAppId] = useState("");
  const [aat, setAat] = useState("");
  const [useGlobal, setUseGlobal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await devrevApi.updateIntegration({
        devrev_app_id: appId,
        devrev_application_access_token: aat,
        use_global_devrev_config: useGlobal,
      });
      alert("DevRev settings saved!");
    } catch (error) {
      console.error("Failed to save DevRev settings:", error);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>

      <section className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">💬 DevRev Integration</h2>
        <p className="text-sm text-gray-600 mb-4">
          Configure your DevRev Application Access Token to enable PLuG features
          and user identity.
        </p>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-global"
              checked={useGlobal}
              onCheckedChange={(checked) => setUseGlobal(!!checked)}
            />
            <Label htmlFor="use-global">
              Use global DevRev configuration (shared settings)
            </Label>
          </div>

          {!useGlobal && (
            <>
              <div>
                <Label htmlFor="app-id">DevRev App ID</Label>
                <Input
                  id="app-id"
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="don:integration:dvrv-us-1:devo/xxx:custom_app/yyy"
                />
              </div>

              <div>
                <Label htmlFor="aat">Application Access Token (AAT)</Label>
                <Input
                  id="aat"
                  type="password"
                  value={aat}
                  onChange={(e) => setAat(e.target.value)}
                  placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>
            </>
          )}

          <div className="flex space-x-3">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save DevRev Settings"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

**工数**: 1 日

### 1-6: Frontend - PLuG SDK Integration

**ファイル**: `frontend/app/layout.tsx` (既存ファイルに追加)

```typescript
"use client";

import { useEffect, useState } from "react";
import { devrevApi } from "@/lib/api/devrev";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [plugInitialized, setPlugInitialized] = useState(false);

  useEffect(() => {
    const initializePlug = async () => {
      try {
        // Check if user is authenticated
        const { data: user } = await authApi.verifyToken();
        if (!user) return;

        // Check session status
        const status = await devrevApi.getSessionStatus();

        if (!status.has_aat) {
          console.log("DevRev not configured");
          return;
        }

        // Generate session token if needed
        let sessionToken = status.session_token;
        if (!sessionToken || status.is_expired) {
          const tokenData = await devrevApi.generateSessionToken();
          sessionToken = tokenData.session_token;
        }

        // Initialize PLuG SDK
        if (window.plugSDK && sessionToken) {
          window.plugSDK.init({
            app_id: user.devrev_app_id,
            session_token: sessionToken,
            enable_default_launcher: false,
            custom_launcher_selector: "#plug-launcher",
            widget_alignment: "right",
            spacing: {
              bottom: "20px",
              side: "20px",
            },
          });
          setPlugInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize PLuG:", error);
      }
    };

    initializePlug();
  }, []);

  return (
    <html lang="ja">
      <head>
        <script
          src="https://plug-platform.devrev.ai/static/plug-sdk.js"
          async
        />
      </head>
      <body>
        {children}

        {/* Custom PLuG Launcher */}
        {plugInitialized && (
          <div
            id="plug-launcher"
            className="fixed bottom-6 right-6 z-50 cursor-pointer"
          >
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        )}
      </body>
    </html>
  );
}
```

**工数**: 1 日

### Phase 1 成果物チェックリスト

- [ ] User model に DevRev フィールド追加
- [ ] Alembic マイグレーション実行
- [ ] Pydantic schemas 作成
- [ ] Session Token 生成 API 実装
- [ ] Session Status 確認 API 実装
- [ ] Profile UI 作成
- [ ] PLuG SDK 統合
- [ ] カスタムランチャー実装
- [ ] 動作確認（E2E テスト）

**合計工数**: 5-6 日

---

## Phase 2: API Key 管理

### 目標

ユーザーが自分の API Key を生成・管理できるようにする。

### 2-1: Backend - API Key 生成

**ファイル**: `backend/app/api/v1/auth.py` (既存ファイルに追加)

```python
import secrets
from datetime import datetime

@router.post("/api-key", response_model=ApiKeyResponse)
async def generate_api_key(
    request: ApiKeyCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a new API key for the current user.
    """
    # Check if user already has an API key
    if current_user.api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an API key. Delete the existing one first."
        )

    # Generate API key
    api_key = f"drv_live_{secrets.token_urlsafe(32)}"

    # Update user
    current_user.api_key = api_key
    current_user.api_key_name = request.name or 'User API Key'
    current_user.api_key_created_at = datetime.utcnow()
    db.commit()

    return ApiKeyResponse(
        api_key=api_key,
        name=current_user.api_key_name,
        created_at=current_user.api_key_created_at
    )
```

**工数**: 1 日

### 2-2: Frontend - API Key UI

**ファイル**: `frontend/app/profile/page.tsx` (既存に追加)

```typescript
// API Keys section
<section className="bg-white shadow rounded-lg p-6">
  <h2 className="text-xl font-semibold mb-4">🔑 API Keys</h2>

  {apiKey ? (
    <div>
      <p className="text-sm text-gray-600 mb-2">Your API Key:</p>
      <div className="flex space-x-2">
        <Input value={apiKey} readOnly />
        <Button variant="outline" onClick={handleCopyApiKey}>
          Copy
        </Button>
        <Button variant="destructive" onClick={handleDeleteApiKey}>
          Delete
        </Button>
      </div>
    </div>
  ) : (
    <Button onClick={handleGenerateApiKey}>Generate API Key</Button>
  )}
</section>
```

**工数**: 0.5 日

### Phase 2 成果物チェックリスト

- [ ] API Key 生成エンドポイント
- [ ] API Key 削除エンドポイント
- [ ] API Key 取得エンドポイント
- [ ] Profile UI に API Keys セクション追加
- [ ] 動作確認

**合計工数**: 1.5-2 日

---

## Phase 3-5: 続き

（以降の Phase は同様のフォーマットで記載）

**Phase 3**: 予約カレンダー（詳細は `05_RESERVATION_SYSTEM.md` 参照）
**Phase 4**: Global Configuration
**Phase 5**: Workflow Skill 実装（詳細は `04_DEVREV_INTEGRATION.md` 参照）

---

## テスト計画

### Unit Tests

- Backend: pytest
- Frontend: Jest + React Testing Library

### Integration Tests

- API Endpoints
- Database Operations
- DevRev API Calls

### E2E Tests

- Playwright
- ユーザーフロー全体

---

## デプロイ計画

### 開発環境

- Docker Compose
- ローカル PostgreSQL

### ステージング環境

- GCP Cloud Run (Backend)
- Vercel (Frontend)

### 本番環境

- GCP Cloud Run (Backend)
- Vercel (Frontend)
- Cloud SQL (PostgreSQL)

---

## 次のステップ

👉 [04_DEVREV_INTEGRATION.md](./04_DEVREV_INTEGRATION.md) で DevRev 統合の詳細設計を確認
