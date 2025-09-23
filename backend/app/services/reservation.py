"""
予約ビジネスロジックサービス
TDD Green Phase - テストを通すための最小実装
プロダクション品質の予約管理
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Dict, List, Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.reservation import Reservation
from app.models.store import Store
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.reservation import (
    ReservationCreate,
    ReservationQuote,
    ReservationUpdate,
)
from app.services.price_calculator import PriceCalculator


class ReservationService:
    """予約関連のビジネスロジック"""

    def __init__(self, db: Session):
        """
        初期化

        Args:
            db: データベースセッション
        """
        self.db = db
        self.price_calculator = PriceCalculator()

    def create_reservation(
        self, reservation_data: ReservationCreate, customer_id: str
    ) -> Reservation:
        """
        予約を作成する

        Args:
            reservation_data: 予約作成データ
            customer_id: 顧客ID

        Returns:
            作成された予約

        Raises:
            HTTPException: バリデーションエラーまたは業務エラー
        """
        # 1. 基本妥当性検証
        if not self.price_calculator.validate_reservation_dates(
            reservation_data.pickup_datetime, reservation_data.return_datetime
        ):
            # より詳細なエラーメッセージを提供
            pickup_dt = reservation_data.pickup_datetime
            return_dt = reservation_data.return_datetime

            if return_dt <= pickup_dt:
                detail = "返却日時は借り出し日時より後に設定してください。"
            elif pickup_dt <= datetime.now(timezone.utc):
                detail = "借り出し日時は現在時刻より後に設定してください。"
            elif return_dt - pickup_dt > timedelta(days=30):
                detail = "レンタル期間は30日以内に設定してください。"
            else:
                detail = "予約日時が無効です。"

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail,
            )

        # 2. 車両存在確認
        vehicle = (
            self.db.query(Vehicle)
            .filter(Vehicle.id == reservation_data.vehicle_id)
            .first()
        )
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="指定された車両が見つかりません。",
            )

        # 3. 店舗存在確認
        pickup_store = (
            self.db.query(Store)
            .filter(Store.id == reservation_data.pickup_store_id)
            .first()
        )
        return_store = (
            self.db.query(Store)
            .filter(Store.id == reservation_data.return_store_id)
            .first()
        )
        if not pickup_store or not return_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="指定された店舗が見つかりません。",
            )

        # 4. 空車確認
        availability_result = self._check_vehicle_availability(
            reservation_data.vehicle_id,
            reservation_data.pickup_datetime,
            reservation_data.return_datetime,
        )
        if not availability_result["available"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=availability_result["reason"],
            )

        # 5. 顧客情報確認
        customer = self.db.query(User).filter(User.id == customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="顧客情報が見つかりません。",
            )

        # 6. 料金計算
        quote = self.calculate_quote(
            ReservationQuote(
                vehicle_id=reservation_data.vehicle_id,
                pickup_datetime=reservation_data.pickup_datetime,
                return_datetime=reservation_data.return_datetime,
                options=reservation_data.options or {},
                points_to_use=reservation_data.points_to_use,
            ),
            customer_id,
        )

        # 7. 確認番号生成
        confirmation_number = self._generate_confirmation_number()

        # 8. 予約レコード作成
        reservation_dict = {
            "confirmation_number": confirmation_number,
            "customer_id": customer_id,
            "vehicle_id": reservation_data.vehicle_id,
            "pickup_store_id": reservation_data.pickup_store_id,
            "return_store_id": reservation_data.return_store_id,
            "pickup_datetime": reservation_data.pickup_datetime,
            "return_datetime": reservation_data.return_datetime,
            "status": "pending",
            "base_rate": quote["base_rate"],
            "duration_hours": quote["duration_hours"],
            "subtotal": quote["subtotal"],
            "options": reservation_data.options,
            "option_fees": quote["option_fees"],
            "insurance_fee": quote["insurance_fee"],
            "tax_amount": quote["tax_amount"],
            "total_amount": quote["total_amount"],
            "member_discount": quote["member_discount"],
            "points_used": reservation_data.points_to_use or 0,
            "points_earned": int(
                quote["total_amount"] * Decimal("0.01")
            ),  # 1%ポイント還元
            "special_requests": reservation_data.special_requests,
            "payment_status": "pending",
        }

        db_reservation = Reservation(**reservation_dict)

        try:
            self.db.add(db_reservation)
            self.db.commit()
            self.db.refresh(db_reservation)
            return db_reservation
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="予約作成中にエラーが発生しました。",
            )

    def calculate_quote(
        self, quote_data: ReservationQuote, customer_id: str
    ) -> Dict[str, Decimal]:
        """
        見積もりを計算する

        Args:
            quote_data: 見積もりデータ
            customer_id: 顧客ID

        Returns:
            料金詳細
        """
        # 車両情報取得
        vehicle = (
            self.db.query(Vehicle).filter(Vehicle.id == quote_data.vehicle_id).first()
        )
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="指定された車両が見つかりません。",
            )

        # 顧客情報取得（会員判定用）
        customer = self.db.query(User).filter(User.id == customer_id).first()
        is_member = customer and customer.role == "customer"  # 簡易会員判定

        # 料金計算
        return self.price_calculator.calculate_quote(
            vehicle=vehicle,
            pickup_datetime=quote_data.pickup_datetime,
            return_datetime=quote_data.return_datetime,
            options=quote_data.options,
            customer_is_member=is_member,
            points_to_use=quote_data.points_to_use or 0,
        )

    def get_reservation_by_id(
        self, reservation_id: str, customer_id: str
    ) -> Optional[Reservation]:
        """
        予約をIDで取得する

        Args:
            reservation_id: 予約ID
            customer_id: 顧客ID（本人確認用）

        Returns:
            予約データ（存在しない場合はNone）
        """
        return (
            self.db.query(Reservation)
            .options(
                joinedload(Reservation.vehicle),
                joinedload(Reservation.pickup_store),
                joinedload(Reservation.return_store),
            )
            .filter(
                Reservation.id == reservation_id, Reservation.customer_id == customer_id
            )
            .first()
        )

    def get_customer_reservations(
        self,
        customer_id: str,
        status: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> List[Reservation]:
        """
        顧客の予約一覧を取得する

        Args:
            customer_id: 顧客ID
            status: ステータスフィルター
            limit: 取得件数上限
            skip: スキップ数

        Returns:
            予約リスト
        """
        query = (
            self.db.query(Reservation)
            .options(
                joinedload(Reservation.vehicle),
                joinedload(Reservation.pickup_store),
                joinedload(Reservation.return_store),
            )
            .filter(Reservation.customer_id == customer_id)
        )

        if status:
            query = query.filter(Reservation.status == status)

        return (
            query.order_by(Reservation.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_all_reservations_for_admin(
        self,
        status: Optional[str] = None,
        customer_email: Optional[str] = None,
        vehicle_id: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> List[Reservation]:
        """
        管理者向け全予約一覧を取得する

        Args:
            status: ステータスフィルター
            customer_email: 顧客メールアドレスでフィルタ
            vehicle_id: 車両IDでフィルタ
            limit: 取得件数上限
            skip: スキップ数

        Returns:
            予約リスト
        """
        query = self.db.query(Reservation).options(
            joinedload(Reservation.vehicle),
            joinedload(Reservation.pickup_store),
            joinedload(Reservation.return_store),
            joinedload(Reservation.customer),
        )

        # ステータスフィルタ
        if status:
            query = query.filter(Reservation.status == status)

        # 車両IDフィルタ
        if vehicle_id:
            query = query.filter(Reservation.vehicle_id == vehicle_id)

        # 顧客メールアドレスフィルタ
        if customer_email:
            query = query.join(User).filter(User.email.ilike(f"%{customer_email}%"))

        return (
            query.order_by(Reservation.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_reservation_status_for_admin(
        self, reservation_id: str, new_status: str, reason: Optional[str] = None
    ) -> Reservation:
        """
        管理者による予約ステータス更新

        Args:
            reservation_id: 予約ID
            new_status: 新しいステータス
            reason: 変更理由

        Returns:
            更新された予約

        Raises:
            HTTPException: 予約が見つからない場合
        """
        # 予約を取得（管理者なので customer_id チェックなし）
        reservation = (
            self.db.query(Reservation).filter(Reservation.id == reservation_id).first()
        )

        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="指定された予約が見つかりません",
            )

        # ステータス更新
        reservation.status = new_status

        # 変更理由がある場合はspecial_requestsに追加
        if reason:
            current_requests = reservation.special_requests or ""
            status_update_note = f"\n[管理者変更] {new_status}: {reason}"
            reservation.special_requests = current_requests + status_update_note

        self.db.commit()
        self.db.refresh(reservation)

        return reservation

    def cancel_reservation(
        self, reservation_id: str, customer_id: str, reason: str = None
    ) -> Reservation:
        """
        予約をキャンセルする

        Args:
            reservation_id: 予約ID
            customer_id: 顧客ID
            reason: キャンセル理由

        Returns:
            キャンセルされた予約

        Raises:
            HTTPException: 予約が見つからないまたはキャンセル不可
        """
        reservation = self.get_reservation_by_id(reservation_id, customer_id)
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="指定された予約が見つかりません。",
            )

        if reservation.status in ["cancelled", "completed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="この予約はキャンセルできません。",
            )

        # キャンセル処理
        reservation.status = "cancelled"
        reservation.cancellation_reason = reason
        reservation.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(reservation)

        return reservation

    def update_customer_reservation(
        self, reservation_id: str, customer_id: str, update_data: ReservationUpdate
    ) -> Reservation:
        """
        顧客による予約更新

        Args:
            reservation_id: 予約ID
            customer_id: 顧客ID
            update_data: 更新データ

        Returns:
            更新された予約

        Raises:
            HTTPException: 予約が見つからない、更新不可、期限切れ等
        """
        # 予約取得・権限チェック
        reservation = self.get_reservation_by_id(reservation_id, customer_id)
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="指定された予約が見つかりません。",
            )

        # ステータスチェック
        if reservation.status in ["cancelled", "completed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="この予約は変更できません。",
            )

        # 変更期限チェック（借り出し24時間前まで）
        from datetime import timedelta, timezone

        change_deadline = reservation.pickup_datetime - timedelta(hours=24)
        if datetime.now(timezone.utc) >= change_deadline:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="予約変更期限（借り出し24時間前）を過ぎています。",
            )

        # 更新データ適用
        needs_price_recalc = False
        update_dict = update_data.model_dump(exclude_unset=True)

        # 日時変更の場合は車両空き状況をチェック
        if "pickup_datetime" in update_dict or "return_datetime" in update_dict:
            new_pickup = update_dict.get("pickup_datetime", reservation.pickup_datetime)
            new_return = update_dict.get("return_datetime", reservation.return_datetime)

            if not self._is_vehicle_available(
                str(reservation.vehicle_id), new_pickup, new_return, reservation_id
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="指定された日時では車両が利用できません。",
                )
            needs_price_recalc = True

        # 店舗変更の場合も料金再計算が必要
        if "pickup_store_id" in update_dict or "return_store_id" in update_dict:
            needs_price_recalc = True

        # データ更新
        for field, value in update_dict.items():
            setattr(reservation, field, value)

        reservation.updated_at = datetime.now(timezone.utc)

        # 料金再計算（日時・店舗変更時）
        if needs_price_recalc:
            # 簡単な料金再計算（実際はもっと複雑）
            duration_hours = (
                reservation.return_datetime - reservation.pickup_datetime
            ).total_seconds() / 3600
            vehicle = (
                self.db.query(Vehicle)
                .filter(Vehicle.id == reservation.vehicle_id)
                .first()
            )
            if vehicle:
                reservation.base_rate = vehicle.daily_rate * Decimal(
                    str(duration_hours / 24)
                )
                # 簡略化した総額再計算
                option_fees = reservation.option_fees or Decimal("0")
                insurance_fee = reservation.insurance_fee or Decimal("0")
                tax_amount = reservation.tax_amount or Decimal("0")
                reservation.total_amount = (
                    reservation.base_rate + option_fees + insurance_fee + tax_amount
                )

        self.db.commit()
        self.db.refresh(reservation)

        return reservation

    def _check_vehicle_availability(
        self,
        vehicle_id: str,
        pickup_datetime: datetime,
        return_datetime: datetime,
        exclude_reservation_id: Optional[str] = None,
    ) -> Dict[str, any]:
        """
        車両の空き状況を詳細に確認する

        Args:
            vehicle_id: 車両ID
            pickup_datetime: 借り出し日時
            return_datetime: 返却日時
            exclude_reservation_id: 除外する予約ID（更新時用）

        Returns:
            {"available": bool, "reason": str, "conflicting_reservations": List}
        """
        # デバッグログ（本番では削除推奨）
        # print(f"DEBUG: _check_vehicle_availability called with:")
        # print(f"  vehicle_id: {vehicle_id}")
        # print(f"  pickup_datetime: {pickup_datetime}")
        # print(f"  return_datetime: {return_datetime}")

        query = self.db.query(Reservation).filter(
            Reservation.vehicle_id == vehicle_id,
            Reservation.status.in_(["pending", "confirmed", "active"]),
            # 時間重複チェック：既存の予約と新しい予約の時間が重複するかチェック
            # 重複条件: 既存の借り出し日時 < 新しい返却日時 AND 既存の返却日時 > 新しい借り出し日時
            Reservation.pickup_datetime < return_datetime,
            Reservation.return_datetime > pickup_datetime,
        )

        if exclude_reservation_id:
            query = query.filter(Reservation.id != exclude_reservation_id)

        conflicting_reservations = query.all()

        if conflicting_reservations:
            # 重複する予約の詳細を取得
            conflict_details = []
            for reservation in conflicting_reservations:
                conflict_details.append(
                    {
                        "confirmation_number": reservation.confirmation_number,
                        "pickup_datetime": reservation.pickup_datetime,
                        "return_datetime": reservation.return_datetime,
                        "status": reservation.status,
                    }
                )

            # 最も近い重複予約を特定
            closest_conflict = min(
                conflicting_reservations,
                key=lambda r: abs(
                    (r.pickup_datetime - pickup_datetime).total_seconds()
                ),
            )

            pickup_str = pickup_datetime.strftime("%Y年%m月%d日 %H:%M")
            return_str = return_datetime.strftime("%Y年%m月%d日 %H:%M")
            existing_pickup = closest_conflict.pickup_datetime.strftime(
                "%Y年%m月%d日 %H:%M"
            )
            existing_return = closest_conflict.return_datetime.strftime(
                "%Y年%m月%d日 %H:%M"
            )

            reason = (
                f"指定された期間（{pickup_str} ～ {return_str}）は、"
                f"既存の予約（確認番号: {closest_conflict.confirmation_number}）と重複しています。"
            )
            reason += f" 既存の予約期間: {existing_pickup} ～ {existing_return}"

            return {
                "available": False,
                "reason": reason,
                "conflicting_reservations": conflict_details,
            }

        return {"available": True, "reason": "", "conflicting_reservations": []}

    def _is_vehicle_available(
        self,
        vehicle_id: str,
        pickup_datetime: datetime,
        return_datetime: datetime,
        exclude_reservation_id: Optional[str] = None,
    ) -> bool:
        """
        車両の空き状況を確認する（後方互換性のため）

        Args:
            vehicle_id: 車両ID
            pickup_datetime: 借り出し日時
            return_datetime: 返却日時
            exclude_reservation_id: 除外する予約ID（更新時用）

        Returns:
            利用可能フラグ
        """
        result = self._check_vehicle_availability(
            vehicle_id, pickup_datetime, return_datetime, exclude_reservation_id
        )
        return result["available"]

    def _generate_confirmation_number(self) -> str:
        """
        確認番号を生成する

        Returns:
            ユニークな確認番号
        """
        import random
        import string
        from datetime import datetime

        # RES + YYYYMMDD + 3桁ランダム数字
        today = datetime.now(timezone.utc).strftime("%Y%m%d")
        random_suffix = "".join(random.choices(string.digits, k=3))

        confirmation_number = f"RES{today}{random_suffix}"

        # 重複チェック
        existing = (
            self.db.query(Reservation)
            .filter(Reservation.confirmation_number == confirmation_number)
            .first()
        )

        # 重複していたら再生成（実際にはより堅牢な実装が必要）
        if existing:
            return self._generate_confirmation_number()

        return confirmation_number
