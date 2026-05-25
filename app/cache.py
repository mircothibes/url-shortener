import redis
import json
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def cache_get(key: str):
    """Get value from Redis cache"""
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        print(f"Cache GET error: {e}")
        return None

def cache_set(key: str, value, ttl: int = 3600):
    """Set value in Redis cache"""
    try:
        redis_client.setex(key, ttl, json.dumps(value))
        return True
    except Exception as e:
        print(f"Cache SET error: {e}")
        return False

async def get_url_from_cache_or_db(short_code: str, db: Session):
    """Get URL from cache or database"""
    cache_key = f"url:{short_code}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    # Cache miss: query PostgreSQL
    from app.models import URL
    url = db.query(URL).filter(URL.short_code == short_code).first()
    if url:
        cache_set(cache_key, {
            "id": url.id,
            "short_code": url.short_code,
            "original_url": url.original_url
        })
    return url

def rate_limit_check(user_id: str, limit: int = 100, window: int = 3600):
    """Token bucket algorithm: 100 requests per hour"""
    key = f"rate_limit:{user_id}"
    current = redis_client.incr(key)
    if current == 1:
        redis_client.expire(key, window)
    if current > limit:
        raise HTTPException(status_code=429, detail="Too many requests")
    return current
