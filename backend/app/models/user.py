"""
ユーザーモデル定義
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy_utils import StringEncryptedType

from app.db.database import Base
from app.core.config import settings


class UserRole(str, enum.Enum):
    """ユーザー権限"""

    customer = "customer"  # 一般顧客
    admin = "admin"  # 管理者


class User(Base):
    """ユーザーモデル"""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=True)
    role: UserRole = Column(
        Enum(UserRole, name="userrole"), default=UserRole.customer, nullable=False
    )
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # DevRev Integration (Phase 1)
    devrev_app_id = Column(String(500), nullable=True)
    # 暗号化して保存（セキュリティ対策）
    devrev_application_access_token = Column(
        StringEncryptedType(String, settings.SECRET_KEY), nullable=True
    )
    devrev_use_personal_config = Column(Boolean, default=False, nullable=False)
    devrev_revuser_id = Column(String(200), nullable=True, index=True)
    devrev_session_token = Column(String(500), nullable=True)
    devrev_session_expires_at = Column(DateTime, nullable=True)

    # API Key Management (Phase 1)
    # 暗号化して保存（セキュリティ対策）
    api_key = Column(
        StringEncryptedType(String, settings.SECRET_KEY),
        nullable=True,
        unique=True,
        index=True,
    )
    api_key_name = Column(String(100), default="User API Key", nullable=True)
    api_key_created_at = Column(DateTime, nullable=True)
    api_key_last_used = Column(DateTime, nullable=True)

    # リレーションシップ
    # lock = relationship("UserLock", back_populates="user", uselist=False)

    def clear_expired_devrev_session(self) -> None:
        """期限切れのDevRev Session Tokenをクリアする"""
        if (
            self.devrev_session_expires_at
            and datetime.now(timezone.utc) >= self.devrev_session_expires_at
        ):
            self.devrev_session_token = None
            self.devrev_session_expires_at = None

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
