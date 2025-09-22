"""
決済スキーマ
TDD Green Phase - テストを通すための最小実装
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class PaymentRequest(BaseModel):
    """決済リクエストスキーマ"""
    payment_method: str = Field(..., description="決済方法 (card, cash, bank_transfer)")
    card_token: Optional[str] = Field(None, description="カードトークン (Stripe)")
    amount: Decimal = Field(..., gt=0, description="決済金額")
    currency: str = Field(default="JPY", description="通貨")


class PaymentResponse(BaseModel):
    """決済レスポンススキーマ"""
    payment_id: str = Field(..., description="決済ID")
    payment_status: str = Field(..., description="決済ステータス")
    transaction_id: Optional[str] = Field(None, description="取引ID")
    amount: Decimal = Field(..., description="決済金額")
    currency: str = Field(..., description="通貨")
    created_at: datetime = Field(..., description="決済日時")
    failure_reason: Optional[str] = Field(None, description="失敗理由")
    failure_code: Optional[str] = Field(None, description="失敗コード")
    failure_details: Optional[str] = Field(None, description="失敗詳細")
    # 決済履歴表示用の追加フィールド
    vehicle_name: Optional[str] = Field(None, description="車両名")
    pickup_date: Optional[datetime] = Field(None, description="受取日時")
    return_date: Optional[datetime] = Field(None, description="返却日時")
    payment_method: Optional[str] = Field(None, description="決済方法")
    # 管理者用決済履歴に必要な顧客・予約情報
    customer_name: Optional[str] = Field(None, description="顧客名")
    customer_email: Optional[str] = Field(None, description="顧客メールアドレス")
    customer_id: Optional[str] = Field(None, description="顧客ID")
    reservation_id: Optional[str] = Field(None, description="予約ID")
    store_name: Optional[str] = Field(None, description="店舗名")
    pickup_datetime: Optional[datetime] = Field(None, description="受取日時")
    return_datetime: Optional[datetime] = Field(None, description="返却日時")


class PaymentHistoryResponse(BaseModel):
    """決済履歴レスポンススキーマ"""
    payments: List[PaymentResponse] = Field(..., description="決済履歴リスト")
    total_count: int = Field(..., description="総件数")
    total_amount: Decimal = Field(..., description="総決済金額")


class RefundRequest(BaseModel):
    """返金リクエストスキーマ"""
    amount: Decimal = Field(..., gt=0, description="返金額")
    reason: str = Field(..., description="返金理由")


class RefundResponse(BaseModel):
    """返金レスポンススキーマ"""
    refund_id: str = Field(..., description="返金ID")
    refund_status: str = Field(..., description="返金ステータス")
    amount: Decimal = Field(..., description="返金額")
    reason: str = Field(..., description="返金理由")
    created_at: datetime = Field(..., description="返金日時")


class AdminPaymentStats(BaseModel):
    """管理者用決済統計スキーマ"""
    total_payments: int = Field(..., description="総決済件数")
    total_amount: Decimal = Field(..., description="総決済金額")
    successful_payments: int = Field(..., description="成功決済件数")
    failed_payments: int = Field(..., description="失敗決済件数")
    refunded_amount: Decimal = Field(..., description="返金総額")


class AdminPaymentHistoryResponse(BaseModel):
    """管理者用決済履歴レスポンススキーマ"""
    payments: List[PaymentResponse] = Field(..., description="決済履歴リスト")
    payment_stats: AdminPaymentStats = Field(..., description="決済統計")
    total_count: int = Field(..., description="総件数")
