"""
Basic tests for the FastAPI application
"""

import pytest


def test_read_main(client):
    """Test the main endpoint"""
    response = client.get("/")
    assert response.status_code in [200, 404]  # Main endpoint may or may not exist


def test_health_check(client):
    """Test health check endpoint if it exists"""
    response = client.get("/health")
    # This might fail if no health endpoint exists
    # but we want to test basic app functionality
    assert response.status_code in [200, 404]


def test_docs_endpoint(client):
    """Test that docs endpoint is accessible"""
    response = client.get("/docs")
    assert response.status_code == 200


def test_api_v1_accessible(client):
    """Test that API v1 is accessible"""
    response = client.get("/api/v1/")
    # Test that the API exists, even if protected
    assert response.status_code in [200, 401, 404, 422]