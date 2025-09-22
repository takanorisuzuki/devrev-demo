"""
予約データモデル
TDD Red Phase - 失敗テストから開始
TECHNICAL_SPEC.md完全準拠実装
"""

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DECIMAL,
    DateTime,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid


class Reservation(Base):
    """予約テーブル - プロダクション品質実装"""

    __tablename__ = "reservations"

    # 主キー
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    confirmation_number = Column(String(20), unique=True, nullable=False)

    # 関連エンティティ（外部キー）
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    pickup_store_id = Column(
        UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False
    )
    return_store_id = Column(
        UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False
    )

    # 予約期間
    pickup_datetime = Column(DateTime(timezone=True), nullable=False)
    return_datetime = Column(DateTime(timezone=True), nullable=False)
    actual_pickup_datetime = Column(DateTime(timezone=True), nullable=True)
    actual_return_datetime = Column(DateTime(timezone=True), nullable=True)

    # ステータス管理
    status = Column(String(20), default="pending", nullable=False)
    # pending, confirmed, active, completed, cancelled

    # 料金計算基盤
    base_rate: DECIMAL = Column(DECIMAL(10, 2), nullable=False)
    duration_hours = Column(Integer, nullable=False)
    subtotal: DECIMAL = Column(DECIMAL(10, 2), nullable=False)

    # オプション・追加料金
    options = Column(JSON, nullable=True)  # 選択されたオプション
    option_fees: DECIMAL = Column(DECIMAL(10, 2), default=0)
    insurance_fee: DECIMAL = Column(DECIMAL(10, 2), default=0)
    tax_amount: DECIMAL = Column(DECIMAL(10, 2), nullable=False)
    total_amount: DECIMAL = Column(DECIMAL(10, 2), nullable=False)

    # 割引・ポイント
    discount_amount: DECIMAL = Column(DECIMAL(10, 2), default=0)
    member_discount: DECIMAL = Column(DECIMAL(10, 2), default=0)
    points_used = Column(Integer, default=0)
    points_earned = Column(Integer, default=0)

    # 特記事項
    special_requests = Column(Text, nullable=True)
    staff_notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    # 決済情報
    payment_method = Column(String(20), nullable=True)
    payment_status = Column(String(20), default="pending")
    # pending, processing, completed, failed, refunded
    payment_reference = Column(String(100), nullable=True)

    # タイムスタンプ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # リレーションシップ
    customer = relationship("User", foreign_keys=[customer_id])
    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])
    pickup_store = relationship("Store", foreign_keys=[pickup_store_id])
    return_store = relationship("Store", foreign_keys=[return_store_id])
