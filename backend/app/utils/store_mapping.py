"""
店舗IDマッピングユーティリティ
デモサイト用の店舗ID（store-1, store-2等）とバックエンドUUIDの対応管理
"""

from typing import Dict, Optional
from uuid import UUID


class StoreMapping:
    """店舗IDマッピング管理クラス"""
    
    # デモ店舗IDとバックエンドUUIDの対応表
    # 実際の運用では、データベースから動的に取得することを推奨
    DEMO_STORE_MAPPING: Dict[str, str] = {
        "store-1": "ad3653cd-ba84-4f27-8fb3-198b25596aba",  # 東京駅店
        "store-2": "b8464cde-ba95-4f38-8fc4-209c36607bcb",  # 新宿店
        "store-3": "c9575def-cb06-4f49-8fd5-310d47718cdc",  # 渋谷店
        "store-4": "d0686ef0-dc17-4f5a-8fe6-421e58829ded",  # 横浜店
        "store-5": "e1797f01-ed28-4f6b-8ff7-532f69930efe",  # 大阪店
    }
    
    @classmethod
    def get_backend_store_id(cls, demo_store_id: str) -> Optional[str]:
        """
        デモ店舗IDをバックエンドUUIDに変換
        
        Args:
            demo_store_id: デモ店舗ID（例: "store-1"）
            
        Returns:
            バックエンドUUID文字列、見つからない場合はNone
        """
        return cls.DEMO_STORE_MAPPING.get(demo_store_id)
    
    @classmethod
    def get_demo_store_id(cls, backend_store_id: str) -> Optional[str]:
        """
        バックエンドUUIDをデモ店舗IDに変換
        
        Args:
            backend_store_id: バックエンドUUID文字列
            
        Returns:
            デモ店舗ID（例: "store-1"）、見つからない場合はNone
        """
        for demo_id, backend_id in cls.DEMO_STORE_MAPPING.items():
            if backend_id == backend_store_id:
                return demo_id
        return None
    
    @classmethod
    def is_valid_demo_store_id(cls, demo_store_id: str) -> bool:
        """
        デモ店舗IDが有効かどうかをチェック
        
        Args:
            demo_store_id: デモ店舗ID
            
        Returns:
            有効な場合はTrue、無効な場合はFalse
        """
        return demo_store_id in cls.DEMO_STORE_MAPPING
    
    @classmethod
    def get_all_demo_store_ids(cls) -> list[str]:
        """
        すべてのデモ店舗IDを取得
        
        Returns:
            デモ店舗IDのリスト
        """
        return list(cls.DEMO_STORE_MAPPING.keys())
    
    @classmethod
    def get_all_backend_store_ids(cls) -> list[str]:
        """
        すべてのバックエンド店舗IDを取得
        
        Returns:
            バックエンドUUIDのリスト
        """
        return list(cls.DEMO_STORE_MAPPING.values())
