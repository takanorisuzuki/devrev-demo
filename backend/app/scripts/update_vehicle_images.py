#!/usr/bin/env python3
"""
既存車両データに画像ファイル名を追加するスクリプト
assets/images/cars/ の画像ファイルと車両データをマッピング
"""

import os
import sys
from pathlib import Path

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session

from app.db.database import SessionLocal, engine
from app.models.vehicle import Vehicle


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


def update_vehicle_images():
    """既存車両データに画像ファイル名を追加する"""

    db = SessionLocal()
    try:
        print("🖼️ 車両データの画像ファイル名更新を開始します...")

        # 全車両を取得
        vehicles = db.query(Vehicle).all()
        print(f"📊 更新対象車両数: {len(vehicles)}台")

        updated_count = 0
        for vehicle in vehicles:
            try:
                # 現在の画像ファイル名を確認
                if vehicle.image_filename:
                    print(
                        f"⚠️  スキップ: {vehicle.make} {vehicle.model} - 既に画像設定済み ({vehicle.image_filename})"
                    )
                    continue

                # 適切な画像ファイル名を取得
                image_filename = get_image_filename_by_vehicle(
                    vehicle.make, vehicle.model
                )

                # 画像ファイル名を更新
                vehicle.image_filename = image_filename

                print(
                    f"✅ 更新完了: {vehicle.year} {vehicle.make} {vehicle.model} → {image_filename}"
                )
                updated_count += 1

            except Exception as e:
                print(f"❌ エラー: {vehicle.make} {vehicle.model} - {str(e)}")
                continue

        # データベースに保存
        db.commit()

        print(f"\n🎉 車両画像データ更新完了!")
        print(f"📈 更新完了: {updated_count}台")
        print(f"💾 データベース: 車両画像データが利用可能になりました")

    except Exception as e:
        print(f"❌ 予期しないエラー: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_vehicle_images()
