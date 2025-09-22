"""
システム設定スキーマ
TDD Green Phase - テストを通すための最小実装
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
import re


class BusinessHours(BaseModel):
    """営業時間設定"""
    start_time: str = Field(..., description="開始時間 (HH:MM)")
    end_time: str = Field(..., description="終了時間 (HH:MM)")
    timezone: str = Field(default="Asia/Tokyo", description="タイムゾーン")
    
    @field_validator('start_time', 'end_time')
    @classmethod
    def validate_time_format(cls, v):
        """時間形式を検証 (HH:MM)"""
        if not re.match(r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$', v):
            raise ValueError('時間はHH:MM形式で入力してください (例: 09:00)')
        return v


class SystemSettingsResponse(BaseModel):
    """システム設定レスポンス"""
    id: str
    app_name: str
    app_version: str
    environment: str
    maintenance_mode: bool
    maintenance_message: Optional[str] = None
    business_hours: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
        
    @classmethod
    def model_validate(cls, obj):
        """UUIDを文字列に変換してからバリデーション"""
        if hasattr(obj, 'id'):
            obj.id = str(obj.id)
        return super().model_validate(obj)


class SystemSettingsUpdate(BaseModel):
    """システム設定更新"""
    app_name: Optional[str] = Field(None, description="アプリケーション名")
    app_version: Optional[str] = Field(None, description="アプリケーションバージョン")
    environment: Optional[str] = Field(None, description="環境設定")
    maintenance_mode: Optional[bool] = Field(None, description="メンテナンスモード")
    maintenance_message: Optional[str] = Field(None, description="メンテナンスメッセージ")
    business_hours: Optional[BusinessHours] = Field(None, description="営業時間設定")
