"""
customer1アカウントのパスワード修正スクリプト
"""

import asyncio

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.database import SessionLocal
from app.models.user import User


def fix_customer1_password():
    """customer1アカウントのパスワードを修正"""
    db = SessionLocal()

    try:
        # customer1アカウントを取得
        customer = db.query(User).filter(User.email == "customer1@example.com").first()

        if not customer:
            print("❌ customer1アカウントが見つかりません")
            return

        # パスワードをハッシュ化して更新
        new_password_hash = get_password_hash("Customer123!")
        customer.hashed_password = new_password_hash
        customer.is_verified = True  # 認証状態も有効にする

        db.commit()
        print(f"✅ customer1アカウントのパスワードを修正しました: {customer.email}")
        print(f"   認証状態: {'認証済み' if customer.is_verified else '未認証'}")

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    fix_customer1_password()
