"""
SQLAlchemy モデル
全モデルをインポートしてAlembicに認識させる
"""

from app.db.database import Base
from app.models.reservation import Reservation
from app.models.store import Store
from app.models.user import User
from app.models.vehicle import Vehicle

# Alembicが認識できるように全モデルをリストアップ
__all__ = ["Base", "User", "Vehicle", "Store", "Reservation"]
