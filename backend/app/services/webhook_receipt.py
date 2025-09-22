"""
決済Webhook/領収書サービス
TDD Green Phase - 最小実装
"""

from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
import hashlib
import hmac
import logging

from app.models.reservation import Reservation
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.webhook_receipt import WebhookPayload, ReceiptData

logger = logging.getLogger(__name__)


class WebhookReceiptService:
    """決済Webhook/領収書サービス"""

    def __init__(self, db: Session):
        self.db = db
        self.webhook_secret = "webhook_secret_key"  # 実際の環境では環境変数から取得

    def process_webhook(self, webhook_payload: WebhookPayload) -> Dict[str, Any]:
        """Webhookを処理する"""
        try:
            # 署名検証
            if not self._verify_signature(webhook_payload):
                raise ValueError("無効なWebhook署名です")

            # 決済情報を更新
            reservation = self._update_payment_status(
                webhook_payload.payment_id,
                webhook_payload.status,
                webhook_payload.amount
            )

            if not reservation:
                raise ValueError(f"決済ID {webhook_payload.payment_id} が見つかりません")

            logger.info(f"Webhook processed successfully for payment {webhook_payload.payment_id}")

            return {
                "status": "received",
                "message": "Webhook処理が完了しました",
                "payment_id": webhook_payload.payment_id,
                "processed_at": datetime.now()
            }

        except Exception as e:
            logger.error(f"Webhook processing failed: {str(e)}")
            raise

    def generate_receipt(self, payment_id: str) -> Dict[str, Any]:
        """領収書を生成する"""
        try:
            # 予約情報を取得（決済IDは予約のIDとして使用）
            reservation = self.db.query(Reservation).filter(
                Reservation.id == payment_id
            ).first()
            
            if not reservation:
                raise ValueError(f"決済ID {payment_id} が見つかりません")

            # 車両情報を取得
            vehicle = self.db.query(Vehicle).filter(
                Vehicle.id == reservation.vehicle_id
            ).first()

            # 顧客情報を取得
            customer = self.db.query(User).filter(
                User.id == reservation.customer_id
            ).first()

            # 領収書データを構築
            receipt_data = ReceiptData(
                payment_id=payment_id,
                amount=float(reservation.total_amount),
                currency="JPY",
                customer_name=customer.full_name if customer else "不明",
                customer_email=customer.email if customer else "不明",
                vehicle_info={
                    "make": vehicle.make if vehicle else "不明",
                    "model": vehicle.model if vehicle else "不明",
                    "year": vehicle.year if vehicle else "不明",
                    "license_plate": vehicle.license_plate if vehicle else "不明"
                },
                rental_period={
                    "start_date": str(reservation.pickup_datetime.date()),
                    "end_date": str(reservation.return_datetime.date())
                },
                issued_at=datetime.now()
            )

            return {
                "receipt_data": receipt_data,
                "pdf_url": f"/api/v1/payments/{payment_id}/receipt.pdf",
                "download_url": f"/api/v1/payments/{payment_id}/receipt/download"
            }

        except Exception as e:
            logger.error(f"Receipt generation failed: {str(e)}")
            raise

    def _verify_signature(self, webhook_payload: WebhookPayload) -> bool:
        """Webhook署名を検証する"""
        try:
            # 実際の署名検証ロジック（簡易版）
            expected_signature = self._calculate_signature(webhook_payload)
            return hmac.compare_digest(webhook_payload.signature, expected_signature)
        except Exception:
            return False

    def _calculate_signature(self, webhook_payload: WebhookPayload) -> str:
        """署名を計算する"""
        message = f"{webhook_payload.payment_id}:{webhook_payload.status}:{webhook_payload.amount}"
        return hmac.new(
            self.webhook_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

    def _update_payment_status(self, payment_id: str, status: str, amount: float) -> Optional[Reservation]:
        """決済ステータスを更新する"""
        try:
            reservation = self.db.query(Reservation).filter(Reservation.id == payment_id).first()
            if reservation:
                reservation.payment_status = status
                reservation.total_amount = amount
                reservation.updated_at = datetime.now()
                self.db.commit()
            return reservation
        except Exception as e:
            logger.error(f"Payment status update failed: {str(e)}")
            self.db.rollback()
            return None
