"""
Authentication utilities.

Password hashing (argon2), JWT access-token creation/validation, and API key
generation. Kept separate from the route handlers so the auth logic is reusable
and testable.
"""
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Single hasher instance, consistent with the rest of the app
_pwd_hasher = PasswordHasher()

# JWT configuration (secret comes from the environment; never hard-coded)
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = int(os.getenv("JWT_EXPIRE_DAYS", "7"))


def hash_password(password: str) -> str:
    """Hash a plaintext password using argon2."""
    return _pwd_hasher.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verify a plaintext password against an argon2 hash."""
    try:
        _pwd_hasher.verify(hashed, password)
        return True
    except VerifyMismatchError:
        return False


def generate_api_key() -> str:
    """Generate a URL-safe API key that fits the users.api_key column."""
    return secrets.token_urlsafe(32)


def create_access_token(user_id: str) -> str:
    """Create a signed JWT access token for the given user id."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(days=JWT_EXPIRE_DAYS),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode a JWT and return its subject (user id), or None if the token is
    missing, malformed, expired, or the signing secret is not configured.
    """
    if not JWT_SECRET_KEY or not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None
