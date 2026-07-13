"""Tests for authentication and account-management endpoints"""

import pytest
from uuid import uuid4

from app.models import User
from app.auth import hash_password


@pytest.fixture
def make_user(db_session):
    """Factory to create a user with a real hashed password."""
    def _make(email="user@example.com", password="password123", is_active=True):
        user = User(
            id=uuid4(),
            email=email,
            hashed_password=hash_password(password),
            api_key=f"key-{uuid4().hex}",
            is_active=is_active,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user
    return _make


def auth_headers(client, email, password):
    """Log in and return Authorization headers with the JWT."""
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


class TestRegister:
    """POST /api/v1/auth/register"""

    def test_register_success(self, client):
        res = client.post(
            "/api/v1/auth/register",
            json={"email": "new@example.com", "password": "password123"},
        )
        assert res.status_code == 201
        data = res.json()
        assert data["email"] == "new@example.com"
        assert data["access_token"]
        assert data["token_type"] == "bearer"
        assert data["api_key"]

    def test_register_duplicate_email(self, client, make_user):
        make_user(email="dup@example.com", password="password123")
        res = client.post(
            "/api/v1/auth/register",
            json={"email": "dup@example.com", "password": "password123"},
        )
        assert res.status_code == 409

    def test_register_short_password(self, client):
        res = client.post(
            "/api/v1/auth/register",
            json={"email": "short@example.com", "password": "short"},
        )
        assert res.status_code == 422

    def test_register_invalid_email(self, client):
        res = client.post(
            "/api/v1/auth/register",
            json={"email": "not-an-email", "password": "password123"},
        )
        assert res.status_code == 422

    def test_register_normalizes_email(self, client):
        res = client.post(
            "/api/v1/auth/register",
            json={"email": "MixedCase@Example.com", "password": "password123"},
        )
        assert res.status_code == 201
        assert res.json()["email"] == "mixedcase@example.com"


class TestLogin:
    """POST /api/v1/auth/login"""

    def test_login_success(self, client, make_user):
        make_user(email="login@example.com", password="password123")
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "login@example.com", "password": "password123"},
        )
        assert res.status_code == 200
        assert res.json()["access_token"]

    def test_login_wrong_password(self, client, make_user):
        make_user(email="wrong@example.com", password="password123")
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpassword"},
        )
        assert res.status_code == 401

    def test_login_unknown_email(self, client):
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "ghost@example.com", "password": "password123"},
        )
        assert res.status_code == 401

    def test_login_inactive_user(self, client, make_user):
        make_user(email="inactive@example.com", password="password123", is_active=False)
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "inactive@example.com", "password": "password123"},
        )
        assert res.status_code == 403


class TestGetMe:
    """GET /api/v1/auth/me"""

    def test_get_me_with_jwt(self, client, make_user):
        make_user(email="me@example.com", password="password123")
        headers = auth_headers(client, "me@example.com", "password123")
        res = client.get("/api/v1/auth/me", headers=headers)
        assert res.status_code == 200
        assert res.json()["email"] == "me@example.com"

    def test_get_me_no_auth(self, client):
        res = client.get("/api/v1/auth/me")
        assert res.status_code == 401

    def test_get_me_with_api_key(self, client, make_user):
        """The dual-auth get_current_user should also accept the API key."""
        user = make_user(email="apikey@example.com", password="password123")
        res = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {user.api_key}"},
        )
        assert res.status_code == 200
        assert res.json()["email"] == "apikey@example.com"


class TestUpdateProfile:
    """PATCH /api/v1/auth/me"""

    def test_update_email_success(self, client, make_user):
        make_user(email="old@example.com", password="password123")
        headers = auth_headers(client, "old@example.com", "password123")
        res = client.patch(
            "/api/v1/auth/me",
            json={"email": "updated@example.com"},
            headers=headers,
        )
        assert res.status_code == 200
        assert res.json()["email"] == "updated@example.com"

    def test_update_email_conflict(self, client, make_user):
        make_user(email="taken@example.com", password="password123")
        make_user(email="mover@example.com", password="password123")
        headers = auth_headers(client, "mover@example.com", "password123")
        res = client.patch(
            "/api/v1/auth/me",
            json={"email": "taken@example.com"},
            headers=headers,
        )
        assert res.status_code == 409

    def test_update_email_invalid(self, client, make_user):
        make_user(email="valid@example.com", password="password123")
        headers = auth_headers(client, "valid@example.com", "password123")
        res = client.patch(
            "/api/v1/auth/me",
            json={"email": "not-an-email"},
            headers=headers,
        )
        assert res.status_code == 422


class TestChangePassword:
    """POST /api/v1/auth/change-password"""

    def test_change_password_success(self, client, make_user):
        make_user(email="cp@example.com", password="password123")
        headers = auth_headers(client, "cp@example.com", "password123")
        res = client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "password123", "new_password": "newpassword456"},
            headers=headers,
        )
        assert res.status_code == 200
        assert client.post(
            "/api/v1/auth/login",
            json={"email": "cp@example.com", "password": "password123"},
        ).status_code == 401
        assert client.post(
            "/api/v1/auth/login",
            json={"email": "cp@example.com", "password": "newpassword456"},
        ).status_code == 200

    def test_change_password_wrong_current(self, client, make_user):
        make_user(email="cp2@example.com", password="password123")
        headers = auth_headers(client, "cp2@example.com", "password123")
        res = client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "wrongpassword", "new_password": "newpassword456"},
            headers=headers,
        )
        assert res.status_code == 401

    def test_change_password_same_as_current(self, client, make_user):
        make_user(email="cp3@example.com", password="password123")
        headers = auth_headers(client, "cp3@example.com", "password123")
        res = client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "password123", "new_password": "password123"},
            headers=headers,
        )
        assert res.status_code == 400

    def test_change_password_too_short(self, client, make_user):
        make_user(email="cp4@example.com", password="password123")
        headers = auth_headers(client, "cp4@example.com", "password123")
        res = client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "password123", "new_password": "short"},
            headers=headers,
        )
        assert res.status_code == 422

    def test_change_password_no_auth(self, client):
        res = client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "password123", "new_password": "newpassword456"},
        )
        assert res.status_code == 401
