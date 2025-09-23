"""
ユーザー管理サービス
"""

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """ユーザー管理サービス"""

    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: UserCreate | dict) -> User:
        """ユーザー作成"""
        try:
            # 辞書形式の場合は直接使用、UserCreateの場合は変換
            if isinstance(user_data, dict):
                # 管理者用の辞書形式データ
                db_user = User(
                    email=user_data["email"],
                    hashed_password=user_data["password_hash"],
                    full_name=user_data["full_name"],
                    phone_number=user_data.get("phone_number"),
                    role=user_data["role"],
                    is_active=user_data.get("is_active", True),
                    is_verified=user_data.get("is_verified", False),
                )
            else:
                # 通常のUserCreate形式
                hashed_password = get_password_hash(user_data.password)
                db_user = User(
                    email=user_data.email,
                    hashed_password=hashed_password,
                    full_name=user_data.full_name,
                    phone_number=user_data.phone_number,
                    role=user_data.role,
                )

                # 管理者は自動的に認証済み
                if user_data.role == UserRole.admin:
                    db_user.is_verified = True

            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)

            return db_user

        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このメールアドレスは既に使用されています",
            )

    def get_user_by_email(self, email: str) -> Optional[User]:
        """メールアドレスでユーザー取得"""
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """IDでユーザー取得"""
        try:
            # UUID型として処理を試行
            from uuid import UUID

            uuid_id = UUID(user_id) if isinstance(user_id, str) else user_id
            return self.db.query(User).filter(User.id == uuid_id).first()
        except (ValueError, TypeError):
            # UUID変換に失敗した場合は文字列として処理
            return self.db.query(User).filter(User.id == user_id).first()

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """ユーザー認証"""
        user = self.get_user_by_email(email)
        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        if not user.is_active:
            return None

        return user

    def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """ユーザー更新"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        # 提供されたフィールドのみ更新
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)

        return user

    def delete_user(self, user_id: str) -> bool:
        """ユーザー削除（論理削除）"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        user.is_active = False
        self.db.commit()

        return True

    def list_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """ユーザー一覧取得"""
        return (
            self.db.query(User)
            .filter(User.is_active.is_(True))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_active_admin_users(self) -> int:
        """アクティブな管理者ユーザーの数を取得"""
        return (
            self.db.query(User)
            .filter(User.role == UserRole.admin, User.is_active.is_(True))
            .count()
        )

    def is_last_admin_user(self, user_id: str) -> bool:
        """指定されたユーザーが最後の管理者ユーザーかチェック"""
        user = self.get_user_by_id(user_id)
        if not user or user.role != UserRole.admin:
            return False

        # このユーザー以外のアクティブな管理者ユーザー数をカウント
        try:
            # UUID型として処理を試行
            from uuid import UUID

            uuid_id = UUID(user_id) if isinstance(user_id, str) else user_id
            other_admin_count = (
                self.db.query(User)
                .filter(
                    User.role == UserRole.admin,
                    User.is_active.is_(True),
                    User.id != uuid_id,
                )
                .count()
            )
        except (ValueError, TypeError):
            # UUID変換に失敗した場合は文字列として処理
            other_admin_count = (
                self.db.query(User)
                .filter(
                    User.role == UserRole.admin,
                    User.is_active.is_(True),
                    User.id != user_id,
                )
                .count()
            )

        return other_admin_count == 0
