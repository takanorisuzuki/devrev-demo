"""
予約データスキーマ
TDD Green Phase - テストを通すための最小実装
API_DESIGN.md準拠
"""

from typing import Optional, Dict, Any
from datetime import datetime, timezone
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator, ConfigDict


class ReservationCreate(BaseModel):
    """予約作成用スキーマ"""

    # 車両・店舗選択
    vehicle_id: str = Field(..., description="車両ID")
    pickup_store_id: str = Field(..., description="借り出し店舗ID")
    return_store_id: str = Field(..., description="返却店舗ID")

    # 予約期間
    pickup_datetime: datetime = Field(..., description="借り出し日時")
    return_datetime: datetime = Field(..., description="返却日時")

    # オプション
    options: Optional[Dict[str, Any]] = Field(None, description="選択オプション")
    special_requests: Optional[str] = Field(
        None, max_length=500, description="特別要望"
    )

    # ポイント使用
    points_to_use: Optional[int] = Field(0, ge=0, description="使用ポイント")

    @field_validator("return_datetime")
    def validate_return_after_pickup(cls, v, info):
        """返却日時が借り出し日時より後であることを確認"""
        if "pickup_datetime" in info.data and v <= info.data["pickup_datetime"]:
            raise ValueError("返却日時は借り出し日時より後である必要があります")
        return v


class ReservationQuote(BaseModel):
    """見積もり用スキーマ"""

    vehicle_id: str = Field(..., description="車両ID")
    pickup_datetime: datetime = Field(..., description="借り出し日時")
    return_datetime: datetime = Field(..., description="返却日時")
    options: Optional[Dict[str, Any]] = Field(None, description="選択オプション")
    points_to_use: Optional[int] = Field(0, ge=0, description="使用ポイント")


class ReservationQuoteResponse(BaseModel):
    """見積もり結果スキーマ"""

    # 基本料金
    base_rate: Decimal = Field(..., description="基本料金（時間単価）")
    duration_hours: int = Field(..., description="利用時間")
    subtotal: Decimal = Field(..., description="小計")

    # 追加料金
    option_fees: Decimal = Field(..., description="オプション料金")
    insurance_fee: Decimal = Field(..., description="保険料")
    tax_amount: Decimal = Field(..., description="税金")

    # 割引
    discount_amount: Decimal = Field(..., description="割引金額")
    member_discount: Decimal = Field(..., description="会員割引")
    points_discount: Decimal = Field(..., description="ポイント割引")

    # 最終金額
    total_amount: Decimal = Field(..., description="合計金額")

    model_config = ConfigDict(from_attributes=True)


class ReservationResponse(BaseModel):
    """予約レスポンス用スキーマ"""

    # ID・確認番号
    id: str = Field(..., description="予約ID")
    confirmation_number: str = Field(..., description="確認番号")

    # 関連情報
    customer_id: str = Field(..., description="顧客ID")
    vehicle_id: str = Field(..., description="車両ID")
    pickup_store_id: str = Field(..., description="借り出し店舗ID")
    return_store_id: str = Field(..., description="返却店舗ID")

    # 予約期間
    pickup_datetime: datetime = Field(..., description="借り出し日時")
    return_datetime: datetime = Field(..., description="返却日時")

    # ステータス
    status: str = Field(..., description="予約ステータス")
    payment_status: str = Field(..., description="決済ステータス")

    # 料金
    total_amount: Decimal = Field(..., description="合計金額")
    tax_amount: Decimal = Field(..., description="消費税額")

    # オプション
    options: Optional[Dict[str, Any]] = Field(None, description="選択オプション")
    special_requests: Optional[str] = Field(None, description="特別要望")

    # 関連データ
    vehicle: Optional[Dict[str, Any]] = Field(None, description="車両情報")
    pickup_store: Optional[Dict[str, Any]] = Field(None, description="借り出し店舗情報")
    return_store: Optional[Dict[str, Any]] = Field(None, description="返却店舗情報")

    # 日時
    created_at: datetime = Field(..., description="作成日時")

    model_config = ConfigDict(from_attributes=True)


class ReservationStatusUpdate(BaseModel):
    """予約ステータス更新用スキーマ（管理者用）"""
    
    status: str = Field(..., description="新しい予約ステータス")
    reason: Optional[str] = Field(None, max_length=500, description="ステータス変更理由")
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """ステータス値の検証"""
        valid_statuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled']
        if v not in valid_statuses:
            raise ValueError(f'ステータスは次のいずれかである必要があります: {", ".join(valid_statuses)}')
        return v


class ReservationListResponse(BaseModel):
    """予約一覧表示用の軽量スキーマ"""

    id: str = Field(..., description="予約ID")
    confirmation_number: str = Field(..., description="確認番号")
    vehicle_id: str = Field(..., description="車両ID")
    pickup_datetime: datetime = Field(..., description="借り出し日時")
    return_datetime: datetime = Field(..., description="返却日時")
    status: str = Field(..., description="予約ステータス")
    total_amount: Decimal = Field(..., description="合計金額")
    created_at: datetime = Field(..., description="作成日時")
    
    # 決済情報
    payment_status: Optional[str] = Field(None, description="支払いステータス")
    payment_method: Optional[str] = Field(None, description="支払い方法")
    payment_reference: Optional[str] = Field(None, description="支払い参照番号")
    
    # 車両情報
    vehicle: Optional[Dict[str, Any]] = Field(None, description="車両情報")
    # 店舗情報
    pickup_store: Optional[Dict[str, Any]] = Field(None, description="借り出し店舗情報")
    return_store: Optional[Dict[str, Any]] = Field(None, description="返却店舗情報")
    # ユーザー情報（管理者用）
    customer: Optional[Dict[str, Any]] = Field(None, description="顧客情報")

    model_config = ConfigDict(from_attributes=True)


class ReservationUpdate(BaseModel):
    """顧客用予約更新スキーマ（拡張版）"""

    # 予約期間
    pickup_datetime: Optional[datetime] = Field(None, description="借り出し日時")
    return_datetime: Optional[datetime] = Field(None, description="返却日時")
    
    # 店舗変更
    pickup_store_id: Optional[str] = Field(None, description="借り出し店舗ID")
    return_store_id: Optional[str] = Field(None, description="返却店舗ID")
    
    # 要望・オプション
    special_requests: Optional[str] = Field(
        None, max_length=500, description="特別要望"
    )
    options: Optional[Dict[str, Any]] = Field(None, description="選択オプション")

    @field_validator("return_datetime")
    @classmethod
    def validate_return_after_pickup(cls, v, info):
        """返却日時が借り出し日時より後であることを確認"""
        if (
            "pickup_datetime" in info.data
            and info.data["pickup_datetime"]
            and v
            and v <= info.data["pickup_datetime"]
        ):
            raise ValueError("返却日時は借り出し日時より後である必要があります")
        return v

    @field_validator("pickup_datetime", "return_datetime")
    @classmethod
    def validate_future_datetime(cls, v):
        """過去の日時を禁止（24時間前制限は後で追加）"""
        if v and v <= datetime.now(timezone.utc):
            raise ValueError("過去の日時は指定できません")
        return v
