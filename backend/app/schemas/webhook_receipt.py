"""
決済Webhook/領収書API用スキーマ
TDD Green Phase - 最小実装
"""

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class WebhookPayload(BaseModel):
    """Webhookペイロードスキーマ"""

    payment_id: str = Field(..., description="決済ID")
    status: str = Field(..., description="決済ステータス")
    amount: float = Field(..., description="決済金額")
    currency: str = Field(..., description="通貨")
    timestamp: datetime = Field(..., description="タイムスタンプ")
    signature: str = Field(..., description="Webhook署名")


class WebhookResponse(BaseModel):
    """Webhookレスポンススキーマ"""

    status: str = Field(..., description="処理ステータス")
    message: str = Field(..., description="処理メッセージ")
    payment_id: str = Field(..., description="決済ID")
    processed_at: datetime = Field(..., description="処理日時")


class ReceiptData(BaseModel):
    """領収書データスキーマ"""

    payment_id: str = Field(..., description="決済ID")
    amount: float = Field(..., description="決済金額")
    currency: str = Field(..., description="通貨")
    customer_name: str = Field(..., description="顧客名")
    customer_email: str = Field(..., description="顧客メール")
    vehicle_info: Dict[str, Any] = Field(..., description="車両情報")
    rental_period: Dict[str, str] = Field(..., description="レンタル期間")
    issued_at: datetime = Field(..., description="発行日時")


class ReceiptResponse(BaseModel):
    """領収書レスポンススキーマ"""

    receipt_data: ReceiptData = Field(..., description="領収書データ")
    pdf_url: Optional[str] = Field(None, description="PDF URL")
    download_url: Optional[str] = Field(None, description="ダウンロードURL")
