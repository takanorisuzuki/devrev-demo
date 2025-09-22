"""
空車検索API用スキーマ
TDD Green Phase - 最小実装
"""

from typing import List, Optional
from datetime import date
from pydantic import BaseModel, Field, field_validator


class AvailabilitySearchRequest(BaseModel):
    """空車検索リクエストスキーマ"""
    start_date: date = Field(..., description="レンタル開始日")
    end_date: date = Field(..., description="レンタル終了日")
    store_id: Optional[str] = Field(None, description="店舗ID（UUID）")
    category: Optional[str] = Field(None, description="車両カテゴリ")
    make: Optional[str] = Field(None, description="メーカー名")
    fuel_type: Optional[str] = Field(None, description="燃料タイプ")
    min_price: Optional[float] = Field(None, ge=0, description="最低価格")
    max_price: Optional[float] = Field(None, ge=0, description="最高価格")

    @field_validator('end_date')
    @classmethod
    def validate_date_range(cls, v, info):
        """日付範囲の妥当性検証"""
        if info.data.get('start_date') and v < info.data['start_date']:
            raise ValueError('終了日は開始日以降である必要があります')
        return v


class AvailableVehicle(BaseModel):
    """利用可能車両スキーマ"""
    id: str = Field(..., description="車両ID")
    make: str = Field(..., description="メーカー名")
    model: str = Field(..., description="モデル名")
    year: int = Field(..., description="年式")
    category: str = Field(..., description="車両カテゴリ")
    daily_rate: float = Field(..., description="日額料金")
    image_filename: Optional[str] = Field(None, description="画像ファイル名")
    transmission: str = Field(..., description="トランスミッション")
    is_smoking_allowed: bool = Field(..., description="喫煙可否")
    store_id: str = Field(..., description="店舗ID")
    store_name: str = Field(..., description="店舗名")
    store_address: str = Field(..., description="店舗住所")


class AvailabilitySearchResponse(BaseModel):
    """空車検索レスポンススキーマ"""
    available_vehicles: List[AvailableVehicle] = Field(..., description="利用可能車両一覧")
    total_count: int = Field(..., description="総件数")
    search_criteria: AvailabilitySearchRequest = Field(..., description="検索条件")
    search_period_days: int = Field(..., description="検索期間（日数）")


class VehicleAvailabilityRequest(BaseModel):
    """特定車両の空き状況確認リクエストスキーマ"""
    vehicle_id: str = Field(..., description="車両ID（UUID）")
    start_date: date = Field(..., description="レンタル開始日")
    end_date: date = Field(..., description="レンタル終了日")

    @field_validator('end_date')
    @classmethod
    def validate_date_range(cls, v, info):
        """日付範囲の妥当性検証"""
        if info.data.get('start_date') and v < info.data['start_date']:
            raise ValueError('終了日は開始日以降である必要があります')
        return v


class VehicleAvailabilityResponse(BaseModel):
    """特定車両の空き状況確認レスポンススキーマ"""
    vehicle_id: str = Field(..., description="車両ID")
    is_available: bool = Field(..., description="利用可能かどうか")
    start_date: date = Field(..., description="レンタル開始日")
    end_date: date = Field(..., description="レンタル終了日")
    conflicting_reservations: List[dict] = Field(default_factory=list, description="競合予約一覧")
    message: str = Field(..., description="状況メッセージ")
