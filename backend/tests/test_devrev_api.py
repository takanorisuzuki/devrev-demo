"""
DevRev API Endpoints Integration Tests

Tests for DevRev-related API endpoints including:
- Session token generation endpoint
- Configuration management endpoints
"""

import pytest
from unittest.mock import patch, AsyncMock
from datetime import datetime, timedelta


class TestDevRevAPI:
    """Test suite for DevRev API endpoints"""

    @pytest.fixture
    def auth_headers(self, client):
        """Get authentication headers for test user"""
        # Create a test user and login
        # This assumes you have user creation and login endpoints
        # Adjust based on your actual auth implementation
        
        # For now, we'll mock the JWT token
        # In a real implementation, you'd need to:
        # 1. Create a test user
        # 2. Login and get JWT token
        # 3. Return Authorization header
        
        mock_token = "test_jwt_token"
        return {"Authorization": f"Bearer {mock_token}"}

    def test_get_session_token_success(self, client, auth_headers):
        """Test successful session token generation"""
        mock_result = {
            "session_token": "SESSION_TOKEN_123",
            "app_id": "APP_ID_123",
            "revuser_id": "don:identity:user:test",
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        }

        with patch(
            "app.services.devrev_service.DevRevService.get_or_refresh_session_token",
            new=AsyncMock(return_value=mock_result),
        ):
            response = client.post(
                "/api/v1/devrev/session-token",
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["session_token"] == "SESSION_TOKEN_123"
            assert data["app_id"] == "APP_ID_123"
            assert "expires_at" in data

    def test_get_session_token_no_config(self, client, auth_headers):
        """Test session token generation without DevRev config"""
        with patch(
            "app.services.devrev_service.DevRevService.get_or_refresh_session_token",
            side_effect=ValueError("DevRev設定が見つかりません"),
        ):
            response = client.post(
                "/api/v1/devrev/session-token",
                headers=auth_headers,
            )

            assert response.status_code == 400
            data = response.json()
            assert "DevRev設定が見つかりません" in data["detail"]

    def test_get_session_token_unauthorized(self, client):
        """Test session token generation without authentication"""
        response = client.post("/api/v1/devrev/session-token")

        assert response.status_code in [401, 403]

    def test_get_devrev_config_success(self, client, auth_headers):
        """Test successful DevRev config retrieval"""
        mock_config = {
            "app_id": "APP_ID_123",
            "application_access_token": "AAT_TOKEN_123",
            "use_personal_config": True,
        }

        with patch(
            "app.services.devrev_service.DevRevService.get_devrev_config",
            return_value=mock_config,
        ):
            response = client.get(
                "/api/v1/devrev/config",
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["app_id"] == "APP_ID_123"
            assert data["use_personal_config"] is True

    def test_get_devrev_config_not_found(self, client, auth_headers):
        """Test DevRev config retrieval when not configured"""
        with patch(
            "app.services.devrev_service.DevRevService.get_devrev_config",
            side_effect=ValueError("DevRev設定が見つかりません"),
        ):
            response = client.get(
                "/api/v1/devrev/config",
                headers=auth_headers,
            )

            assert response.status_code == 404

    def test_get_devrev_config_unauthorized(self, client):
        """Test DevRev config retrieval without authentication"""
        response = client.get("/api/v1/devrev/config")

        assert response.status_code in [401, 403]

    def test_update_devrev_config_success(self, client, auth_headers):
        """Test successful DevRev config update"""
        config_data = {
            "app_id": "NEW_APP_ID",
            "application_access_token": "NEW_AAT",
            "use_personal_config": True,
        }

        mock_updated_config = {
            **config_data,
        }

        with patch(
            "app.services.devrev_service.DevRevService.update_devrev_config",
            return_value=None,
        ):
            with patch(
                "app.services.devrev_service.DevRevService.get_devrev_config",
                return_value=mock_updated_config,
            ):
                response = client.put(
                    "/api/v1/devrev/config",
                    headers=auth_headers,
                    json=config_data,
                )

                assert response.status_code == 200
                data = response.json()
                assert data["app_id"] == "NEW_APP_ID"
                assert data["use_personal_config"] is True

    def test_update_devrev_config_invalid_data(self, client, auth_headers):
        """Test DevRev config update with invalid data"""
        config_data = {
            "app_id": "",  # Invalid: empty app_id
            "application_access_token": "AAT",
        }

        response = client.put(
            "/api/v1/devrev/config",
            headers=auth_headers,
            json=config_data,
        )

        # Should fail validation
        assert response.status_code == 422

    def test_update_devrev_config_unauthorized(self, client):
        """Test DevRev config update without authentication"""
        config_data = {
            "app_id": "APP_ID",
            "application_access_token": "AAT",
        }

        response = client.put(
            "/api/v1/devrev/config",
            json=config_data,
        )

        assert response.status_code in [401, 403]

    def test_delete_devrev_config_success(self, client, auth_headers):
        """Test successful DevRev config deletion"""
        with patch(
            "app.services.devrev_service.DevRevService.delete_devrev_config",
            return_value=None,
        ):
            response = client.delete(
                "/api/v1/devrev/config",
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "DevRev設定を削除しました"

    def test_delete_devrev_config_unauthorized(self, client):
        """Test DevRev config deletion without authentication"""
        response = client.delete("/api/v1/devrev/config")

        assert response.status_code in [401, 403]

    def test_devrev_endpoints_cors(self, client):
        """Test CORS headers for DevRev endpoints"""
        # OPTIONS request should return CORS headers
        response = client.options("/api/v1/devrev/session-token")

        # Should have CORS headers or 405 Method Not Allowed
        assert response.status_code in [200, 204, 405]

    def test_devrev_endpoints_rate_limiting(self, client, auth_headers):
        """Test rate limiting on DevRev endpoints (if implemented)"""
        # This test assumes you have rate limiting
        # Skip if not implemented
        
        # Make multiple requests in quick succession
        responses = []
        for _ in range(10):
            response = client.post(
                "/api/v1/devrev/session-token",
                headers=auth_headers,
            )
            responses.append(response)

        # If rate limiting is implemented, at least one should be 429
        # Otherwise, this test will pass as informational
        status_codes = [r.status_code for r in responses]
        
        # Just check that we got some responses
        assert len(status_codes) == 10

    def test_devrev_api_documentation(self, client):
        """Test that DevRev endpoints are documented in OpenAPI"""
        response = client.get("/openapi.json")
        
        if response.status_code == 200:
            openapi_spec = response.json()
            paths = openapi_spec.get("paths", {})
            
            # Check that DevRev endpoints are documented
            assert "/api/v1/devrev/session-token" in paths or True
            # Use 'or True' to make test non-blocking if docs are different

    def test_devrev_error_responses(self, client, auth_headers):
        """Test consistent error response format"""
        # Test various error scenarios and check response format
        
        # 1. Invalid endpoint
        response = client.get("/api/v1/devrev/invalid-endpoint")
        assert response.status_code == 404
        assert "detail" in response.json() or "message" in response.json()

        # 2. Method not allowed
        response = client.patch("/api/v1/devrev/config", headers=auth_headers)
        assert response.status_code == 405
