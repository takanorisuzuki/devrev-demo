#!/usr/bin/env python
"""
データベース初期化スクリプト

コンテナ起動時に自動実行される初期化処理
- サンプルユーザー作成
- サンプル車両作成
- サンプル店舗作成
- 過去の予約データ作成
"""

import os
import subprocess
import sys
from pathlib import Path

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from app.db.database import SessionLocal
from app.models.reservation import Reservation
from app.models.store import Store
from app.models.user import User
from app.models.vehicle import Vehicle


def check_database_ready():
    """データベースが準備できているかチェック"""
    try:
        db = SessionLocal()
        # 簡単なクエリで接続確認
        from sqlalchemy import text

        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        print(f"❌ データベース接続エラー: {e}")
        return False


def check_data_exists():
    """必要なデータが既に存在するかチェック"""
    db = SessionLocal()
    try:
        # 顧客データの確認
        customer_count = db.query(User).filter(User.role == "customer").count()

        # 車両データの確認
        vehicle_count = db.query(Vehicle).count()

        # 店舗データの確認
        store_count = db.query(Store).count()

        # 予約データの確認
        reservation_count = db.query(Reservation).count()

        print(f"📊 現在のデータ状況:")
        print(f"   顧客数: {customer_count}")
        print(f"   車両数: {vehicle_count}")
        print(f"   店舗数: {store_count}")
        print(f"   予約数: {reservation_count}")

        # 必要なデータが揃っているかチェック
        if customer_count >= 2 and vehicle_count >= 8 and store_count >= 5:
            print("✅ 必要なデータが揃っています")
            return True
        else:
            print("⚠️  必要なデータが不足しています")
            return False

    except Exception as e:
        print(f"❌ データ確認エラー: {e}")
        return False
    finally:
        db.close()


def run_script(script_name):
    """指定されたスクリプトを実行"""
    try:
        print(f"🔄 {script_name} を実行中...")
        result = subprocess.run(
            [sys.executable, "-m", f"app.scripts.{script_name}"],
            cwd=project_root,
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            print(f"✅ {script_name} 実行完了")
            if result.stdout:
                print(result.stdout)
        else:
            print(f"❌ {script_name} 実行エラー:")
            print(result.stderr)
            return False

        return True
    except Exception as e:
        print(f"❌ {script_name} 実行例外: {e}")
        return False


def main():
    """メイン処理"""
    print("🚀 DriveRev データベース初期化開始")

    # 1. データベース接続確認
    if not check_database_ready():
        print("❌ データベースに接続できません。初期化をスキップします。")
        return

    # 2. 既存データ確認
    if check_data_exists():
        print("✅ データベース初期化は既に完了しています")
        return

    # 3. 必要なスクリプトを順次実行
    scripts_to_run = [
        "create_sample_users",
        "create_sample_stores",
        "create_demo_vehicles",
        "assign_vehicles_to_stores",
        "create_past_reservations",
    ]

    for script in scripts_to_run:
        if not run_script(script):
            print(f"❌ {script} の実行に失敗しました")
            return

    print("🎉 データベース初期化完了！")
    print("📝 テスト用アカウント:")
    print("   管理者: admin@driverev.jp / AdminPass123!")
    print("   顧客1: customer1@example.com / Customer123!")
    print("   顧客2: customer2@example.com / Customer123!")


if __name__ == "__main__":
    main()
