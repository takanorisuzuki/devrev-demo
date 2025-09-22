"""
ユーザーアカウントロックサービス
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_lock import UserLock


class UserLockService:
    """ユーザーアカウントロックサービス"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_lock(self, user_id: str) -> Optional[UserLock]:
        """ユーザーロック情報を取得"""
        return self.db.query(UserLock).filter(UserLock.user_id == user_id).first()

    def create_user_lock(self, user_id: str) -> UserLock:
        """ユーザーロック情報を作成"""
        try:
            user_lock = UserLock(
                user_id=user_id, max_failed_attempts=5, lockout_duration_minutes=30
            )
            self.db.add(user_lock)
            self.db.commit()
            self.db.refresh(user_lock)
            return user_lock
        except IntegrityError:
            self.db.rollback()
            # 既に存在する場合は取得
            return self.get_user_lock(user_id)

    def record_failed_login(self, user_id: str) -> bool:
        """
        ログイン失敗を記録

        Returns:
            bool: アカウントがロックされた場合True
        """
        user_lock = self.get_user_lock(user_id)
        if not user_lock:
            user_lock = self.create_user_lock(user_id)

        # 失敗回数を増加
        user_lock.failed_attempts += 1
        user_lock.last_failed_attempt = datetime.now(timezone.utc)

        # 最大失敗回数に達した場合、アカウントをロック
        if user_lock.failed_attempts >= user_lock.max_failed_attempts:
            user_lock.is_locked = True
            user_lock.lock_reason = "ログイン失敗回数が上限に達しました"
            user_lock.locked_at = datetime.now(timezone.utc)

        self.db.commit()
        return user_lock.is_locked

    def record_successful_login(self, user_id: str):
        """ログイン成功を記録"""
        user_lock = self.get_user_lock(user_id)
        if user_lock:
            # 失敗回数をリセット
            user_lock.failed_attempts = 0
            user_lock.last_failed_attempt = None

            # ロック状態を解除
            if user_lock.is_locked:
                user_lock.is_locked = False
                user_lock.lock_reason = None
                user_lock.unlocked_at = datetime.now(timezone.utc)

            self.db.commit()

    def is_account_locked(self, user_id: str) -> bool:
        """アカウントがロックされているかチェック"""
        user_lock = self.get_user_lock(user_id)
        if not user_lock:
            return False

        # 自動ロック解除のチェック
        if user_lock.is_locked and user_lock.locked_at:
            lockout_duration = timedelta(minutes=user_lock.lockout_duration_minutes)
            if datetime.now(timezone.utc) - user_lock.locked_at > lockout_duration:
                # 自動ロック解除
                user_lock.is_locked = False
                user_lock.lock_reason = None
                user_lock.unlocked_at = datetime.now(timezone.utc)
                self.db.commit()
                return False

        return user_lock.is_locked

    def lock_account(self, user_id: str, reason: str = "管理者による手動ロック"):
        """アカウントを手動でロック"""
        user_lock = self.get_user_lock(user_id)
        if not user_lock:
            user_lock = self.create_user_lock(user_id)

        user_lock.is_locked = True
        user_lock.lock_reason = reason
        user_lock.locked_at = datetime.now(timezone.utc)

        self.db.commit()

    def unlock_account(self, user_id: str):
        """アカウントを手動でアンロック"""
        user_lock = self.get_user_lock(user_id)
        if user_lock:
            user_lock.is_locked = False
            user_lock.lock_reason = None
            user_lock.unlocked_at = datetime.now(timezone.utc)
            user_lock.failed_attempts = 0
            user_lock.last_failed_attempt = None

            self.db.commit()

    def get_lock_status(self, user_id: str) -> dict:
        """ロック状態の詳細情報を取得"""
        user_lock = self.get_user_lock(user_id)
        if not user_lock:
            return {
                "is_locked": False,
                "failed_attempts": 0,
                "remaining_attempts": 5,
                "lock_reason": None,
                "locked_at": None,
                "unlocked_at": None,
            }

        return {
            "is_locked": user_lock.is_locked,
            "failed_attempts": user_lock.failed_attempts,
            "remaining_attempts": max(
                0, user_lock.max_failed_attempts - user_lock.failed_attempts
            ),
            "lock_reason": user_lock.lock_reason,
            "locked_at": user_lock.locked_at,
            "unlocked_at": user_lock.unlocked_at,
            "max_failed_attempts": user_lock.max_failed_attempts,
            "lockout_duration_minutes": user_lock.lockout_duration_minutes,
        }
