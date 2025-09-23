#!/usr/bin/env python3
"""
サンプル車両データ作成スクリプト
既存の車両画像に合わせたリアルなデータ
"""

import sys
from decimal import Decimal
from pathlib import Path

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from app.db.database import SessionLocal  # noqa: E402
from app.models.vehicle import Vehicle  # noqa: E402
from app.schemas.vehicle import VehicleCreate  # noqa: E402
from app.services.vehicle import VehicleService  # noqa: E402


def get_image_filename_by_vehicle(make: str, model: str) -> str:
    """
    メーカーとモデルから適切な画像ファイル名を取得
    """
    # メーカー・モデルを小文字に変換し、スペースをアンダースコアに
    make_lower = make.lower().replace("-", "_")
    model_lower = model.lower().replace(" ", "_").replace("-", "_")

    # 画像ファイル名のマッピング辞書
    image_mapping = {
        # Toyota
        ("toyota", "corolla"): "toyota_corolla.jpg",
        ("toyota", "camry"): "toyota_camry.jpg",
        ("toyota", "rav4"): "toyota_rav4.jpg",
        ("toyota", "prius"): "toyota_corolla.jpg",  # Priusの画像がないのでCorollaを代用
        # Honda
        ("honda", "civic"): "honda_civic.jpg",
        ("honda", "accord"): "honda_accord.jpg",
        ("honda", "cr_v"): "honda_crv.jpg",
        # Nissan
        ("nissan", "versa"): "nissan_versa.jpg",
        ("nissan", "altima"): "nissan_altima.jpg",
        ("nissan", "leaf"): "nissan_leaf.jpg",
        # Mitsubishi
        ("mitsubishi", "mirage"): "mitsubishi_mirage.jpg",
        # Chevrolet
        ("chevrolet", "spark"): "chevrolet_spark.jpg",
        ("chevrolet", "malibu"): "chevrolet_malibu.jpg",
        ("chevrolet", "camaro_convertible"): "chevrolet_camaro_convertible.jpg",
        ("chevrolet", "corvette"): "chevrolet_corvette.jpg",
        ("chevrolet", "tahoe"): "chevrolet_tahoe.jpg",
        ("chevrolet", "express"): "chevrolet_express.jpg",
        # Kia
        ("kia", "forte"): "kia_forte.jpg",
        # Ford
        ("ford", "focus"): "ford_focus.jpg",
        ("ford", "explorer"): "ford_explorer.jpg",
        ("ford", "mustang_convertible"): "ford_mustang_convertible.jpg",
        ("ford", "transit"): "ford_transit.jpg",
        # Hyundai
        ("hyundai", "elantra"): "hyundai_elantra.jpg",
        # Mazda
        ("mazda", "mazda6"): "mazda_mazda6.jpg",
        # Volkswagen
        ("volkswagen", "jetta"): "volkswagen_jetta.jpg",
        # BMW
        ("bmw", "3_series"): "bmw_3_series.jpg",
        ("bmw", "m4"): "bmw_m4.jpg",
        ("bmw", "4_series_convertible"): "bmw_4_series_convertible.jpg",
        # Audi
        ("audi", "a4"): "audi_a4.jpg",
        ("audi", "r8"): "audi_r8.jpg",
        # Mercedes-Benz
        ("mercedes_benz", "c_class"): "mercedes_cclass.jpg",
        ("mercedes_benz", "sprinter"): "mercedes_sprinter.jpg",
        # Lexus
        ("lexus", "is"): "lexus_is.jpg",
        # Cadillac
        ("cadillac", "ct5"): "cadillac_ct5.jpg",
        # Buick
        ("buick", "lacrosse"): "buick_lacrosse.jpg",
        # Chrysler
        ("chrysler", "300"): "chrysler_300.jpg",
        # Tesla
        ("tesla", "model_3"): "tesla_model3.jpg",
        ("tesla", "model_y"): "tesla_model_y.jpg",
        # Lotus
        ("lotus", "eletre"): "lotus_eletre.jpg",
        # Ferrari
        ("ferrari", "458_italia"): "ferrari_458_italia.jpg",
        # Porsche
        ("porsche", "911"): "porsche_911.jpg",
        # Jeep
        ("jeep", "cherokee"): "jeep_cherokee.jpg",
        # Opel
        ("opel", "astra_opc"): "opel_astra_opc.jpg",
    }

    # マッピング辞書から画像ファイル名を取得
    key = (make_lower, model_lower)
    return image_mapping.get(key, "toyota_corolla.jpg")  # デフォルト画像


def create_sample_vehicles():
    """既存画像に基づくサンプル車両データを作成する（画像ファイル名込み）"""

    # デモデータと同じ車両データ（フロントエンドと同期）
    sample_vehicles = [
        # デモデータ1: Toyota Camry
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
        ),
        # デモデータ2: Honda Civic
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
        ),
        # デモデータ3: BMW 3 Series
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
        ),
        # デモデータ4: Porsche 911
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
        ),
        # デモデータ5: Tesla Model 3
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
        ),
        # デモデータ6: Toyota RAV4
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
        ),
        # デモデータ7: Ford Mustang
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
        ),
        # デモデータ8: Mercedes-Benz C-Class
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
        ),
        VehicleCreate(
            make="Kia",
            model="Forte",
            year=2023,
            color="Black",
            license_plate="品川330あ0006",
            category="compact",
            class_type="standard",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("5400.00"),
        ),
        VehicleCreate(
            make="Ford",
            model="Focus",
            year=2022,
            color="Blue",
            license_plate="品川330あ0007",
            category="compact",
            class_type="standard",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("5600.00"),
        ),
        # スタンダード・フルサイズクラス
        VehicleCreate(
            make="Toyota",
            model="Camry",
            year=2023,
            color="Gray",
            license_plate="品川330あ0008",
            category="standard",
            class_type="full_size",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("7200.00"),
        ),
        VehicleCreate(
            make="Honda",
            model="Accord",
            year=2023,
            color="White",
            license_plate="品川330あ0009",
            category="standard",
            class_type="full_size",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("7800.00"),
        ),
        VehicleCreate(
            make="Nissan",
            model="Altima",
            year=2023,
            color="Silver",
            license_plate="品川330あ0010",
            category="standard",
            class_type="full_size",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("7400.00"),
        ),
        VehicleCreate(
            make="Hyundai",
            model="Elantra",
            year=2023,
            color="White",
            license_plate="品川330あ0011",
            category="standard",
            class_type="standard",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("6800.00"),
        ),
        VehicleCreate(
            make="Chevrolet",
            model="Malibu",
            year=2022,
            color="Black",
            license_plate="品川330あ0012",
            category="standard",
            class_type="full_size",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("7600.00"),
        ),
        VehicleCreate(
            make="Mazda",
            model="Mazda6",
            year=2023,
            color="Red",
            license_plate="品川330あ0013",
            category="standard",
            class_type="full_size",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("7900.00"),
        ),
        VehicleCreate(
            make="Volkswagen",
            model="Jetta",
            year=2023,
            color="Silver",
            license_plate="品川330あ0014",
            category="standard",
            class_type="standard",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("7000.00"),
        ),
        # SUV クラス
        VehicleCreate(
            make="Toyota",
            model="RAV4",
            year=2023,
            color="Blue",
            license_plate="品川330あ0015",
            category="suv",
            class_type="compact_suv",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("8800.00"),
        ),
        VehicleCreate(
            make="Honda",
            model="CR-V",
            year=2023,
            color="White",
            license_plate="品川330あ0016",
            category="suv",
            class_type="compact_suv",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("9200.00"),
        ),
        VehicleCreate(
            make="Ford",
            model="Explorer",
            year=2023,
            color="Black",
            license_plate="品川330あ0017",
            category="suv",
            class_type="full_size_suv",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("12000.00"),
        ),
        VehicleCreate(
            make="Jeep",
            model="Cherokee",
            year=2023,
            color="Red",
            license_plate="品川330あ0018",
            category="suv",
            class_type="mid_size_suv",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("10800.00"),
        ),
        VehicleCreate(
            make="Chevrolet",
            model="Tahoe",
            year=2023,
            color="Black",
            license_plate="品川330あ0019",
            category="suv",
            class_type="full_size_suv",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("14400.00"),
        ),
        # プレミアム・ラグジュアリークラス
        VehicleCreate(
            make="BMW",
            model="3 Series",
            year=2023,
            color="Gray",
            license_plate="品川330あ0020",
            category="premium",
            class_type="luxury",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("15600.00"),
        ),
        VehicleCreate(
            make="Audi",
            model="A4",
            year=2023,
            color="Black",
            license_plate="品川330あ0021",
            category="premium",
            class_type="luxury",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("16200.00"),
        ),
        VehicleCreate(
            make="Mercedes-Benz",
            model="C-Class",
            year=2023,
            color="Silver",
            license_plate="品川330あ0022",
            category="premium",
            class_type="luxury",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("17400.00"),
        ),
        VehicleCreate(
            make="Lexus",
            model="IS",
            year=2023,
            color="White",
            license_plate="品川330あ0023",
            category="premium",
            class_type="luxury",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("18000.00"),
        ),
        VehicleCreate(
            make="Cadillac",
            model="CT5",
            year=2023,
            color="Black",
            license_plate="品川330あ0024",
            category="premium",
            class_type="luxury",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("19200.00"),
        ),
        VehicleCreate(
            make="Buick",
            model="LaCrosse",
            year=2022,
            color="Silver",
            license_plate="品川330あ0025",
            category="premium",
            class_type="full_size",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("16800.00"),
        ),
        VehicleCreate(
            make="Chrysler",
            model="300",
            year=2023,
            color="Black",
            license_plate="品川330あ0026",
            category="premium",
            class_type="full_size",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("17600.00"),
        ),
        # スポーツ・コンバーチブル
        VehicleCreate(
            make="BMW",
            model="M4",
            year=2023,
            color="Blue",
            license_plate="品川330あ0027",
            category="sports",
            class_type="luxury_sports",
            transmission="manual",
            fuel_type="gasoline",
            daily_rate=Decimal("28800.00"),
        ),
        VehicleCreate(
            make="BMW",
            model="4 Series Convertible",
            year=2023,
            color="White",
            license_plate="品川330あ0028",
            category="convertible",
            class_type="luxury_convertible",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("32400.00"),
        ),
        VehicleCreate(
            make="Ford",
            model="Mustang Convertible",
            year=2023,
            color="Red",
            license_plate="品川330あ0029",
            category="convertible",
            class_type="sports_convertible",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("26400.00"),
        ),
        VehicleCreate(
            make="Chevrolet",
            model="Camaro Convertible",
            year=2023,
            color="Yellow",
            license_plate="品川330あ0030",
            category="convertible",
            class_type="sports_convertible",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("28800.00"),
        ),
        VehicleCreate(
            make="Chevrolet",
            model="Corvette",
            year=2023,
            color="Red",
            license_plate="品川330あ0031",
            category="sports",
            class_type="super_sports",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("48000.00"),
        ),
        VehicleCreate(
            make="Porsche",
            model="911",
            year=2023,
            color="Black",
            license_plate="品川330あ0032",
            category="sports",
            class_type="super_sports",
            transmission="manual",
            fuel_type="gasoline",
            daily_rate=Decimal("72000.00"),
        ),
        VehicleCreate(
            make="Ferrari",
            model="458 Italia",
            year=2022,
            color="Red",
            license_plate="品川330あ0033",
            category="exotic",
            class_type="super_car",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("120000.00"),
        ),
        VehicleCreate(
            make="Audi",
            model="R8",
            year=2023,
            color="Gray",
            license_plate="品川330あ0034",
            category="exotic",
            class_type="super_car",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("96000.00"),
        ),
        # 電気自動車
        VehicleCreate(
            make="Tesla",
            model="Model 3",
            year=2023,
            color="White",
            license_plate="品川330あ0035",
            category="electric",
            class_type="luxury_electric",
            transmission="automatic",
            fuel_type="electric",
            daily_rate=Decimal("14400.00"),
        ),
        VehicleCreate(
            make="Tesla",
            model="Model Y",
            year=2023,
            color="Black",
            license_plate="品川330あ0036",
            category="electric_suv",
            class_type="luxury_electric",
            transmission="automatic",
            fuel_type="electric",
            daily_rate=Decimal("18000.00"),
        ),
        VehicleCreate(
            make="Nissan",
            model="Leaf",
            year=2023,
            color="Blue",
            license_plate="品川330あ0037",
            category="electric",
            class_type="economy_electric",
            transmission="automatic",
            fuel_type="electric",
            daily_rate=Decimal("9600.00"),
        ),
        VehicleCreate(
            make="Lotus",
            model="Eletre",
            year=2023,
            color="Green",
            license_plate="品川330あ0038",
            category="electric_suv",
            class_type="luxury_electric",
            transmission="automatic",
            fuel_type="electric",
            daily_rate=Decimal("48000.00"),
        ),
        # 商用車・ミニバン
        VehicleCreate(
            make="Ford",
            model="Transit",
            year=2023,
            color="White",
            license_plate="品川330あ0039",
            category="van",
            class_type="commercial",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("10800.00"),
        ),
        VehicleCreate(
            make="Chevrolet",
            model="Express",
            year=2023,
            color="White",
            license_plate="品川330あ0040",
            category="van",
            class_type="commercial",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("12000.00"),
        ),
        VehicleCreate(
            make="Mercedes-Benz",
            model="Sprinter",
            year=2023,
            color="Silver",
            license_plate="品川330あ0041",
            category="van",
            class_type="premium_commercial",
            transmission="automatic",
            fuel_type="gasoline",
            daily_rate=Decimal("16800.00"),
        ),
        # ヨーロッパ車
        VehicleCreate(
            make="Opel",
            model="Astra OPC",
            year=2022,
            color="Red",
            license_plate="品川330あ0042",
            category="sports",
            class_type="hot_hatch",
            transmission="manual",
            fuel_type="gasoline",
            daily_rate=Decimal("19200.00"),
        ),
    ]

    # データベースセッションを開始
    db = SessionLocal()
    try:
        vehicle_service = VehicleService(db)

        print("🚗 車両サンプルデータの作成を開始します...")
        print(f"📊 作成予定車両数: {len(sample_vehicles)}台")

        created_count = 0
        for vehicle_data in sample_vehicles:
            try:
                # 重複チェック（ナンバープレートで）
                existing = (
                    db.query(Vehicle)
                    .filter(Vehicle.license_plate == vehicle_data.license_plate)
                    .first()
                )

                if existing:
                    print(
                        f"⚠️  スキップ: {vehicle_data.make} {vehicle_data.model} "
                        f"({vehicle_data.license_plate}) - 既に存在"
                    )
                    continue

                # 画像ファイル名を自動設定（まだ設定されていない場合）
                if not vehicle_data.image_filename:
                    vehicle_data.image_filename = get_image_filename_by_vehicle(
                        vehicle_data.make, vehicle_data.model
                    )

                # 車両作成
                vehicle = vehicle_service.create_vehicle(vehicle_data)
                print(
                    f"✅ 作成完了: {vehicle.year} {vehicle.make} "
                    f"{vehicle.model} - ¥{vehicle.daily_rate}/日 "
                    f"(画像: {vehicle.image_filename})"
                )
                created_count += 1

            except Exception as e:
                print(
                    f"❌ エラー: {vehicle_data.make} "
                    f"{vehicle_data.model} - {str(e)}"
                )
                continue

        print("\n🎉 車両サンプルデータ作成完了!")
        print(f"📈 新規作成: {created_count}台")
        print("💾 データベース: 車両データが利用可能になりました")

    except Exception as e:
        print(f"❌ 予期しないエラー: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_sample_vehicles()
