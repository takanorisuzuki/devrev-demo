"""
Store API エンドポイント
フロントエンドの店舗選択プルダウン向けAPI実装
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.database import get_db
from app.schemas.store import StoreCreate, StoreResponse, StoreListResponse
from app.schemas.store_hours_policy import (
    StoreHours,
    StorePolicy,
    StoreHoursResponse,
    StorePolicyResponse,
)
from app.services.store import StoreService
from app.services.store_hours_policy import StoreHoursPolicyService
from app.utils.validators import validate_uuid_format


# Store API ルーター
router = APIRouter()


def get_store_service(db: Session = Depends(get_db)) -> StoreService:
    """StoreServiceの依存性注入"""
    return StoreService(db)


def get_store_hours_policy_service(db: Session = Depends(get_db)) -> StoreHoursPolicyService:
    """StoreHoursPolicyServiceの依存性注入"""
    return StoreHoursPolicyService(db)


@router.get("/", response_model=List[StoreListResponse])
async def get_stores(
    skip: int = Query(0, ge=0, description="スキップする件数"),
    limit: int = Query(100, ge=1, le=1000, description="取得する最大件数"),
    prefecture: Optional[str] = Query(None, description="都道府県でフィルタ"),
    city: Optional[str] = Query(None, description="市区町村でフィルタ"),
    is_airport: Optional[bool] = Query(None, description="空港店舗のみ"),
    is_station: Optional[bool] = Query(None, description="駅店舗のみ"),
    is_active: Optional[bool] = Query(True, description="営業中のみ"),
    service: StoreService = Depends(get_store_service),
):
    """
    店舗一覧を取得する

    フロントエンドの店舗選択プルダウンで使用されます。
    デフォルトでは営業中の店舗のみを返します。
    """
    try:
        stores = service.get_stores(
            skip=skip,
            limit=limit,
            prefecture=prefecture,
            city=city,
            is_airport=is_airport,
            is_station=is_station,
            is_active=is_active,
        )

        return [
            StoreListResponse(
                id=str(store.id),
                name=store.name,
                code=store.code,
                prefecture=store.prefecture,
                city=store.city,
                is_airport=store.is_airport,
                is_station=store.is_station,
                is_active=store.is_active,
            )
            for store in stores
        ]
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "店舗一覧の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(store_id: str, service: StoreService = Depends(get_store_service)):
    """
    店舗をIDで取得する

    - **store_id**: 店舗のUUID
    """
    try:
        # UUID形式を検証
        validate_uuid_format(store_id, "店舗ID")

        store = service.get_store_by_id(store_id)
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Not Found",
                    "message": "指定された店舗が見つかりません。",
                    "status_code": 404,
                    "details": {"store_id": store_id},
                },
            )

        return StoreResponse(
            id=str(store.id),
            name=store.name,
            code=store.code,
            prefecture=store.prefecture,
            city=store.city,
            address_line1=store.address_line1,
            address_line2=store.address_line2,
            postal_code=store.postal_code,
            phone=store.phone,
            email=store.email,
            latitude=store.latitude,
            longitude=store.longitude,
            is_airport=store.is_airport,
            is_station=store.is_station,
            is_active=store.is_active,
            created_at=store.created_at,
            updated_at=store.updated_at,
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "店舗の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.post("/", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
async def create_store(
    store_data: StoreCreate, service: StoreService = Depends(get_store_service)
):
    """
    店舗を作成する（管理者用）

    - **name**: 店舗名
    - **code**: 店舗コード（一意）
    - **prefecture**: 都道府県
    - **city**: 市区町村
    - **address_line1**: 住所1
    """
    try:
        store = service.create_store(store_data)
        return StoreResponse(
            id=str(store.id),
            name=store.name,
            code=store.code,
            prefecture=store.prefecture,
            city=store.city,
            address_line1=store.address_line1,
            address_line2=store.address_line2,
            postal_code=store.postal_code,
            phone=store.phone,
            email=store.email,
            latitude=store.latitude,
            longitude=store.longitude,
            is_airport=store.is_airport,
            is_station=store.is_station,
            is_active=store.is_active,
            created_at=store.created_at,
            updated_at=store.updated_at,
        )
    except IntegrityError as e:
        # 重複エラーのハンドリング
        if "code" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error": "Conflict",
                    "message": f"店舗コード '{store_data.code}' は既に登録されています。",
                    "status_code": 409,
                },
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error": "Conflict",
                    "message": "データの重複により店舗を作成できません。",
                    "status_code": 409,
                },
            )
    except Exception:
        # 予期しないエラーのハンドリング
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "店舗の作成に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.get("/{store_id}/hours", response_model=StoreHoursResponse)
async def get_store_hours(
    store_id: str,
    service: StoreHoursPolicyService = Depends(get_store_hours_policy_service),
):
    """
    店舗営業時間を取得する

    - **store_id**: 店舗ID
    """
    try:
        result = service.get_store_hours(store_id)
        return result
        
    except ValueError as e:
        # バリデーションエラー（店舗が見つからないなど）
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "Not Found",
                "message": str(e),
                "status_code": 404,
            },
        )
    except Exception:
        # 予期しないエラー
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "営業時間の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.put("/{store_id}/hours", response_model=StoreHoursResponse)
async def update_store_hours(
    store_id: str,
    hours: StoreHours,
    service: StoreHoursPolicyService = Depends(get_store_hours_policy_service),
):
    """
    店舗営業時間を更新する（管理者専用）

    - **store_id**: 店舗ID
    - **hours**: 営業時間データ
    """
    try:
        result = service.update_store_hours(store_id, hours)
        return result
        
    except ValueError as e:
        # バリデーションエラー（店舗が見つからない、時間フォーマットエラーなど）
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "Unprocessable Entity",
                "message": str(e),
                "status_code": 422,
            },
        )
    except Exception:
        # 予期しないエラー
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "営業時間の更新に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.get("/{store_id}/policy", response_model=StorePolicyResponse)
async def get_store_policy(
    store_id: str,
    service: StoreHoursPolicyService = Depends(get_store_hours_policy_service),
):
    """
    店舗ポリシーを取得する

    - **store_id**: 店舗ID
    """
    try:
        result = service.get_store_policy(store_id)
        return result
        
    except ValueError as e:
        # バリデーションエラー（店舗が見つからないなど）
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "Not Found",
                "message": str(e),
                "status_code": 404,
            },
        )
    except Exception:
        # 予期しないエラー
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "ポリシーの取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.put("/{store_id}/policy", response_model=StorePolicyResponse)
async def update_store_policy(
    store_id: str,
    policy: StorePolicy,
    service: StoreHoursPolicyService = Depends(get_store_hours_policy_service),
):
    """
    店舗ポリシーを更新する（管理者専用）

    - **store_id**: 店舗ID
    - **policy**: ポリシーデータ
    """
    try:
        result = service.update_store_policy(store_id, policy)
        return result
        
    except ValueError as e:
        # バリデーションエラー（店舗が見つからない、ポリシー値エラーなど）
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "Unprocessable Entity",
                "message": str(e),
                "status_code": 422,
            },
        )
    except Exception:
        # 予期しないエラー
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "ポリシーの更新に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )
