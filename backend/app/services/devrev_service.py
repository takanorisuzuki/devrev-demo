"""
DevRev API統合サービス
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User


class DevRevService:
    """DevRev API統合サービス"""

    def __init__(self, db: Session):
        self.db = db

    async def get_or_create_session_token(
        self, user: User, force_refresh: bool = False
    ) -> tuple[str, str, datetime]:
        """
        Session Tokenを取得または生成

        Args:
            user: ユーザーモデル
            force_refresh: 強制的に新しいトークンを生成するか

        Returns:
            tuple[session_token, revuser_id, expires_at]

        Raises:
            ValueError: DevRev設定が不正な場合
            httpx.HTTPError: DevRev API呼び出しエラー
        """
        # 既存のSession Tokenが有効かチェック
        if not force_refresh and self._is_session_token_valid(user):
            return (
                user.devrev_session_token,
                user.devrev_revuser_id,
                user.devrev_session_expires_at,
            )

        # Session Token生成
        session_token, revuser_id = await self._generate_session_token(user)

        # DBに保存
        user.devrev_session_token = session_token
        user.devrev_revuser_id = revuser_id
        user.devrev_session_expires_at = datetime.now(timezone.utc) + timedelta(
            hours=settings.DEVREV_SESSION_TOKEN_EXPIRY_HOURS
        )
        self.db.commit()
        self.db.refresh(user)

        return session_token, revuser_id, user.devrev_session_expires_at

    async def _generate_session_token(self, user: User) -> tuple[str, str]:
        """
        DevRev APIを使ってSession Tokenを生成

        Args:
            user: ユーザーモデル

        Returns:
            tuple[session_token, revuser_id]
        """
        # 有効なAATを取得（Personal or Global）
        aat = self._get_effective_aat(user)
        if not aat:
            raise ValueError(
                "DevRev Application Access Token が設定されていません。"
                "個人設定またはGlobal設定を確認してください。"
            )

        # DevRev API: Session Token生成エンドポイント
        # POST /session_tokens.create
        url = f"{settings.DEVREV_API_URL}/internal/session_tokens.create"
        headers = {"Authorization": aat, "Content-Type": "application/json"}

        # ユーザー情報をペイロードに含める
        payload = {
            "user_id": str(user.id),
            "email": user.email,
            "display_name": user.full_name,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url, headers=headers, json=payload, timeout=30.0
            )
            response.raise_for_status()
            data = response.json()

        # Session TokenとRevUser IDを抽出
        session_token = data.get("session_token")
        revuser_id = data.get("revuser_id")

        if not session_token or not revuser_id:
            raise ValueError(f"DevRev API レスポンスが不正です: {data}")

        return session_token, revuser_id

    def _is_session_token_valid(self, user: User) -> bool:
        """
        既存のSession Tokenが有効かチェック

        Args:
            user: ユーザーモデル

        Returns:
            bool: 有効ならTrue
        """
        if not user.devrev_session_token:
            return False

        if not user.devrev_session_expires_at:
            return False

        # 有効期限をチェック（余裕を持って5分前に更新）
        now = datetime.now(timezone.utc)
        expires_with_buffer = user.devrev_session_expires_at - timedelta(minutes=5)

        return now < expires_with_buffer

    def _get_effective_aat(self, user: User) -> Optional[str]:
        """
        有効なAAT（Application Access Token）を取得

        優先順位:
        1. Personal設定が有効な場合: user.devrev_application_access_token
        2. それ以外: Global設定のAAT（環境変数）

        Args:
            user: ユーザーモデル

        Returns:
            Optional[str]: AAT または None
        """
        # Personal設定が有効で、AATが設定されている場合
        if user.devrev_use_personal_config and user.devrev_application_access_token:
            return user.devrev_application_access_token

        # Global設定のAAT（settingsから取得）
        return settings.DEVREV_GLOBAL_AAT

    def get_devrev_config(self, user: User) -> dict:
        """
        ユーザーの有効なDevRev設定を取得

        Args:
            user: ユーザーモデル

        Returns:
            dict: DevRev設定
        """
        # Personal設定が有効な場合
        if user.devrev_use_personal_config:
            return {
                "mode": "personal",
                "app_id": user.devrev_app_id,
                "has_aat": bool(user.devrev_application_access_token),
                "revuser_id": user.devrev_revuser_id,
                "session_token_expires_at": (
                    user.devrev_session_expires_at.isoformat()
                    if user.devrev_session_expires_at
                    else None
                ),
            }

        # Global設定
        return {
            "mode": "global",
            "app_id": settings.DEVREV_GLOBAL_APP_ID,
            "has_aat": bool(settings.DEVREV_GLOBAL_AAT),
            "revuser_id": None,  # Globalモードでは個別のRevUser IDは不要
            "session_token_expires_at": None,
        }

    def update_devrev_config(
        self,
        user: User,
        app_id: Optional[str] = None,
        aat: Optional[str] = None,
        use_personal_config: Optional[bool] = None,
    ) -> User:
        """
        ユーザーのDevRev設定を更新

        Args:
            user: ユーザーモデル
            app_id: DevRev App ID
            aat: Application Access Token
            use_personal_config: Personal設定を有効にするか

        Returns:
            User: 更新されたユーザーモデル
        """
        if app_id is not None:
            user.devrev_app_id = app_id

        if aat is not None:
            user.devrev_application_access_token = aat
            # AATが更新されたら既存のSession Tokenは無効化
            user.devrev_session_token = None
            user.devrev_session_expires_at = None
            user.devrev_revuser_id = None

        if use_personal_config is not None:
            user.devrev_use_personal_config = use_personal_config
            # Personal設定を無効にする場合、Session Tokenをクリア
            if not use_personal_config:
                user.devrev_session_token = None
                user.devrev_session_expires_at = None
                user.devrev_revuser_id = None

        self.db.commit()
        self.db.refresh(user)

        return user

    def delete_devrev_config(self, user: User) -> User:
        """
        ユーザーのDevRev設定を削除

        Args:
            user: ユーザーモデル

        Returns:
            User: 更新されたユーザーモデル
        """
        user.devrev_app_id = None
        user.devrev_application_access_token = None
        user.devrev_use_personal_config = False
        user.devrev_session_token = None
        user.devrev_session_expires_at = None
        user.devrev_revuser_id = None

        self.db.commit()
        self.db.refresh(user)

        return user
