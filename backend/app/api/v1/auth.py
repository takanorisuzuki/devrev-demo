"""
認証関連のAPIエンドポイント
"""

import time
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    PasswordResetConfirm,
    PasswordResetRequest,
    Token,
    UserCreate,
    UserLogin,
    UserPasswordUpdate,
    UserProfileUpdate,
    UserResponse,
)
from app.services.user import UserService

router = APIRouter()


def get_current_user(
    authorization: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db),
) -> User:
    """現在のユーザーを取得"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="認証情報を確認できませんでした",
        headers={"WWW-Authenticate": "Bearer"},
    )

    print(f"DEBUG: authorization = {authorization}")

    if not authorization or not authorization.startswith("Bearer "):
        print("DEBUG: No authorization header or not Bearer token")
        raise credentials_exception

    parts = authorization.split(" ")
    token = parts[1] if len(parts) > 1 else ""
    print(f"DEBUG: token = {token[:20]}...")

    payload = verify_token(token)
    if payload is None:
        print("DEBUG: Token verification failed")
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        print("DEBUG: No email in token payload")
        raise credentials_exception

    print(f"DEBUG: email = {email}")

    user_service = UserService(db)
    user = user_service.get_user_by_email(email)
    if user is None:
        print("DEBUG: User not found")
        raise credentials_exception

    print(f"DEBUG: user found = {user.email}, role = {user.role}")
    return user


def get_active_user(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """アクティブなユーザーを取得"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無効なユーザーアカウントです",
        )
    return current_user


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """ユーザー登録"""
    user_service = UserService(db)

    # 既存ユーザーチェック
    if user_service.get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています",
        )

    # ユーザー作成
    user = user_service.create_user(user_data)
    return UserResponse.model_validate(user)


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
) -> Token:
    """ログイン（OAuth2パスワードフロー - フォーム形式）"""
    user_service = UserService(db)
    user = user_service.authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # アクセストークン作成
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires,
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=Token)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)) -> Token:
    """ログイン（JSONペイロード）"""
    user_service = UserService(db)
    user = user_service.authenticate_user(login_data.email, login_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません",
        )

    # アクセストークン作成
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires,
    )

    # リフレッシュトークン作成
    refresh_token = create_refresh_token(user.email, user.role.value)

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=Token)
def refresh_access_token(refresh_data: dict, db: Session = Depends(get_db)) -> Token:
    """アクセストークンリフレッシュ"""
    refresh_token = refresh_data.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="リフレッシュトークンが必要です",
        )

    # リフレッシュトークンを検証
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無効なリフレッシュトークンです",
        )

    # ユーザーを取得
    user_service = UserService(db)
    user = user_service.get_user_by_email(payload.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーが見つかりません",
        )

    # 新しいアクセストークンを作成
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires,
    )

    # 新しいリフレッシュトークンを作成
    new_refresh_token = create_refresh_token(user.email, user.role.value)

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=new_refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: Annotated[User, Depends(get_active_user)],
) -> UserResponse:
    """現在のユーザー情報取得"""
    return UserResponse.model_validate(current_user)


@router.get("/verify-token")
def verify_access_token(
    current_user: Annotated[User, Depends(get_active_user)],
) -> dict:
    """トークン検証"""
    return {
        "valid": True,
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
    }


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: Annotated[User, Depends(get_active_user)],
    db: Session = Depends(get_db),
) -> UserResponse:
    """プロフィール情報更新（ログインユーザー本人のみ）"""
    try:
        # プロフィール更新データをUserUpdateスキーマに変換
        # （管理者用とは異なり、is_active、is_verifiedは更新不可）
        update_data = profile_data.model_dump(exclude_unset=True)

        # 空の更新チェック
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="更新するデータがありません",
            )

        # ユーザー情報を直接更新（最小実装）
        for field, value in update_data.items():
            setattr(current_user, field, value)

        db.commit()
        db.refresh(current_user)

        return UserResponse.model_validate(current_user)

    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="プロフィール更新に失敗しました。システム管理者にお問い合わせください。",
        )


@router.put("/me", response_model=UserResponse)
def update_profile_me(
    profile_data: UserProfileUpdate,
    current_user: Annotated[User, Depends(get_active_user)],
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    プロフィール情報更新（/me エイリアス - Frontend互換性）

    Frontend が期待する PUT /api/v1/auth/me エンドポイントを提供。
    既存の /profile エンドポイントと同じロジックを使用して重複を避ける。
    """
    # /profile エンドポイントと同じロジックを使用（DRY原則）
    return update_profile(profile_data, current_user, db)


@router.put("/password")
def update_password(
    password_data: UserPasswordUpdate,
    current_user: Annotated[User, Depends(get_active_user)],
    db: Session = Depends(get_db),
) -> dict:
    """パスワード更新（ログインユーザー本人のみ）"""
    try:
        # 現在のパスワード確認
        if not verify_password(
            password_data.current_password, current_user.hashed_password
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="現在のパスワードが正しくありません",
            )

        # 新しいパスワードが現在のパスワードと同じかチェック
        if verify_password(password_data.new_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="新しいパスワードは現在のパスワードと異なる必要があります",
            )

        # パスワード更新
        current_user.hashed_password = get_password_hash(password_data.new_password)

        db.commit()

        return {
            "message": "パスワードが正常に更新されました",
            "updated_at": current_user.updated_at,
        }

    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="パスワード更新に失敗しました。システム管理者にお問い合わせください。",
        )


@router.post("/password-reset")
def request_password_reset(
    reset_data: PasswordResetRequest,
    db: Session = Depends(get_db),
) -> dict:
    """
    パスワードリセット要求

    セキュリティのため、ユーザーが存在しない場合でも成功レスポンスを返します。
    実際のメール送信は現在スタブ実装です。
    """
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_email(reset_data.email)

        if not user:
            # セキュリティのため、ユーザーが存在しない場合でも成功レスポンスを返す
            return {
                "message": "パスワードリセットメールを送信しました",
                "email": reset_data.email,
            }

        # TODO: 実際のメール送信は後で実装（現在はスタブ）
        # リセットトークンを生成（簡易実装）
        reset_token = f"reset_{user.id}_{int(time.time())}"

        # ログ出力（開発環境用）
        print(f"Password reset token for {user.email}: {reset_token}")

        return {
            "message": "パスワードリセットメールを送信しました",
            "email": reset_data.email,
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="パスワードリセット要求の処理に失敗しました。システム管理者にお問い合わせください。",
        )


@router.post("/password-reset/confirm")
def confirm_password_reset(
    confirm_data: PasswordResetConfirm,
    db: Session = Depends(get_db),
) -> dict:
    """
    パスワードリセット確定

    現在は簡易的なトークン検証を実装しています。
    実際の本番環境ではJWTやDBに保存されたトークンを使用することを推奨します。
    """
    try:
        # TODO: 実際のトークン検証は後で実装（現在は簡易実装）
        if not confirm_data.token.startswith("reset_"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="無効なリセットトークンです",
            )

        # 簡易的なトークン解析（実際の実装ではJWTやDBに保存）
        token_parts = confirm_data.token.split("_")
        if len(token_parts) != 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="無効なリセットトークンです",
            )

        user_id = int(token_parts[1])
        user_service = UserService(db)
        user = user_service.get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ユーザーが見つかりません",
            )

        # パスワード更新
        user.hashed_password = get_password_hash(confirm_data.new_password)
        db.commit()

        return {"message": "パスワードが正常にリセットされました", "email": user.email}

    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="パスワードリセットの処理に失敗しました。システム管理者にお問い合わせください。",
        )
