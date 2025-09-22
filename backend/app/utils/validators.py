"""
バリデーションユーティリティ
プロダクション品質のバリデーション機能
"""

import uuid
from fastapi import HTTPException


def validate_uuid_format(value: str, field_name: str = "ID") -> str:
    """
    UUID形式を検証する

    Args:
        value: 検証するUUID文字列
        field_name: エラーメッセージ用のフィールド名

    Returns:
        検証済みUUID文字列

    Raises:
        HTTPException: UUID形式が無効な場合（400 Bad Request）
    """
    try:
        uuid.UUID(value)
        return value
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Bad Request",
                "message": f"無効な{field_name}です。正しいUUID形式で入力してください。",
                "status_code": 400,
                "details": {
                    "invalid_value": value,
                    "expected_format": "UUID (e.g., 550e8...440000)",
                },
            },
        )


def validate_license_plate_format(license_plate: str) -> str:
    """
    ナンバープレート形式を検証する

    Args:
        license_plate: 検証するナンバープレート

    Returns:
        検証済みナンバープレート

    Raises:
        HTTPException: 形式が無効な場合（400 Bad Request）
    """
    if not license_plate or len(license_plate.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Bad Request",
                "message": "ナンバープレートは必須です。",
                "status_code": 400,
            },
        )

    # 簡単な形式チェック（実際のプロダクションではより厳密に）
    if len(license_plate) > 20:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Bad Request",
                "message": "ナンバープレートは20文字以下で入力してください。",
                "status_code": 400,
            },
        )

    return license_plate.strip()
