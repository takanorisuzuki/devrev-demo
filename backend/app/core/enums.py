"""
アプリケーション全体で使用するEnumの定義
"""

from enum import Enum


class ReservationStatus(str, Enum):
    """予約ステータス"""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    """決済ステータス"""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
