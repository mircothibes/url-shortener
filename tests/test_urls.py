"""Tests for URL update, redirect, ownership isolation, and custom codes."""

from uuid import uuid4

import pytest

from app.models import User, URL


def auth(user):
    """Authorization header for a user (API key)."""
    return {"Authorization": f"Bearer {user.api_key}"}


@pytest.fixture
def other_user(db_session):
    """A second user, to test ownership isolation."""
    user = User(
        id=uuid4(),
        email="other@example.com",
        hashed_password="hashed",
        api_key=f"other-key-{uuid4().hex}",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def create_url(client, user, original_url="https://example.com", custom_slug=None):
    """Helper to create a URL and return the response JSON."""
    payload = {"original_url": original_url}
    if custom_slug:
        payload["custom_slug"] = custom_slug
    res = client.post("/api/v1/urls", json=payload, headers=auth(user))
    assert res.status_code == 201, res.text
    return res.json()


class TestCustomSlug:
    """Creating URLs with a custom short code."""

    def test_create_with_custom_slug(self, client, test_user):
        data = create_url(client, test_user, custom_slug="my-link")
        assert data["short_code"] == "my-link"

    def test_custom_slug_conflict(self, client, test_user):
        create_url(client, test_user, custom_slug="taken")
        res = client.post(
            "/api/v1/urls",
            json={"original_url": "https://example.org", "custom_slug": "taken"},
            headers=auth(test_user),
        )
        assert res.status_code == 409


class TestUpdateURL:
    """PATCH /api/v1/urls/{url_id}"""

    def test_update_original_url(self, client, test_user):
        data = create_url(client, test_user, "https://old.example.com")
        res = client.patch(
            f"/api/v1/urls/{data['id']}",
            json={"original_url": "https://new.example.com"},
            headers=auth(test_user),
        )
        assert res.status_code == 200
        assert res.json()["original_url"] == "https://new.example.com"

    def test_update_is_active(self, client, test_user):
        data = create_url(client, test_user)
        res = client.patch(
            f"/api/v1/urls/{data['id']}",
            json={"is_active": False},
            headers=auth(test_user),
        )
        assert res.status_code == 200
        assert res.json()["is_active"] is False

    def test_update_invalid_url(self, client, test_user):
        data = create_url(client, test_user)
        res = client.patch(
            f"/api/v1/urls/{data['id']}",
            json={"original_url": "not-a-url"},
            headers=auth(test_user),
        )
        assert res.status_code == 422

    def test_update_not_found(self, client, test_user):
        res = client.patch(
            "/api/v1/urls/999999",
            json={"is_active": False},
            headers=auth(test_user),
        )
        assert res.status_code == 404

    def test_update_no_auth(self, client, test_user):
        data = create_url(client, test_user)
        res = client.patch(f"/api/v1/urls/{data['id']}", json={"is_active": False})
        assert res.status_code == 401


class TestOwnershipIsolation:
    """A user cannot touch another user's URLs."""

    def test_cannot_update_others_url(self, client, test_user, other_user):
        data = create_url(client, test_user)
        res = client.patch(
            f"/api/v1/urls/{data['id']}",
            json={"is_active": False},
            headers=auth(other_user),
        )
        assert res.status_code == 404

    def test_cannot_delete_others_url(self, client, test_user, other_user):
        data = create_url(client, test_user)
        res = client.delete(f"/api/v1/urls/{data['id']}", headers=auth(other_user))
        assert res.status_code == 404

    def test_others_url_not_in_list(self, client, test_user, other_user):
        create_url(client, test_user, "https://mine.example.com")
        res = client.get("/api/v1/urls", headers=auth(other_user))
        assert res.status_code == 200
        urls = res.json() if isinstance(res.json(), list) else res.json().get("urls", [])
        assert all(u["original_url"] != "https://mine.example.com" for u in urls)


class TestRedirect:
    """GET /{short_code}"""

    def test_redirect_success(self, client, test_user):
        data = create_url(client, test_user, "https://redirect-target.example.com")
        res = client.get(f"/{data['short_code']}", follow_redirects=False)
        assert res.status_code == 307
        assert res.headers["location"] == "https://redirect-target.example.com"

    def test_redirect_not_found(self, client):
        res = client.get("/nonexistent-code-xyz", follow_redirects=False)
        assert res.status_code == 404

    def test_redirect_inactive_url(self, client, test_user):
        data = create_url(client, test_user)
        client.patch(
            f"/api/v1/urls/{data['id']}",
            json={"is_active": False},
            headers=auth(test_user),
        )
        res = client.get(f"/{data['short_code']}", follow_redirects=False)
        assert res.status_code in (404, 410)
