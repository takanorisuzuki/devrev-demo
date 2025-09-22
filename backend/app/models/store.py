"""
店舗データモデル
TDD Green Phase - テストを通すための最小実装
"""

import uuid

from sqlalchemy import DECIMAL, Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Store(Base):
    """店舗テーブル"""

    __tablename__ = "stores"

    # 主キー
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 基本情報
    name = Column(String(100), nullable=False)
    code = Column(String(10), unique=True, nullable=False)

    # 住所情報
    prefecture = Column(String(10), nullable=False)
    city = Column(String(50), nullable=False)
    address_line1 = Column(String(200), nullable=False)
    address_line2 = Column(String(200), nullable=True)
    postal_code = Column(String(8), nullable=True)

    # 連絡先
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)

    # 位置情報
    latitude: DECIMAL = Column(DECIMAL(10, 8), nullable=True)
    longitude: DECIMAL = Column(DECIMAL(11, 8), nullable=True)

    # 分類フラグ
    is_airport = Column(Boolean, default=False)
    is_station = Column(Boolean, default=False)

    # ステータス
    is_active = Column(Boolean, default=True)

    # 営業情報（JSON形式で格納予定）
    # opening_hours = Column(JSONB, nullable=True)  # 後で追加

    # タイムスタンプ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # リレーションシップ
    vehicles = relationship("Vehicle", back_populates="current_store")
