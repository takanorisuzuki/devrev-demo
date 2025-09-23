"""
Vehicle API エンドポイント
実際のDriveRev APIとして動作
プロダクション品質のエラーハンドリング実装
"""

from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import DataError, IntegrityError
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.auth import get_admin_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.availability import (
    AvailabilitySearchRequest,
    AvailabilitySearchResponse,
    VehicleAvailabilityRequest,
    VehicleAvailabilityResponse,
)
from app.schemas.vehicle import (
    StoreInfo,
    VehicleCreate,
    VehicleListResponse,
    VehicleResponse,
    VehicleUpdate,
)
from app.services.availability import AvailabilityService
from app.services.vehicle import VehicleService
from app.utils.validators import validate_license_plate_format, validate_uuid_format

# Vehicle API ルーター
router = APIRouter()


def get_vehicle_service(db: Session = Depends(get_db)) -> VehicleService:
    """VehicleServiceの依存性注入"""
    return VehicleService(db)


def get_availability_service(db: Session = Depends(get_db)) -> AvailabilityService:
    """AvailabilityServiceの依存性注入"""
    return AvailabilityService(db)


def get_admin_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """管理者認証を必要とする現在のユーザーを取得"""
    return get_admin_user(current_user)


def create_store_info(store) -> Optional[StoreInfo]:
    """Store オブジェクトから StoreInfo を作成する"""
    if not store:
        return None

    return StoreInfo(
        id=str(store.id),
        name=store.name,
        address=f"{store.prefecture} {store.city} {store.address_line1}",
    )


@router.get("/", response_model=List[VehicleListResponse])
async def get_all_vehicles(
    category: Optional[str] = Query(None, description="車両カテゴリでフィルタ"),
    make: Optional[str] = Query(None, description="メーカーでフィルタ"),
    fuel_type: Optional[str] = Query(None, description="燃料タイプでフィルタ"),
    is_available: Optional[bool] = Query(True, description="利用可能な車両のみ表示"),
    min_price: Optional[float] = Query(None, ge=0, description="最低価格"),
    max_price: Optional[float] = Query(None, ge=0, description="最高価格"),
    skip: int = Query(0, ge=0, description="スキップ数"),
    limit: int = Query(100, le=100, description="取得件数上限"),
    service: VehicleService = Depends(get_vehicle_service),
):
    """
    全車両を取得する（フィルタリング可能）

    - **category**: compact, suv, premium, sports, electric等
    - **make**: Toyota, Honda, BMW等のメーカー名
    - **fuel_type**: gasoline, electric, hybrid等
    - **is_available**: 利用可能な車両のみ（デフォルト: true）
    - **min_price/max_price**: 価格帯での絞り込み
    """
    try:
        vehicles = service.get_all_vehicles(
            category=category,
            make=make,
            fuel_type=fuel_type,
            is_available=is_available,
            min_price=min_price,
            max_price=max_price,
            skip=skip,
            limit=limit,
        )

        return [
            VehicleListResponse(
                id=str(vehicle.id),
                make=vehicle.make,
                model=vehicle.model,
                year=vehicle.year,
                category=vehicle.category,
                daily_rate=vehicle.daily_rate,
                is_available=vehicle.is_available,
                image_filename=vehicle.image_filename,
                transmission=vehicle.transmission,
                is_smoking_allowed=vehicle.is_smoking_allowed,
                store=create_store_info(vehicle.current_store),
            )
            for vehicle in vehicles
        ]

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "車両一覧の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    current_user: Annotated[User, Depends(get_admin_current_user)],
    service: VehicleService = Depends(get_vehicle_service),
):
    """
    車両を作成する

    - **make**: メーカー名（例: Toyota）
    - **model**: モデル名（例: Prius）
    - **year**: 年式（例: 2023）
    - **daily_rate**: 日額料金（円）
    """
    try:
        # ナンバープレート形式検証
        validate_license_plate_format(vehicle_data.license_plate)

        vehicle = service.create_vehicle(vehicle_data)
        return VehicleResponse(
            id=str(vehicle.id),
            make=vehicle.make,
            model=vehicle.model,
            year=vehicle.year,
            color=vehicle.color,
            license_plate=vehicle.license_plate,
            category=vehicle.category,
            class_type=vehicle.class_type,
            transmission=vehicle.transmission,
            fuel_type=vehicle.fuel_type,
            daily_rate=vehicle.daily_rate,
            is_available=vehicle.is_available,
            is_smoking_allowed=vehicle.is_smoking_allowed,
            image_filename=vehicle.image_filename,
            store_id=str(vehicle.store_id) if vehicle.store_id else None,
            store=create_store_info(vehicle.current_store),
            created_at=vehicle.created_at,
            updated_at=vehicle.updated_at,
        )
    except IntegrityError as e:
        # 重複エラーのハンドリング
        if "license_plate" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error": "Conflict",
                    "message": f"ナンバープレート '{vehicle_data.license_plate}' は既に登録されています。",
                    "status_code": 409,
                },
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error": "Conflict",
                    "message": "データの重複により車両を作成できません。",
                    "status_code": 409,
                },
            )
    except Exception:
        # 予期しないエラーのハンドリング（情報漏洩防止）
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "車両の作成に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: str, service: VehicleService = Depends(get_vehicle_service)
):
    """
    車両をIDで取得する

    - **vehicle_id**: 車両のUUID
    """
    try:
        # UUID形式を検証
        validate_uuid_format(vehicle_id, "車両ID")

        vehicle = service.get_vehicle_by_id(vehicle_id)
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Not Found",
                    "message": "指定された車両が見つかりません。",
                    "status_code": 404,
                    "details": {"vehicle_id": vehicle_id},
                },
            )

        return VehicleResponse(
            id=str(vehicle.id),
            make=vehicle.make,
            model=vehicle.model,
            year=vehicle.year,
            color=vehicle.color,
            license_plate=vehicle.license_plate,
            category=vehicle.category,
            class_type=vehicle.class_type,
            transmission=vehicle.transmission,
            fuel_type=vehicle.fuel_type,
            daily_rate=vehicle.daily_rate,
            is_available=vehicle.is_available,
            is_smoking_allowed=vehicle.is_smoking_allowed,
            image_filename=vehicle.image_filename,
            store_id=str(vehicle.store_id) if vehicle.store_id else None,
            store=create_store_info(vehicle.current_store),
            created_at=vehicle.created_at,
            updated_at=vehicle.updated_at,
        )
    except DataError:
        # SQLAlchemy UUID変換エラー
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Bad Request",
                "message": "無効な車両IDです。正しいUUID形式で入力してください。",
                "status_code": 400,
            },
        )
    except HTTPException:
        raise
    except Exception:
        # 予期しないエラー
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "車両の取得に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    vehicle_data: VehicleUpdate,
    current_user: Annotated[User, Depends(get_admin_current_user)],
    service: VehicleService = Depends(get_vehicle_service),
):
    """
    車両情報を更新する（管理者専用）

    - **vehicle_id**: 車両のUUID
    - 提供されたフィールドのみ更新されます
    - 管理者権限が必要です
    """
    try:
        # UUID形式を検証
        validate_uuid_format(vehicle_id, "車両ID")

        vehicle = service.update_vehicle(vehicle_id, vehicle_data)
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Not Found",
                    "message": "指定された車両が見つかりません。",
                    "status_code": 404,
                    "details": {"vehicle_id": vehicle_id},
                },
            )

        return VehicleResponse(
            id=str(vehicle.id),
            make=vehicle.make,
            model=vehicle.model,
            year=vehicle.year,
            color=vehicle.color,
            license_plate=vehicle.license_plate,
            category=vehicle.category,
            class_type=vehicle.class_type,
            transmission=vehicle.transmission,
            fuel_type=vehicle.fuel_type,
            daily_rate=vehicle.daily_rate,
            is_available=vehicle.is_available,
            is_smoking_allowed=vehicle.is_smoking_allowed,
            image_filename=vehicle.image_filename,
            store_id=str(vehicle.store_id) if vehicle.store_id else None,
            store=create_store_info(vehicle.current_store),
            created_at=vehicle.created_at,
            updated_at=vehicle.updated_at,
        )
    except DataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Bad Request",
                "message": "無効な車両IDです。正しいUUID形式で入力してください。",
                "status_code": 400,
            },
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "車両の更新に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.delete("/{vehicle_id}", status_code=status.HTTP_200_OK)
async def delete_vehicle(
    vehicle_id: str,
    current_user: Annotated[User, Depends(get_admin_current_user)],
    service: VehicleService = Depends(get_vehicle_service),
) -> dict:
    """
    車両を削除する（管理者専用・論理削除）

    - **vehicle_id**: 車両のUUID
    - 論理削除を行い、is_active=false、is_available=falseに設定
    - 管理者権限が必要です
    """
    try:
        # UUID形式を検証
        validate_uuid_format(vehicle_id, "車両ID")

        success = service.delete_vehicle(vehicle_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Not Found",
                    "message": "指定された車両が見つかりません。",
                    "status_code": 404,
                    "details": {"vehicle_id": vehicle_id},
                },
            )

        return {
            "message": "車両を正常に削除しました。",
            "vehicle_id": vehicle_id,
            "deleted_by": current_user.email,
        }
    except DataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Bad Request",
                "message": "無効な車両IDです。正しいUUID形式で入力してください。",
                "status_code": 400,
            },
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "車両の削除に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.post("/availability", response_model=AvailabilitySearchResponse)
async def search_available_vehicles(
    search_request: AvailabilitySearchRequest,
    service: AvailabilityService = Depends(get_availability_service),
):
    """
    空車検索を実行する

    - **start_date**: レンタル開始日
    - **end_date**: レンタル終了日
    - **store_id**: 店舗ID（オプション）
    - **category**: 車両カテゴリ（オプション）
    - **make**: メーカー名（オプション）
    - **fuel_type**: 燃料タイプ（オプション）
    - **min_price/max_price**: 価格帯（オプション）
    """
    try:
        # 空車検索実行
        available_vehicles = service.search_available_vehicles(search_request)

        # 検索期間の日数を計算
        search_period_days = (
            search_request.end_date - search_request.start_date
        ).days + 1

        return AvailabilitySearchResponse(
            available_vehicles=available_vehicles,
            total_count=len(available_vehicles),
            search_criteria=search_request,
            search_period_days=search_period_days,
        )

    except ValueError as e:
        # バリデーションエラー（日付範囲など）
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Bad Request",
                "message": str(e),
                "status_code": 400,
            },
        )
    except Exception:
        # 予期しないエラー
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "空車検索に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.post("/availability/check", response_model=VehicleAvailabilityResponse)
async def check_vehicle_availability(
    request: VehicleAvailabilityRequest,
    service: AvailabilityService = Depends(get_availability_service),
):
    """
    特定車両の空き状況を確認する

    - **vehicle_id**: 車両ID（UUID）
    - **start_date**: レンタル開始日
    - **end_date**: レンタル終了日
    """
    try:
        # 空き状況確認実行
        result = service.check_vehicle_availability(request)

        return result

    except ValueError as e:
        # バリデーションエラー（日付範囲など）
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Bad Request",
                "message": str(e),
                "status_code": 400,
            },
        )
    except Exception:
        # 予期しないエラー
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "空き状況の確認に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )
