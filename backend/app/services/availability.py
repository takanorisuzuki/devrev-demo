"""
空車検索サービス
TDD Green Phase - 最小実装
"""

from datetime import date
from typing import List, Optional
from uuid import UUID

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.models.store import Store
from app.models.vehicle import Vehicle
from app.schemas.availability import (AvailabilitySearchRequest,
                                      AvailableVehicle,
                                      VehicleAvailabilityRequest,
                                      VehicleAvailabilityResponse)
from app.utils.store_mapping import StoreMapping


class AvailabilityService:
    """空車検索サービス"""

    def __init__(self, db: Session):
        self.db = db

    def search_available_vehicles(
        self, search_request: AvailabilitySearchRequest
    ) -> List[AvailableVehicle]:
        """空車検索を実行する"""
        # 基本的な車両クエリ
        query = self.db.query(Vehicle).filter(
            Vehicle.is_available == True, Vehicle.is_active == True
        )

        # 店舗フィルタ（デモ店舗ID対応）
        if search_request.store_id:
            # デモ店舗ID（store-1等）の場合はバックエンドUUIDに変換
            backend_store_id = StoreMapping.get_backend_store_id(
                search_request.store_id
            )
            if backend_store_id:
                try:
                    store_uuid = UUID(backend_store_id)
                    query = query.filter(Vehicle.store_id == store_uuid)
                except ValueError:
                    # 無効なUUIDの場合は空の結果を返す
                    return []
            else:
                # デモ店舗IDでもバックエンドUUIDでもない場合は、直接UUIDとして処理
                try:
                    store_uuid = UUID(search_request.store_id)
                    query = query.filter(Vehicle.store_id == store_uuid)
                except ValueError:
                    # 無効なUUIDの場合は空の結果を返す
                    return []

        # カテゴリフィルタ
        if search_request.category:
            query = query.filter(Vehicle.category == search_request.category)

        # メーカーフィルタ
        if search_request.make:
            query = query.filter(Vehicle.make == search_request.make)

        # 燃料タイプフィルタ
        if search_request.fuel_type:
            query = query.filter(Vehicle.fuel_type == search_request.fuel_type)

        # 価格フィルタ
        if search_request.min_price:
            query = query.filter(Vehicle.daily_rate >= search_request.min_price)
        if search_request.max_price:
            query = query.filter(Vehicle.daily_rate <= search_request.max_price)

        # 予約済み車両を除外
        reserved_vehicle_ids = self._get_reserved_vehicle_ids(
            search_request.start_date, search_request.end_date
        )
        if reserved_vehicle_ids:
            # UUID文字列をUUIDオブジェクトに変換
            reserved_uuids = [UUID(vehicle_id) for vehicle_id in reserved_vehicle_ids]
            query = query.filter(Vehicle.id.notin_(reserved_uuids))

        # 店舗情報と結合
        vehicles = query.join(Store, Vehicle.store_id == Store.id).all()

        # レスポンス形式に変換
        return [
            AvailableVehicle(
                id=str(vehicle.id),
                make=vehicle.make,
                model=vehicle.model,
                year=vehicle.year,
                category=vehicle.category,
                daily_rate=vehicle.daily_rate,
                image_filename=vehicle.image_filename,
                transmission=vehicle.transmission,
                is_smoking_allowed=vehicle.is_smoking_allowed,
                store_id=str(vehicle.store_id),
                store_name=(
                    vehicle.current_store.name if vehicle.current_store else "不明"
                ),
                store_address=(
                    f"{vehicle.current_store.prefecture} {vehicle.current_store.city} {vehicle.current_store.address_line1}"
                    if vehicle.current_store
                    else "不明"
                ),
            )
            for vehicle in vehicles
        ]

    def check_vehicle_availability(
        self, request: VehicleAvailabilityRequest
    ) -> VehicleAvailabilityResponse:
        """特定車両の空き状況を確認する"""
        try:
            # UUID形式を検証
            vehicle_uuid = UUID(request.vehicle_id)

            # 車両情報を取得
            vehicle = self.db.query(Vehicle).filter(Vehicle.id == vehicle_uuid).first()

            if not vehicle:
                return VehicleAvailabilityResponse(
                    vehicle_id=request.vehicle_id,
                    is_available=False,
                    start_date=request.start_date,
                    end_date=request.end_date,
                    conflicting_reservations=[],
                    message=f"車両ID {request.vehicle_id} が見つかりません",
                )

            # 車両が利用不可能な場合
            if not vehicle.is_available or not vehicle.is_active:
                return VehicleAvailabilityResponse(
                    vehicle_id=request.vehicle_id,
                    is_available=False,
                    start_date=request.start_date,
                    end_date=request.end_date,
                    conflicting_reservations=[],
                    message="この車両は現在利用不可能です",
                )

            # 競合予約を確認
            conflicting_reservations = self._get_conflicting_reservations(
                vehicle_uuid, request.start_date, request.end_date
            )

            if conflicting_reservations:
                return VehicleAvailabilityResponse(
                    vehicle_id=request.vehicle_id,
                    is_available=False,
                    start_date=request.start_date,
                    end_date=request.end_date,
                    conflicting_reservations=conflicting_reservations,
                    message=f"指定期間に競合予約があります（{len(conflicting_reservations)}件）",
                )

            # 利用可能
            return VehicleAvailabilityResponse(
                vehicle_id=request.vehicle_id,
                is_available=True,
                start_date=request.start_date,
                end_date=request.end_date,
                conflicting_reservations=[],
                message="指定期間で利用可能です",
            )

        except ValueError:
            # 無効なUUID
            return VehicleAvailabilityResponse(
                vehicle_id=request.vehicle_id,
                is_available=False,
                start_date=request.start_date,
                end_date=request.end_date,
                conflicting_reservations=[],
                message="無効な車両IDです",
            )
        except Exception:
            # 予期しないエラー
            return VehicleAvailabilityResponse(
                vehicle_id=request.vehicle_id,
                is_available=False,
                start_date=request.start_date,
                end_date=request.end_date,
                conflicting_reservations=[],
                message="空き状況の確認中にエラーが発生しました",
            )

    def _get_conflicting_reservations(
        self, vehicle_id: UUID, start_date: date, end_date: date
    ) -> List[dict]:
        """指定車両の競合予約を取得する"""
        try:
            conflicting_reservations = (
                self.db.query(Reservation)
                .filter(
                    and_(
                        Reservation.vehicle_id == vehicle_id,
                        Reservation.status.in_(["confirmed", "active"]),
                        or_(
                            # 開始日が期間内
                            and_(
                                Reservation.start_date <= end_date,
                                Reservation.start_date >= start_date,
                            ),
                            # 終了日が期間内
                            and_(
                                Reservation.end_date <= end_date,
                                Reservation.end_date >= start_date,
                            ),
                            # 期間を包含
                            and_(
                                Reservation.start_date <= start_date,
                                Reservation.end_date >= end_date,
                            ),
                        ),
                    )
                )
                .all()
            )

            return [
                {
                    "id": str(reservation.id),
                    "start_date": reservation.start_date.isoformat(),
                    "end_date": reservation.end_date.isoformat(),
                    "status": reservation.status,
                }
                for reservation in conflicting_reservations
            ]
        except Exception:
            return []

    def _get_reserved_vehicle_ids(self, start_date: date, end_date: date) -> List[str]:
        """指定期間に予約済みの車両IDを取得する"""
        try:
            reserved_vehicles = (
                self.db.query(Reservation.vehicle_id)
                .filter(
                    and_(
                        Reservation.status.in_(["confirmed", "active"]),
                        or_(
                            # 開始日が期間内
                            and_(
                                Reservation.start_date <= end_date,
                                Reservation.start_date >= start_date,
                            ),
                            # 終了日が期間内
                            and_(
                                Reservation.end_date <= end_date,
                                Reservation.end_date >= start_date,
                            ),
                            # 期間を包含
                            and_(
                                Reservation.start_date <= start_date,
                                Reservation.end_date >= end_date,
                            ),
                        ),
                    )
                )
                .all()
            )

            return [str(vehicle_id[0]) for vehicle_id in reserved_vehicles]
        except Exception:
            # エラーが発生した場合は空のリストを返す
            return []
