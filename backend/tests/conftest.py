"""
Pytest configuration for tests
"""

import os
import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Set up test environment variables"""
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["SECRET_KEY"] = "test-secret-key"
    os.environ["ENVIRONMENT"] = "test"
    os.environ["REDIS_URL"] = "redis://localhost:6379/1"


@pytest.fixture
def client():
    """Create a test client"""
    from app.main import app
    return TestClient(app)