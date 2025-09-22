"""
予約統計サービス
TDD Green Phase - テストを通すための最小実装
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.models.store import Store
from app.models.vehicle import Vehicle
from app.schemas.reservation_stats import (CategoryBreakdown,
                                           CategoryUtilization, PeriodInfo,
                                           PeriodUtilization,
                                           ReservationStatsResponse,
                                           RevenueSummary, StatusBreakdown,
                                           StoreBreakdown,
                                           VehicleUtilizationItem,
                                           VehicleUtilizationResponse)


class ReservationStatsService:
    """予約統計関連のビジネスロジック"""

    def __init__(self, db: Session):
        """
        初期化

        Args:
            db: データベースセッション
        """
        self.db = db

    def get_reservation_stats(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> ReservationStatsResponse:
        """
        予約統計を取得する

        Args:
            start_date: 開始日 (YYYY-MM-DD)
            end_date: 終了日 (YYYY-MM-DD)

        Returns:
            予約統計データ
        """
        # 基本クエリ
        query = self.db.query(Reservation)

        # 日付フィルタリング
        if start_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Reservation.created_at >= start_dt)

        if end_date:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(Reservation.created_at < end_dt)

        # 総予約数
        total_reservations = query.count()

        # ステータス別集計
        status_counts = (
            query.with_entities(Reservation.status, func.count(Reservation.id))
            .group_by(Reservation.status)
            .all()
        )

        status_breakdown = StatusBreakdown()
        for status, count in status_counts:
            if status == "pending":
                status_breakdown.pending = count
            elif status == "confirmed":
                status_breakdown.confirmed = count
            elif status == "active":
                status_breakdown.active = count
            elif status == "completed":
                status_breakdown.completed = count
            elif status == "cancelled":
                status_breakdown.cancelled = count

        # カテゴリ別集計（車両テーブルとJOIN）
        category_counts = (
            query.join(Vehicle, Reservation.vehicle_id == Vehicle.id)
            .with_entities(Vehicle.category, func.count(Reservation.id))
            .group_by(Vehicle.category)
            .all()
        )

        category_breakdown = CategoryBreakdown()
        for category, count in category_counts:
            if category == "compact":
                category_breakdown.compact = count
            elif category == "suv":
                category_breakdown.suv = count
            elif category == "premium":
                category_breakdown.premium = count
            elif category == "sports":
                category_breakdown.sports = count
            elif category == "electric":
                category_breakdown.electric = count

        # 店舗別集計
        store_counts = (
            query.join(Store, Reservation.pickup_store_id == Store.id)
            .with_entities(
                Store.id,
                Store.name,
                func.count(Reservation.id),
                func.sum(Reservation.total_amount),
            )
            .group_by(Store.id, Store.name)
            .all()
        )

        store_breakdown = [
            StoreBreakdown(
                store_id=str(store_id),
                store_name=store_name,
                reservation_count=count,
                total_revenue=revenue or Decimal("0"),
            )
            for store_id, store_name, count, revenue in store_counts
        ]

        # 売上サマリー
        revenue_data = query.with_entities(
            func.sum(Reservation.total_amount),
            func.avg(Reservation.total_amount),
            func.sum(Reservation.tax_amount),
        ).first()

        total_revenue = revenue_data[0] or Decimal("0")
        avg_revenue = revenue_data[1] or Decimal("0")
        tax_collected = revenue_data[2] or Decimal("0")

        revenue_summary = RevenueSummary(
            total_revenue=total_revenue,
            average_revenue_per_reservation=avg_revenue,
            tax_collected=tax_collected,
        )

        # 期間情報
        period = PeriodInfo(start_date=start_date, end_date=end_date)

        return ReservationStatsResponse(
            total_reservations=total_reservations,
            status_breakdown=status_breakdown,
            category_breakdown=category_breakdown,
            store_breakdown=store_breakdown,
            revenue_summary=revenue_summary,
            period=period,
        )

    def get_vehicle_utilization(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> VehicleUtilizationResponse:
        """
        車両稼働率を取得する

        Args:
            start_date: 開始日 (YYYY-MM-DD)
            end_date: 終了日 (YYYY-MM-DD)

        Returns:
            車両稼働率データ
        """
        # 期間設定（デフォルトは過去30日）
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)

        # 車両別稼働率
        vehicle_utilization = []
        vehicles = self.db.query(Vehicle).all()

        for vehicle in vehicles:
            # 予約時間の合計を計算
            reservations = (
                self.db.query(Reservation)
                .filter(
                    Reservation.vehicle_id == vehicle.id,
                    Reservation.status.in_(["confirmed", "active", "completed"]),
                    Reservation.pickup_datetime >= start_dt,
                    Reservation.return_datetime <= end_dt,
                )
                .all()
            )

            total_hours = sum(
                (res.return_datetime - res.pickup_datetime).total_seconds() / 3600
                for res in reservations
            )

            # 期間内の総時間
            period_hours = (end_dt - start_dt).total_seconds() / 3600

            utilization_rate = (
                (total_hours / period_hours * 100) if period_hours > 0 else 0
            )

            vehicle_utilization.append(
                VehicleUtilizationItem(
                    vehicle_id=str(vehicle.id),
                    vehicle_name=f"{vehicle.make} {vehicle.model}",
                    utilization_rate=round(utilization_rate, 2),
                    total_hours=int(total_hours),
                    available_hours=int(period_hours),
                )
            )

        # カテゴリ別稼働率
        category_utilization = []
        categories = ["compact", "suv", "premium", "sports", "electric"]

        for category in categories:
            category_vehicles = [v for v in vehicles if v.category == category]
            if category_vehicles:
                total_vehicles = len(category_vehicles)
                active_vehicles = len([v for v in category_vehicles if v.is_active])
                avg_utilization = (
                    sum(
                        item.utilization_rate
                        for item in vehicle_utilization
                        if any(
                            v.category == category and str(v.id) == item.vehicle_id
                            for v in category_vehicles
                        )
                    )
                    / total_vehicles
                    if total_vehicles > 0
                    else 0
                )

                category_utilization.append(
                    CategoryUtilization(
                        category=category,
                        utilization_rate=round(avg_utilization, 2),
                        total_vehicles=total_vehicles,
                        active_vehicles=active_vehicles,
                    )
                )

        # 期間別稼働率（週単位）
        period_utilization = []
        current_date = start_dt
        while current_date < end_dt:
            week_end = min(current_date + timedelta(days=7), end_dt)

            week_reservations = (
                self.db.query(Reservation)
                .filter(
                    Reservation.status.in_(["confirmed", "active", "completed"]),
                    Reservation.pickup_datetime >= current_date,
                    Reservation.return_datetime <= week_end,
                )
                .all()
            )

            week_hours = sum(
                (res.return_datetime - res.pickup_datetime).total_seconds() / 3600
                for res in week_reservations
            )

            week_total_hours = (week_end - current_date).total_seconds() / 3600
            week_utilization = (
                (week_hours / week_total_hours * 100) if week_total_hours > 0 else 0
            )

            period_utilization.append(
                PeriodUtilization(
                    period=current_date.strftime("%Y-%m-%d"),
                    utilization_rate=round(week_utilization, 2),
                    total_hours=int(week_total_hours),
                    utilized_hours=int(week_hours),
                )
            )

            current_date = week_end

        return VehicleUtilizationResponse(
            vehicle_utilization=vehicle_utilization,
            category_utilization=category_utilization,
            period_utilization=period_utilization,
        )
