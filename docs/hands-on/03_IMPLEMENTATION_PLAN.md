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

### Timeline (12 週間)

| Week | Phase                         | 主要成果物                     | 状態      |
| ---- | ----------------------------- | ------------------------------ | --------- |
| 1-2  | Phase 1                       | Global Config + PLuG 基盤      | 📝 計画中 |
| 3    | Phase 2                       | API Key 管理                   | 📝 計画中 |
| 4-5  | Phase 3                       | 予約カレンダー基盤             | 📝 計画中 |
| 4-5  | Phase 4 （一部並行）          | 決済統合 API 強化              | 📝 計画中 |
| 6    | hardening                     | テスト・パフォーマンス改善     | 📝 計画中 |
| 7-10 | Phase 5                       | Workflow Skills 15 個          | 📝 計画中 |
| 11   | 統合テスト                    | E2E / Agent 対話検証           | 📝 計画中 |
| 12   | ドキュメント & デプロイ準備   | 運用ガイド・トラブル対応整備   | 📝 計画中 |
<!--
旧タイムライン (8 週間):
| Week | Phase            | 主要成果物     | 状態      |
| ---- | ---------------- | -------------- | --------- |
| 1-2  | Phase 1          | PLuG 基盤      | 📝 計画中 |
| 3    | Phase 2          | API Key 管理   | 📝 計画中 |
| 4-5  | Phase 3          | 予約カレンダー | 📝 計画中 |
| 6    | Phase 4          | Global Config  | 📝 計画中 |
| 7    | Phase 5          | Workflow 集    | 📝 計画中 |
| 8    | Testing & Deploy | 本番リリース   | 📝 計画中 |
-->

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

    # DevRev Integration
    devrev_app_id: str | None = Column(String(500), nullable=True)
    devrev_application_access_token: str | None = Column(String(500), nullable=True)
    devrev_use_personal_config: bool = Column(Boolean, default=False)
    devrev_revuser_id: str | None = Column(String(200), nullable=True, index=True)
    devrev_session_token: str | None = Column(String(500), nullable=True)
    devrev_session_expires_at: datetime | None = Column(DateTime, nullable=True)

    # API Key Management
    api_key: str | None = Column(String(100), nullable=True, unique=True, index=True)
    api_key_name: str | None = Column(String(100), default='User API Key')
    api_key_created_at: datetime | None = Column(DateTime, nullable=True)
    api_key_last_used: datetime | None = Column(DateTime, nullable=True)

    def clear_expired_devrev_session(self) -> None:
        if self.devrev_session_expires_at and datetime.utcnow() >= self.devrev_session_expires_at:
            self.devrev_session_token = None
            self.devrev_session_expires_at = None
```
<!--
旧記述:
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
-->

**ポイント**:

- ゲスト（未ログイン）は Global 設定を使用し、ログインユーザーは `devrev_use_personal_config` を有効化すると個人設定で PLuG を初期化できる
- 個人 AAT は `crypto_service.encrypt()` で暗号化して保存し、Session Token 同様にローテーション手順を用意する
- Session Token は `crypto_service.encrypt()` で暗号化して保存する
- Alembic では新規カラム追加と既存データの初期値（`NULL`）を設定し、移行後に整合性テストを実施する

### 1-2: Backend - Pydantic Schemas

**ファイル**: 既存の `backend/app/schemas/__init__.py` などに追記

```python
class DevRevSessionTokenResponse(BaseModel):
    session_token: str
    expires_at: int
    app_id: str

class DevRevSessionStatusResponse(BaseModel):
    has_session_token: bool
    expires_at: int | None
    is_expired: bool

class ApiKeyResponse(BaseModel):
    api_key: str
    user_info: dict[str, str]
```

**ポイント**:

- 既存スキーマモジュールにまとめ、重複定義を避ける（DRY）
- ユーザー設定更新用に `DevRevIntegrationUpdate`（`app_id` / `application_access_token` / `use_personal_config`）を復活させ、暗号化保存を前提とする
- `app_id` など Global/Personal 設定はレスポンスに含め、フロントエンドで再利用できるようにする
<!--
旧記述:
```python
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
-->

### 1-3: Backend - API Endpoints

**ファイル**: 既存の `backend/app/api/v1/devrev.py` を拡張

```python
router = APIRouter(prefix="/devrev", tags=["DevRev Integration"])
devrev_config_service = DevRevConfigService

@router.post("/session-token", response_model=DevRevSessionTokenResponse)
async def generate_session_token(
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    config_service = devrev_config_service(db)

    # 1. 個人設定を利用する場合
    if current_user and current_user.devrev_use_personal_config:
        user = db.merge(current_user)
        if not user.devrev_app_id or not user.devrev_application_access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Personal DevRev configuration is incomplete"
            )

        if user.devrev_session_token and user.devrev_session_expires_at:
            if user.devrev_session_expires_at > datetime.utcnow() + timedelta(minutes=5):
                return DevRevSessionTokenResponse(
                    session_token=crypto_service.decrypt_aat(user.devrev_session_token),
                    expires_at=int(user.devrev_session_expires_at.timestamp()),
                    app_id=user.devrev_app_id,
                )

        devrev_service = DevRevService(
            crypto_service.decrypt_aat(user.devrev_application_access_token)
        )
        token, revuser_id, expires_at = await devrev_service.create_session_token(
            email=user.email,
            full_name=user.full_name,
        )

        user.devrev_session_token = crypto_service.encrypt_aat(token)
        user.devrev_session_expires_at = expires_at
        user.devrev_revuser_id = revuser_id
        db.commit()

        return DevRevSessionTokenResponse(
            session_token=token,
            expires_at=int(expires_at.timestamp()),
            app_id=user.devrev_app_id,
        )

    # 2. ゲスト or 個人設定を使わない場合は Global 設定を利用
    config = config_service.get_global_config()
    if not config:
        raise HTTPException(status_code=204, detail="DevRev not configured")

    user = db.merge(current_user) if current_user else None
    if user and user.devrev_session_token and user.devrev_session_expires_at:
        if user.devrev_session_expires_at > datetime.utcnow() + timedelta(minutes=5):
            return DevRevSessionTokenResponse(
                session_token=crypto_service.decrypt_aat(user.devrev_session_token),
                expires_at=int(user.devrev_session_expires_at.timestamp()),
                app_id=config["app_id"],
            )

    token, revuser_id, expires_at = await DevRevService(config["aat"]).create_session_token(
        email=user.email if user else "guest@driverev.dev",
        full_name=user.full_name if user else "DriveRev Guest",
    )

    if user:
        user.devrev_session_token = crypto_service.encrypt_aat(token)
        user.devrev_session_expires_at = expires_at
        if revuser_id:
            user.devrev_revuser_id = revuser_id
        db.commit()

    return DevRevSessionTokenResponse(
        session_token=token,
        expires_at=int(expires_at.timestamp()),
        app_id=config["app_id"],
    )

@router.get("/session-status", response_model=DevRevSessionStatusResponse)
async def get_session_status(
    current_user: User | None = Depends(get_current_user_optional)
):
    if not current_user:
        return DevRevSessionStatusResponse(
            has_session_token=False,
            expires_at=None,
            is_expired=True,
        )

    expires_at = current_user.devrev_session_expires_at
    is_expired = not expires_at or expires_at <= datetime.utcnow()
    return DevRevSessionStatusResponse(
        has_session_token=not is_expired and bool(current_user.devrev_session_token),
        expires_at=int(expires_at.timestamp()) if expires_at else None,
        is_expired=is_expired,
    )
```

**ポイント**:

- DevRev API 呼び出しは `DevRevService` で一元化し、`httpx.AsyncClient` を利用する
- Session Token は暗号化して保存し、再利用できる場合は DevRev API 呼び出しを省略する
- 個人設定が有効な場合はユーザーの App/AAT を、そうでなければ Global 設定（ゲスト用）を使う
- 204 を用いて「未設定」を表現し、フロントエンドで PLuG を無効化できるようにする
- `DevRevService.create_session_token` は `(token: str, revuser_id: str, expires_at: datetime)` を返却するユーティリティとして実装する
- `get_current_user_optional` は未ログイン時に `None` を返すヘルパーで、ゲストでも API が利用できるように FastAPI で用意する
- `requirements.txt` に `httpx==0.27.0` を追加し、既存の `requests` 呼び出しは順次 `httpx.AsyncClient` に移行する
<!--
旧記述（抜粋）:
```python
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
    ...
```
（この他、`get_session_status` やルート登録手順など旧実装全文を保持）
-->

### 1-4: Frontend - API クライアント

**ファイル**: `frontend/lib/api/devrev.ts`（既存ファイルを拡張）

```typescript
type DevRevSessionToken = {
  session_token: string;
  expires_at: number;
  app_id: string;
};

type DevRevSessionStatus = {
  has_session_token: boolean;
  expires_at: number | null;
  is_expired: boolean;
};

export const devrevApi = {
  async getSessionToken(): Promise<DevRevSessionToken> {
    const response = await apiClient.get('/api/v1/devrev/session-token');
    return response.data;
  },
  async getSessionStatus(): Promise<DevRevSessionStatus> {
    const response = await apiClient.get('/api/v1/devrev/session-status');
    return response.data;
  },
};
```

**ポイント**:

- 204 のレスポンスをハンドリングし、DevRev 未設定時は PLuG を非表示にする
- セッション再利用のため、フロントではトークンを保持せず毎回バックエンドを参照する
<!--
旧記述:
```typescript
export interface DevRevIntegrationUpdate {
  devrev_app_id?: string;
  devrev_application_access_token?: string;
  use_global_devrev_config: boolean;
}

export const devrevApi = {
  async updateIntegrationSettings(data: DevRevIntegrationUpdate) {
    return apiClient.put("/api/v1/devrev/settings", data);
  },

  async generateSessionToken() {
    const response = await apiClient.post<DevRevSessionToken>(
      "/api/v1/devrev/session-token"
    );
    return response.data;
  },
  ...
};
```
-->

### 1-5: Admin UI（Global Config）

**ファイル**: `frontend/app/admin/devrev/page.tsx`

- 管理者のみアクセス可能とし、App ID / AAT を登録・更新するフォームを提供する
- 保存時は `/api/v1/admin/devrev/global-config` を呼び出し、AAT はバックエンドで暗号化
- 更新後はトースト通知で PLuG 再初期化を案内する

### 1-6: Frontend - PLuG SDK 初期化

**ファイル**: `frontend/app/layout.tsx`

```typescript
const initializePlug = async () => {
  try {
    const token = await devrevApi.getSessionToken();
    if (!token?.session_token) {
      setPlugStatus('disabled');
      return;
    }

    window.plugSDK?.init({
      app_id: token.app_id,
      session_token: token.session_token,
      on_ready: () => setPlugStatus('ready'),
      on_error: (error) => handlePlugError(error),
    });
  } catch (error) {
    handlePlugError(error);
  }
};
```

**ポイント**:

- `handlePlugError` で 401（未設定）と 502（DevRev 障害）を区別し、ユーザー通知を出し分ける
- `window.plugSDK` が未定義の場合は `console.warn` で検知し、再試行やサポート連絡を案内する
- `useEffect` の依存配列は空にし、初期表示時のみ初期化する
<!--
旧記述では `authApi.verifyToken()` によるユーザー検証や `status.has_aat` 判定、カスタムランチャー実装などを詳細に記載していた。
-->

<!--
旧 Phase 1 成果物チェックリスト:
- [ ] User model に DevRev フィールド追加
- [ ] Alembic マイグレーション実行
- [ ] Pydantic schemas 作成
- [ ] Session Token 生成 API 実装
- [ ] Session Status 確認 API 実装
- [ ] 期限切れ Session Token クリーンアップジョブ（バッチ or DB TTL）実装
- [ ] Profile UI 作成
- [ ] PLuG SDK 統合
- [ ] カスタムランチャー実装
- [ ] 動作確認（E2E テスト）

合計工数: 5-6 日
-->

### Phase 1 実装タスクリスト（Living Docs）

- [ ] User model に DevRev フィールド追加（`devrev_use_personal_config` など）
- [ ] Alembic マイグレーション実行
- [ ] Pydantic schemas 作成
- [ ] Session Token 生成/ステータス API 実装（ゲスト・個人切り替え対応）
- [ ] DevRevService を `httpx.AsyncClient` ベースに移行（タイムアウト/リトライ実装）
- [ ] 期限切れ Session Token クリーンアップジョブ（バッチ or DB TTL）実装
- [ ] `frontend/lib/types/devrev.ts` に DevRev 関連の型定義を追加
- [ ] Profile UI 作成（個人設定の ON/OFF 切り替えを含む）
- [ ] PLuG SDK 統合
- [ ] カスタムランチャー実装
- [ ] 動作確認（E2E テスト）

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

## Phase 3: 店舗別在庫・予約システム

### 目標

店舗の営業時間と車両の空き状況を管理し、AI Agent が適切な予約提案ができるようにする。

### 3-1: Backend - Store Model 拡張

**ファイル**: `backend/app/models/store.py`

**変更内容**:

```python
class Store(Base):
    # ... 既存フィールド ...

    # 営業時間管理（新規追加）
    opening_hours: dict | None = Column(JSON, nullable=True)
    # 例: {
    #   "monday": {"open": "09:00", "close": "19:00", "closed": false},
    #   "tuesday": {"open": "09:00", "close": "19:00", "closed": false},
    #   "saturday": {"open": "10:00", "close": "18:00", "closed": false},
    #   "sunday": {"open": "10:00", "close": "18:00", "closed": false}
    # }

    closed_dates: list | None = Column(JSON, nullable=True)
    # 例: ["2024-12-31", "2025-01-01", "2025-01-02"]

    dropoff_enabled_stores: list | None = Column(JSON, nullable=True)
    # 例: ["uuid-osaka-store", "uuid-fukuoka-store"]

    def is_open_on_date(self, date: datetime.date) -> bool:
        """指定日が営業日かチェック"""
        if self.closed_dates and date.isoformat() in self.closed_dates:
            return False

        if not self.opening_hours:
            return True  # デフォルトは営業

        day_name = date.strftime('%A').lower()
        day_hours = self.opening_hours.get(day_name)

        return day_hours and not day_hours.get('closed', False)
```

