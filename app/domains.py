"""Custom domain validation and management for URL Shortener API

Handles domain registration, verification, and DNS validation.
"""

import socket
from typing import List, Optional
from pydantic import BaseModel, validator
from datetime import datetime, timezone


# ============================================================================
# Domain Models (Pydantic)
# ============================================================================

class DomainCreateRequest(BaseModel):
    """Request model for registering a custom domain"""
    domain: str
    set_as_primary: bool = False
    
    @validator('domain')
    def validate_domain(cls, v):
        """Validate domain format"""
        if not v:
            raise ValueError("Domain is required")
        
        # Remove protocol if present
        if v.startswith(('http://', 'https://')):
            v = v.split('://', 1)[1]
        
        # Remove trailing slash
        v = v.rstrip('/')
        
        # Basic domain format validation
        if len(v) < 3 or len(v) > 255:
            raise ValueError("Domain must be between 3 and 255 characters")
        
        # Check for valid characters
        valid_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-')
        if not all(c in valid_chars for c in v):
            raise ValueError("Domain contains invalid characters")
        
        # Check for consecutive dots or hyphens at start/end
        if v.startswith('-') or v.endswith('-') or v.startswith('.') or v.endswith('.'):
            raise ValueError("Domain cannot start or end with hyphen or dot")
        
        # Check label length (each part between dots)
        labels = v.split('.')
        for label in labels:
            if not label or len(label) > 63:
                raise ValueError("Each domain label must be 1-63 characters")
        
        return v.lower()


class DomainResponse(BaseModel):
    """Response model for custom domain"""
    id: int
    domain: str
    is_verified: bool
    is_primary: bool
    created_at: str
    verified_at: Optional[str] = None


# ============================================================================
# Domain Validation Functions
# ============================================================================

def validate_domain_dns(domain: str) -> tuple[bool, str]:
    """
    Validate that domain resolves via DNS.
    
    Args:
        domain: Domain to validate (e.g., "example.com")
        
    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        # Try to resolve domain
        ip_address = socket.gethostbyname(domain)
        
        if not ip_address:
            return False, "Domain does not resolve"
        
        return True, f"Domain resolved to {ip_address}"
        
    except socket.gaierror:
        return False, "Domain does not resolve (DNS lookup failed)"
    except socket.error as e:
        return False, f"DNS validation error: {str(e)}"
    except Exception as e:
        return False, f"Unexpected error: {str(e)}"


def is_valid_domain_format(domain: str) -> bool:
    """
    Quick check if domain has valid format (without DNS lookup).
    
    Args:
        domain: Domain to check
        
    Returns:
        bool: True if format is valid
    """
    try:
        # Remove protocol if present
        if domain.startswith(('http://', 'https://')):
            domain = domain.split('://', 1)[1]
        
        domain = domain.rstrip('/').lower()
        
        # Must have at least one dot (except localhost)
        if '.' not in domain and domain != 'localhost':
            return False
        
        # Must be reasonable length
        if len(domain) < 3 or len(domain) > 255:
            return False
        
        # Check valid characters
        valid_chars = set('abcdefghijklmnopqrstuvwxyz0123456789.-')
        if not all(c in valid_chars for c in domain):
            return False
        
        # Check labels
        labels = domain.split('.')
        for label in labels:
            if not label or len(label) > 63:
                return False
            if label.startswith('-') or label.endswith('-'):
                return False
        
        return True
        
    except:
        return False


# ============================================================================
# Constants
# ============================================================================

"""
CUSTOM DOMAIN CONFIGURATION:

Validation:
- Basic format validation (Pydantic)
- DNS resolution check
- Unique constraint per user
- Max 5 domains per user

Features:
- Primary domain (default for this user)
- Verification status
- Verified timestamp
- Last health check timestamp

Reserved domains:
- Cannot use: localhost, 127.0.0.1, main domain of API
- Cannot use: common reserved domains

Usage:
- Users can access same URL via multiple domains
- Example: https://myapp.com/abc123 and https://links.mycompany.com/abc123
  both redirect to same original URL
"""
