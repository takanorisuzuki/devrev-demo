"""
管理者用ユーザー管理APIエンドポイント
TDD Green Phase - 管理者がユーザーを管理する機能
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.auth import get_admin_user
from app.core.security import get_password_hash
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    AdminPasswordReset,
    AdminUserCreate,
    UserResponse,
    UserUpdate,
)
from app.services.user import UserService

# 管理者ユーザー管理ルーター
router = APIRouter()


def get_admin_current_user(current_user: User = Depends(get_current_user)) -> User:
    """管理者認証を必要とする現在のユーザーを取得"""
    return get_admin_user(current_user)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """UserServiceの依存性注入"""
    return UserService(db)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: AdminUserCreate,
    current_user: User = Depends(get_admin_current_user),
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    管理者による新規ユーザー作成

    管理者は新しいユーザーを作成し、ロールやアクティブ状態を設定可能
    """
    try:
        # メールアドレスの重複チェック
        existing_user = service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Bad Request",
                    "message": "このメールアドレスは既に登録されています。",
                    "status_code": 400,
                    "details": {"email": user_data.email},
                },
            )

        # パスワードをハッシュ化
        hashed_password = get_password_hash(user_data.password)

        # ユーザー作成データを準備
        user_create_data = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "phone_number": user_data.phone_number,
            "password_hash": hashed_password,
            "role": user_data.role,
            "is_active": user_data.is_active,
            "is_verified": user_data.is_verified,
        }

        # ユーザー作成
        new_user = service.create_user(user_create_data)

        return UserResponse.model_validate(new_user)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "ユーザーの作成に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    # フィルタリングパラメータ
    skip: int = Query(0, ge=0, description="スキップ数"),
    limit: int = Query(100, ge=1, le=200, description="取得上限数"),
    role: Optional[str] = Query(None, description="ロールでフィルタ"),
    is_active: Optional[bool] = Query(None, description="アクティブユーザーのみ"),
    # 認証・DB
    current_user: User = Depends(get_admin_current_user),
    service: UserService = Depends(get_user_service),
) -> List[UserResponse]:
    """
    管理者向け全ユーザー一覧取得

    管理者は全てのユーザーを閲覧でき、ロールやアクティブ状態でフィルタリング可能
    """
    try:
        # 基本的なユーザー一覧を取得（最小実装）
        users = service.list_users(skip=skip, limit=limit)

        # TODO: ロールフィルタやis_activeフィルタの実装は後のリファクタリングで

        return [UserResponse.model_validate(user) for user in users]

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "ユーザー一覧の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_detail(
    user_id: str,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    管理者向け特定ユーザー詳細取得

    管理者は任意のユーザーの詳細情報を取得可能
    """
    try:
        # 管理者権限チェック
        get_admin_user(current_user)

        user = service.get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Not Found",
                    "message": "指定されたユーザーが見つかりません。",
                    "status_code": 404,
                    "details": {"user_id": user_id},
                },
            )

        return UserResponse.model_validate(user)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "ユーザー情報の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    管理者による他ユーザー情報更新

    管理者は他のユーザーの情報を更新可能（is_active, is_verifiedを含む）
    """
    try:
        # 管理者権限チェック
        get_admin_user(current_user)

        # 最後の管理者ユーザーを無効化することを防止
        if user_data.is_active is False and service.is_last_admin_user(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="最後の管理者ユーザーを無効化することはできません。システムに最低1人の管理者が必要です。",
            )

        # 自分自身を無効化することを防止
        if user_id == current_user.id and user_data.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="自分自身のアカウントを無効化することはできません。",
            )

        updated_user = service.update_user(user_id, user_data)

        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Not Found",
                    "message": "指定されたユーザーが見つかりません。",
                    "status_code": 404,
                    "details": {"user_id": user_id},
                },
            )

        return UserResponse.model_validate(updated_user)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "ユーザー情報の更新に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> dict:
    """
    管理者による他ユーザー削除（論理削除）

    管理者は他のユーザーを削除可能（is_active = Falseに設定）
    """
    try:
        # 管理者権限チェック
        get_admin_user(current_user)

        # 自分自身を削除することを防止（最優先）
        from uuid import UUID

        try:
            user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
            current_uuid = current_user.id
            is_self = str(user_uuid) == str(current_uuid)
        except (ValueError, TypeError):
            is_self = user_id == str(current_user.id)

        if is_self:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="自分自身のアカウントを削除することはできません。",
            )

        # 最後の管理者ユーザーを削除することを防止
        if service.is_last_admin_user(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="最後の管理者ユーザーを削除することはできません。システムに最低1人の管理者が必要です。",
            )

        success = service.delete_user(user_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Not Found",
                    "message": "指定されたユーザーが見つかりません。",
                    "status_code": 404,
                    "details": {"user_id": user_id},
                },
            )

        return {
            "message": f"ユーザーID {user_id} を正常に削除しました",
            "user_id": user_id,
            "deleted": True,
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "ユーザーの削除に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.put("/{user_id}/password")
async def reset_user_password(
    user_id: str,
    password_data: AdminPasswordReset,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    管理者によるユーザーパスワードリセット

    デモ環境では無効化されています（セキュリティ上の理由）
    """
    # デモ環境ではパスワードリセット機能を無効化
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "error": "Forbidden",
            "message": "デモ環境では管理者によるパスワードリセット機能は無効化されています。",
            "status_code": 403,
        },
    )
