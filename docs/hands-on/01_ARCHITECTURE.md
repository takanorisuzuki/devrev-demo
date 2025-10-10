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

### PetStore (参照実装)

- **ドメイン**: ペット販売・獣医サービス
- **目的**: DevRev PLuG 統合のリファレンス実装
- **特徴**: Flask + Jinja2 のモノリシック Web アプリケーション
- **実績**: パートナートレーニングで実証済み

### DriveRev (新規実装)

- **ドメイン**: レンタカーサービス
- **目的**: モダンな DevRev AI Agent 学習プラットフォーム
- **特徴**: FastAPI + Next.js のモダン SPA
- **目標**: PetStore の機能を日本市場向けに最適化

---

## 技術スタック比較

### Backend

| 項目                     | PetStore                  | DriveRev             | 備考                                |
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

| 項目               | PetStore                    | DriveRev                | 備考                      |
| ------------------ | --------------------------- | ----------------------- | ------------------------- |
| **アーキテクチャ** | SSR (Server Side Rendering) | SPA (Single Page App)   | DriveRev はモダン         |
| **フレームワーク** | Jinja2 Templates            | Next.js 14 (React 18)   | DriveRev はフレームワーク |
| **スタイリング**   | Tailwind CSS 3.x            | Tailwind CSS 3.x        | 同じ                      |
| **JavaScript**     | Vanilla JS + Alpine.js      | TypeScript + React      | DriveRev は型安全         |
| **状態管理**       | N/A (ページごと)            | Zustand                 | DriveRev はグローバル状態 |
| **ルーティング**   | Flask Routes                | Next.js App Router      | DriveRev はクライアント   |
| **ビルドツール**   | N/A                         | Vite (Dev) / Next Build | DriveRev は最適化         |

### DevOps & Infrastructure

| 項目                 | PetStore                | DriveRev                | 備考                  |
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

#### PetStore (Session-based)

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

#### PetStore (SSR)

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

#### PetStore

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
| PetStore     | Integer (Auto Increment) | SQLite の制約、シンプル        |
| DriveRev     | UUID                     | 分散システム対応、セキュリティ |

**移行への影響**:

- API の ID 型が UUID 文字列になる
- DevRev RevUser ID は両方とも文字列なので問題なし

### 2. API 設計

#### PetStore

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

#### PetStore User Model

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
    devrev_app_id = Column(String(500), nullable=True)
    devrev_application_access_token = Column(String(500), nullable=True)
    devrev_revuser_id = Column(String(200), nullable=True)
    use_global_devrev_config = Column(Boolean, default=False)

    # API Key Management (追加予定)
    api_key = Column(String(100), nullable=True, unique=True)
    api_key_name = Column(String(100))
    api_key_created_at = Column(DateTime)
    api_key_last_used = Column(DateTime)
```

---

## データモデル設計

### コアエンティティ比較

| PetStore       | DriveRev                 | 関係              |
| -------------- | ------------------------ | ----------------- |
| Pet            | Vehicle                  | 1:1 (商品)        |
| PetCategory    | VehicleCategory          | 1:1 (カテゴリ)    |
| VetAppointment | Reservation              | 1:1 (予約)        |
| Veterinarian   | Store Staff (未実装)     | 新規追加予定      |
| Order          | Reservation Order (統合) | 異なる設計        |
| Product        | N/A                      | DriveRev では不要 |

### 追加が必要なモデル

1. **GlobalConfig** (PetStore から移植)

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

2. **ApiCallLog** (トレーニング用)
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

**PetStore & DriveRev (同じ)**:

- bcrypt with salt
- 最小 12 文字
- 強度チェック

### 2. API Key 管理

**PetStore**:

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

### PetStore から学ぶべき点

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
