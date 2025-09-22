"""
API v1 ルーター統合
"""

from fastapi import APIRouter

from app.api.v1 import (admin_reservations, admin_stats, admin_stores,
                        admin_users, auth, payments, reservations, stores,
                        system_settings, vehicles)

# API v1 ルーター
api_router = APIRouter()

# 基本機能
api_router.include_router(auth.router, prefix="/auth", tags=["認証"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["車両"])
api_router.include_router(stores.router, prefix="/stores", tags=["店舗"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["予約"])
api_router.include_router(payments.router, prefix="/payments", tags=["決済"])

# 管理者機能
api_router.include_router(
    admin_users.router, prefix="/admin/users", tags=["管理者ユーザー管理"]
)
api_router.include_router(
    admin_reservations.router, prefix="/admin/reservations", tags=["管理者予約管理"]
)
api_router.include_router(admin_stats.router, prefix="/admin", tags=["管理者統計"])
api_router.include_router(
    admin_stores.router, prefix="/admin/stores", tags=["管理者店舗管理"]
)

# システム機能
api_router.include_router(system_settings.router, prefix="", tags=["システム設定"])
