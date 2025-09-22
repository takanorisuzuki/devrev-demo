"""
決済API エンドポイント
TDD Green Phase - テストを通すための最小実装
実サーバーTDD開発手法準拠
セキュリティ権限テスト対応
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session
import logging

from app.db.database import get_db
from app.schemas.payment import (
    PaymentRequest,
    PaymentResponse,
    PaymentHistoryResponse,
    RefundRequest,
    RefundResponse,
    AdminPaymentHistoryResponse,
)
from app.schemas.webhook_receipt import (
    WebhookPayload,
    WebhookResponse,
    ReceiptResponse,
)
from app.services.payment import PaymentService
from app.services.webhook_receipt import WebhookReceiptService
from app.api.v1.auth import get_current_user
from app.models.user import User

# 決済API ルーター
router = APIRouter()

# ロガー設定
logger = logging.getLogger(__name__)

# 共通RBAC依存関数と内部エラーヘルパー

def require_roles(*roles: str):
    """要求されたロールのいずれかを持つユーザーのみ許可する依存関数。
    成功時は `User` を返すので、そのまま `current_user` として受け取れる。
    """
    def _dep(user: User = Depends(get_current_user)) -> User:
        if user.role.value not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="この操作には適切な権限が必要です",
            )
        return user

    return _dep


def _internal_error(message: str) -> HTTPException:
    """内部エラーのレスポンスを統一するヘルパー。"""
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={
            "error": "Internal Server Error",
            "message": message,
            "code": "INTERNAL_ERROR",
        },
    )


def get_payment_service(db: Session = Depends(get_db)) -> PaymentService:
    """PaymentServiceの依存性注入"""
    return PaymentService(db)


def get_webhook_receipt_service(db: Session = Depends(get_db)) -> WebhookReceiptService:
    """WebhookReceiptServiceの依存性注入"""
    return WebhookReceiptService(db)


@router.post(
    "/reservations/{reservation_id}/payment",
    response_model=PaymentResponse,
    tags=["payments"],
)
async def process_payment(
    reservation_id: str,
    payment_data: PaymentRequest,
    idempotency_key: Optional[str] = Header(
        default=None,
        alias="Idempotency-Key",
        min_length=8,
        max_length=128,
        regex=r"^[A-Za-z0-9._-]+$",
    ),
    current_user: User = Depends(require_roles("customer")),
    service: PaymentService = Depends(get_payment_service),
) -> PaymentResponse:
    """
    予約の決済処理
    
    - **reservation_id**: 予約ID
    - **payment_method**: 決済方法 (card, cash, bank_transfer)
    - **card_token**: カードトークン (Stripe)
    - **amount**: 決済金額
    - **Idempotency-Key (header)**: 冪等性キー（重複決済防止）
    
    顧客権限が必要です。
    """
    try:
        payment = service.process_payment(
            reservation_id=reservation_id,
            payment_data=payment_data,
            customer_id=str(current_user.id),
            idempotency_key=idempotency_key,
        )
        return payment
        
    except HTTPException as e:
        if e.status_code == status.HTTP_409_CONFLICT:
            logger.exception("duplicate request detected", extra={
                "reservation_id": str(reservation_id),
                "actor": str(current_user.id),
                "idempotency_key": idempotency_key,
            })
        elif e.status_code == status.HTTP_402_PAYMENT_REQUIRED:
            logger.exception("payment declined", extra={
                "reservation_id": str(reservation_id),
                "actor": str(current_user.id),
                "idempotency_key": idempotency_key,
            })
        elif e.status_code == status.HTTP_504_GATEWAY_TIMEOUT:
            logger.exception("payment gateway timeout", extra={
                "reservation_id": str(reservation_id),
                "actor": str(current_user.id),
                "idempotency_key": idempotency_key,
            })
        raise
    except Exception:
        logger.exception("process_payment failed", extra={
            "reservation_id": str(reservation_id),
            "actor": str(current_user.id),
            "idempotency_key": idempotency_key,
        })
        raise _internal_error("決済処理に失敗しました。システム管理者にお問い合わせください。")


@router.get("/history", response_model=PaymentHistoryResponse, tags=["payments"])
async def get_payment_history(
    skip: int = Query(0, ge=0, description="スキップ数"),
    limit: int = Query(50, le=100, description="取得件数上限"),
    current_user: User = Depends(require_roles("customer")),
    service: PaymentService = Depends(get_payment_service),
) -> PaymentHistoryResponse:
    """
    自分の決済履歴を取得する
    
    - **skip**: スキップ数（ページング）
    - **limit**: 取得件数上限（最大100）
    
    顧客権限が必要です。
    RBAC: このエンドポイントは RBAC 依存関数により権限が検証されます。
    """
    try:
        history = service.get_customer_payment_history(
            customer_id=str(current_user.id),
            skip=skip,
            limit=limit
        )
        return history
        
    except Exception:
        logger.exception("get_payment_history failed", extra={
            "actor": str(current_user.id),
            "skip": skip,
            "limit": limit,
        })
        raise _internal_error("決済履歴の取得に失敗しました。システム管理者にお問い合わせください。")


@router.get("/admin", response_model=AdminPaymentHistoryResponse, tags=["payments:admin"])
async def get_all_payments_for_admin(
    skip: int = Query(0, ge=0, description="スキップ数"),
    limit: int = Query(100, le=200, description="取得件数上限"),
    current_user: User = Depends(require_roles("admin")),
    service: PaymentService = Depends(get_payment_service),
) -> AdminPaymentHistoryResponse:
    """
    管理者向け全決済履歴取得
    
    - **skip**: スキップ数（ページング）
    - **limit**: 取得件数上限（最大200）
    
    管理者権限が必要です。
    RBAC: このエンドポイントは RBAC 依存関数により権限が検証されます。
    """
    try:
        history = service.get_all_payments_for_admin(
            skip=skip,
            limit=limit
        )
        return history
        
    except Exception:
        logger.exception("get_all_payments_for_admin failed", extra={
            "actor": str(current_user.id),
            "skip": skip,
            "limit": limit,
        })
        raise _internal_error("決済履歴の取得に失敗しました。システム管理者にお問い合わせください。")


@router.get(
    "/admin",
    response_model=AdminPaymentHistoryResponse,
    tags=["payments:admin"],
)
async def get_admin_payment_history(
    skip: int = Query(default=0, ge=0, description="スキップ数"),
    limit: int = Query(default=100, ge=1, le=1000, description="取得件数上限"),
    current_user: User = Depends(require_roles("admin")),
    service: PaymentService = Depends(get_payment_service),
) -> AdminPaymentHistoryResponse:
    """
    管理者向け全決済履歴取得
    
    - **skip**: スキップ数（デフォルト: 0）
    - **limit**: 取得件数上限（デフォルト: 100、最大: 1000）
    
    管理者権限が必要です。
    RBAC: このエンドポイントは RBAC 依存関数により権限が検証されます。
    
    顧客情報・予約詳細・店舗情報を含む詳細な決済履歴を返します。
    """
    try:
        history = service.get_all_payments_for_admin(skip=skip, limit=limit)
        return history
        
    except Exception:
        logger.exception("get_admin_payment_history failed", extra={
            "actor": str(current_user.id),
            "skip": skip,
            "limit": limit,
        })
        raise _internal_error("決済履歴の取得に失敗しました。システム管理者にお問い合わせください。")


@router.post(
    "/admin/{payment_id}/refund",
    response_model=RefundResponse,
    tags=["payments:admin"],
)
async def process_refund(
    payment_id: str,
    refund_data: RefundRequest,
    idempotency_key: Optional[str] = Header(
        default=None,
        alias="Idempotency-Key",
        min_length=8,
        max_length=128,
        regex=r"^[A-Za-z0-9._-]+$",
    ),
    current_user: User = Depends(require_roles("admin")),
    service: PaymentService = Depends(get_payment_service),
) -> RefundResponse:
    """
    管理者向け返金処理
    
    - **payment_id**: 決済ID
    - **amount**: 返金額
    - **reason**: 返金理由
    - **Idempotency-Key (header)**: 冪等性キー（重複返金防止）
    
    管理者権限が必要です。
    RBAC: このエンドポイントは RBAC 依存関数により権限が検証されます。
    
    冪等性: 同じIdempotency-Keyで複数回呼び出された場合、重複処理を防止します。
    現在は簡易実装（実際の本番環境ではRedisやDBに保存されたキーをチェック）。
    """
    try:
        refund = service.process_refund(
            payment_id=payment_id,
            refund_data=refund_data,
            idempotency_key=idempotency_key
        )
        return refund
        
    except HTTPException as e:
        if e.status_code == status.HTTP_409_CONFLICT:
            logger.exception("duplicate refund request detected", extra={
                "payment_id": payment_id,
                "actor": str(current_user.id),
                "idempotency_key": idempotency_key,
            })
        elif e.status_code == status.HTTP_504_GATEWAY_TIMEOUT:
            logger.exception("refund gateway timeout", extra={
                "payment_id": payment_id,
                "actor": str(current_user.id),
                "idempotency_key": idempotency_key,
            })
        raise
    except Exception:
        logger.exception("process_refund failed", extra={
            "payment_id": payment_id,
            "actor": str(current_user.id),
            "idempotency_key": idempotency_key,
        })
        raise _internal_error("返金処理に失敗しました。システム管理者にお問い合わせください。")


@router.post("/webhook", response_model=WebhookResponse)
async def receive_payment_webhook(
    webhook_payload: WebhookPayload,
    service: WebhookReceiptService = Depends(get_webhook_receipt_service),
):
    """
    決済Webhookを受信する

    - **payment_id**: 決済ID
    - **status**: 決済ステータス
    - **amount**: 決済金額
    - **currency**: 通貨
    - **timestamp**: タイムスタンプ
    - **signature**: Webhook署名
    """
    try:
        result = service.process_webhook(webhook_payload)
        return WebhookResponse(**result)
        
    except ValueError as e:
        # バリデーションエラー（署名検証失敗など）
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "Unauthorized",
                "message": str(e),
                "status_code": 401,
            },
        )
    except Exception:
        # 予期しないエラー
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": "Webhook処理に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )


@router.get("/{payment_id}/receipt", response_model=ReceiptResponse)
async def generate_payment_receipt(
    payment_id: str,
    current_user: User = Depends(require_roles("admin")),
    service: WebhookReceiptService = Depends(get_webhook_receipt_service),
):
    """
    決済領収書を生成する（管理者専用）

    - **payment_id**: 決済ID
    - 管理者権限が必要です
    """
    try:
        result = service.generate_receipt(payment_id)
        return ReceiptResponse(**result)
        
    except ValueError as e:
        # バリデーションエラー（決済が見つからないなど）
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
                "message": "領収書生成に失敗しました。システム管理者にお問い合わせください。",
                "status_code": 500,
            },
        )
