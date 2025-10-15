"""
DevRev統合 API エンドポイント
"""

import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.devrev_service import DevRevService

router = APIRouter()


# --- Pydantic スキーマ ---


class DevRevConfigResponse(BaseModel):
    """DevRev設定レスポンス"""

    mode: str = Field(..., description="設定モード: 'personal' または 'global'")
    app_id: Optional[str] = Field(None, description="DevRev App ID")
    has_aat: bool = Field(..., description="AATが設定されているか")
    revuser_id: Optional[str] = Field(None, description="RevUser ID")
    session_token_expires_at: Optional[str] = Field(
        None, description="Session Token有効期限（ISO 8601形式）"
    )


class DevRevConfigUpdateRequest(BaseModel):
    """DevRev設定更新リクエスト"""

    app_id: Optional[str] = Field(None, description="DevRev App ID")
    application_access_token: Optional[str] = Field(
        None, description="Application Access Token"
    )
    use_personal_config: Optional[bool] = Field(
        None, description="Personal設定を有効にするか"
    )


class SessionTokenResponse(BaseModel):
    """Session Tokenレスポンス"""

    session_token: str = Field(..., description="DevRev Session Token")
    revuser_id: str = Field(..., description="RevUser ID")
    expires_at: str = Field(..., description="有効期限（ISO 8601形式）")
    app_id: Optional[str] = Field(None, description="DevRev App ID")


# --- API エンドポイント ---


@router.post(
    "/session-token",
    response_model=SessionTokenResponse,
    summary="Session Token生成",
    description="DevRev PLuG用のSession Tokenを生成または更新します",
)
async def create_session_token(
    force_refresh: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Session Token生成エンドポイント

    Args:
        force_refresh: 強制的に新しいトークンを生成するか
        current_user: 認証済みユーザー
        db: データベースセッション

    Returns:
        SessionTokenResponse: Session Token情報
    """
    devrev_service = DevRevService(db)

    try:
        # Session Token生成（expires_atも返される）
        session_token, revuser_id, expires_at = (
            await devrev_service.get_or_create_session_token(
                current_user, force_refresh=force_refresh
            )
        )

        # 有効なApp IDを取得
        if current_user.devrev_use_personal_config:
            app_id = current_user.devrev_app_id
        else:
            # Global設定からApp IDを取得（環境変数）
            app_id = os.getenv("DEVREV_GLOBAL_APP_ID")

        return SessionTokenResponse(
            session_token=session_token,
            revuser_id=revuser_id,
            expires_at=expires_at.isoformat(),
            app_id=app_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception:
        # 詳細はサーバーログに記録（実装時に追加）
        # logger.error("Session Token生成エラー", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session Tokenの生成中にエラーが発生しました。",
        )


@router.get(
    "/anonymous-session",
    response_model=SessionTokenResponse,
    summary="匿名Session Token生成",
    description="未認証ユーザー向けにDevRev PLuG用の匿名Session Tokenを生成します",
)
async def create_anonymous_session():
    """
    匿名Session Token生成エンドポイント（認証不要）

    セキュリティ:
    - 認証不要（未ログインユーザー向け）
    - AATはサーバー側で安全に管理（GitHub Secrets経由）
    - 短命Session Token（1時間）を返却

    Returns:
        SessionTokenResponse: 匿名Session Token情報
    """
    devrev_service = DevRevService()

    # 匿名ユーザー情報（固定値）
    anonymous_user_email = "anonymous@guest.driverev.jp"
    anonymous_user_name = "ゲストユーザー"

    try:
        # Session Token生成（expires_atも返される）
        session_token, revuser_id, expires_at = (
            await devrev_service.create_session_token(
                user_email=anonymous_user_email,
                user_display_name=anonymous_user_name,
            )
        )

        # Global設定からApp IDを取得（環境変数）
        app_id = os.getenv("DEVREV_GLOBAL_APP_ID")

        return SessionTokenResponse(
            session_token=session_token,
            revuser_id=revuser_id,
            expires_at=expires_at.isoformat(),
            app_id=app_id,
        )

    except Exception as e:
        # 詳細はサーバーログに記録
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"匿名セッションの作成に失敗しました: {str(e)}",
        )


@router.get(
    "/config",
    response_model=DevRevConfigResponse,
    summary="DevRev設定取得",
    description="現在のユーザーの有効なDevRev設定を取得します",
)
async def get_devrev_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    DevRev設定取得エンドポイント

    Args:
        current_user: 認証済みユーザー
        db: データベースセッション

    Returns:
        DevRevConfigResponse: DevRev設定情報
    """
    devrev_service = DevRevService(db)
    config = devrev_service.get_devrev_config(current_user)

    return DevRevConfigResponse(**config)


@router.put(
    "/config",
    response_model=DevRevConfigResponse,
    summary="DevRev設定更新",
    description="ユーザーのDevRev設定を更新します",
)
async def update_devrev_config(
    request: DevRevConfigUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    DevRev設定更新エンドポイント

    Args:
        request: 更新リクエスト
        current_user: 認証済みユーザー
        db: データベースセッション

    Returns:
        DevRevConfigResponse: 更新後のDevRev設定
    """
    devrev_service = DevRevService(db)

    try:
        devrev_service.update_devrev_config(
            current_user,
            app_id=request.app_id,
            aat=request.application_access_token,
            use_personal_config=request.use_personal_config,
        )

        # 更新後の設定を取得
        config = devrev_service.get_devrev_config(current_user)
        return DevRevConfigResponse(**config)

    except Exception:
        # 詳細はサーバーログに記録（実装時に追加）
        # logger.error("DevRev設定更新エラー", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="DevRev設定の更新中にエラーが発生しました。",
        )


@router.delete(
    "/config",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="DevRev設定削除",
    description="ユーザーのDevRev設定を削除します",
)
async def delete_devrev_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    DevRev設定削除エンドポイント

    Args:
        current_user: 認証済みユーザー
        db: データベースセッション
    """
    devrev_service = DevRevService(db)

    try:
        devrev_service.delete_devrev_config(current_user)
    except Exception:
        # 詳細はサーバーログに記録（実装時に追加）
        # logger.error("DevRev設定削除エラー", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="DevRev設定の削除中にエラーが発生しました。",
        )
