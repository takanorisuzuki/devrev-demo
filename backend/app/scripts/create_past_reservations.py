#!/usr/bin/env python
"""
過去の予約データ作成スクリプト

現在の日付から1-4週間前の日付で予約したことがある状態を
各顧客に3-4件ずつランダムに作成する

管理者ユーザーには予約を作成しない（管理者は予約しない）
各顧客には完了・キャンセル・アクティブな予約をランダムに作成
"""

import os
import sys
from datetime import datetime, timedelta
from uuid import uuid4
import random
from decimal import Decimal

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.store import Store
from app.models.reservation import Reservation


def create_past_reservations():
    """過去の予約データを作成"""
    db: Session = SessionLocal()

    try:
        print("🚗 過去の予約データを作成中...")

        # 必要なデータの取得
        customers = db.query(User).filter(User.role == "customer").all()
        vehicles = db.query(Vehicle).all()
        stores = db.query(Store).all()

        if not customers:
            print("❌ 顧客データが見つかりません")
            return

        if not vehicles:
            print("❌ 車両データが見つかりません")
            return

        if not stores:
            print("❌ 店舗データが見つかりません")
            return

        # 管理者以外の全顧客に過去の予約を作成
        target_customers = [c for c in customers if c.role == "customer"]
        
        if not target_customers:
            print("❌ 顧客データが見つかりません")
            return
            
        print(f"   対象顧客数: {len(target_customers)}人")
            
        for customer in target_customers:
            # 既存の予約数を確認
            existing_count = db.query(Reservation).filter(Reservation.customer_id == customer.id).count()
            
            # 既に4件以上の予約がある場合はスキップ
            if existing_count >= 4:
                print(f"   {customer.email}: 既に{existing_count}件の予約があります（スキップ）")
                continue
            
            # 各顧客に3-4件の予約を作成
            num_reservations = random.randint(3, 4)
            
            print(f"   {customer.email}: {num_reservations}件の過去の予約を作成中...")

            reservations_data = []
            for i in range(num_reservations):
                # 1-4週間前のランダムな日付
                days_ago = random.randint(7, 28)
                pickup_date = datetime.now() - timedelta(days=days_ago)
                
                # ランダムな車両と店舗を選択
                vehicle = random.choice(vehicles)
                pickup_store = random.choice(stores)
                return_store = random.choice(stores)
                
                # レンタル期間（1-5日）
                rental_days = random.randint(1, 5)
                return_date = pickup_date + timedelta(days=rental_days)
                
                # 料金計算
                base_rate = vehicle.daily_rate
                subtotal = base_rate * rental_days
                
                # オプション（ランダム）
                options = []
                option_fees = Decimal("0")
                if random.choice([True, False]):
                    options.append("GPS")
                    option_fees += Decimal("500") * rental_days
                if random.choice([True, False]):
                    options.append("ETC")
                    option_fees += Decimal("300") * rental_days
                
                # 保険料
                insurance_fee = Decimal("1000") * rental_days
                
                # 小計
                subtotal_with_options = subtotal + option_fees + insurance_fee
                
                # 税金（10%）
                tax_amount = subtotal_with_options * Decimal("0.1")
                
                # 会員割引（ランダム）
                discount_amount = Decimal("0")
                member_discount_amount = Decimal("0")
                if random.choice([True, False]):
                    discount_amount = subtotal_with_options * Decimal("0.05")  # 5%割引
                    member_discount_amount = discount_amount  # 会員割引額
                
                # 最終金額
                total_amount = subtotal_with_options + tax_amount - discount_amount
                
                # ステータス（完了・キャンセル・アクティブをランダムに）
                status_weights = [0.5, 0.2, 0.3]  # completed, cancelled, active の重み
                status = random.choices(["completed", "cancelled", "active"], weights=status_weights)[0]
                
                # キャンセル理由のリスト
                cancellation_reasons = [
                    "急な出張のため",
                    "体調不良のため",
                    "家族の都合により",
                    "代替交通手段を選択",
                    "予定が変更になったため"
                ]
                
                reservation_data = {
                    "id": uuid4(),
                    "confirmation_number": f"DRV{random.randint(100000, 999999)}",
                    "customer_id": customer.id,
                    "vehicle_id": vehicle.id,
                    "pickup_store_id": pickup_store.id,
                    "return_store_id": return_store.id,
                    "pickup_datetime": pickup_date,
                    "return_datetime": return_date,
                    "status": status,
                    "base_rate": base_rate,
                    "duration_hours": rental_days * 24,
                    "subtotal": subtotal,
                    "options": options if options else [],
                    "option_fees": option_fees,
                    "insurance_fee": insurance_fee,
                    "tax_amount": tax_amount,
                    "total_amount": total_amount,
                    "discount_amount": discount_amount,
                    "member_discount": member_discount_amount,
                    "points_used": 0,
                    "points_earned": int(total_amount * Decimal("0.01")) if status != "cancelled" else 0,
                    "special_requests": "",
                    "staff_notes": "",
                    "cancellation_reason": random.choice(cancellation_reasons) if status == "cancelled" else None,
                    "payment_method": "credit_card",
                    "payment_status": "completed" if status == "completed" else ("refunded" if status == "cancelled" else "pending"),
                    "payment_reference": f"PAY{random.randint(100000, 999999)}",
                    "created_at": pickup_date - timedelta(days=random.randint(1, 7)),
                    "updated_at": pickup_date + timedelta(days=random.randint(1, 3)) if status == "cancelled" else datetime.now()
                }
                
                reservations_data.append(reservation_data)

            # データベースに挿入
            for data in reservations_data:
                reservation = Reservation(**data)
                db.add(reservation)
            
            db.commit()
            print(f"   ✅ {customer.email}: {len(reservations_data)}件の予約を作成しました")

        print(f"\n🎯 テスト用アカウント:")
        for customer in target_customers:
            # データベースから実際の予約数を取得（キャンセルした予約も含む）
            total_reservations = db.query(Reservation).filter(Reservation.customer_id == customer.id).count()
            completed_reservations = db.query(Reservation).filter(
                Reservation.customer_id == customer.id,
                Reservation.status == "completed"
            ).count()
            cancelled_reservations = db.query(Reservation).filter(
                Reservation.customer_id == customer.id,
                Reservation.status == "cancelled"
            ).count()
            active_reservations = db.query(Reservation).filter(
                Reservation.customer_id == customer.id,
                Reservation.status == "active"
            ).count()
            
            print(f"   Email: {customer.email}")
            print(f"   Password: Customer123!")
            print(f"   総予約件数: {total_reservations}件")
            print(f"   - 完了: {completed_reservations}件")
            print(f"   - キャンセル: {cancelled_reservations}件")
            print(f"   - アクティブ: {active_reservations}件")

        print("\n✅ 過去の予約データ作成完了！")

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_past_reservations()
