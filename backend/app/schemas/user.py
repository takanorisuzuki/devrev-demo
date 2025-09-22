"""
ユーザー関連のPydanticスキーマ
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    """ユーザー基本スキーマ"""

    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)


class UserCreate(UserBase):
    """ユーザー作成スキーマ"""

    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole = UserRole.customer

    @field_validator("password")
    def validate_password(cls, v):
        """パスワードの複雑性をチェック"""
        if len(v) < 8:
            raise ValueError("パスワードは8文字以上である必要があります")
        if not any(c.isupper() for c in v):
            raise ValueError("パスワードには大文字を含む必要があります")
        if not any(c.islower() for c in v):
            raise ValueError("パスワードには小文字を含む必要があります")
        if not any(c.isdigit() for c in v):
            raise ValueError("パスワードには数字を含む必要があります")
        return v


class UserProfileUpdate(BaseModel):
    """プロフィール更新スキーマ（ログインユーザー用）"""

    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)


class UserUpdate(BaseModel):
    """ユーザー更新スキーマ（管理者用）"""

    phone_number: Optional[str] = Field(None, max_length=20)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class UserPasswordUpdate(BaseModel):
    """パスワード更新スキーマ"""

    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    def validate_new_password(cls, v):
        """新パスワードの複雑性をチェック"""
        if len(v) < 8:
            raise ValueError("パスワードは8文字以上である必要があります")
        if not any(c.isupper() for c in v):
            raise ValueError("パスワードには大文字を含む必要があります")
        if not any(c.islower() for c in v):
            raise ValueError("パスワードには小文字を含む必要があります")
        if not any(c.isdigit() for c in v):
            raise ValueError("パスワードには数字を含む必要があります")
        return v


class UserResponse(UserBase):
    """ユーザーレスポンススキーマ"""

    id: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        """UUIDオブジェクトを文字列に変換"""
        if hasattr(v, 'hex'):  # UUIDオブジェクトの場合
            return str(v)
        return v


class UserLogin(BaseModel):
    """ログインスキーマ"""

    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    """パスワードリセット要求スキーマ"""

    email: EmailStr = Field(..., description="メールアドレス")


class PasswordResetConfirm(BaseModel):
    """パスワードリセット確定スキーマ"""

    token: str = Field(..., description="リセットトークン")
    new_password: str = Field(..., min_length=8, max_length=128, description="新しいパスワード")

    @field_validator("new_password")
    def validate_new_password(cls, v):
        """新パスワードの複雑性をチェック"""
        if len(v) < 8:
            raise ValueError("パスワードは8文字以上である必要があります")
        if not any(c.isupper() for c in v):
            raise ValueError("パスワードには大文字を含む必要があります")
        if not any(c.islower() for c in v):
            raise ValueError("パスワードには小文字を含む必要があります")
        if not any(c.isdigit() for c in v):
            raise ValueError("パスワードには数字を含む必要があります")
        return v


class AdminPasswordReset(BaseModel):
    """管理者によるパスワードリセットスキーマ"""

    new_password: str = Field(..., min_length=8, max_length=128, description="新しいパスワード")
    reason: Optional[str] = Field(None, max_length=200, description="パスワードリセット理由")

    @field_validator("new_password")
    def validate_new_password(cls, v):
        """新パスワードの複雑性をチェック"""
        if len(v) < 8:
            raise ValueError("パスワードは8文字以上である必要があります")
        if not any(c.isupper() for c in v):
            raise ValueError("パスワードには大文字を含む必要があります")
        if not any(c.islower() for c in v):
            raise ValueError("パスワードには小文字を含む必要があります")
        if not any(c.isdigit() for c in v):
            raise ValueError("パスワードには数字を含む必要があります")
        return v


class AdminUserCreate(UserBase):
    """管理者による新規ユーザー作成スキーマ"""

    password: str = Field(..., min_length=8, max_length=128, description="初期パスワード")
    role: UserRole = Field(..., description="ユーザーロール")
    is_active: bool = Field(True, description="アクティブ状態")
    is_verified: bool = Field(False, description="認証状態")

    @field_validator("password")
    def validate_password(cls, v):
        """パスワードの複雑性をチェック"""
        if len(v) < 8:
            raise ValueError("パスワードは8文字以上である必要があります")
        if not any(c.isupper() for c in v):
            raise ValueError("パスワードには大文字を含む必要があります")
        if not any(c.islower() for c in v):
            raise ValueError("パスワードには小文字を含む必要があります")
        if not any(c.isdigit() for c in v):
            raise ValueError("パスワードには数字を含む必要があります")
        return v


class Token(BaseModel):
    """トークンレスポンス"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: Optional[str] = None
    user: UserResponse


class TokenData(BaseModel):
    """トークンデータ"""

    email: Optional[str] = None
    role: Optional[str] = None
