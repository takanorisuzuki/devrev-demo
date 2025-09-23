"""
予約API エンドポイント
実際のDriveRev予約APIとして動作
プロダクション品質のエラーハンドリング実装
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.reservation import (
    ReservationCreate,
    ReservationListResponse,
    ReservationQuote,
    ReservationQuoteResponse,
    ReservationResponse,
    ReservationUpdate,
)
from app.services.reservation import ReservationService

# Reservation API ルーター
router = APIRouter()


def get_reservation_service(db: Session = Depends(get_db)) -> ReservationService:
    """ReservationServiceの依存性注入"""
    return ReservationService(db)


def build_reservation_response(reservation) -> ReservationResponse:
    """予約レスポンスを構築するヘルパー関数"""
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
        tax_amount=reservation.tax_amount,
        options=reservation.options,
        special_requests=reservation.special_requests,
        vehicle=(
            {
                "id": str(reservation.vehicle.id),
                "make": reservation.vehicle.make,
                "model": reservation.vehicle.model,
                "category": reservation.vehicle.category,
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
        created_at=reservation.created_at,
    )


@router.post("/quote", response_model=ReservationQuoteResponse)
async def calculate_quote(
    quote_data: ReservationQuote,
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    """
    料金見積もりを計算する

    - **vehicle_id**: 車両ID
    - **pickup_datetime**: 借り出し日時
    - **return_datetime**: 返却日時
    - **options**: 選択オプション（GPS, チャイルドシートなど）
    - **points_to_use**: 使用ポイント数

    見積もり結果には以下が含まれます：
    - 基本料金、オプション料金、保険料
    - 各種割引（会員割引、ポイント割引）
    - 税金、合計金額
    """
    try:
        quote_result = service.calculate_quote(quote_data, str(current_user.id))

        return ReservationQuoteResponse(
            base_rate=quote_result["base_rate"],
            duration_hours=quote_result["duration_hours"],
            subtotal=quote_result["subtotal"],
            option_fees=quote_result["option_fees"],
            insurance_fee=quote_result["insurance_fee"],
            tax_amount=quote_result["tax_amount"],
            discount_amount=quote_result.get("discount_amount", 0),
            member_discount=quote_result["member_discount"],
            points_discount=quote_result["points_discount"],
            total_amount=quote_result["total_amount"],
        )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "見積もり計算に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.post(
    "/", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED
)
async def create_reservation(
    reservation_data: ReservationCreate,
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    """
    予約を作成する

    - **vehicle_id**: 予約する車両ID
    - **pickup_store_id**: 借り出し店舗ID
    - **return_store_id**: 返却店舗ID
    - **pickup_datetime**: 借り出し日時
    - **return_datetime**: 返却日時
    - **options**: 選択オプション
    - **special_requests**: 特別な要望
    - **points_to_use**: 使用ポイント数

    成功時は予約確認番号付きの予約情報が返されます。
    """
    try:
        reservation = service.create_reservation(reservation_data, str(current_user.id))

        return build_reservation_response(reservation)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "予約作成に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.get("/", response_model=List[ReservationListResponse])
async def get_my_reservations(
    status: Optional[str] = Query(None, description="予約ステータスでフィルタ"),
    limit: int = Query(50, le=100, description="取得件数上限"),
    skip: int = Query(0, ge=0, description="スキップ数"),
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    """
    自分の予約一覧を取得する

    - **status**: 予約ステータスでフィルタ（pending, confirmed, active, completed, cancelled）
    - **limit**: 取得件数上限（最大100件）
    - **skip**: スキップ数（ページング用）

    作成日時の降順で返されます。
    """
    try:
        reservations = service.get_customer_reservations(
            customer_id=str(current_user.id), status=status, limit=limit, skip=skip
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
                payment_status=reservation.payment_status,
                payment_method=reservation.payment_method,
                payment_reference=reservation.payment_reference,
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
            )
            for reservation in reservations
        ]

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "予約一覧の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation_detail(
    reservation_id: str,
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    """
    予約詳細を取得する

    指定された予約IDの詳細情報を取得します。
    本人の予約のみアクセス可能です。
    """
    try:
        reservation = service.get_reservation_by_id(
            reservation_id, str(current_user.id)
        )

        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Not Found",
                    "message": "指定された予約が見つかりません。",
                    "status_code": 404,
                },
            )

        return build_reservation_response(reservation)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "予約詳細の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.put("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(
    reservation_id: str,
    update_data: ReservationUpdate,
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    """
    予約を更新する（顧客用）

    指定された予約の情報を更新します。
    本人の予約のみ更新可能です。
    変更期限（借り出し24時間前）を過ぎた予約は変更できません。

    - **pickup_datetime**: 借り出し日時（オプション）
    - **return_datetime**: 返却日時（オプション）
    - **pickup_store_id**: 借り出し店舗ID（オプション）
    - **return_store_id**: 返却店舗ID（オプション）
    - **special_requests**: 特別要望（オプション）
    - **options**: 選択オプション（オプション）
    """
    try:
        reservation = service.update_customer_reservation(
            reservation_id=reservation_id,
            customer_id=str(current_user.id),
            update_data=update_data,
        )

        return build_reservation_response(reservation)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "予約更新に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.delete("/{reservation_id}", response_model=ReservationResponse)
async def cancel_reservation(
    reservation_id: str,
    cancellation_reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    """
    予約をキャンセルする

    指定された予約をキャンセル状態にします。
    完了済みまたは既にキャンセル済みの予約はキャンセルできません。

    - **cancellation_reason**: キャンセル理由（任意）
    """
    try:
        reservation = service.cancel_reservation(
            reservation_id=reservation_id,
            customer_id=str(current_user.id),
            reason=cancellation_reason,
        )

        return build_reservation_response(reservation)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "予約キャンセルに失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )
