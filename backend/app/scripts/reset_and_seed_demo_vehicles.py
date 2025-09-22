#!/usr/bin/env python3
"""
既存車両データをリセットしてデモデータを投入するスクリプト
"""

import os
import sys
from decimal import Decimal
from pathlib import Path

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session

from app.db.database import SessionLocal, engine
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate
from app.services.vehicle import VehicleService


def reset_and_seed_demo_vehicles():
    """既存車両データを削除してデモデータを投入する"""

    # フロントエンドのDEMO_VEHICLESと同じデータ
    demo_vehicles = [
        VehicleCreate(
            make="Toyota",
            model="Camry",
            year=2023,
            color="White",
            license_plate="品川330あ0001",
            category="standard",
            class_type="full_size",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("8000.00"),
            image_filename="toyota_camry.jpg",
            is_smoking_allowed=False,
        ),
        VehicleCreate(
            make="Honda",
            model="Civic",
            year=2023,
            color="Silver",
            license_plate="品川330あ0002",
            category="compact",
            class_type="economy",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("6000.00"),
            image_filename="honda_civic.jpg",
            is_smoking_allowed=False,
        ),
        VehicleCreate(
            make="BMW",
            model="3 Series",
            year=2023,
            color="Gray",
            license_plate="品川330あ0003",
            category="premium",
            class_type="luxury",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("15000.00"),
            image_filename="bmw_3_series.jpg",
            is_smoking_allowed=False,
        ),
        VehicleCreate(
            make="Porsche",
            model="911",
            year=2023,
            color="Black",
            license_plate="品川330あ0004",
            category="sports",
            class_type="super_sports",
            transmission="manual",
            fuel_type="gasoline",
            daily_rate=Decimal("25000.00"),
            image_filename="porsche_911.jpg",
            is_smoking_allowed=False,
        ),
        VehicleCreate(
            make="Tesla",
            model="Model 3",
            year=2023,
            color="White",
            license_plate="品川330あ0005",
            category="electric",
            class_type="luxury_electric",
            transmission="automatic",
            fuel_type="electric",
            daily_rate=Decimal("12000.00"),
            image_filename="tesla_model3.jpg",
            is_smoking_allowed=False,
        ),
        VehicleCreate(
            make="Toyota",
            model="RAV4",
            year=2023,
            color="Blue",
            license_plate="品川330あ0006",
            category="suv",
            class_type="compact_suv",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("10000.00"),
            image_filename="toyota_rav4.jpg",
            is_smoking_allowed=False,
        ),
        VehicleCreate(
            make="Ford",
            model="Mustang",
            year=2023,
            color="Red",
            license_plate="品川330あ0007",
            category="sports",
            class_type="sports_convertible",
            transmission="manual",
            fuel_type="gasoline",
            daily_rate=Decimal("20000.00"),
            image_filename="ford_mustang_convertible.jpg",
            is_smoking_allowed=True,
        ),
        VehicleCreate(
            make="Mercedes-Benz",
            model="C-Class",
            year=2023,
            color="Silver",
            license_plate="品川330あ0008",
            category="premium",
            class_type="luxury",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("18000.00"),
            image_filename="mercedes_cclass.jpg",
            is_smoking_allowed=False,
        ),
    ]

    # データベースセッションを開始
    db = SessionLocal()
    try:
        vehicle_service = VehicleService(db)

        print("🗑️  既存車両データの削除を開始します...")

        # 既存の車両データをすべて削除
        existing_vehicles = db.query(Vehicle).all()
        for vehicle in existing_vehicles:
            db.delete(vehicle)

        db.commit()
        print(f"✅ 既存車両データ {len(existing_vehicles)}台を削除しました")

        print("🚗 デモ車両データの作成を開始します...")
        print(f"📊 作成予定車両数: {len(demo_vehicles)}台")

        created_count = 0
        for vehicle_data in demo_vehicles:
            try:
                # 車両作成
                vehicle = vehicle_service.create_vehicle(vehicle_data)
                print(
                    f"✅ 作成完了: {vehicle.year} {vehicle.make} {vehicle.model} - ¥{vehicle.daily_rate}/日 (画像: {vehicle.image_filename})"
                )
                created_count += 1

            except Exception as e:
                print(f"❌ エラー: {vehicle_data.make} {vehicle_data.model} - {str(e)}")
                continue

        print(f"\n🎉 デモ車両データ作成完了!")
        print(f"📈 新規作成: {created_count}台")
        print(
            f"💾 データベース: フロントエンドのデモデータと同じ車両データが利用可能になりました"
        )

    except Exception as e:
        print(f"❌ 予期しないエラー: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_and_seed_demo_vehicles()
