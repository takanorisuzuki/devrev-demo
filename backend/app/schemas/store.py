"""
店舗データ用Pydanticスキーマ
TDD Green Phase - APIリクエスト・レスポンス定義
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StoreCreate(BaseModel):
    """店舗作成用スキーマ"""

    name: str = Field(..., min_length=1, max_length=100, description="店舗名")
    code: str = Field(..., min_length=3, max_length=10, description="店舗コード")
    prefecture: str = Field(..., min_length=2, max_length=10, description="都道府県")
    city: str = Field(..., min_length=1, max_length=50, description="市区町村")
    address_line1: str = Field(..., min_length=1, max_length=200, description="住所1")
    address_line2: Optional[str] = Field(None, max_length=200, description="住所2")
    postal_code: Optional[str] = Field(None, max_length=8, description="郵便番号")
    phone: Optional[str] = Field(None, max_length=20, description="電話番号")
    email: Optional[str] = Field(None, max_length=100, description="メールアドレス")
    latitude: Optional[Decimal] = Field(None, description="緯度")
    longitude: Optional[Decimal] = Field(None, description="経度")
    is_airport: bool = Field(False, description="空港店舗フラグ")
    is_station: bool = Field(False, description="駅店舗フラグ")
    is_active: bool = Field(True, description="営業中フラグ")


class StoreUpdate(BaseModel):
    """店舗更新用スキーマ"""

    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="店舗名"
    )
    code: Optional[str] = Field(
        None, min_length=3, max_length=10, description="店舗コード"
    )
    prefecture: Optional[str] = Field(
        None, min_length=2, max_length=10, description="都道府県"
    )
    city: Optional[str] = Field(
        None, min_length=1, max_length=50, description="市区町村"
    )
    address_line1: Optional[str] = Field(
        None, min_length=1, max_length=200, description="住所1"
    )
    address_line2: Optional[str] = Field(None, max_length=200, description="住所2")
    postal_code: Optional[str] = Field(None, max_length=8, description="郵便番号")
    phone: Optional[str] = Field(None, max_length=20, description="電話番号")
    email: Optional[str] = Field(None, max_length=100, description="メールアドレス")
    latitude: Optional[Decimal] = Field(None, description="緯度")
    longitude: Optional[Decimal] = Field(None, description="経度")
    is_airport: Optional[bool] = Field(None, description="空港店舗フラグ")
    is_station: Optional[bool] = Field(None, description="駅店舗フラグ")
    is_active: Optional[bool] = Field(None, description="営業中フラグ")


class StoreResponse(BaseModel):
    """店舗レスポンス用スキーマ"""

    id: str = Field(..., description="店舗ID（UUID）")
    name: str = Field(..., description="店舗名")
    code: str = Field(..., description="店舗コード")
    prefecture: str = Field(..., description="都道府県")
    city: str = Field(..., description="市区町村")
    address_line1: str = Field(..., description="住所1")
    address_line2: Optional[str] = Field(None, description="住所2")
    postal_code: Optional[str] = Field(None, description="郵便番号")
    phone: Optional[str] = Field(None, description="電話番号")
    email: Optional[str] = Field(None, description="メールアドレス")
    latitude: Optional[Decimal] = Field(None, description="緯度")
    longitude: Optional[Decimal] = Field(None, description="経度")
    is_airport: bool = Field(..., description="空港店舗フラグ")
    is_station: bool = Field(..., description="駅店舗フラグ")
    is_active: bool = Field(..., description="営業中フラグ")
    created_at: datetime = Field(..., description="作成日時")
    updated_at: datetime = Field(..., description="更新日時")

    model_config = ConfigDict(
        from_attributes=True
    )  # SQLAlchemyモデルからの変換を有効化


class StoreListResponse(BaseModel):
    """店舗一覧レスポンス用スキーマ（簡易版）"""

    id: str = Field(..., description="店舗ID（UUID）")
    name: str = Field(..., description="店舗名")
    code: str = Field(..., description="店舗コード")
    prefecture: str = Field(..., description="都道府県")
    city: str = Field(..., description="市区町村")
    is_airport: bool = Field(..., description="空港店舗フラグ")
    is_station: bool = Field(..., description="駅店舗フラグ")
    is_active: bool = Field(..., description="営業中フラグ")

    model_config = ConfigDict(from_attributes=True)
