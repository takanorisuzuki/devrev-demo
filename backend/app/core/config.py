"""
DriveRev アプリケーション設定
"""

from typing import List, Optional

from pydantic import ConfigDict, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """アプリケーション設定クラス"""

    # アプリケーション基本設定
    APP_NAME: str = "DriveRev"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # API設定
    API_PREFIX: str = "/api/v1"

    # データベース設定
    DATABASE_URL: Optional[str] = None
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "driverev_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres123"

    # Redis設定
    REDIS_URL: str = "redis://localhost:6379/0"

    # セキュリティ設定
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS設定
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "0.0.0.0"]
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
    ]

    # メール設定
    EMAIL_HOST: Optional[str] = None
    EMAIL_PORT: int = 587
    EMAIL_USER: Optional[str] = None
    EMAIL_PASSWORD: Optional[str] = None
    EMAIL_USE_TLS: bool = True

    # ファイルアップロード設定
    UPLOAD_MAX_SIZE: int = 10485760  # 10MB
    UPLOAD_PATH: str = "/app/uploads"
    ASSETS_PATH: str = "/app/assets"

    # ログ設定
    LOG_LEVEL: str = "INFO"

    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info) -> str:
        """データベースURLを組み立て"""
        if isinstance(v, str):
            return v
        return (
            f"postgresql://{info.data.get('DB_USER')}:"
            f"{info.data.get('DB_PASSWORD')}@{info.data.get('DB_HOST')}:"
            f"{info.data.get('DB_PORT')}/{info.data.get('DB_NAME')}"
        )

    @field_validator("CORS_ORIGINS", "ALLOWED_HOSTS", mode="before")
    def parse_json_list(cls, v) -> List[str]:
        """
        JSON文字列をリストにパース
        
        本番環境の.envファイルでは環境変数が以下の形式で設定される:
        CORS_ORIGINS=["http://IP:3000", "http://IP:8000"]
        
        Pydanticはこれを自動的にリストに変換しないため、
        このバリデーターでJSON文字列をパースする。
        """
        if isinstance(v, str):
            import json
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                # JSON解析失敗時は単一の値として扱う
                return [v]
        # 既にリストの場合はそのまま返す
        return v if isinstance(v, list) else [v]

    model_config = ConfigDict(env_file=".env", case_sensitive=True)


# 設定インスタンス
settings = Settings()
