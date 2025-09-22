"""
管理者用店舗管理API
TDD Green Phase - テストを通すための最小実装
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.database import get_db
from app.schemas.store import StoreCreate, StoreResponse, StoreListResponse, StoreUpdate
from app.services.store import StoreService
from app.utils.validators import validate_uuid_format
from app.core.auth import get_admin_user
from app.api.v1.auth import get_current_user
from app.models.user import User


# 管理者用店舗管理API ルーター
router = APIRouter()


def get_store_service(db: Session = Depends(get_db)) -> StoreService:
    """StoreServiceの依存性注入"""
    return StoreService(db)


def get_admin_current_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """管理者認証を必要とする現在のユーザーを取得"""
    return get_admin_user(current_user)


@router.get("/", response_model=dict)
async def get_all_stores(
    skip: int = Query(0, ge=0, description="スキップする件数"),
    limit: int = Query(100, ge=1, le=1000, description="取得する最大件数"),
    prefecture: Optional[str] = Query(None, description="都道府県でフィルタ"),
    city: Optional[str] = Query(None, description="市区町村でフィルタ"),
    is_airport: Optional[bool] = Query(None, description="空港店舗のみ"),
    is_station: Optional[bool] = Query(None, description="駅店舗のみ"),
    is_active: Optional[bool] = Query(None, description="営業中のみ"),
    service: StoreService = Depends(get_store_service),
    current_user: User = Depends(get_admin_current_user),
):
    """
    管理者用店舗一覧取得
    
    管理者権限が必要です。
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

        store_list = [
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

        return {
            "stores": store_list,
            "total": len(store_list),
            "pagination": {
                "skip": skip,
                "limit": limit,
                "has_more": len(store_list) == limit
            }
        }
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
async def get_store_detail(
    store_id: str,
    service: StoreService = Depends(get_store_service),
    current_user: User = Depends(get_admin_current_user),
):
    """
    管理者用店舗詳細取得
    
    管理者権限が必要です。
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
    store_data: StoreCreate,
    service: StoreService = Depends(get_store_service),
    current_user: User = Depends(get_admin_current_user),
):
    """
    管理者用店舗作成
    
    管理者権限が必要です。
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


@router.put("/{store_id}", response_model=StoreResponse)
async def update_store(
    store_id: str,
    store_data: StoreUpdate,
    service: StoreService = Depends(get_store_service),
    current_user: User = Depends(get_admin_current_user),
):
    """
    管理者用店舗更新
    
    管理者権限が必要です。
    """
    try:
        # UUID形式を検証
        validate_uuid_format(store_id, "店舗ID")

        store = service.update_store(store_id, store_data)
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
                "message": "店舗の更新に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.delete("/{store_id}")
async def delete_store(
    store_id: str,
    service: StoreService = Depends(get_store_service),
    current_user: User = Depends(get_admin_current_user),
):
    """
    管理者用店舗削除
    
    管理者権限が必要です。
    """
    try:
        # UUID形式を検証
        validate_uuid_format(store_id, "店舗ID")

        success = service.delete_store(store_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Not Found",
                    "message": "指定された店舗が見つかりません。",
                    "status_code": 404,
                    "details": {"store_id": store_id},
                },
            )

        return {
            "message": "店舗が正常に削除されました",
            "store_id": store_id
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "店舗の削除に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )
