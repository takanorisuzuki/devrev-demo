"""
車両データスキーマ
TDD Green Phase - テストを通すための最小実装
API_DESIGN.md準拠
"""

from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class StoreInfo(BaseModel):
    """車両レスポンス用の店舗情報（簡易版）"""

    id: str = Field(..., description="店舗ID")
    name: str = Field(..., description="店舗名")
    address: str = Field(..., description="住所")

    model_config = ConfigDict(from_attributes=True)


class VehicleCreate(BaseModel):
    """車両作成用スキーマ"""

    # 基本情報
    make: str = Field(..., max_length=50, description="メーカー")
    model: str = Field(..., max_length=50, description="モデル名")
    year: int = Field(..., ge=1900, le=2030, description="年式")
    color: str = Field(..., max_length=30, description="色")
    license_plate: str = Field(..., max_length=20, description="ナンバープレート")

    # 分類
    category: str = Field(..., max_length=20, description="カテゴリ")
    class_type: str = Field(..., max_length=20, description="クラス分類")

    # 仕様
    transmission: str = Field(..., max_length=10, description="トランスミッション")
    fuel_type: str = Field(..., max_length=15, description="燃料タイプ")

    # 料金
    daily_rate: Decimal = Field(..., gt=0, description="日額料金")

    # 所在店舗
    store_id: Optional[str] = Field(None, description="所在店舗ID")

    # 画像
    image_filename: Optional[str] = Field(
        None, max_length=100, description="画像ファイル名"
    )
    
    # 喫煙可否
    is_smoking_allowed: Optional[bool] = Field(False, description="喫煙可否")


class VehicleResponse(BaseModel):
    """車両レスポンス用スキーマ"""

    # ID
    id: str = Field(..., description="車両ID")

    # 基本情報
    make: str = Field(..., description="メーカー")
    model: str = Field(..., description="モデル名")
    year: int = Field(..., description="年式")
    color: str = Field(..., description="色")
    license_plate: str = Field(..., description="ナンバープレート")

    # 分類
    category: str = Field(..., description="カテゴリ")
    class_type: str = Field(..., description="クラス分類")
    transmission: str = Field(..., description="トランスミッション")
    fuel_type: str = Field(..., description="燃料タイプ")

    # 料金
    daily_rate: Decimal = Field(..., description="日額料金")

    # ステータス
    is_available: bool = Field(..., description="利用可能フラグ")
    
    # 喫煙可否
    is_smoking_allowed: bool = Field(..., description="喫煙可否")

    # 画像
    image_filename: Optional[str] = Field(None, description="画像ファイル名")

    # 所在店舗
    store_id: Optional[str] = Field(None, description="所在店舗ID")

    # 店舗情報
    store: Optional[StoreInfo] = Field(None, description="所在店舗情報")

    # タイムスタンプ
    created_at: datetime = Field(..., description="作成日時")
    updated_at: datetime = Field(..., description="更新日時")

    model_config = ConfigDict(from_attributes=True)  # SQLAlchemyモデルからの変換を有効化


class VehicleUpdate(BaseModel):
    """車両更新用スキーマ（管理者用）"""

    # 基本情報（オプショナル）
    make: Optional[str] = Field(None, max_length=50, description="メーカー")
    model: Optional[str] = Field(None, max_length=50, description="モデル名")
    year: Optional[int] = Field(None, ge=1900, le=2030, description="年式")
    color: Optional[str] = Field(None, max_length=30, description="色")

    # 分類
    category: Optional[str] = Field(None, max_length=20, description="カテゴリ")
    class_type: Optional[str] = Field(None, max_length=20, description="クラス分類")

    # 仕様
    transmission: Optional[str] = Field(None, max_length=10, description="トランスミッション")
    fuel_type: Optional[str] = Field(None, max_length=15, description="燃料タイプ")

    # 料金
    daily_rate: Optional[Decimal] = Field(None, gt=0, description="日額料金")

    # ステータス（管理者が更新可能）
    is_available: Optional[bool] = Field(None, description="利用可能フラグ")
    is_active: Optional[bool] = Field(None, description="アクティブフラグ")
    
    # 喫煙可否
    is_smoking_allowed: Optional[bool] = Field(None, description="喫煙可否")

    # 所在店舗
    store_id: Optional[str] = Field(None, description="所在店舗ID")

    # 画像
    image_filename: Optional[str] = Field(
        None, max_length=100, description="画像ファイル名"
    )


class VehicleListResponse(BaseModel):
    """車両一覧表示用の軽量スキーマ"""

    id: str = Field(..., description="車両ID")
    make: str = Field(..., description="メーカー")
    model: str = Field(..., description="モデル名")
    year: int = Field(..., description="年式")
    category: str = Field(..., description="カテゴリ")
    daily_rate: Decimal = Field(..., description="日額料金")
    is_available: bool = Field(..., description="利用可能フラグ")
    image_filename: Optional[str] = Field(None, description="画像ファイル名")
    transmission: str = Field(..., description="トランスミッション")
    is_smoking_allowed: bool = Field(..., description="喫煙可否")

    # 店舗情報
    store: Optional[StoreInfo] = Field(None, description="所在店舗情報")

    model_config = ConfigDict(from_attributes=True)
