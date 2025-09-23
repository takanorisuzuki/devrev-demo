"""
管理者用予約管理APIエンドポイント
TDD Green Phase - 管理者が全予約を管理する機能
"""

from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.auth import get_admin_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.reservation import (ReservationListResponse,
                                     ReservationResponse,
                                     ReservationStatusUpdate)
from app.services.reservation import ReservationService

# 管理者予約管理ルーター
router = APIRouter()


def get_admin_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """管理者認証を必要とする現在のユーザーを取得"""
    return get_admin_user(current_user)


def get_reservation_service(db: Session = Depends(get_db)) -> ReservationService:
    """ReservationServiceの依存性注入"""
    return ReservationService(db)


@router.get("/", response_model=List[ReservationListResponse])
async def get_all_reservations_for_admin(
    # 認証・サービス（デフォルトなしの引数を先に）
    current_user: Annotated[User, Depends(get_admin_current_user)],
    service: ReservationService = Depends(get_reservation_service),
    # フィルタリングパラメータ（デフォルトありの引数を後に）
    skip: int = Query(0, ge=0, description="スキップ数"),
    limit: int = Query(100, ge=1, le=200, description="取得上限数"),
    status: Optional[str] = Query(None, description="予約ステータスでフィルタ"),
    customer_email: Optional[str] = Query(None, description="顧客メールでフィルタ"),
    vehicle_id: Optional[str] = Query(None, description="車両IDでフィルタ"),
) -> List[ReservationListResponse]:
    """
    管理者向け全予約一覧取得

    - **skip**: スキップ数（ページング）
    - **limit**: 取得上限数（最大200）
    - **status**: 予約ステータスでフィルタ（pending, confirmed, active, completed, cancelled）
    - **customer_email**: 顧客メールアドレスでフィルタ（部分一致）
    - **vehicle_id**: 車両IDでフィルタ

    管理者権限が必要です。
    """
    try:
        reservations = service.get_all_reservations_for_admin(
            status=status,
            customer_email=customer_email,
            vehicle_id=vehicle_id,
            limit=limit,
            skip=skip,
        )

        return [
            ReservationListResponse(
                id=str(reservation.id),
                confirmation_number=reservation.confirmation_number,
                vehicle_id=str(reservation.vehicle_id),
                pickup_datetime=reservation.pickup_datetime,
                return_datetime=reservation.return_datetime,
                status=reservation.status,
                total_amount=reservation.total_amount,
                created_at=reservation.created_at,
                vehicle=(
                    {
                        "id": str(reservation.vehicle.id),
                        "make": reservation.vehicle.make,
                        "model": reservation.vehicle.model,
                        "year": reservation.vehicle.year,
                        "category": reservation.vehicle.category,
                        "daily_rate": reservation.vehicle.daily_rate,
                        "image_url": (
                            f"/assets/images/cars/{reservation.vehicle.image_filename}"
                            if reservation.vehicle.image_filename
                            else None
                        ),
                    }
                    if reservation.vehicle
                    else None
                ),
                pickup_store=(
                    {
                        "id": str(reservation.pickup_store.id),
                        "name": reservation.pickup_store.name,
                        "address": (
                            f"{reservation.pickup_store.prefecture}"
                            f"{reservation.pickup_store.city}"
                            f"{reservation.pickup_store.address_line1}"
                        ),
                    }
                    if reservation.pickup_store
                    else None
                ),
                return_store=(
                    {
                        "id": str(reservation.return_store.id),
                        "name": reservation.return_store.name,
                        "address": (
                            f"{reservation.return_store.prefecture}"
                            f"{reservation.return_store.city}"
                            f"{reservation.return_store.address_line1}"
                        ),
                    }
                    if reservation.return_store
                    else None
                ),
                customer=(
                    {
                        "id": str(reservation.customer.id),
                        "email": reservation.customer.email,
                        "full_name": reservation.customer.full_name,
                        "phone_number": reservation.customer.phone_number,
                        "role": reservation.customer.role,
                    }
                    if reservation.customer
                    else None
                ),
            )
            for reservation in reservations
        ]

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "予約一覧の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.put("/{reservation_id}/status", response_model=ReservationResponse)
async def update_reservation_status(
    reservation_id: str,
    status_data: ReservationStatusUpdate,
    current_user: Annotated[User, Depends(get_admin_current_user)],
    service: ReservationService = Depends(get_reservation_service),
) -> ReservationResponse:
    """
    管理者による予約ステータス変更

    - **reservation_id**: 予約ID (UUID)
    - **status**: 新しいステータス (pending, confirmed, active, completed, cancelled)
    - **reason**: ステータス変更理由（任意）

    管理者権限が必要です。
    """
    try:
        # 予約ステータス更新
        reservation = service.update_reservation_status_for_admin(
            reservation_id=reservation_id,
            new_status=status_data.status,
            reason=status_data.reason,
        )

        return ReservationResponse(
            id=str(reservation.id),
            confirmation_number=reservation.confirmation_number,
            customer_id=str(reservation.customer_id),
            vehicle_id=str(reservation.vehicle_id),
            pickup_store_id=str(reservation.pickup_store_id),
            return_store_id=str(reservation.return_store_id),
            pickup_datetime=reservation.pickup_datetime,
            return_datetime=reservation.return_datetime,
            status=reservation.status,
            payment_status=reservation.payment_status,
            total_amount=reservation.total_amount,
            options=reservation.options,
            special_requests=reservation.special_requests,
            created_at=reservation.created_at,
        )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "予約ステータス更新に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )
