"""
予約統計スキーマ
TDD Green Phase - テストを通すための最小実装
"""

from decimal import Decimal
from typing import Dict, List, Optional

from pydantic import BaseModel


class StatusBreakdown(BaseModel):
    """ステータス別集計"""

    pending: int = 0
    confirmed: int = 0
    active: int = 0
    completed: int = 0
    cancelled: int = 0


class CategoryBreakdown(BaseModel):
    """カテゴリ別集計"""

    compact: int = 0
    suv: int = 0
    premium: int = 0
    sports: int = 0
    electric: int = 0


class StoreBreakdown(BaseModel):
    """店舗別集計"""

    store_id: str
    store_name: str
    reservation_count: int
    total_revenue: Decimal


class RevenueSummary(BaseModel):
    """売上サマリー"""

    total_revenue: Decimal
    average_revenue_per_reservation: Decimal
    tax_collected: Decimal


class PeriodInfo(BaseModel):
    """期間情報"""

    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ReservationStatsResponse(BaseModel):
    """予約統計レスポンス"""

    total_reservations: int
    status_breakdown: StatusBreakdown
    category_breakdown: CategoryBreakdown
    store_breakdown: List[StoreBreakdown]
    revenue_summary: RevenueSummary
    period: PeriodInfo


class VehicleUtilizationItem(BaseModel):
    """車両稼働率アイテム"""

    vehicle_id: str
    vehicle_name: str
    utilization_rate: float
    total_hours: int
    available_hours: int


class CategoryUtilization(BaseModel):
    """カテゴリ別稼働率"""

    category: str
    utilization_rate: float
    total_vehicles: int
    active_vehicles: int


class PeriodUtilization(BaseModel):
    """期間別稼働率"""

    period: str
    utilization_rate: float
    total_hours: int
    utilized_hours: int


class VehicleUtilizationResponse(BaseModel):
    """車両稼働率レスポンス"""

    vehicle_utilization: List[VehicleUtilizationItem]
    category_utilization: List[CategoryUtilization]
    period_utilization: List[PeriodUtilization]


class ReportGenerationRequest(BaseModel):
    """レポート生成リクエスト"""

    report_type: str  # "reservations", "vehicles", "revenue"
    format: str  # "csv", "pdf", "json"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    filters: Optional[Dict[str, str]] = None
