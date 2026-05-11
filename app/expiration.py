"""Link expiration policies and management for URL Shortener API

Handles different expiration strategies and notifications.
"""

from typing import Optional, Tuple
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, validator
from enum import Enum


# ============================================================================
# Expiration Policy Models (Pydantic)
# ============================================================================

class ExpirationPolicyType(str, Enum):
    """Types of expiration policies"""
    DATE = "date"  # Expire at specific date/time
    DAYS = "days"  # Expire after X days
    CLICKS = "clicks"  # Expire after X clicks
    COMBINED = "combined"  # Expire by date OR clicks (whichever comes first)


class ExpirationPolicyRequest(BaseModel):
    """Request model for setting expiration policy"""
    policy_type: ExpirationPolicyType
    expires_at: Optional[datetime] = None
    expires_after_days: Optional[int] = None
    expires_after_clicks: Optional[int] = None
    
    @validator('expires_at')
    def validate_expires_at(cls, v):
        """Validate expiration date"""
        if v is not None:
            if v < datetime.now(timezone.utc):
                raise ValueError("Expiration date must be in the future")
            
            # Max 365 days
            max_date = datetime.now(timezone.utc) + timedelta(days=365)
            if v > max_date:
                raise ValueError("Expiration date cannot be more than 365 days in the future")
        
        return v
    
    @validator('expires_after_days')
    def validate_expires_after_days(cls, v):
        """Validate days until expiration"""
        if v is not None:
            if v <= 0:
                raise ValueError("Days must be greater than 0")
            if v > 365:
                raise ValueError("Maximum 365 days allowed")
        
        return v
    
    @validator('expires_after_clicks')
    def validate_expires_after_clicks(cls, v):
        """Validate clicks until expiration"""
        if v is not None:
            if v <= 0:
                raise ValueError("Clicks must be greater than 0")
            if v > 1000000:
                raise ValueError("Maximum 1,000,000 clicks allowed")
        
        return v
    
    @validator('policy_type')
    def validate_policy_type(cls, v, values):
        """Validate policy type and required fields"""
        if v == ExpirationPolicyType.DATE:
            if 'expires_at' not in values or not values['expires_at']:
                raise ValueError("expires_at required for 'date' policy")
        
        elif v == ExpirationPolicyType.DAYS:
            if 'expires_after_days' not in values or not values['expires_after_days']:
                raise ValueError("expires_after_days required for 'days' policy")
        
        elif v == ExpirationPolicyType.CLICKS:
            if 'expires_after_clicks' not in values or not values['expires_after_clicks']:
                raise ValueError("expires_after_clicks required for 'clicks' policy")
        
        elif v == ExpirationPolicyType.COMBINED:
            if ('expires_at' not in values or not values['expires_at']) or \
               ('expires_after_clicks' not in values or not values['expires_after_clicks']):
                raise ValueError("Both expires_at and expires_after_clicks required for 'combined' policy")
        
        return v


class ExpirationPolicyResponse(BaseModel):
    """Response model for expiration policy"""
    policy_type: str
    expires_at: Optional[str] = None
    expires_after_days: Optional[int] = None
    expires_after_clicks: Optional[int] = None
    expired_at: Optional[str] = None
    expiring_soon_notified: bool


# ============================================================================
# Expiration Check Functions
# ============================================================================

def check_if_expired(
    url_obj,
    current_clicks: int = None
) -> Tuple[bool, str]:
    """
    Check if URL is expired based on policy.
    
    Args:
        url_obj: URL database object
        current_clicks: Current click count (optional)
        
    Returns:
        tuple: (is_expired: bool, reason: str)
    """
    now = datetime.now(timezone.utc)
    
    if url_obj.expiration_policy == "date":
        # Date-based expiration
        if url_obj.expires_at and url_obj.expires_at < now:
            return True, "Expired by date"
    
    elif url_obj.expiration_policy == "days":
        # Days-based expiration
        if url_obj.expires_after_days:
            expiration_date = url_obj.created_at + timedelta(days=url_obj.expires_after_days)
            if now > expiration_date:
                return True, f"Expired after {url_obj.expires_after_days} days"
    
    elif url_obj.expiration_policy == "clicks":
        # Clicks-based expiration
        if url_obj.expires_after_clicks and current_clicks is not None:
            if current_clicks >= url_obj.expires_after_clicks:
                return True, f"Expired after {url_obj.expires_after_clicks} clicks"
    
    elif url_obj.expiration_policy == "combined":
        # Combined: expire by date OR clicks (whichever comes first)
        
        # Check date
        if url_obj.expires_at and url_obj.expires_at < now:
            return True, "Expired by date"
        
        # Check clicks
        if url_obj.expires_after_clicks and current_clicks is not None:
            if current_clicks >= url_obj.expires_after_clicks:
                return True, f"Expired after {url_obj.expires_after_clicks} clicks"
    
    return False, ""


