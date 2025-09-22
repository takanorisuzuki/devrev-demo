"""
管理者権限チェック機能
"""

from fastapi import HTTPException, status
from app.models.user import User, UserRole


def get_admin_user(current_user: User) -> User:
    """管理者権限を持つユーザーかチェック"""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者権限が必要です",
        )
    
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="無効なアカウントです",
        )
    
    return current_user


def check_admin_permission(current_user: User) -> bool:
    """管理者権限を持っているかチェック（boolean返却版）"""
    return (
        current_user.role == UserRole.admin and
        current_user.is_active and
        current_user.is_verified
    )
