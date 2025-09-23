"""
管理者用統計情報API
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.auth import get_admin_user
from app.db.database import get_db
from app.models.reservation import Reservation
from app.models.store import Store
from app.models.user import User
from app.models.vehicle import Vehicle

router = APIRouter()


@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    管理者用統計情報を取得
    """
    try:
        # 管理者権限チェック
        get_admin_user(current_user)
        # 総ユーザー数（テストユーザーを除外）
        from sqlalchemy import and_, not_

        total_users = (
            db.query(User)
            .filter(
                and_(
                    not_(User.email.contains("test")),
                    not_(User.email.contains("demo")),
                    not_(User.email.contains("integration")),
                )
            )
            .count()
        )

        # 利用可能車両数
        total_vehicles = db.query(Vehicle).filter(Vehicle.is_available is True).count()

        # 今月の予約数
        now = datetime.now(timezone.utc)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_reservations = (
            db.query(Reservation)
            .filter(Reservation.created_at >= start_of_month)
            .count()
        )

        # 総店舗数
        total_stores = db.query(Store).count()

        # 最近のアクティビティ（最新5件）
        recent_activities = []

        # 最新のユーザー登録
        latest_user = db.query(User).order_by(User.created_at.desc()).first()
        if latest_user:
            recent_activities.append(
                {
                    "type": "user_registration",
                    "message": f"新しいユーザーが登録しました: {latest_user.full_name}",
                    "timestamp": latest_user.created_at.isoformat(),
                    "time_ago": _get_time_ago(latest_user.created_at),
                }
            )

        # 最新の予約
        latest_reservation = (
            db.query(Reservation).order_by(Reservation.created_at.desc()).first()
        )
        if latest_reservation:
            recent_activities.append(
                {
                    "type": "reservation",
                    "message": (
                        f"{latest_reservation.vehicle.make} "
                        f"{latest_reservation.vehicle.model}が予約されました"
                    ),
                    "timestamp": latest_reservation.created_at.isoformat(),
                    "time_ago": _get_time_ago(latest_reservation.created_at),
                }
            )

        return {
            "total_users": total_users,
            "total_vehicles": total_vehicles,  # 利用可能車両数
            "monthly_reservations": monthly_reservations,
            "total_stores": total_stores,
            "recent_activities": recent_activities[:5],  # 最新5件
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"統計情報の取得に失敗しました: {str(e)}"
        )


def _get_time_ago(timestamp: datetime) -> str:
    """時間差を日本語で表現"""
    now = datetime.now(timezone.utc)
    # タイムゾーンを統一
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    diff = now - timestamp

    if diff.days > 0:
        return f"{diff.days}日前"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours}時間前"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes}分前"
    else:
        return "たった今"
