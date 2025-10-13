# アーキテクチャ設計と技術スタック比較

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック比較](#技術スタック比較)
3. [アーキテクチャの違い](#アーキテクチャの違い)
4. [設計上の重要な決定事項](#設計上の重要な決定事項)
5. [データモデル設計](#データモデル設計)
6. [セキュリティ設計](#セキュリティ設計)

---

## プロジェクト概要

### 参照システム<!-- 旧称: PetStore --> (参照実装)

- **ドメイン**: ペット販売・獣医サービス
- **目的**: DevRev PLuG 統合のリファレンス実装
- **特徴**: Flask + Jinja2 のモノリシック Web アプリケーション
- **実績**: パートナートレーニングで実証済み

### DriveRev (新規実装)

- **ドメイン**: レンタカーサービス
- **目的**: モダンな DevRev AI Agent 学習プラットフォーム
- **特徴**: FastAPI + Next.js のモダン SPA
- **目標**: 参照システム<!-- 旧称: PetStore --> の機能を日本市場向けに最適化

---

## 技術スタック比較

### Backend

| 項目                     | 参照システム<!-- 旧称: PetStore -->                  | DriveRev             | 備考                                |
| ------------------------ | ------------------------- | -------------------- | ----------------------------------- |
| **フレームワーク**       | Flask 2.3.3               | FastAPI 0.115+       | FastAPI は API 特化、型安全性       |
| **テンプレートエンジン** | Jinja2 (SSR)              | N/A (SPA)            | DriveRev はクライアントレンダリング |
| **認証**                 | Flask-Login (Session)     | JWT (Stateless)      | DriveRev はスケーラブル             |
| **ORM**                  | SQLAlchemy 2.0            | SQLAlchemy 2.0       | 同じ                                |
| **DB**                   | SQLite (Dev) / PostgreSQL | PostgreSQL           | DriveRev は本番想定                 |
| **API Doc**              | Flasgger (Swagger)        | FastAPI (OpenAPI)    | FastAPI は自動生成                  |
| **バリデーション**       | WTForms                   | Pydantic             | Pydantic は型ベース                 |
| **非同期**               | 同期                      | 非同期 (async/await) | FastAPI は高パフォーマンス          |

### Frontend

| 項目               | 参照システム<!-- 旧称: PetStore -->                    | DriveRev                | 備考                      |
| ------------------ | --------------------------- | ----------------------- | ------------------------- |
| **アーキテクチャ** | SSR (Server Side Rendering) | SPA (Single Page App)   | DriveRev はモダン         |
| **フレームワーク** | Jinja2 Templates            | Next.js 14 (React 18)   | DriveRev はフレームワーク |
| **スタイリング**   | Tailwind CSS 3.x            | Tailwind CSS 3.x        | 同じ                      |
| **JavaScript**     | Vanilla JS + Alpine.js      | TypeScript + React      | DriveRev は型安全         |
| **状態管理**       | N/A (ページごと)            | Zustand                 | DriveRev はグローバル状態 |
| **ルーティング**   | Flask Routes                | Next.js App Router      | DriveRev はクライアント   |
| **ビルドツール**   | N/A                         | Vite (Dev) / Next Build | DriveRev は最適化         |

### DevOps & Infrastructure

| 項目                 | 参照システム<!-- 旧称: PetStore -->                | DriveRev                | 備考                  |
| -------------------- | ----------------------- | ----------------------- | --------------------- |
| **コンテナ**         | Docker + Docker Compose | Docker + Docker Compose | 同じ                  |
| **WSGI/ASGI**        | Gunicorn (WSGI)         | Uvicorn (ASGI)          | DriveRev は非同期対応 |
| **リバースプロキシ** | Nginx                   | Nginx                   | 同じ                  |
| **CI/CD**            | Manual / GitHub Actions | GitHub Actions          | DriveRev は自動化     |
| **デプロイ先**       | AWS ECS                 | GCP Cloud Run (計画中)  | DriveRev は GCP       |
| **監視**             | CloudWatch              | (未実装)                | 今後追加予定          |

---

## アーキテクチャの違い

### 1. 認証・認可

#### 参照システム<!-- 旧称: PetStore --> (Session-based)

```python
# Flask-Login
@login_required
def profile():
    return render_template('profile.html', user=current_user)
```

**特徴**:

- セッション Cookie
- サーバー側でセッション管理
- CSRF トークン必須
- ステートフル

#### DriveRev (JWT-based)

```python
# FastAPI + JWT
@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
```

**特徴**:

- JWT Token (Bearer Token)
- ステートレス
- クライアント側で Token 管理
- スケーラブル

**移行時の注意点**:

- Session Token を JWT に変換する必要なし（DevRev Session Token は独立）
- API Key 認証は両プロジェクトで共通
- DevRev AAT も同じ方式で利用可能

### 2. レンダリング方式

#### 参照システム<!-- 旧称: PetStore --> (SSR)

```python
# Flask Route
@frontend_bp.route('/pets')
def list_pets():
    pets = Pet.query.all()
    return render_template('pets/list.html', pets=pets)
```

**フロー**:

1. ユーザーがページリクエスト
2. サーバーで HTML を生成
3. 完全な HTML をレスポンス
4. ブラウザが表示

#### DriveRev (SPA + CSR)

```typescript
// Next.js Page Component
export default async function VehiclesPage() {
  const vehicles = await fetchVehicles();
  return <VehicleGrid vehicles={vehicles} />;
}
```

**フロー**:

1. 初回は静的 HTML と JS をロード
2. クライアントで API リクエスト
3. JSON データを受信
4. React が DOM 更新

**利点**:

- ページ遷移が高速
- リッチな UI/UX
- API 再利用可能

**欠点**:

- 初回ロードが若干遅い（最適化で改善）
- SEO 対策が必要（Next.js が解決）

### 3. DevRev PLuG 統合の違い

#### 参照システム<!-- 旧称: PetStore -->

```html
<!-- Jinja2 Template -->
<script>
  {% if current_user.is_authenticated %}
    const sessionToken = "{{ session.get('devrev_session_token', '') }}";
    initializePlug(sessionToken, "{{ current_user.get_effective_devrev_config()['app_id'] }}");
  {% endif %}
</script>
```

**課題**:

- テンプレート内にロジックが混在
- Session Token が HTML に埋め込まれる（XSS 対策必要）

#### DriveRev (推奨実装)

```typescript
// React Component
const [sessionToken, setSessionToken] = useState<string | null>(null);

useEffect(() => {
  // API経由で安全にSession Token取得
  const fetchSessionToken = async () => {
    const token = await generateDevRevSessionToken();
    setSessionToken(token);
  };
  fetchSessionToken();
}, []);

useEffect(() => {
  if (sessionToken && plugAppId) {
    initializePlug(sessionToken, plugAppId);
  }
}, [sessionToken, plugAppId]);
```

**利点**:

- クリーンな分離
- セキュリティ向上
- 再利用可能

---

## 設計上の重要な決定事項

### 1. ユーザー ID の型

| プロジェクト | ユーザー ID 型           | 理由                           |
| ------------ | ------------------------ | ------------------------------ |
| 参照システム<!-- 旧称: PetStore -->     | Integer (Auto Increment) | SQLite の制約、シンプル        |
| DriveRev     | UUID                     | 分散システム対応、セキュリティ |

**移行への影響**:

- API の ID 型が UUID 文字列になる
- DevRev RevUser ID は両方とも文字列なので問題なし

### 2. API 設計

#### 参照システム<!-- 旧称: PetStore -->

- **エンドポイント**: `/api/*`
- **認証**: Session, API Key, DevRev AAT
- **レスポンス**: JSON
- **ドキュメント**: Swagger UI

#### DriveRev

- **エンドポイント**: `/api/v1/*` (バージョニング)
- **認証**: JWT, API Key, DevRev AAT
- **レスポンス**: Pydantic Model → JSON
- **ドキュメント**: FastAPI 自動生成

**互換性**:

- DevRev Workflow からのアクセスは同じパターン
- API Key 認証は完全互換

### 3. データベーススキーマ

#### 参照システム<!-- 旧称: PetStore --> User Model

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(200))

    # DevRev Integration
    devrev_app_id = db.Column(db.String(500))
    devrev_application_access_token = db.Column(db.String(500))
    devrev_revuser_id = db.Column(db.String(200))
    use_global_devrev_config = db.Column(db.Boolean, default=False)
```

#### DriveRev User Model (拡張版)

```python
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(100))
    role: UserRole = Column(Enum(UserRole))

    # DevRev Integration (追加予定)
    devrev_app_id = Column(String(500), nullable=True)  # ログインユーザー固有の PLuG App ID
    devrev_application_access_token = Column(String(500), nullable=True)  # 暗号化保存前提
    devrev_use_personal_config = Column(Boolean, default=False)  # True の場合は個人設定を優先
    devrev_revuser_id = Column(String(200), nullable=True, index=True)
    devrev_session_token = Column(String(500), nullable=True)
    devrev_session_expires_at = Column(DateTime, nullable=True)
    <!--
    旧構成 (2025/02 時点):
        devrev_revuser_id = Column(String(200), nullable=True, index=True)
        devrev_session_token = Column(String(500), nullable=True)
        devrev_session_expires_at = Column(DateTime, nullable=True)
        # GlobalConfig のみで運用し、ユーザー単位の App/AAT を持たない方針だった。
    -->

    # API Key Management (追加予定)
    api_key = Column(String(100), nullable=True, unique=True)
    api_key_name = Column(String(100))
    api_key_created_at = Column(DateTime)
    api_key_last_used = Column(DateTime)
```

---

## データモデル設計

### コアエンティティ比較

| 参照システム<!-- 旧称: PetStore -->       | DriveRev                 | 関係              | 備考 |
| -------------- | ------------------------ | ----------------- | ---- |
| Pet            | Vehicle                  | 1:1 (商品)        | 両方とも「貸し出す資産」 |
| PetCategory    | VehicleType              | 1:1 (カテゴリ)    | サービスタイプ ≈ 車両タイプ |
| VetAppointment | Reservation              | 1:1 (予約)        | 時間枠 → 日付範囲 |
| Veterinarian   | **Store** (既存モデル)   | **概念の置き換え** | スタッフ → 店舗・在庫管理 |
| Order          | Reservation (統合済)     | 異なる設計        | 注文と予約を統合 |
| Product        | N/A                      | DriveRev では不要 | 物販なし |

**重要な設計方針**:
- 参照システム<!-- 旧称: PetStore -->の「Veterinarian（スタッフ）」は DriveRevでは「Store（店舗）+ Vehicle在庫」に置き換え
- スタッフの勤務スケジュール → 店舗の営業時間 + 車両のメンテナンス期間
- これにより、参照システム<!-- 旧称: PetStore -->と同じデータ構造・APIパターンで自然なレンタカーシステムを実現

### 拡張が必要な既存モデル

#### 1. **Store Model** (営業時間・乗り捨て管理)

```python
class Store(Base):
    # 既存フィールド: id, name, address, phone, email, ...

    # 追加フィールド
    opening_hours: dict | None = Column(JSON, nullable=True)
    # 例: {"monday": {"open": "09:00", "close": "19:00", "closed": false}}

    closed_dates: list | None = Column(JSON, nullable=True)
    # 例: ["2024-12-31", "2025-01-01"]

    dropoff_enabled_stores: list | None = Column(JSON, nullable=True)
    # 例: ["uuid-osaka", "uuid-fukuoka"]

    def is_open_on_date(self, date: datetime.date) -> bool:
        """指定日が営業日かチェック（参照システム<!-- 旧称: PetStore -->のスタッフスケジュールと同等）"""
        pass
```

**参照システム<!-- 旧称: PetStore -->対応**: Veterinarian の勤務スケジュール → Store の営業時間

#### 2. **Vehicle Model** (メンテナンス管理)

```python
class Vehicle(Base):
    # 既存フィールド: id, model, type, daily_rate, ...

    # 追加フィールド
    maintenance_periods: list | None = Column(JSON, nullable=True)
    # 例: [{"start": "2024-02-01", "end": "2024-02-05", "reason": "定期点検"}]

    features: list | None = Column(JSON, nullable=True)
    # 例: ["カーナビ", "ETC", "バックカメラ"]

    def is_available_on_period(self, start: date, end: date) -> bool:
        """指定期間が利用可能かチェック（参照システム<!-- 旧称: PetStore -->の時間枠チェックと同等）"""
        pass
```

**参照システム<!-- 旧称: PetStore -->対応**: スタッフの空き時間 → 車両の利用可能期間

#### 3. **User Model** (DevRev統合)

```python
class User(Base):
    # 既存フィールド: id, email, hashed_password, ...

    # DevRev Integration (新規追加)
    devrev_app_id: str | None = Column(String(500), nullable=True)
    devrev_application_access_token: str | None = Column(String(500), nullable=True)
    devrev_use_personal_config: bool = Column(Boolean, default=False)
    devrev_revuser_id: str | None = Column(String(200), nullable=True, index=True)
    devrev_session_token: str | None = Column(String(500), nullable=True)
    devrev_session_expires_at: datetime | None = Column(DateTime, nullable=True)
    <!--
    旧構成:
        devrev_revuser_id: str | None = Column(String(200), nullable=True, index=True)
        devrev_session_token: str | None = Column(String(500), nullable=True)
        devrev_session_expires_at: datetime | None = Column(DateTime, nullable=True)
        # GlobalConfig のみ運用 (ユーザー設定なし)
    -->

    # API Key Management (新規追加)
    api_key: str | None = Column(String(100), nullable=True, unique=True)
    api_key_name: str | None = Column(String(100))
    api_key_created_at: datetime | None = Column(DateTime)
    api_key_last_used: datetime | None = Column(DateTime)
```

**参照システム<!-- 旧称: PetStore -->対応**: 完全に同じフィールド構成
**DriveRev差分**: ゲスト（未ログイン）は `GlobalConfig` に格納された固定 App/AAT を利用し、ログイン後はユーザー行の `devrev_app_id` / `devrev_application_access_token`（暗号化保存）を有効化して自組織の PLuG をカスタマイズできる

### アーキテクチャ・デシジョン（Living Docs）

- **DevRev 統合の責務分離**  
  Global Config（`global_config` テーブル）でゲスト用の固定 App/AAT を保持し、未ログイン時はこの設定で PLuG を提供する。ログイン後のユーザーは `devrev_use_personal_config` を有効化すると、個人設定（`devrev_app_id` / `devrev_application_access_token`）を使って自組織の PLuG を呼び出せる。<br>
  <!-- 旧案 (2025/02): Global Config のみで運用し、個人設定は無効化していた。 -->

- **DevRev サービス層の非同期化**  
  すべての DevRev API 呼び出しは `DevRevService` を経由し、`httpx.AsyncClient` を利用した非同期実装とする。タイムアウト（既定 10 秒）、リトライ方針、例外ロギングはサービス層に集約し、FastAPI のイベントループをブロックしない。<br>
  <!-- 旧案: `requests` を直接 API ハンドラから呼び出していた。 -->

- **Session Token の暗号化と再利用**  
  Session Token はユーザー行に暗号化保存し、`devrev_session_expires_at` が 5 分以上先であれば復号して再利用する。期限切れトークンはバッチまたは DB TTL で削除する。DevRev 未設定（Global Config 不存在）時は DriveRev 本体機能のみ動作させ、PLuG 初期化 API は 204 を返す。

- **負荷と障害時の扱い**  
  DevRev API 障害時は `DevRevService.create_session_token` が 502 を返し、フロントは PLuG を無効化／ユーザーへ案内を表示する。DriveRev の予約・決済機能は独立して動作し、DevRev 統合はオプション扱いとする。

- **ドキュメント更新運用**  
  本ファイル・`03_IMPLEMENTATION_PLAN.md`・`04_DEVREV_INTEGRATION.md`・`05_IMPLEMENTATION_ANALYSIS.md` を同期更新し、旧仕様は HTML コメントで残す。これにより、Living Document として意思決定の経緯を可視化しつつ、現行仕様との差異を追跡できる。
- **Phase 1 の UI 方針**  
  Phase 1 時点では `devrev_use_personal_config` の UI 表示を行わず、すべてのユーザーが Global 設定を利用する。将来のフェーズで個人設定を解放する場合は、管理者承認フローと併せて UI を追加する。

### 追加が必要な新規モデル

#### 4. **GlobalConfig** (参照システム<!-- 旧称: PetStore --> から移植)

```python
class GlobalConfig(Base):
    __tablename__ = "global_config"

    id = Column(Integer, primary_key=True)
    config_key = Column(String(100), unique=True)
    config_value = Column(Text)
    description = Column(String(255))
    is_secret = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

#### 5. **ApiCallLog** (トレーニング・デバッグ用)

```python
class ApiCallLog(Base):
    __tablename__ = "api_call_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    endpoint = Column(String(255))
    method = Column(String(10))
    status_code = Column(Integer)
    request_body = Column(Text)
    response_body = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## セキュリティ設計

### 1. パスワードハッシュ

**参照システム<!-- 旧称: PetStore --> & DriveRev (同じ)**:

- bcrypt with salt
- 最小 12 文字
- 強度チェック

### 2. API Key 管理

**参照システム<!-- 旧称: PetStore -->**:

```python
# Simple API Key
def generate_api_key():
    return 'ps_live_' + secrets.token_urlsafe(32)
```

**DriveRev (推奨)**:

```python
# Prefixed API Key with better entropy
def generate_api_key():
    prefix = "drv_live_"
    key = secrets.token_urlsafe(32)
    return f"{prefix}{key}"
```

### 3. DevRev AAT Storage

**両プロジェクト共通の課題**:

- DB 平文保存（暗号化すべき）

**改善案**:

```python
from cryptography.fernet import Fernet

# Environment variable
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_aat(aat: str) -> str:
    return cipher_suite.encrypt(aat.encode()).decode()

def decrypt_aat(encrypted_aat: str) -> str:
    return cipher_suite.decrypt(encrypted_aat.encode()).decode()
```

---

## まとめ

### 参照システム<!-- 旧称: PetStore --> から学ぶべき点

✅ **DevRev 統合パターン**: Session Token 生成、API Key 管理
✅ **ユーザー設定**: Personal vs Global Configuration
✅ **予約システム**: 時間枠管理、スタッフアサイン
✅ **API デザイン**: DevRev Workflow friendly

### DriveRev で改善する点

✅ **モダンスタック**: FastAPI + Next.js + TypeScript
✅ **型安全性**: Pydantic + TypeScript
✅ **スケーラビリティ**: JWT + Stateless
✅ **パフォーマンス**: 非同期処理
✅ **セキュリティ**: 暗号化、Rate Limiting

### 次のステップ

👉 [02_FEATURE_COMPARISON.md](./02_FEATURE_COMPARISON.md) で機能比較と実装ギャップを確認
