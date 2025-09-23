"""
店舗営業時間・ポリシー管理API用スキーマ
TDD Green Phase - 最小実装
"""

from datetime import time

from pydantic import BaseModel, Field, field_validator


class DayHours(BaseModel):
    """1日の営業時間スキーマ"""

    open: str = Field(..., description="開店時間 (HH:MM)")
    close: str = Field(..., description="閉店時間 (HH:MM)")

    @field_validator("open", "close")
    @classmethod
    def validate_time_format(cls, v):
        """時間フォーマットを検証する"""
        try:
            time.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError(
                f"無効な時間フォーマットです: {v}. HH:MM形式で入力してください"
            )


class StoreHours(BaseModel):
    """店舗営業時間スキーマ"""

    monday: DayHours = Field(..., description="月曜日の営業時間")
    tuesday: DayHours = Field(..., description="火曜日の営業時間")
    wednesday: DayHours = Field(..., description="水曜日の営業時間")
    thursday: DayHours = Field(..., description="木曜日の営業時間")
    friday: DayHours = Field(..., description="金曜日の営業時間")
    saturday: DayHours = Field(..., description="土曜日の営業時間")
    sunday: DayHours = Field(..., description="日曜日の営業時間")
    holidays: DayHours = Field(..., description="祝日の営業時間")


class CancellationPolicy(BaseModel):
    """キャンセルポリシースキーマ"""

    free_cancellation_hours: int = Field(
        ..., ge=0, description="無料キャンセル可能時間（時間）"
    )
    cancellation_fee_percentage: float = Field(
        ..., ge=0, le=100, description="キャンセル料率（%）"
    )
    no_show_fee_percentage: float = Field(
        ..., ge=0, le=100, description="ノーショー料率（%）"
    )


class PricingPolicy(BaseModel):
    """料金ポリシースキーマ"""

    base_rate: float = Field(..., ge=0, description="基本料金")
    weekend_multiplier: float = Field(..., ge=1.0, description="週末料金倍率")
    holiday_multiplier: float = Field(..., ge=1.0, description="祝日料金倍率")
    late_return_fee_per_hour: float = Field(
        ..., ge=0, description="延滞料（時間あたり）"
    )


class InsurancePolicy(BaseModel):
    """保険ポリシースキーマ"""

    required: bool = Field(..., description="保険必須かどうか")
    coverage_amount: float = Field(..., ge=0, description="補償金額")
    daily_rate: float = Field(..., ge=0, description="日額保険料")


class AgeRestriction(BaseModel):
    """年齢制限スキーマ"""

    minimum_age: int = Field(..., ge=18, le=25, description="最小年齢")
    maximum_age: int = Field(..., ge=65, le=80, description="最大年齢")
    young_driver_surcharge: float = Field(..., ge=0, description="若年運転者追加料金")


class LicenseRequirement(BaseModel):
    """免許要件スキーマ"""

    required: bool = Field(..., description="免許必須かどうか")
    validity_period_months: int = Field(
        ..., ge=1, le=24, description="免許有効期間（月）"
    )
    international_license_accepted: bool = Field(..., description="国際免許受け入れ")


class StorePolicy(BaseModel):
    """店舗ポリシースキーマ"""

    cancellation_policy: CancellationPolicy = Field(
        ..., description="キャンセルポリシー"
    )
    pricing_policy: PricingPolicy = Field(..., description="料金ポリシー")
    insurance_policy: InsurancePolicy = Field(..., description="保険ポリシー")
    age_restriction: AgeRestriction = Field(..., description="年齢制限")
    license_requirement: LicenseRequirement = Field(..., description="免許要件")


class StoreHoursResponse(BaseModel):
    """店舗営業時間レスポンススキーマ"""

    store_id: str = Field(..., description="店舗ID")
    hours: StoreHours = Field(..., description="営業時間")
    last_updated: str = Field(..., description="最終更新日時")


class StorePolicyResponse(BaseModel):
    """店舗ポリシーレスポンススキーマ"""

    store_id: str = Field(..., description="店舗ID")
    policy: StorePolicy = Field(..., description="ポリシー")
    last_updated: str = Field(..., description="最終更新日時")
