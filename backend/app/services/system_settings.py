"""
システム設定サービス
TDD Green Phase - テストを通すための最小実装
"""

from sqlalchemy.orm import Session

from app.models.system_settings import SystemSettings
from app.schemas.system_settings import SystemSettingsUpdate


class SystemSettingsService:
    """システム設定サービス"""

    def __init__(self, db: Session):
        self.db = db

    def get_settings(self) -> SystemSettings:
        """システム設定を取得"""
        settings = self.db.query(SystemSettings).first()
        if not settings:
            # デフォルト設定を作成
            settings = SystemSettings()
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

    def update_settings(self, update_data: SystemSettingsUpdate) -> SystemSettings:
        """システム設定を更新"""
        settings = self.get_settings()

        # 更新データを適用
        if update_data.app_name is not None:
            settings.app_name = update_data.app_name
        if update_data.app_version is not None:
            settings.app_version = update_data.app_version
        if update_data.environment is not None:
            settings.environment = update_data.environment
        if update_data.maintenance_mode is not None:
            settings.maintenance_mode = update_data.maintenance_mode
        if update_data.maintenance_message is not None:
            settings.maintenance_message = update_data.maintenance_message
        if update_data.business_hours is not None:
            settings.business_hours = update_data.business_hours.model_dump()

        self.db.commit()
        self.db.refresh(settings)
        return settings
