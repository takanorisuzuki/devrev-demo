"""
ユーザーアカウントロック機能
"""

import uuid
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class UserLock(Base):
    """ユーザーアカウントロックテーブル"""

    __tablename__ = "user_locks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True
    )

    # ロック情報
    is_locked = Column(Boolean, default=False, nullable=False)
    lock_reason = Column(String(255), nullable=True)
    locked_at = Column(DateTime(timezone=True), nullable=True)
    unlocked_at = Column(DateTime(timezone=True), nullable=True)

    # ログイン試行回数
    failed_attempts = Column(Integer, default=0, nullable=False)
    last_failed_attempt = Column(DateTime(timezone=True), nullable=True)

    # 自動ロック設定
    max_failed_attempts = Column(Integer, default=5, nullable=False)
    lockout_duration_minutes = Column(Integer, default=30, nullable=False)

    # タイムスタンプ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # リレーションシップ
    user = relationship("User", back_populates="lock")

    def __repr__(self):
        return f"<UserLock(user_id={self.user_id}, is_locked={self.is_locked})>"
