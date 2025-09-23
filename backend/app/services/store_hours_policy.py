"""
店舗営業時間・ポリシー管理サービス
TDD Green Phase - 最小実装
"""

import logging
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.store import Store
from app.schemas.store_hours_policy import (
    StoreHours,
    StoreHoursResponse,
    StorePolicy,
    StorePolicyResponse,
)

logger = logging.getLogger(__name__)


class StoreHoursPolicyService:
    """店舗営業時間・ポリシー管理サービス"""

    def __init__(self, db: Session):
        self.db = db

    def get_store_hours(self, store_id: str) -> StoreHoursResponse:
        """店舗営業時間を取得する"""
        try:
            # UUID形式の検証
            import uuid

            try:
                uuid.UUID(store_id)
            except ValueError:
                raise ValueError(f"無効な店舗ID形式です: {store_id}")

            # 店舗の存在確認
            store = self.db.query(Store).filter(Store.id == store_id).first()
            if not store:
                raise ValueError(f"店舗ID {store_id} が見つかりません")

            # デフォルト営業時間を返す（実際の実装ではDBから取得）
            default_hours = StoreHours(
                monday={"open": "09:00", "close": "18:00"},
                tuesday={"open": "09:00", "close": "18:00"},
                wednesday={"open": "09:00", "close": "18:00"},
                thursday={"open": "09:00", "close": "18:00"},
                friday={"open": "09:00", "close": "18:00"},
                saturday={"open": "10:00", "close": "17:00"},
                sunday={"open": "10:00", "close": "17:00"},
                holidays={"open": "10:00", "close": "17:00"},
            )

            return StoreHoursResponse(
                store_id=store_id,
                hours=default_hours,
                last_updated=datetime.now().isoformat(),
            )

        except Exception as e:
            logger.error(f"Store hours retrieval failed: {str(e)}")
            raise

    def update_store_hours(
        self, store_id: str, hours: StoreHours
    ) -> StoreHoursResponse:
        """店舗営業時間を更新する"""
        try:
            # UUID形式の検証
            import uuid

            try:
                uuid.UUID(store_id)
            except ValueError:
                raise ValueError(f"無効な店舗ID形式です: {store_id}")

            # 店舗の存在確認
            store = self.db.query(Store).filter(Store.id == store_id).first()
            if not store:
                raise ValueError(f"店舗ID {store_id} が見つかりません")

            # 営業時間の妥当性検証
            self._validate_hours(hours)

            # 営業時間を更新（実際の実装ではDBに保存）
            # ここでは検証のみ行い、成功レスポンスを返す
            logger.info(f"Store hours updated for store {store_id}")

            return StoreHoursResponse(
                store_id=store_id, hours=hours, last_updated=datetime.now().isoformat()
            )

        except Exception as e:
            logger.error(f"Store hours update failed: {str(e)}")
            raise

    def get_store_policy(self, store_id: str) -> StorePolicyResponse:
        """店舗ポリシーを取得する"""
        try:
            # UUID形式の検証
            import uuid

            try:
                uuid.UUID(store_id)
            except ValueError:
                raise ValueError(f"無効な店舗ID形式です: {store_id}")

            # 店舗の存在確認
            store = self.db.query(Store).filter(Store.id == store_id).first()
            if not store:
                raise ValueError(f"店舗ID {store_id} が見つかりません")

            # デフォルトポリシーを返す（実際の実装ではDBから取得）
            default_policy = StorePolicy(
                cancellation_policy={
                    "free_cancellation_hours": 24,
                    "cancellation_fee_percentage": 10,
                    "no_show_fee_percentage": 50,
                },
                pricing_policy={
                    "base_rate": 5000,
                    "weekend_multiplier": 1.2,
                    "holiday_multiplier": 1.5,
                    "late_return_fee_per_hour": 1000,
                },
                insurance_policy={
                    "required": True,
                    "coverage_amount": 1000000,
                    "daily_rate": 500,
                },
                age_restriction={
                    "minimum_age": 18,
                    "maximum_age": 75,
                    "young_driver_surcharge": 2000,
                },
                license_requirement={
                    "required": True,
                    "validity_period_months": 12,
                    "international_license_accepted": True,
                },
            )

            return StorePolicyResponse(
                store_id=store_id,
                policy=default_policy,
                last_updated=datetime.now().isoformat(),
            )

        except Exception as e:
            logger.error(f"Store policy retrieval failed: {str(e)}")
            raise

    def update_store_policy(
        self, store_id: str, policy: StorePolicy
    ) -> StorePolicyResponse:
        """店舗ポリシーを更新する"""
        try:
            # UUID形式の検証
            import uuid

            try:
                uuid.UUID(store_id)
            except ValueError:
                raise ValueError(f"無効な店舗ID形式です: {store_id}")

            # 店舗の存在確認
            store = self.db.query(Store).filter(Store.id == store_id).first()
            if not store:
                raise ValueError(f"店舗ID {store_id} が見つかりません")

            # ポリシーの妥当性検証
            self._validate_policy(policy)

            # ポリシーを更新（実際の実装ではDBに保存）
            # ここでは検証のみ行い、成功レスポンスを返す
            logger.info(f"Store policy updated for store {store_id}")

            return StorePolicyResponse(
                store_id=store_id,
                policy=policy,
                last_updated=datetime.now().isoformat(),
            )

        except Exception as e:
            logger.error(f"Store policy update failed: {str(e)}")
            raise

    def _validate_hours(self, hours: StoreHours) -> None:
        """営業時間の妥当性を検証する"""
        days = [
            hours.monday,
            hours.tuesday,
            hours.wednesday,
            hours.thursday,
            hours.friday,
            hours.saturday,
            hours.sunday,
            hours.holidays,
        ]

        for day in days:
            open_time = datetime.strptime(day.open, "%H:%M").time()
            close_time = datetime.strptime(day.close, "%H:%M").time()

            if open_time >= close_time:
                raise ValueError(
                    f"開店時間は閉店時間より早い必要があります: {day.open} >= {day.close}"
                )

    def _validate_policy(self, policy: StorePolicy) -> None:
        """ポリシーの妥当性を検証する"""
        # キャンセルポリシー検証
        if policy.cancellation_policy.free_cancellation_hours < 0:
            raise ValueError("無料キャンセル時間は0以上である必要があります")

        if (
            policy.cancellation_policy.cancellation_fee_percentage < 0
            or policy.cancellation_policy.cancellation_fee_percentage > 100
        ):
            raise ValueError("キャンセル料率は0-100%の範囲である必要があります")

        # 料金ポリシー検証
        if policy.pricing_policy.base_rate < 0:
            raise ValueError("基本料金は0以上である必要があります")

        if policy.pricing_policy.weekend_multiplier < 1.0:
            raise ValueError("週末料金倍率は1.0以上である必要があります")

        # 年齢制限検証
        if policy.age_restriction.minimum_age >= policy.age_restriction.maximum_age:
            raise ValueError("最小年齢は最大年齢より小さい必要があります")

        # 免許要件検証
        if policy.license_requirement.validity_period_months < 1:
            raise ValueError("免許有効期間は1ヶ月以上である必要があります")