def check_if_expiring_soon(url_obj) -> Tuple[bool, str]:
    """
    Check if URL is expiring within 24 hours.
    
    Args:
        url_obj: URL database object
        
    Returns:
        tuple: (is_expiring_soon: bool, reason: str)
    """
    now = datetime.now(timezone.utc)
    tomorrow = now + timedelta(days=1)
    
    if url_obj.expiration_policy == "date":
        if url_obj.expires_at and now < url_obj.expires_at < tomorrow:
            return True, f"Expires at {url_obj.expires_at.isoformat()}"
    
    elif url_obj.expiration_policy == "days":
        if url_obj.expires_after_days:
            expiration_date = url_obj.created_at + timedelta(days=url_obj.expires_after_days)
            if now < expiration_date < tomorrow:
                return True, f"Expires in less than 24 hours"
    
    elif url_obj.expiration_policy == "combined":
        # Check date
        if url_obj.expires_at and now < url_obj.expires_at < tomorrow:
            return True, f"Expires at {url_obj.expires_at.isoformat()}"
    
    return False, ""


def get_time_until_expiration(url_obj, current_clicks: int = None) -> Optional[str]:
    """
    Get human-readable time until expiration.
    
    Args:
        url_obj: URL database object
        current_clicks: Current click count
        
    Returns:
        str: Time until expiration (e.g., "2 days", "500 clicks")
    """
    now = datetime.now(timezone.utc)
    
    if url_obj.expiration_policy == "date":
        if url_obj.expires_at:
            delta = url_obj.expires_at - now
            days = delta.days
            if days > 0:
                return f"{days} days"
            else:
                return "Less than 1 day"
    
    elif url_obj.expiration_policy == "days":
        if url_obj.expires_after_days:
            expiration_date = url_obj.created_at + timedelta(days=url_obj.expires_after_days)
            delta = expiration_date - now
            days = delta.days
            if days > 0:
                return f"{days} days"
            else:
                return "Less than 1 day"
    
    elif url_obj.expiration_policy == "clicks":
        if url_obj.expires_after_clicks and current_clicks is not None:
            remaining = url_obj.expires_after_clicks - current_clicks
            if remaining > 0:
                return f"{remaining} clicks"
            else:
                return "0 clicks remaining"
    
    elif url_obj.expiration_policy == "combined":
        if url_obj.expires_at:
            delta = url_obj.expires_at - now
            days = delta.days
            if days > 0:
                days_remaining = f"{days} days"
            else:
                days_remaining = "Less than 1 day"
            
            if url_obj.expires_after_clicks and current_clicks is not None:
                clicks_remaining = url_obj.expires_after_clicks - current_clicks
                return f"{days_remaining} or {clicks_remaining} clicks"
            else:
                return days_remaining
    
    return None


# ============================================================================
# Constants
# ============================================================================

"""
EXPIRATION POLICIES:

1. DATE: Expire at specific date/time
   - Max: 365 days in future
   - Example: expires_at = 2026-06-15

2. DAYS: Expire X days after creation
   - Max: 365 days
   - Example: expires_after_days = 30

3. CLICKS: Expire after X clicks
   - Max: 1,000,000 clicks
   - Example: expires_after_clicks = 1000

4. COMBINED: Expire by date OR clicks (whichever comes first)
   - Max: 365 days + 1,000,000 clicks
   - Example: expires_at = 2026-06-15, expires_after_clicks = 5000

Notifications:
- url.expiring_soon: Sent 24 hours before expiration
- url.expired: Sent when URL expires

Webhook events:
- Both events trigger webhooks if user subscribed
"""
