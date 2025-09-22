"""
サンプルユーザー作成スクリプト

管理者とサンプル顧客を作成
"""

import asyncio

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user import UserRole
from app.schemas.user import UserCreate
from app.services.user import UserService


def create_admin_user(db: Session) -> None:
    """管理者ユーザー作成"""
    user_service = UserService(db)

    # 既存の管理者チェック
    existing_admin = user_service.get_user_by_email("admin@driverev.jp")
    if existing_admin:
        print("✅ 管理者アカウントは既に存在します: admin@driverev.jp")
        return

    # 管理者作成
    admin_data = UserCreate(
        email="admin@driverev.jp",
        password="AdminPass123!",
        full_name="System Administrator",
        role=UserRole.admin,
    )

    admin_user = user_service.create_user(admin_data)
    print(f"✅ 管理者アカウント作成完了: {admin_user.email} (ID: {admin_user.id})")


def create_sample_customers(db: Session) -> None:
    """サンプル顧客ユーザー作成"""
    user_service = UserService(db)

    # サンプル顧客データ
    customers = [
        {
            "email": "customer1@example.com",
            "password": "Customer123!",
            "full_name": "田中 太郎",
            "phone_number": "090-1234-5678",
        },
        {
            "email": "customer2@example.com",
            "password": "Customer456!",
            "full_name": "佐藤 花子",
            "phone_number": "080-9876-5432",
        },
    ]

    for customer_info in customers:
        # 既存ユーザーチェック
        existing_user = user_service.get_user_by_email(customer_info["email"])
        if existing_user:
            print(f"✅ 顧客アカウントは既に存在します: {customer_info['email']}")
            continue

        # 顧客作成
        customer_data = UserCreate(
            email=customer_info["email"],
            password=customer_info["password"],
            full_name=customer_info["full_name"],
            phone_number=customer_info["phone_number"],
            role=UserRole.customer,
        )

        customer_user = user_service.create_user(customer_data)
        print(
            f"✅ 顧客アカウント作成完了: {customer_user.email} (ID: {customer_user.id})"
        )


def main():
    """メイン実行関数"""
    print("🚀 DriveRev サンプルユーザー作成開始...")

    # データベースセッション作成
    db = SessionLocal()

    try:
        # 管理者ユーザー作成
        print("\n👑 管理者ユーザー作成...")
        create_admin_user(db)

        # サンプル顧客作成
        print("\n👥 サンプル顧客ユーザー作成...")
        create_sample_customers(db)

        print("\n🎉 すべてのサンプルユーザー作成が完了しました！")

        # 作成されたユーザー一覧表示
        user_service = UserService(db)
        all_users = user_service.list_users()

        print(f"\n📋 登録済みユーザー一覧 ({len(all_users)}人):")
        for user in all_users:
            print(
                f"  - {user.email} ({user.full_name}) - {user.role.value} - {'認証済み' if user.is_verified else '未認証'}"
            )

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    main()
