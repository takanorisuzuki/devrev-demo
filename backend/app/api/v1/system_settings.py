"""
システム設定API
TDD Green Phase - テストを通すための最小実装
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.system_settings import SystemSettingsService
from app.schemas.system_settings import SystemSettingsResponse, SystemSettingsUpdate
from app.api.v1.auth import get_current_user
from app.core.auth import get_admin_user
from app.models.user import User

router = APIRouter()


def get_admin_current_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """管理者認証を必要とする現在のユーザーを取得"""
    return get_admin_user(current_user)


def get_system_settings_service(db: Session = Depends(get_db)) -> SystemSettingsService:
    """システム設定サービスの依存性注入"""
    return SystemSettingsService(db)


@router.get("/admin/system-settings", response_model=SystemSettingsResponse)
def get_system_settings(
    current_user: User = Depends(get_admin_current_user),
    service: SystemSettingsService = Depends(get_system_settings_service)
):
    """システム設定を取得"""
    settings = service.get_settings()
    return SystemSettingsResponse.model_validate(settings)


@router.put("/admin/system-settings", response_model=SystemSettingsResponse)
def update_system_settings(
    update_data: SystemSettingsUpdate,
    current_user: User = Depends(get_admin_current_user),
    service: SystemSettingsService = Depends(get_system_settings_service)
):
    """システム設定を更新（デモ環境では無効化）"""
    # デモ環境ではシステム設定の更新を無効化
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "error": "Forbidden",
            "message": "デモ環境ではシステム設定の更新は無効化されています。",
            "status_code": 403,
        }
    )
