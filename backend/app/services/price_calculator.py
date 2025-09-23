"""
料金計算エンジン
TDD Green Phase - テストを通すための最小実装
複雑な料金体系をサポート
"""

from datetime import datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal
from typing import Any, Dict, Optional

from app.models.vehicle import Vehicle


class PriceCalculator:
    """料金計算エンジン - プロダクション品質"""

    # 税率設定
    TAX_RATE = Decimal("0.10")  # 10%消費税

    # 基本保険料（日額）
    BASE_INSURANCE_FEE = Decimal("1000.00")

    # 会員割引率
    MEMBER_DISCOUNT_RATE = Decimal("0.05")  # 5%

    # オプション料金設定
    OPTION_PRICES = {
        "gps": Decimal("500.00"),  # GPS：1日500円
        "child_seat": Decimal("800.00"),  # チャイルドシート：1日800円
        "etc": Decimal("300.00"),  # ETC：1日300円
        "wifi": Decimal("600.00"),  # Wi-Fi：1日600円
        "snow_tires": Decimal("1200.00"),  # スタッドレス：1日1200円
        "ski_carrier": Decimal("700.00"),  # スキーキャリア：1日700円
    }

    def __init__(self):
        """初期化"""
        pass

    def calculate_quote(
        self,
        vehicle: Vehicle,
        pickup_datetime: datetime,
        return_datetime: datetime,
        options: Optional[Dict[str, Any]] = None,
        customer_is_member: bool = False,
        points_to_use: int = 0,
    ) -> Dict[str, Decimal]:
        """
        見積もり計算メイン関数

        Args:
            vehicle: 車両情報
            pickup_datetime: 借り出し日時
            return_datetime: 返却日時
            options: 選択オプション
            customer_is_member: 会員フラグ
            points_to_use: 使用ポイント（1ポイント=1円）

        Returns:
            料金詳細辞書
        """
        # 利用時間計算
        duration = return_datetime - pickup_datetime
        duration_hours = max(1, int(duration.total_seconds() / 3600))  # 最低1時間
        duration_days = max(
            1, duration_hours // 24 + (1 if duration_hours % 24 > 0 else 0)
        )

        # 基本料金計算
        base_rate = vehicle.daily_rate
        subtotal = base_rate * duration_days

        # オプション料金計算
        option_fees = self._calculate_option_fees(options or {}, duration_days)

        # 保険料計算
        insurance_fee = self.BASE_INSURANCE_FEE * duration_days

        # 小計（税抜き）
        pretax_total = subtotal + option_fees + insurance_fee

        # 割引計算
        member_discount = Decimal("0.00")
        if customer_is_member:
            member_discount = pretax_total * self.MEMBER_DISCOUNT_RATE

        # ポイント割引
        points_discount = min(
            Decimal(str(points_to_use)), pretax_total * Decimal("0.30")
        )  # 最大30%まで

        # 総割引
        total_discount = member_discount + points_discount

        # 税込み前金額
        discounted_amount = pretax_total - total_discount

        # 消費税計算
        tax_amount = (discounted_amount * self.TAX_RATE).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        # 最終金額
        total_amount = discounted_amount + tax_amount

        return {
            "base_rate": base_rate,
            "duration_hours": duration_hours,
            "duration_days": duration_days,
            "subtotal": subtotal,
            "option_fees": option_fees,
            "insurance_fee": insurance_fee,
            "discount_amount": Decimal("0.00"),  # 一般割引（将来拡張用）
            "member_discount": member_discount,
            "points_discount": points_discount,
            "tax_amount": tax_amount,
            "total_amount": total_amount,
        }

    def _calculate_option_fees(
        self, options: Dict[str, Any], duration_days: int
    ) -> Decimal:
        """
        オプション料金計算

        Args:
            options: 選択されたオプション
            duration_days: 利用日数

        Returns:
            オプション料金合計
        """
        total_option_fees = Decimal("0.00")

        for option_key, is_selected in options.items():
            if is_selected and option_key in self.OPTION_PRICES:
                total_option_fees += self.OPTION_PRICES[option_key] * duration_days

        return total_option_fees

    def validate_reservation_dates(
        self, pickup_datetime: datetime, return_datetime: datetime
    ) -> bool:
        """
        予約日時の妥当性検証

        Args:
            pickup_datetime: 借り出し日時
            return_datetime: 返却日時

        Returns:
            妥当性フラグ
        """
        # 基本的な日時順序チェック（返却日時は借り出し日時より後でなければならない）
        if return_datetime <= pickup_datetime:
            return False

        # 現在時刻より未来かチェック（UTC時刻で比較）
        now = datetime.now(timezone.utc)
        # pickup_datetimeがタイムゾーン情報なしの場合はUTCとして扱う
        if pickup_datetime.tzinfo is None:
            pickup_datetime = pickup_datetime.replace(tzinfo=timezone.utc)
        if pickup_datetime <= now:
            return False

        # return_datetimeもタイムゾーン情報なしの場合はUTCとして扱う
        if return_datetime.tzinfo is None:
            return_datetime = return_datetime.replace(tzinfo=timezone.utc)

        # 最長レンタル期間チェック（30日）
        max_duration = timedelta(days=30)
        if return_datetime - pickup_datetime > max_duration:
            return False

        return True
