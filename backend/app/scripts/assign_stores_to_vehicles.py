#!/usr/bin/env python3
"""
既存車両にstore_idを割り当てるスクリプト
車両-店舗関係の基盤実装
"""

import random
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

try:
    from app.db.database import SessionLocal
    from app.models.store import Store
    from app.models.vehicle import Vehicle
except ImportError:  # pragma: no cover
    if str(PROJECT_ROOT) not in sys.path:
        sys.path.insert(0, str(PROJECT_ROOT))
    from app.db.database import SessionLocal
    from app.models.store import Store
    from app.models.vehicle import Vehicle


def get_store_assignment_strategy():
    """車両カテゴリ別の店舗割り当て戦略を取得"""
    return {
        # 空港店はプレミアム・スポーツ車重視
        "HND001": ["premium", "exotic", "sports", "convertible", "electric"],
        "NRT001": ["premium", "exotic", "sports", "convertible", "electric"],
        "KIX001": ["premium", "sports", "convertible", "electric"],
        # 駅前店は一般車重視
        "TKY001": ["compact", "standard", "suv", "electric"],
        "SBY001": ["compact", "standard", "electric", "premium"],
        "SJK001": ["compact", "standard", "suv", "premium"],
        "YOK001": ["compact", "standard", "suv", "van"],
        "OSK001": ["compact", "standard", "suv", "van"],
    }


def print_store_info(stores):
    """店舗情報を表示"""
    print(f"🏢 利用可能店舗: {len(stores)}店舗")
    for store in stores:
        airport_flag = "✈️" if store.is_airport else ""
        station_flag = "🚃" if store.is_station else ""
        print(f"  - {store.name} ({store.code}) {airport_flag}{station_flag}")
    print()


def select_suitable_store(vehicle, store_assignments, store_code_to_id):
    """車両に適した店舗を選択"""
    suitable_stores = []

    for store_code, preferred_categories in store_assignments.items():
        if vehicle.category in preferred_categories:
            suitable_stores.append(store_code)

    # 適合する店舗がない場合は全店舗から選択
    if not suitable_stores:
        suitable_stores = list(store_code_to_id.keys())

    selected_store_code = random.choice(suitable_stores)
    return selected_store_code, store_code_to_id[selected_store_code]


def print_assignment_results(assignments_by_store, stores):
    """割り当て結果を表示"""
    print("📊 店舗別割り当て結果:")
    for store_code, assigned_vehicles in assignments_by_store.items():
        store_name = next(s.name for s in stores if s.code == store_code)
        print(f"\n🏢 {store_name} ({store_code}): {len(assigned_vehicles)}台")

        # カテゴリ別内訳
        category_counts = {}
        for vehicle in assigned_vehicles:
            category_counts[vehicle.category] = (
                category_counts.get(vehicle.category, 0) + 1
            )

        for category, count in sorted(category_counts.items()):
            print(f"   - {category}: {count}台")


def assign_stores_to_vehicles():
    """既存の車両にstore_idを割り当てる"""
    db = SessionLocal()
    try:
        # 全店舗と車両を取得
        stores = db.query(Store).filter(Store.is_active is True).all()
        vehicles = db.query(Vehicle).filter(Vehicle.store_id is None).all()

        if not stores:
            print("❌ エラー: アクティブな店舗がありません")
            return

        if not vehicles:
            print("ℹ️  store_idが未設定の車両はありません")
            return

        print(f"🚗 割り当て対象車両: {len(vehicles)}台")
        print_store_info(stores)

        store_assignments = get_store_assignment_strategy()
        store_code_to_id = {store.code: store.id for store in stores}

        # 車両を店舗に割り当て
        assigned_count = 0
        assignments_by_store = {}

        for vehicle in vehicles:
            selected_store_code, selected_store_id = select_suitable_store(
                vehicle, store_assignments, store_code_to_id
            )

            vehicle.store_id = selected_store_id

            if selected_store_code not in assignments_by_store:
                assignments_by_store[selected_store_code] = []
            assignments_by_store[selected_store_code].append(vehicle)

            assigned_count += 1

        db.commit()
        print(f"✅ 車両割り当て完了: {assigned_count}台")
        print()

        print_assignment_results(assignments_by_store, stores)
        print("\n🎉 車両-店舗関係の設定が完了しました!")

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # ランダムシードを設定（再現可能な結果のため）
    random.seed(42)
    assign_stores_to_vehicles()
