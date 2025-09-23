"""
統一エラーレスポンススキーマ
プロダクション品質のエラーハンドリング
"""

from typing import Any, Optional

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """統一エラーレスポンス形式"""

    error: str
    message: str
    status_code: int
    details: Optional[Any] = None


class ValidationErrorDetail(BaseModel):
    """バリデーションエラー詳細"""

    field: str
    message: str
    invalid_value: Any


class ValidationErrorResponse(BaseModel):
    """バリデーションエラーレスポンス"""

    error: str = "Validation Error"
    message: str
    status_code: int = 422
    validation_errors: list[ValidationErrorDetail] = []
