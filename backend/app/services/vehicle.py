"""
車両CRUDサービス
TDD Green Phase - テストを通すための最小実装
ビジネスロジック層
"""

from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


class VehicleService:
    """車両関連のビジネスロジック"""

    def __init__(self, db: Session):
        """
        Args:
            db: データベースセッション
        """
        self.db = db

    def create_vehicle(self, vehicle_data: VehicleCreate) -> Vehicle:
        """
        車両を作成する

        Args:
            vehicle_data: 車両作成データ

        Returns:
            作成された車両
        """
        # VehicleCreateからSQLAlchemyモデル用のdictに変換
        vehicle_dict = vehicle_data.model_dump()

        # SQLAlchemy Vehicleモデルのインスタンス作成
        db_vehicle = Vehicle(**vehicle_dict)

        # データベースに保存
        self.db.add(db_vehicle)
        self.db.commit()
        self.db.refresh(db_vehicle)

        return db_vehicle

    def get_vehicle_by_id(self, vehicle_id: str) -> Optional[Vehicle]:
        """
        IDで車両を取得する

        Args:
            vehicle_id: 車両ID

        Returns:
            車両データ（存在しない場合はNone）
        """
        return (
            self.db.query(Vehicle)
            .options(joinedload(Vehicle.current_store))
            .filter(Vehicle.id == vehicle_id)
            .first()
        )

    def get_all_vehicles(
        self,
        category: Optional[str] = None,
        make: Optional[str] = None,
        fuel_type: Optional[str] = None,
        is_available: Optional[bool] = True,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Vehicle]:
        """
        フィルタリング付きで全車両を取得する

        Args:
            category: 車両カテゴリ (compact, suv, premium等)
            make: メーカー名
            fuel_type: 燃料タイプ (gasoline, electric, hybrid等)
            is_available: 利用可能フラグ
            min_price: 最低価格
            max_price: 最高価格
            skip: スキップ数（ページング）
            limit: 取得件数上限

        Returns:
            車両データリスト
        """
        query = self.db.query(Vehicle).options(joinedload(Vehicle.current_store))

        # フィルタリング条件を追加
        if category:
            query = query.filter(Vehicle.category == category)
        if make:
            query = query.filter(Vehicle.make == make)
        if fuel_type:
            query = query.filter(Vehicle.fuel_type == fuel_type)
        if is_available is not None:
            query = query.filter(Vehicle.is_available == is_available)
        if min_price is not None:
            query = query.filter(Vehicle.daily_rate >= min_price)
        if max_price is not None:
            query = query.filter(Vehicle.daily_rate <= max_price)

        # ページング適用と結果返却
        return query.offset(skip).limit(limit).all()

    def update_vehicle(
        self, vehicle_id: str, vehicle_data: VehicleUpdate
    ) -> Optional[Vehicle]:
        """
        車両情報を更新する

        Args:
            vehicle_id: 車両ID
            vehicle_data: 更新データ

        Returns:
            更新された車両（存在しない場合はNone）
        """
        db_vehicle = self.get_vehicle_by_id(vehicle_id)
        if not db_vehicle:
            return None

        # 提供されたフィールドのみ更新
        update_data = vehicle_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_vehicle, field, value)

        self.db.commit()
        self.db.refresh(db_vehicle)

        return db_vehicle

    def delete_vehicle(self, vehicle_id: str) -> bool:
        """
        車両を削除する（論理削除: is_active = False）

        Args:
            vehicle_id: 車両ID

        Returns:
            削除成功フラグ
        """
        db_vehicle = self.get_vehicle_by_id(vehicle_id)
        if not db_vehicle:
            return False

        # 論理削除
        db_vehicle.is_active = False
        db_vehicle.is_available = False  # 削除時は利用不可にする
        self.db.commit()

        return True
