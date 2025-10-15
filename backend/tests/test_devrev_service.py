"""
DevRev Service Unit Tests

Tests for DevRev integration service including:
- Session token generation
- Configuration management
- Personal/Global settings
"""

import os
import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock, patch, AsyncMock
from sqlalchemy.orm import Session

from app.services.devrev_service import DevRevService
from app.models.user import User


class TestDevRevService:
    """Test suite for DevRev Service"""

    @pytest.fixture
    def mock_db(self):
        """Create a mock database session"""
        db = Mock(spec=Session)
        db.commit = Mock()
        db.refresh = Mock()
        return db

    @pytest.fixture
    def test_user(self):
        """Create a test user"""
        user = User(
            id=1,
            email="test@example.com",
            full_name="Test User",
            hashed_password="hashed",
            devrev_app_id=None,
            devrev_application_access_token=None,
            devrev_use_personal_config=False,
            devrev_revuser_id=None,
            devrev_session_token=None,
            devrev_session_expires_at=None,
        )
        return user

    @pytest.fixture
    def test_user_with_config(self):
        """Create a test user with DevRev config"""
        user = User(
            id=1,
            email="test@example.com",
            full_name="Test User",
            hashed_password="hashed",
            devrev_app_id="APP_ID_123",
            devrev_application_access_token="AAT_TOKEN_123",
            devrev_use_personal_config=True,
            devrev_revuser_id="don:identity:user:test",
            devrev_session_token="SESSION_TOKEN_123",
            devrev_session_expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        return user

    def test_get_devrev_config_personal(self, mock_db, test_user_with_config):
        """Test getting personal DevRev config"""
        service = DevRevService(mock_db)

        config = service.get_devrev_config(test_user_with_config)

        assert config["mode"] == "personal"
        assert config["app_id"] == "APP_ID_123"
        assert config["has_aat"] is True
        assert config["revuser_id"] == "don:identity:user:test"

    def test_get_devrev_config_global(self, mock_db, test_user):
        """Test getting global DevRev config"""
        service = DevRevService(mock_db)

        with patch("app.core.config.settings.DEVREV_GLOBAL_APP_ID", "GLOBAL_APP_ID"):
            with patch("app.core.config.settings.DEVREV_GLOBAL_AAT", "GLOBAL_AAT"):
                config = service.get_devrev_config(test_user)

                assert config["mode"] == "global"
                assert config["app_id"] == "GLOBAL_APP_ID"
                assert config["has_aat"] is True

    def test_update_devrev_config(self, mock_db, test_user):
        """Test updating DevRev config"""
        service = DevRevService(mock_db)

        updated_user = service.update_devrev_config(
            test_user,
            app_id="NEW_APP_ID",
            aat="NEW_AAT",
            use_personal_config=True
        )

        assert updated_user.devrev_app_id == "NEW_APP_ID"
        assert updated_user.devrev_application_access_token == "NEW_AAT"
        assert updated_user.devrev_use_personal_config is True
        # Session token should be cleared when AAT is updated
        assert updated_user.devrev_session_token is None

    def test_delete_devrev_config(self, mock_db, test_user_with_config):
        """Test deleting DevRev config"""
        service = DevRevService(mock_db)

        updated_user = service.delete_devrev_config(test_user_with_config)

        assert updated_user.devrev_app_id is None
        assert updated_user.devrev_application_access_token is None
        assert updated_user.devrev_use_personal_config is False
        assert updated_user.devrev_session_token is None

    def test_is_session_token_valid_with_valid_token(self, mock_db, test_user_with_config):
        """Test session token validity check with valid token"""
        service = DevRevService(mock_db)

        is_valid = service._is_session_token_valid(test_user_with_config)

        assert is_valid is True

    def test_is_session_token_valid_with_expired_token(self, mock_db, test_user_with_config):
        """Test session token validity check with expired token"""
        # Set expired token
        test_user_with_config.devrev_session_expires_at = (
            datetime.now(timezone.utc) - timedelta(hours=1)
        )

        service = DevRevService(mock_db)

        is_valid = service._is_session_token_valid(test_user_with_config)

        assert is_valid is False

    def test_is_session_token_valid_without_token(self, mock_db, test_user):
        """Test session token validity check without token"""
        service = DevRevService(mock_db)

        is_valid = service._is_session_token_valid(test_user)

        assert is_valid is False

    def test_get_effective_aat_personal(self, mock_db, test_user_with_config):
        """Test getting effective AAT with personal config"""
        service = DevRevService(mock_db)

        aat = service._get_effective_aat(test_user_with_config)

        assert aat == "AAT_TOKEN_123"

    def test_get_effective_aat_global(self, mock_db, test_user):
        """Test getting effective AAT with global config"""
        service = DevRevService(mock_db)

        with patch("app.core.config.settings.DEVREV_GLOBAL_AAT", "GLOBAL_AAT"):
            aat = service._get_effective_aat(test_user)

            assert aat == "GLOBAL_AAT"

    def test_get_effective_aat_none(self, mock_db, test_user):
        """Test getting effective AAT when none configured"""
        service = DevRevService(mock_db)

        with patch("app.core.config.settings.DEVREV_GLOBAL_AAT", None):
            aat = service._get_effective_aat(test_user)

            assert aat is None

    @pytest.mark.asyncio
    async def test_generate_session_token_success(self, mock_db, test_user_with_config):
        """Test successful session token generation"""
        service = DevRevService(mock_db)

        mock_response = Mock()
        mock_response.json.return_value = {
            "session_token": "NEW_SESSION_TOKEN",
            "revuser_id": "don:identity:user:test"
        }
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=mock_response)):
            session_token, revuser_id = await service._generate_session_token(test_user_with_config)

            assert session_token == "NEW_SESSION_TOKEN"
            assert revuser_id == "don:identity:user:test"

    @pytest.mark.asyncio
    async def test_generate_session_token_no_aat(self, mock_db, test_user):
        """Test session token generation without AAT"""
        service = DevRevService(mock_db)

        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="Application Access Token"):
                await service._generate_session_token(test_user)
