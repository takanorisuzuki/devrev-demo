"""
データベース設定
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# データベースエンジンの作成
engine = create_engine(
    settings.DATABASE_URL or "sqlite:///./test.db",
    pool_pre_ping=True,
    echo=settings.DEBUG,  # デバッグモードでSQLログを出力
)

# セッションファクトリの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base クラス
Base = declarative_base()


def get_db():
    """データベースセッション取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
