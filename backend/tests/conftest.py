"""
Pytest configuration for tests
"""

import os
import pytest
from fastapi.testclient import TestClient

# Set up environment variables BEFORE any imports
# This ensures database.py has valid environment when it's imported
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["DB_HOST"] = "localhost"
os.environ["DB_PORT"] = "5432"
os.environ["DB_NAME"] = "test_db"
os.environ["DB_USER"] = "test"
os.environ["DB_PASSWORD"] = "test"

# Security
os.environ["SECRET_KEY"] = "test-secret-key-at-least-32-characters-long-for-testing"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

# Application
os.environ["ENVIRONMENT"] = "test"
os.environ["DEBUG"] = "false"

# Redis
os.environ["REDIS_URL"] = "redis://localhost:6379/1"
os.environ["REDIS_HOST"] = "localhost"
os.environ["REDIS_PORT"] = "6379"

# DevRev (optional - can be overridden in tests)
os.environ["DEVREV_APP_ID"] = ""
os.environ["DEVREV_AAT"] = ""


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Test environment setup fixture"""
    # Environment variables are already set above
    yield
    # Cleanup if needed


@pytest.fixture
def client():
    """Create a test client"""
    from app.main import app
    return TestClient(app)