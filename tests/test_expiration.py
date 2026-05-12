"""Tests for URL expiration policies"""

import pytest
from datetime import datetime, timezone, timedelta
from app.expiration import (
    check_if_expired,
    check_if_expiring_soon,
    get_time_until_expiration,
    ExpirationPolicyType
)


class TestExpirationPolicies:
    """Tests for expiration policy logic"""
    
    def test_create_url_with_days_policy(self, client, test_user):
        """Test creating URL with days-based expiration"""
        response = client.post(
            "/api/v1/urls",
            json={
                "original_url": "https://github.com",
                "expiration_policy": "days",
                "expires_after_days": 30
            },
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["original_url"] == "https://github.com"
        assert data["short_code"] is not None
    
    def test_create_url_with_date_policy(self, client, test_user):
        """Test creating URL with date-based expiration"""
        expires_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        
        response = client.post(
            "/api/v1/urls",
            json={
                "original_url": "https://github.com",
                "expiration_policy": "date",
                "expires_at": expires_at
            },
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["original_url"] == "https://github.com"
    
    def test_create_url_with_clicks_policy(self, client, test_user):
        """Test creating URL with clicks-based expiration"""
        response = client.post(
            "/api/v1/urls",
            json={
                "original_url": "https://github.com",
                "expiration_policy": "clicks",
                "expires_after_clicks": 100
            },
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["original_url"] == "https://github.com"
    
    def test_create_url_with_combined_policy(self, client, test_user):
        """Test creating URL with combined expiration"""
        expires_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        
        response = client.post(
            "/api/v1/urls",
            json={
                "original_url": "https://github.com",
                "expiration_policy": "combined",
                "expires_at": expires_at,
                "expires_after_clicks": 500
            },
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["original_url"] == "https://github.com"
    
    def test_invalid_expiration_policy(self, client, test_user):
        """Test creating URL with invalid policy"""
        response = client.post(
            "/api/v1/urls",
            json={
                "original_url": "https://github.com",
                "expiration_policy": "invalid"
            },
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 422


class TestExpirationStatus:
    """Tests for GET /api/v1/urls/{url_id}/expiration endpoint"""
    
    def test_get_expiration_status_days_policy(self, client, test_user):
        """Test getting expiration status for days policy"""
        # Create URL
        create_response = client.post(
            "/api/v1/urls",
            json={
                "original_url": "https://github.com",
                "expiration_policy": "days",
                "expires_after_days": 30
            },
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        url_id = create_response.json()["id"]
        
        # Get expiration status
        response = client.get(
            f"/api/v1/urls/{url_id}/expiration",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["expiration_policy"] == "days"
        assert data["expires_after_days"] == 30
        assert data["is_expired"] == False
        assert "time_remaining" in data
        assert "29 days" in data["time_remaining"] or "30 days" in data["time_remaining"]
    
    def test_get_expiration_status_date_policy(self, client, test_user):
        """Test getting expiration status for date policy"""
        expires_at = (datetime.now(timezone.utc) + timedelta(days=15)).isoformat()
        
        # Create URL
        create_response = client.post(
            "/api/v1/urls",
            json={
                "original_url": "https://example.com",
                "expiration_policy": "date",
                "expires_at": expires_at
            },
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        url_id = create_response.json()["id"]
        
        # Get expiration status
        response = client.get(
            f"/api/v1/urls/{url_id}/expiration",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["expiration_policy"] == "date"
        assert data["is_expired"] == False
        assert "time_remaining" in data
    
    def test_get_expiration_status_clicks_policy(self, client, test_user):
        """Test getting expiration status for clicks policy"""
        # Create URL
        create_response = client.post(
            "/api/v1/urls",
            json={
                "original_url": "https://example.com",
                "expiration_policy": "clicks",
                "expires_after_clicks": 100
            },
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        url_id = create_response.json()["id"]
        
        # Get expiration status
        response = client.get(
            f"/api/v1/urls/{url_id}/expiration",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["expiration_policy"] == "clicks"
        assert data["expires_after_clicks"] == 100
        assert data["is_expired"] == False
        assert "100 clicks" in data["time_remaining"]
    
    def test_get_expiration_status_not_found(self, client, test_user):
        """Test getting expiration status for non-existent URL"""
        response = client.get(
            "/api/v1/urls/99999/expiration",
            headers={"Authorization": f"Bearer {test_user.api_key}"},
        )
        
        assert response.status_code == 404


class TestCheckIfExpired:
    """Tests for check_if_expired function"""
    
    def test_check_expired_by_date(self, test_url_expired):
        """Test checking if URL expired by date"""
        is_expired, reason = check_if_expired(test_url_expired)
        
        assert is_expired == True
        assert "date" in reason.lower()

    def test_check_not_expired_by_date(self, test_url):
        """Test checking non-expired URL"""
        is_expired, reason = check_if_expired(test_url)
        
        assert is_expired == False
        assert reason == ""
    
    def test_check_expired_by_clicks(self, test_url_clicks_policy):
        """Test checking expiration by clicks"""
        test_url_clicks_policy.total_clicks = 100
        is_expired, reason = check_if_expired(
            test_url_clicks_policy,
            current_clicks=100
        )
        
        assert is_expired == True
        assert "clicks" in reason.lower()
    
    def test_check_not_expired_by_clicks(self, test_url_clicks_policy):
        """Test checking not expired by clicks"""
        is_expired, reason = check_if_expired(
            test_url_clicks_policy,
            current_clicks=50
        )
        
        assert is_expired == False


class TestCheckIfExpiringSSoon:
    """Tests for check_if_expiring_soon function"""
    
    def test_expiring_soon(self, test_url_expiring_soon):
        """Test URL expiring in less than 24 hours"""
        is_expiring_soon, reason = check_if_expiring_soon(test_url_expiring_soon)
        
        assert is_expiring_soon == True
        assert "expires" in reason.lower() or "less than" in reason.lower()
    
    def test_not_expiring_soon(self, test_url):
        """Test URL not expiring soon"""
        is_expiring_soon, reason = check_if_expiring_soon(test_url)
        
        assert is_expiring_soon == False


class TestTimeUntilExpiration:
    """Tests for get_time_until_expiration function"""
    
    def test_time_remaining_days(self, test_url_days_policy):
        """Test time remaining for days policy"""
        time_remaining = get_time_until_expiration(test_url_days_policy)
        
        assert time_remaining is not None
        assert "days" in time_remaining
    
    def test_time_remaining_clicks(self, test_url_clicks_policy):
        """Test time remaining for clicks policy"""
        time_remaining = get_time_until_expiration(
            test_url_clicks_policy,
            current_clicks=10
        )
        
        assert time_remaining is not None
        assert "clicks" in time_remaining
        assert "90" in time_remaining  # 100 - 10 = 90        

        
