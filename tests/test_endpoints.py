"""Tests for URL Shortener API endpoints"""

import pytest
from uuid import uuid4


class TestCreateURL:
    """Tests for POST /api/v1/urls endpoint"""
    
    def test_create_url_success(self, client, test_user):
        """Test successful URL creation"""
        response = client.post(
            "/api/v1/urls",
            json={"original_url": "https://github.com"},
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["original_url"] == "https://github.com"
        assert data["short_code"] is not None
        assert data["total_clicks"] == 0
        assert data["is_active"] == True
    
    def test_create_url_invalid_format(self, client, test_user):
        """Test URL creation with invalid URL format"""
        response = client.post(
            "/api/v1/urls",
            json={"original_url": "not-a-url"},
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 422
    
    def test_create_url_no_auth(self, client):
        """Test URL creation without authentication"""
        response = client.post(
            "/api/v1/urls",
            json={"original_url": "https://github.com"},
        )
        
        assert response.status_code == 401
    
    def test_create_url_invalid_auth(self, client):
        """Test URL creation with invalid API key"""
        response = client.post(
            "/api/v1/urls",
            json={"original_url": "https://github.com"},
            headers={"Authorization": "Bearer invalid-key"},
        )
        
        assert response.status_code == 401


class TestListURLs:
    """Tests for GET /api/v1/urls endpoint"""
    
    def test_list_urls_empty(self, client, test_user):
        """Test listing URLs when none exist"""
        response = client.get(
            "/api/v1/urls",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_list_urls_with_data(self, client, test_user):
        """Test listing URLs when they exist"""
        # Create a URL first
        client.post(
            "/api/v1/urls",
            json={"original_url": "https://github.com"},
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        # Now list
        response = client.get(
            "/api/v1/urls",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["original_url"] == "https://github.com"
    
    def test_list_urls_no_auth(self, client):
        """Test listing URLs without authentication"""
        response = client.get("/api/v1/urls")
        
        assert response.status_code == 401


class TestGetURLDetails:
    """Tests for GET /api/v1/urls/{url_id} endpoint"""
    
    def test_get_url_details_success(self, client, test_user):
        """Test getting URL details"""
        # Create a URL
        create_response = client.post(
            "/api/v1/urls",
            json={"original_url": "https://github.com"},
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        url_id = create_response.json()["id"]
        
        # Get details
        response = client.get(
            f"/api/v1/urls/{url_id}",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == url_id
        assert data["original_url"] == "https://github.com"
    
    def test_get_url_details_not_found(self, client, test_user):
        """Test getting non-existent URL"""
        response = client.get(
            "/api/v1/urls/99999",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 404


class TestHealthCheck:
    """Tests for GET /health endpoint"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "database" in data

class TestDeleteURL:
    """Tests for DELETE /api/v1/urls/{url_id} endpoint"""
    
    def test_delete_url_success(self, client, test_user):
        """Test successful URL deletion"""
        # Create a URL first
        create_response = client.post(
            "/api/v1/urls",
            json={"original_url": "https://github.com"},
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        url_id = create_response.json()["id"]
        
        # Delete it
        response = client.delete(
            f"/api/v1/urls/{url_id}",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 204
    
    def test_delete_url_not_found(self, client, test_user):
        """Test deleting non-existent URL"""
        response = client.delete(
            "/api/v1/urls/99999",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 404


class TestGetAnalytics:
    """Tests for GET /api/v1/urls/{url_id}/analytics endpoint"""
    
    def test_get_analytics_success(self, client, test_user):
        """Test getting analytics for a URL"""
        # Create a URL
        create_response = client.post(
            "/api/v1/urls",
            json={"original_url": "https://github.com"},
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        url_id = create_response.json()["id"]
        
        # Get analytics
        response = client.get(
            f"/api/v1/urls/{url_id}/analytics",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_clicks"] == 0
        assert "unique_visitors" in data
    
    def test_get_analytics_not_found(self, client, test_user):
        """Test getting analytics for non-existent URL"""
        response = client.get(
            "/api/v1/urls/99999/analytics",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 404
        
