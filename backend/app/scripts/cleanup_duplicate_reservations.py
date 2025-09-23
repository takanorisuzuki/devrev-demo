#!/usr/bin/env python3
"""
重複予約をクリーンアップするスクリプト
同じユーザー、同じ車両、同じ時刻の予約が複数ある場合、最新のもの以外を削除する
"""

import sys
from pathlib import Path

from sqlalchemy import and_, func

PROJECT_ROOT = Path(__file__).resolve().parents[2]

try:
    from app.db.database import SessionLocal
    from app.models.reservation import Reservation
    from app.models.user import User
    from app.models.vehicle import Vehicle
except ImportError:  # pragma: no cover
    if str(PROJECT_ROOT) not in sys.path:
        sys.path.insert(0, str(PROJECT_ROOT))
    from app.db.database import SessionLocal
    from app.models.reservation import Reservation
    from app.models.user import User
    from app.models.vehicle import Vehicle


def cleanup_duplicate_reservations():
    """重複予約をクリーンアップする"""
    db = SessionLocal()

    try:
        print("🔍 重複予約を検索中...")

        # 同じユーザー、同じ車両、同じ時刻の予約を検索
        duplicates = (
            db.query(
                Reservation.customer_id,
                Reservation.vehicle_id,
                Reservation.pickup_datetime,
                func.count(Reservation.id).label("count"),
                func.min(Reservation.created_at).label("earliest_created"),
                func.max(Reservation.created_at).label("latest_created"),
            )
            .group_by(
                Reservation.customer_id,
                Reservation.vehicle_id,
                Reservation.pickup_datetime,
            )
            .having(func.count(Reservation.id) > 1)
            .all()
        )

        if not duplicates:
            print("✅ 重複予約は見つかりませんでした")
            return

        print(f"📋 {len(duplicates)} 組の重複予約が見つかりました")

        deleted_count = 0
        for duplicate in duplicates:
            customer_id = duplicate.customer_id
            vehicle_id = duplicate.vehicle_id
            pickup_datetime = duplicate.pickup_datetime
            latest_created = duplicate.latest_created

            # ユーザーと車両の情報を取得
            user = db.query(User).filter(User.id == customer_id).first()
            vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

            print(f"\n🚗 車両: {vehicle.make} {vehicle.model}")
            print(f"👤 ユーザー: {user.email}")
            print(f"📅 受取時刻: {pickup_datetime}")
            print(f"🔄 重複数: {duplicate.count}")

            # 最新の予約（latest_created）以外を削除
            reservations_to_delete = (
                db.query(Reservation)
                .filter(
                    and_(
                        Reservation.customer_id == customer_id,
                        Reservation.vehicle_id == vehicle_id,
                        Reservation.pickup_datetime == pickup_datetime,
                        Reservation.created_at != latest_created,
                    )
                )
                .all()
            )

            for reservation in reservations_to_delete:
                print(
                    f"   🗑️  削除: {reservation.id} "
                    f"(作成: {reservation.created_at})"
                )
                db.delete(reservation)
                deleted_count += 1

        db.commit()
        print(f"\n✅ {deleted_count} 件の重複予約を削除しました")

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    cleanup_duplicate_reservations()
