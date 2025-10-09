"""
決済サービス
TDD Green Phase - テストを通すための最小実装
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.enums import PaymentStatus, ReservationStatus
from app.models.reservation import Reservation
from app.models.store import Store
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.payment import (
    AdminPaymentHistoryResponse,
    AdminPaymentStats,
    PaymentHistoryResponse,
    PaymentRequest,
    PaymentResponse,
    RefundRequest,
    RefundResponse,
)


class PaymentService:
    """決済関連のビジネスロジック"""

    def __init__(self, db: Session):
        """
        初期化

        Args:
            db: データベースセッション
        """
        self.db = db

    def process_payment(
        self,
        reservation_id: str,
        payment_data: PaymentRequest,
        customer_id: str,
        idempotency_key: Optional[str] = None,
    ) -> PaymentResponse:
        """
        決済処理を実行する

        Args:
            reservation_id: 予約ID
            payment_data: 決済データ
            customer_id: 顧客ID
            idempotency_key: 冪等性キー（重複決済防止）

        Returns:
            決済レスポンス
        """
        # 1. 冪等性キーの確認（重複決済防止）
        if idempotency_key:
            existing_payment = (
                self.db.query(Reservation)
                .filter(
                    Reservation.id == reservation_id,
                    Reservation.payment_reference == idempotency_key,
                )
                .first()
            )
            if existing_payment:
                # 既存の決済を返す
                return PaymentResponse(
                    payment_id=existing_payment.payment_reference,
                    payment_status=existing_payment.payment_status,
                    transaction_id=existing_payment.payment_reference,
                    amount=existing_payment.total_amount,
                    currency="JPY",
                    created_at=existing_payment.updated_at,
                    failure_reason=(
                        "カードが拒否されました"
                        if existing_payment.payment_status == PaymentStatus.FAILED.value
                        else None
                    ),
                )

        # 2. 予約の存在確認
        reservation = (
            self.db.query(Reservation)
            .filter(
                Reservation.id == reservation_id, Reservation.customer_id == customer_id
            )
            .first()
        )

        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="予約が見つかりません"
            )

        # 3. 決済金額の妥当性確認
        if payment_data.amount != reservation.total_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="決済金額が予約金額と一致しません",
            )

        # 4. 決済処理（Stripe統合は後で実装）
        payment_id = str(uuid.uuid4())
        transaction_id = f"txn_{payment_id[:8]}"

        # 決済成功をシミュレート（実際はStripe API呼び出し）
        payment_status = PaymentStatus.COMPLETED
        failure_reason = None
        failure_code = None
        failure_details = None

        if payment_data.card_token == "tok_failed_card":
            payment_status = PaymentStatus.FAILED
            failure_reason = "カードが拒否されました"
            failure_code = "CARD_DECLINED"
            failure_details = "カード会社により決済が拒否されました。カードの有効性や残高をご確認ください。"
        elif payment_data.card_token == "tok_declined_card":
            payment_status = PaymentStatus.FAILED
            failure_reason = "カードが利用停止されています"
            failure_code = "CARD_BLOCKED"
            failure_details = (
                "カードが利用停止されています。カード会社にお問い合わせください。"
            )

        # 5. 予約の決済情報を更新
        reservation.payment_method = payment_data.payment_method
        reservation.payment_status = payment_status.value
        reservation.payment_reference = transaction_id
        reservation.updated_at = datetime.utcnow()

        # 決済成功時は予約ステータスをconfirmedに更新
        if (
            payment_status == PaymentStatus.COMPLETED
            and reservation.status == ReservationStatus.PENDING.value
        ):
            reservation.status = ReservationStatus.CONFIRMED.value

        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="決済処理中にエラーが発生しました",
            )

        # 6. 決済レスポンス作成
        return PaymentResponse(
            payment_id=payment_id,
            payment_status=payment_status.value,
            transaction_id=(
                transaction_id
                if payment_status == PaymentStatus.COMPLETED
                else None
            ),
            amount=payment_data.amount,
            currency=payment_data.currency,
            created_at=datetime.utcnow(),
            failure_reason=failure_reason,
            failure_code=failure_code,
            failure_details=failure_details,
        )

    def get_customer_payment_history(
        self, customer_id: str, skip: int = 0, limit: int = 50
    ) -> PaymentHistoryResponse:
        """
        顧客の決済履歴を取得する

        Args:
            customer_id: 顧客ID
            skip: スキップ数
            limit: 取得件数上限

        Returns:
            決済履歴レスポンス
        """
        # 顧客の予約で決済済みのものを取得（車両情報も含む）
        reservations = (
            self.db.query(Reservation, Vehicle)
            .join(Vehicle, Reservation.vehicle_id == Vehicle.id)
            .filter(
                Reservation.customer_id == customer_id,
                Reservation.payment_status.in_(
                    [
                        PaymentStatus.COMPLETED.value,
                        PaymentStatus.FAILED.value,
                    ]
                ),
            )
            .order_by(Reservation.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        # 決済履歴レスポンス作成
        payments = []
        total_amount = Decimal("0")

        for reservation, vehicle in reservations:
            if reservation.payment_reference:
                # 車両名を作成
                vehicle_name = (
                    f"{vehicle.make} {vehicle.model}" if vehicle else "車両情報なし"
                )

                payments.append(
                    PaymentResponse(
                        payment_id=reservation.payment_reference,
                        payment_status=reservation.payment_status,
                        transaction_id=reservation.payment_reference,
                        amount=reservation.total_amount,
                        currency="JPY",
                        created_at=reservation.updated_at,
                        failure_reason=(
                            "カードが拒否されました"
                            if reservation.payment_status == PaymentStatus.FAILED.value
                            else None
                        ),
                        failure_code=(
                            "CARD_DECLINED"
                            if reservation.payment_status == PaymentStatus.FAILED.value
                            else None
                        ),
                        failure_details=(
                            "カード会社により決済が拒否されました。カードの有効性や残高をご確認ください。"
                            if reservation.payment_status == PaymentStatus.FAILED.value
                            else None
                        ),
                        # 車両情報を追加
                        vehicle_name=vehicle_name,
                        pickup_date=reservation.pickup_datetime,
                        return_date=reservation.return_datetime,
                        payment_method=reservation.payment_method,
                    )
                )

                if reservation.payment_status == PaymentStatus.COMPLETED.value:
                    total_amount += reservation.total_amount

        return PaymentHistoryResponse(
            payments=payments, total_count=len(payments), total_amount=total_amount
        )

    def get_all_payments_for_admin(
        self, skip: int = 0, limit: int = 100
    ) -> AdminPaymentHistoryResponse:
        """
        管理者用全決済履歴を取得する

        Args:
            skip: スキップ数
            limit: 取得件数上限

        Returns:
            管理者用決済履歴レスポンス
        """
        # 全予約で決済済みのものを取得（車両・顧客・店舗情報も含む）
        reservations = (
            self.db.query(Reservation, Vehicle, User, Store)
            .join(Vehicle, Reservation.vehicle_id == Vehicle.id)
            .join(User, Reservation.customer_id == User.id)
            .join(Store, Reservation.pickup_store_id == Store.id)
            .filter(
                Reservation.payment_status.in_(
                    [
                        PaymentStatus.COMPLETED.value,
                        PaymentStatus.FAILED.value,
                    ]
                )
            )
            .order_by(Reservation.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        # 決済履歴と統計作成
        payments = []
        total_payments = 0
        total_amount = Decimal("0")
        successful_payments = 0
        failed_payments = 0
        refunded_amount = Decimal("0")

        for reservation, vehicle, customer, store in reservations:
            if reservation.payment_reference:
                # 車両名を作成
                vehicle_name = (
                    f"{vehicle.make} {vehicle.model}" if vehicle else "車両情報なし"
                )

                payments.append(
                    PaymentResponse(
                        payment_id=reservation.payment_reference,
                        payment_status=reservation.payment_status,
                        transaction_id=reservation.payment_reference,
                        amount=reservation.total_amount,
                        currency="JPY",
                        created_at=reservation.updated_at,
                        failure_reason=(
                            "カードが拒否されました"
                            if reservation.payment_status == PaymentStatus.FAILED.value
                            else None
                        ),
                        failure_code=(
                            "CARD_DECLINED"
                            if reservation.payment_status == PaymentStatus.FAILED.value
                            else None
                        ),
                        failure_details=(
                            "カード会社により決済が拒否されました。カードの有効性や残高をご確認ください。"
                            if reservation.payment_status == PaymentStatus.FAILED.value
                            else None
                        ),
                        # 車両情報を追加
                        vehicle_name=vehicle_name,
                        pickup_date=reservation.pickup_datetime,
                        return_date=reservation.return_datetime,
                        payment_method=reservation.payment_method,
                        # 管理者用決済履歴に必要な顧客・予約情報を追加
                        customer_name=(
                            customer.full_name if customer else "顧客情報なし"
                        ),
                        customer_email=(
                            customer.email if customer else "メールアドレスなし"
                        ),
                        customer_id=str(customer.id) if customer else None,
                        reservation_id=str(reservation.id),
                        store_name=store.name if store else "店舗情報なし",
                        pickup_datetime=reservation.pickup_datetime,
                        return_datetime=reservation.return_datetime,
                    )
                )

                total_payments += 1
                if reservation.payment_status == PaymentStatus.COMPLETED.value:
                    successful_payments += 1
                    total_amount += reservation.total_amount
                elif reservation.payment_status == PaymentStatus.FAILED.value:
                    failed_payments += 1

        # 統計作成
        payment_stats = AdminPaymentStats(
            total_payments=total_payments,
            total_amount=total_amount,
            successful_payments=successful_payments,
            failed_payments=failed_payments,
            refunded_amount=refunded_amount,
        )

        return AdminPaymentHistoryResponse(
            payments=payments, payment_stats=payment_stats, total_count=len(payments)
        )

    def process_refund(
        self,
        payment_id: str,
        refund_data: RefundRequest,
        idempotency_key: Optional[str] = None,
    ) -> RefundResponse:
        """
        返金処理を実行する

        Args:
            payment_id: 決済ID
            refund_data: 返金データ
            idempotency_key: 冪等性キー（重複返金防止）

        Returns:
            返金レスポンス
        """
        # 1. 冪等性チェック（簡易実装）
        if idempotency_key:
            # TODO: 実際の本番環境ではRedisやDBに保存されたキーをチェック
            # 現在は簡易的な重複チェック（同じ決済IDで既に返金済みかチェック）
            existing_refund = (
                self.db.query(Reservation)
                .filter(
                    Reservation.payment_reference == payment_id,
                    Reservation.payment_status == PaymentStatus.REFUNDED.value,
                )
                .first()
            )

            if existing_refund:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="この返金は既に処理済みです",
                )

        # 2. 決済の存在確認
        reservation = (
            self.db.query(Reservation)
            .filter(Reservation.payment_reference == payment_id)
            .first()
        )

        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="決済が見つかりません"
            )

        # 3. 返金額の妥当性確認
        if refund_data.amount > reservation.total_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="返金額が決済金額を超えています",
            )

        # 4. 返金処理（Stripe統合は後で実装）
        refund_id = str(uuid.uuid4())
        refund_status = PaymentStatus.COMPLETED

        # 5. 予約の決済ステータスを更新
        reservation.payment_status = PaymentStatus.REFUNDED.value
        reservation.updated_at = datetime.utcnow()

        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="返金処理中にエラーが発生しました",
            )

        # 6. 返金レスポンス作成
        return RefundResponse(
            refund_id=refund_id,
            refund_status=refund_status.value,
            amount=refund_data.amount,
            reason=refund_data.reason,
            created_at=datetime.utcnow(),
        )
