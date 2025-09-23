#!/usr/bin/env python3
"""
サンプル店舗データ作成スクリプト
フロントエンドの店舗選択プルダウン用データ
"""

import sys
from decimal import Decimal
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

try:
    from app.db.database import SessionLocal
    from app.schemas.store import StoreCreate
    from app.services.store import StoreService
except ImportError:  # pragma: no cover
    if str(PROJECT_ROOT) not in sys.path:
        sys.path.insert(0, str(PROJECT_ROOT))
    from app.db.database import SessionLocal
    from app.schemas.store import StoreCreate
    from app.services.store import StoreService


def create_sample_stores():
    """サンプル店舗データを作成する"""

    # サンプル店舗データ
    sample_stores = [
        StoreCreate(
            name="東京駅店",
            code="TKY001",
            prefecture="東京都",
            city="千代田区",
            address_line1="東京都千代田区丸の内1-9-1",
            postal_code="100-0005",
            phone="03-1234-5678",
            email="tokyo@driverev.jp",
            latitude=Decimal("35.6812"),
            longitude=Decimal("139.7671"),
            is_airport=False,
            is_station=True,
            is_active=True,
        ),
        StoreCreate(
            name="羽田空港店",
            code="HND001",
            prefecture="東京都",
            city="大田区",
            address_line1="東京都大田区羽田空港3-3-2",
            postal_code="144-0041",
            phone="03-2345-6789",
            email="haneda@driverev.jp",
            latitude=Decimal("35.5494"),
            longitude=Decimal("139.7798"),
            is_airport=True,
            is_station=False,
            is_active=True,
        ),
        StoreCreate(
            name="渋谷店",
            code="SBY001",
            prefecture="東京都",
            city="渋谷区",
            address_line1="東京都渋谷区道玄坂2-1-1",
            postal_code="150-0043",
            phone="03-3456-7890",
            email="shibuya@driverev.jp",
            latitude=Decimal("35.6596"),
            longitude=Decimal("139.7006"),
            is_airport=False,
            is_station=True,
            is_active=True,
        ),
        StoreCreate(
            name="新宿店",
            code="SJK001",
            prefecture="東京都",
            city="新宿区",
            address_line1="東京都新宿区新宿3-38-1",
            postal_code="160-0022",
            phone="03-4567-8901",
            email="shinjuku@driverev.jp",
            latitude=Decimal("35.6896"),
            longitude=Decimal("139.7006"),
            is_airport=False,
            is_station=True,
            is_active=True,
        ),
        StoreCreate(
            name="成田空港店",
            code="NRT001",
            prefecture="千葉県",
            city="成田市",
            address_line1="千葉県成田市古込1-1",
            postal_code="282-0004",
            phone="0476-123-4567",
            email="narita@driverev.jp",
            latitude=Decimal("35.7647"),
            longitude=Decimal("140.3856"),
            is_airport=True,
            is_station=False,
            is_active=True,
        ),
        StoreCreate(
            name="横浜店",
            code="YOK001",
            prefecture="神奈川県",
            city="横浜市西区",
            address_line1="神奈川県横浜市西区高島2-19-12",
            postal_code="220-0011",
            phone="045-234-5678",
            email="yokohama@driverev.jp",
            latitude=Decimal("35.4657"),
            longitude=Decimal("139.6220"),
            is_airport=False,
            is_station=True,
            is_active=True,
        ),
        StoreCreate(
            name="大阪梅田店",
            code="OSK001",
            prefecture="大阪府",
            city="大阪市北区",
            address_line1="大阪府大阪市北区梅田3-1-3",
            postal_code="530-0001",
            phone="06-345-6789",
            email="osaka@driverev.jp",
            latitude=Decimal("34.7024"),
            longitude=Decimal("135.4959"),
            is_airport=False,
            is_station=True,
            is_active=True,
        ),
        StoreCreate(
            name="関西空港店",
            code="KIX001",
            prefecture="大阪府",
            city="泉佐野市",
            address_line1="大阪府泉佐野市泉州空港北1",
            postal_code="549-0001",
            phone="072-456-7890",
            email="kansai@driverev.jp",
            latitude=Decimal("34.4347"),
            longitude=Decimal("135.2441"),
            is_airport=True,
            is_station=False,
            is_active=True,
        ),
    ]

    db = SessionLocal()
    store_service = StoreService(db)

    try:
        print("🏢 サンプル店舗データを作成中...")

        created_count = 0
        for store_data in sample_stores:
            # 既存の店舗コードをチェック
            existing_store = store_service.get_store_by_code(store_data.code)
            if existing_store:
                print(
                    f"⏭️  店舗コード '{store_data.code}' "
                    "は既に存在します - スキップ"
                )
                continue

            # 店舗を作成
            store = store_service.create_store(store_data)
            print(f"✅ 店舗作成: {store.name} ({store.code})")
            created_count += 1

        print(f"\n🎉 完了! {created_count}件の店舗を作成しました")

        # 作成された店舗一覧を表示
        print("\n📋 登録済み店舗一覧:")
        all_stores = store_service.get_active_stores()
        for store in all_stores:
            airport_flag = "✈️" if store.is_airport else ""
            station_flag = "🚃" if store.is_station else ""
            print(
                f"  - {store.name} ({store.code}) "
                f"{airport_flag}{station_flag}"
            )

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_sample_stores()
