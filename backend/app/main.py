"""
DriveRev FastAPI メインアプリケーション
TDD Green Phase - テストを通すための最小実装
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    # 起動時の処理
    print(f"🚀 {settings.APP_NAME} API v{settings.APP_VERSION} starting up...")
    print(f"📍 Environment: {settings.ENVIRONMENT}")
    print(f"🔧 Debug mode: {settings.DEBUG}")
    print("📚 Documentation: http://localhost:8000/docs")

    yield

    # 終了時の処理
    print(f"👋 {settings.APP_NAME} API shutting down...")


# FastAPIアプリケーション作成
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="DriveRev レンタカーサービス API",
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# CORS設定 - フロントエンド統合対応
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# APIルーターを追加
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Welcome to DriveRev API",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": settings.ENVIRONMENT,
    }


@app.get(f"{settings.API_PREFIX}/info")
async def api_info():
    """API情報エンドポイント"""
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "DriveRev レンタカーサービス API",
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX,
        "environment": settings.ENVIRONMENT,
    }


# カスタム404エラーハンドラー
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """404エラーのカスタムハンドラー"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested endpoint was not found",
            "path": str(request.url.path),
            "app_name": settings.APP_NAME,
        },
    )
