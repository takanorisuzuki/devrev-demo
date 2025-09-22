"""
システム設定データモデル
TDD Green Phase - テストを通すための最小実装
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base
import uuid


class SystemSettings(Base):
    """システム設定テーブル"""

    __tablename__ = "system_settings"

    # 主キー
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 基本アプリケーション設定
    app_name = Column(String(100), nullable=False, default="DriveRev")
    app_version = Column(String(20), nullable=False, default="1.0.0")
    environment = Column(String(20), nullable=False, default="production")

    # メンテナンス設定
    maintenance_mode = Column(Boolean, default=False)
    maintenance_message = Column(Text, nullable=True)

    # 営業時間設定（JSON形式）
    business_hours = Column(JSON, nullable=True)

    # タイムスタンプ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<SystemSettings(id={self.id}, app_name='{self.app_name}', maintenance_mode={self.maintenance_mode})>"