**Alembic マイグレーション**:

```bash
cd backend
alembic revision -m "add_operating_hours_to_stores"
alembic upgrade head
```

**工数**: 0.5 日

### 3-2: Backend - Vehicle Model 拡張

**ファイル**: `backend/app/models/vehicle.py`

**変更内容**:

```python
class Vehicle(Base):
    # ... 既存フィールド ...

    # メンテナンス期間管理（新規追加）
    maintenance_periods: list | None = Column(JSON, nullable=True)
    # 例: [
    #   {"start": "2024-02-01", "end": "2024-02-05", "reason": "定期点検"},
    #   {"start": "2024-03-15", "end": "2024-03-16", "reason": "タイヤ交換"}
    # ]

    features: list | None = Column(JSON, nullable=True)
    # 例: ["カーナビ", "ETC", "バックカメラ", "ドライブレコーダー"]

    def is_available_on_period(
        self,
        start_date: datetime.date,
        end_date: datetime.date
    ) -> bool:
        """指定期間がメンテナンス期間と重複しないかチェック"""
        if not self.maintenance_periods:
            return True

        for period in self.maintenance_periods:
            maint_start = datetime.date.fromisoformat(period['start'])
            maint_end = datetime.date.fromisoformat(period['end'])

            # 期間が重複するかチェック
            if not (end_date < maint_start or start_date > maint_end):
                return False

        return True
```

**工数**: 0.5 日

### 3-3: Backend - 空き車両検索 API

**ファイル**: `backend/app/api/v1/vehicles.py` (既存ファイルに追加)

```python
from datetime import datetime, date
from sqlalchemy import and_, or_

@router.get("/search-available", response_model=List[VehicleAvailability])
async def search_available_vehicles(
    start_date: str,  # YYYY-MM-DD
    end_date: str,    # YYYY-MM-DD
    vehicle_type: str | None = None,
    store_id: str | None = None,
    db: Session = Depends(get_db)
):
    """
    空き車両を検索

    ロジック:
    1. 指定期間に予約が入っていない車両
    2. メンテナンス期間と重複しない車両
    3. 指定された車両タイプ（オプション）
    4. 指定された店舗（オプション）
    """
    try:
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    # ベースクエリ
    query = db.query(Vehicle).filter(Vehicle.is_available == True)

    if vehicle_type:
        query = query.filter(Vehicle.type == vehicle_type)

    if store_id:
        query = query.filter(Vehicle.store_id == store_id)

    vehicles = query.all()

    # 空き状況をチェック
    available_vehicles = []
    for vehicle in vehicles:
        # 予約状況チェック
        conflicting_reservations = db.query(Reservation).filter(
            and_(
                Reservation.vehicle_id == vehicle.id,
                Reservation.status.in_(['pending', 'confirmed']),
                or_(
                    and_(
                        Reservation.start_date <= start,
                        Reservation.end_date >= start
                    ),
                    and_(
                        Reservation.start_date <= end,
                        Reservation.end_date >= end
                    ),
                    and_(
                        Reservation.start_date >= start,
                        Reservation.end_date <= end
                    )
                )
            )
        ).count()

        if conflicting_reservations > 0:
            continue

        # メンテナンス期間チェック
        if not vehicle.is_available_on_period(start, end):
            continue

        available_vehicles.append(vehicle)

    return available_vehicles
```

**工数**: 1.5 日

### 3-4: Frontend - 日付範囲選択コンポーネント

**ファイル**: `frontend/components/reservations/DateRangePicker.tsx` (新規作成)

```typescript
'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

export interface DateRange {
  from: Date;
  to: Date;
}

export function DateRangePicker({
  onDateRangeChange
}: {
  onDateRangeChange: (range: DateRange) => void;
}) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      onDateRangeChange(range);
    }
  };

  return (
    <div className="p-4">
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={handleSelect}
        numberOfMonths={2}
        disabled={(date) => date < new Date()}
      />
    </div>
  );
}
```

**工数**: 1 日

### Phase 3 成果物チェックリスト

- [ ] Store Model に営業時間フィールド追加
- [ ] Vehicle Model にメンテナンス期間フィールド追加
- [ ] Alembic マイグレーション実行
- [ ] 空き車両検索 API 実装
- [ ] 日付範囲選択 UI 実装
- [ ] API と UI の統合
- [ ] テスト実行

**合計工数**: 3.5-4 日

---

## Phase 4-5: 続き

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
