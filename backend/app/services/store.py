"""
店舗管理サービス
TDD Green Phase - CRUD操作の実装
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.store import Store
from app.schemas.store import StoreCreate, StoreUpdate


class StoreService:
    """店舗管理サービスクラス"""

    def __init__(self, db: Session):
        self.db = db

    def create_store(self, store_data: StoreCreate) -> Store:
        """店舗を作成する"""
        db_store = Store(
            name=store_data.name,
            code=store_data.code,
            prefecture=store_data.prefecture,
            city=store_data.city,
            address_line1=store_data.address_line1,
            address_line2=store_data.address_line2,
            postal_code=store_data.postal_code,
            phone=store_data.phone,
            email=store_data.email,
            latitude=store_data.latitude,
            longitude=store_data.longitude,
            is_airport=store_data.is_airport,
            is_station=store_data.is_station,
            is_active=store_data.is_active,
        )

        self.db.add(db_store)
        self.db.commit()
        self.db.refresh(db_store)
        return db_store

    def get_store_by_id(self, store_id: str) -> Optional[Store]:
        """IDで店舗を取得する"""
        return self.db.query(Store).filter(Store.id == store_id).first()

    def get_store_by_code(self, store_code: str) -> Optional[Store]:
        """店舗コードで店舗を取得する"""
        return self.db.query(Store).filter(Store.code == store_code).first()

    def get_stores(
        self,
        skip: int = 0,
        limit: int = 100,
        prefecture: Optional[str] = None,
        city: Optional[str] = None,
        is_airport: Optional[bool] = None,
        is_station: Optional[bool] = None,
        is_active: Optional[bool] = True,
    ) -> List[Store]:
        """店舗一覧を取得する（フィルタリング可能）"""
        query = self.db.query(Store)

        # フィルタリング条件を適用
        filters = []

        if prefecture:
            filters.append(Store.prefecture == prefecture)

        if city:
            filters.append(Store.city == city)

        if is_airport is not None:
            filters.append(Store.is_airport == is_airport)

        if is_station is not None:
            filters.append(Store.is_station == is_station)

        if is_active is not None:
            filters.append(Store.is_active == is_active)

        if filters:
            query = query.filter(and_(*filters))

        return query.offset(skip).limit(limit).all()

    def get_active_stores(self) -> List[Store]:
        """営業中の店舗一覧を取得する"""
        return self.db.query(Store).filter(Store.is_active.is_(True)).all()

    def get_stores_by_prefecture(self, prefecture: str) -> List[Store]:
        """都道府県別の店舗一覧を取得する"""
        return (
            self.db.query(Store)
            .filter(and_(Store.prefecture == prefecture, Store.is_active.is_(True)))
            .all()
        )

    def update_store(self, store_id: str, store_data: StoreUpdate) -> Optional[Store]:
        """店舗情報を更新する"""
        db_store = self.get_store_by_id(store_id)
        if not db_store:
            return None

        # 更新可能なフィールドを設定
        for field, value in store_data.model_dump(exclude_unset=True).items():
            setattr(db_store, field, value)

        self.db.commit()
        self.db.refresh(db_store)
        return db_store

    def delete_store(self, store_id: str) -> bool:
        """店舗を削除する（論理削除: is_active = False）"""
        db_store = self.get_store_by_id(store_id)
        if not db_store:
            return False

        # 論理削除
        db_store.is_active = False
        self.db.commit()
        return True
