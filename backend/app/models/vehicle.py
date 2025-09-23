"""
車両データモデル
TDD Green Phase - テストを通すための最小実装
"""

import uuid

from sqlalchemy import (DECIMAL, Boolean, Column, DateTime, ForeignKey,
                        Integer, String)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Vehicle(Base):
    """車両テーブル"""

    __tablename__ = "vehicles"

    # 主キー
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 基本情報
    make = Column(String(50), nullable=False)
    model = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    color = Column(String(30), nullable=False)
    license_plate = Column(String(20), unique=True, nullable=False)

    # 分類
    category = Column(String(20), nullable=False)
    class_type = Column(String(20), nullable=False)

    # 仕様
    transmission = Column(String(10), nullable=False)
    fuel_type = Column(String(15), nullable=False)

    # 料金
    daily_rate: DECIMAL = Column(DECIMAL(10, 2), nullable=False)

    # 所在店舗
    store_id = Column(UUID(as_uuid=True), ForeignKey("stores.id"), nullable=True)

    # 画像
    image_filename = Column(String(100), nullable=True)  # 画像ファイル名

    # ステータス（デフォルト値設定）
    is_available = Column(Boolean, default=True)

    # 喫煙可否
    is_smoking_allowed = Column(Boolean, default=False)

    # タイムスタンプ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # リレーションシップ
    current_store = relationship("Store", back_populates="vehicles")
