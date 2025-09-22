#!/usr/bin/env python
"""
サンプル予約データ作成スクリプト
"""

import os
import random
import sys
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.reservation import Reservation
from app.models.store import Store
from app.models.user import User
from app.models.vehicle import Vehicle


def create_sample_reservations():
    """サンプル予約データを作成"""
    db: Session = SessionLocal()

    try:
        print("🚗 サンプル予約データを作成中...")

        # 既存データの確認
        existing_reservations = db.query(Reservation).count()
        if existing_reservations > 0:
            print(f"   既存予約データ: {existing_reservations}件")
            response = input("   既存データを削除して新しく作成しますか？ (y/N): ")
            if response.lower() == "y":
                db.query(Reservation).delete()
                db.commit()
                print("   既存予約データを削除しました")
            else:
                print("   作成を中止しました")
                return

        # 必要なデータの取得
        customers = db.query(User).filter(User.role == "customer").all()
        vehicles = db.query(Vehicle).all()
        stores = db.query(Store).all()

        if not customers:
            print(
                "❌ 顧客データが見つかりません。先に create_sample_users.py を実行してください"
            )
            return

        if not vehicles:
            print(
                "❌ 車両データが見つかりません。先に create_sample_vehicles.py を実行してください"
            )
            return

        if not stores:
            print(
                "❌ 店舗データが見つかりません。先に create_sample_stores.py を実行してください"
            )
            return

        print(
            f"   利用可能データ: 顧客{len(customers)}名, 車両{len(vehicles)}台, 店舗{len(stores)}箇所"
        )

        # サンプル予約データの作成
        reservations_data = []
        base_date = datetime.now()

        # 各顧客に複数の予約を作成
        for customer in customers[:2]:  # 最初の2名の顧客のみ
            # 顧客ごとに3-5件の予約を作成
            num_reservations = random.randint(3, 5)

            for i in range(num_reservations):
                # ランダムな車両と店舗を選択
                vehicle = random.choice(vehicles)
                pickup_store = random.choice(stores)
                return_store = random.choice(stores)  # 同じ店舗または別の店舗

                # 予約期間の設定
                days_offset = random.randint(-30, 60)  # 過去30日〜未来60日
                pickup_date = base_date + timedelta(days=days_offset)
                rental_days = random.randint(1, 7)  # 1-7日間
                return_date = pickup_date + timedelta(days=rental_days)

                # ステータスの決定
                if days_offset < -7:
                    status = "completed"
                elif days_offset < 0:
                    status = random.choice(["active", "completed"])
                elif days_offset < 7:
                    status = random.choice(["confirmed", "active"])
                else:
                    status = random.choice(["pending", "confirmed"])

                # 料金計算（簡易版）
                daily_rate = vehicle.daily_rate or Decimal("8000")
                days = (return_date - pickup_date).days
                if days < 1:
                    days = 1

                # 時間数計算
                duration_hours = int((return_date - pickup_date).total_seconds() / 3600)

                subtotal = daily_rate * days
                tax_rate = Decimal("0.1")
                tax_amount = int(subtotal * tax_rate)
                total_amount = int(subtotal + (subtotal * tax_rate))

                # 予約確認番号の生成
                confirmation_number = (
                    f"RES{pickup_date.strftime('%Y%m%d')}{str(uuid4())[:8].upper()}"
                )

                reservation_data = {
                    "id": str(uuid4()),
                    "confirmation_number": confirmation_number,
                    "customer_id": customer.id,
                    "vehicle_id": vehicle.id,
                    "pickup_store_id": pickup_store.id,
                    "return_store_id": return_store.id,
                    "pickup_datetime": pickup_date,
                    "return_datetime": return_date,
                    "base_rate": daily_rate,
                    "duration_hours": duration_hours,
                    "subtotal": int(subtotal),
                    "total_amount": total_amount,
                    "tax_amount": tax_amount,
                    "status": status,
                    "options": {
                        "insurance": random.choice([True, False]),
                        "gps": random.choice([True, False]),
                        "child_seat": (
                            random.choice([True, False])
                            if random.random() < 0.3
                            else False
                        ),
                    },
                    "created_at": pickup_date - timedelta(days=random.randint(1, 30)),
                    "updated_at": pickup_date - timedelta(days=random.randint(0, 10)),
                }

                reservations_data.append(reservation_data)

        # データベースに挿入
        for data in reservations_data:
            reservation = Reservation(**data)
            db.add(reservation)

        db.commit()

        print(f"✅ サンプル予約データを{len(reservations_data)}件作成しました")

        # 作成された予約の概要を表示
        print("\n📋 作成された予約データ:")
        for customer in customers[:2]:
            customer_reservations = [
                r for r in reservations_data if r["customer_id"] == customer.id
            ]
            print(f"   {customer.full_name}: {len(customer_reservations)}件")
            for res in customer_reservations:
                print(
                    f"     - {res['confirmation_number']}: {res['status']} ({res['pickup_datetime'].strftime('%Y-%m-%d')})"
                )

        print(f"\n🎯 テスト用アカウント:")
        print(f"   Email: {customers[0].email}")
        print(f"   Password: Customer123!")
        print(
            f"   予約件数: {len([r for r in reservations_data if r['customer_id'] == customers[0].id])}件"
        )

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_sample_reservations()
