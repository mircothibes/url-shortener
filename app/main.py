"""URL Shortener API - Main application file

Production-grade URL shortening service with advanced analytics and click tracking.
"""
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

import secrets
import io
import os

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse, JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from pydantic import BaseModel, ConfigDict

from app.cors import get_cors_config, validate_cors_config
from app.rate_limit import limiter, rate_limit_error_handler
from slowapi.errors import RateLimitExceeded

from app.database import SessionLocal
from app.models import User, URL, Click, AuditLog

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from app.qrcode import generate_qrcode_png

from app.batch import BatchURLRequest, BatchURLResponse, BatchErrorResponse, validate_batch_request
from app.webhooks import (
    WebhookCreateRequest,
    WebhookResponse,
    WebhookLogResponse,
    generate_webhook_secret,
    create_webhook_signature,
    deliver_webhook,
    calculate_next_retry,
    URLClickedEvent
)
from app.models import Webhook, WebhookLog
from app.tasks import trigger_url_created_event, trigger_url_clicked_event, trigger_url_deleted_event
from app.domains import DomainCreateRequest, DomainResponse, validate_domain_dns, is_valid_domain_format
from app.models import CustomDomain

# ============================================================================
# FastAPI Application Setup
# ============================================================================

app = FastAPI(
    title="URL Shortener API",
    description="Production-grade URL shortening service with advanced analytics and click tracking",
    version="1.0.0", 
    contact={
        "name": "Marcos (mircothibes)",
        "url": "https://github.com/mircothibes",
        "email": "mircothibes@gmail.com"
    }
)

# ============================================================================
# CORS Configuration
# ============================================================================

validate_cors_config()

app.add_middleware(
    CORSMiddleware,
    **get_cors_config()
)

# ============================================================================
# Rate Limiting Configuration
# ============================================================================

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_error_handler)

# ============================================================================
# Pydantic Models
# ============================================================================

class URLCreateRequest(BaseModel):
    """Request model for creating a shortened URL"""
    original_url: str
    custom_slug: Optional[str] = None
    expires_at: Optional[datetime] = None
    password: Optional[str] = None
    tags: Optional[List[str]] = None
    description: Optional[str] = None


class URLResponse(BaseModel):
    """Response model for URL data"""
    id: int
    short_code: str
    original_url: str
    created_at: datetime
    total_clicks: int
    is_active: bool
    expires_at: Optional[datetime] = None
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AnalyticsResponse(BaseModel):
    """Response model for URL analytics"""
    total_clicks: int
    unique_visitors: int
    top_country: Optional[str] = None
    top_device: Optional[str] = None
    device_breakdown: dict
    country_breakdown: dict


# ============================================================================
# Database Dependencies
# ============================================================================

def get_db():
    """
    Dependency function to get database session.
    
    """
    db = SessionLocal()
    try:        
        yield db
    except HTTPException:
        raise    
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database unavailable: {str(e)}"
        )
    finally:
        db.close()


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> UUID:
    """
    Verify API key and return authenticated user ID.
    
    Args:
        request: FastAPI request object
        db: Database session
        
    Returns:
        UUID: User ID if authentication successful
        
    Raises:
        HTTPException: If API key is missing, invalid, or user is inactive
    """
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing API key")
    
    api_key = auth_header.replace("Bearer ", "")
    user = db.query(User).filter(User.api_key == api_key).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")
    
    return user.id


# ============================================================================
# Health Check & Root Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint - confirms API is running"""
    return {"message": "API is running"}


@app.get(
    "/health",
    tags=["Health"],
    summary="Health Check",
    description="Verify API status"
)
async def health_check():
    """
    Health check endpoint to verify API status.
    
    Returns:
        dict: API status information
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "service": "URL Shortener API",
            "version": "1.0.0"
        }
    )


# ============================================================================
# URL Management Endpoints
# ============================================================================

@app.post(
    "/api/v1/urls",
    status_code=201,
    response_model=URLResponse,
    tags=["URLs"],
    summary="Create Shortened URL",
    description="Creates a new shortened URL with unique short code and optional customization"
)
@limiter.limit("100/15 minutes")
async def create_short_url(
    request: Request,
    url_request: URLCreateRequest,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Create a new shortened URL.
    
    Features:
    - Auto-generated or custom short code
    - Optional expiration date
    - Optional password protection
    - Tags and description for organization
    
    Args:
        request: FastAPI request object
        url_request: URL creation request data
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        URLResponse: Created URL data
        
    Raises:
        HTTPException: If URL format is invalid or custom slug already exists
    """
    original_url = url_request.original_url
    
    if not original_url.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=422,
            detail="Invalid URL format. Must start with http:// or https://"
        )
    
    if url_request.custom_slug:
        existing = db.query(URL).filter(URL.short_code == url_request.custom_slug).first()
        if existing:
            raise HTTPException(status_code=409, detail="Custom slug already exists")
        short_code = url_request.custom_slug
    else:
        while True:
            short_code = secrets.token_urlsafe(6)[:8]
            existing = db.query(URL).filter(URL.short_code == short_code).first()
            if not existing:
                break
    
    url = URL(
        short_code=short_code,
        original_url=original_url,
        user_id=user_id,
        expires_at=url_request.expires_at,
        description=url_request.description,
        tags=url_request.tags or []
    )
    
    if url_request.password:
        pwd_hasher = PasswordHasher()
        url.password_hash = pwd_hasher.hash(url_request.password) 
    
    db.add(url)
    db.commit()
    db.refresh(url)
    
    audit = AuditLog(
        user_id=user_id,
        action="CREATE_URL",
        resource_type="URL",
        resource_id=str(url.id),
        ip_address=request.client.host if hasattr(request, 'client') else None,
        details={"short_code": short_code}
    )
    db.add(audit)
    db.commit()

    # Trigger webhook event
    trigger_url_created_event(url.id)
    
    return url


@app.get(
    "/api/v1/urls",
    response_model=List[URLResponse],
    tags=["URLs"],
    summary="List User's URLs",
    description="Returns all active shortened URLs created by the authenticated user"
)
@limiter.limit("300/15 minutes")
async def list_user_urls(
    request: Request,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    List all shortened URLs for the authenticated user.
    
    Returns:
        List[URLResponse]: User's active URLs, ordered by creation date (newest first)
    """
    urls = db.query(URL).filter(
        URL.user_id == user_id,
        URL.is_active == True
    ).order_by(URL.created_at.desc()).all()
    return urls


@app.get(
    "/api/v1/urls/{url_id}",
    response_model=URLResponse,
    tags=["URLs"],
    summary="Get URL Details",
    description="Retrieves detailed information about a specific shortened URL"
)
@limiter.limit("300/15 minutes")
async def get_url_details(
    request: Request,
    url_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Get detailed information about a specific shortened URL.
    
    Args:
        request: FastAPI request object
        url_id: URL record ID
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        URLResponse: URL details
        
    Raises:
        HTTPException: If URL not found or doesn't belong to user
    """
    url = db.query(URL).filter(
        URL.id == url_id,
        URL.user_id == user_id
    ).first()
    
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    
    return url


@app.get(
    "/api/v1/urls/{url_id}/qrcode",
    tags=["URLs"],
    summary="Get URL QR Code",
    description="Generates and returns a QR code PNG image for the shortened URL"
)
@limiter.limit("300/15 minutes")
async def get_qrcode(
    request: Request,
    url_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Generate and return QR code for a shortened URL.
    
    The QR code encodes the full shortened URL and can be scanned
    with any QR code reader to access the link.
    
    Args:
        request: FastAPI request object
        url_id: URL record ID
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        PNG image binary (image/png content type)
        
    Raises:
        HTTPException: If URL not found or doesn't belong to user
    """
    url = db.query(URL).filter(
        URL.id == url_id,
        URL.user_id == user_id
    ).first()
    
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    
    if os.getenv("ENVIRONMENT") == "production":
        base_url = os.getenv("APP_URL", "https://your-domain.com")
    else:
        base_url = "http://localhost:8000"
    
    full_short_url = f"{base_url}/{url.short_code}"
    
    try:
        qr_png = generate_qrcode_png(full_short_url)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate QR code: {str(e)}"
        )
    
    return StreamingResponse(
        io.BytesIO(qr_png),
        media_type="image/png",
        headers={"Content-Disposition": f"inline; filename=qrcode_{url.short_code}.png"}
    )


@app.delete(
    "/api/v1/urls/{url_id}",
    status_code=204,
    tags=["URLs"],
    summary="Delete URL",
    description="Soft deletes a shortened URL by marking it as inactive"
)
@limiter.limit("300/15 minutes")
async def delete_url(
    request: Request,
    url_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Delete a shortened URL (soft delete).
    
    The URL is marked as inactive rather than permanently deleted,
    preserving analytics history.
    
    Args:
        request: FastAPI request object
        url_id: URL record ID
        db: Database session
        user_id: Authenticated user ID
        
    Raises:
        HTTPException: If URL not found or doesn't belong to user
    """
    url = db.query(URL).filter(
        URL.id == url_id,
        URL.user_id == user_id
    ).first()
    
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Store data before marking as inactive
    short_code = url.short_code
    original_url = url.original_url
    
    url.is_active = False
    db.commit()
    
    audit = AuditLog(
        user_id=user_id,
        action="DELETE_URL",
        resource_type="URL",
        resource_id=str(url_id),
        details={"short_code": url.short_code}
    )
    db.add(audit)
    db.commit()
    
    # Trigger webhook event
    trigger_url_deleted_event(url_id, short_code, original_url, str(user_id))


@app.post(
    "/api/v1/urls/batch",
    status_code=201,
    response_model=BatchURLResponse,
    tags=["URLs"],
    summary="Create Multiple Shortened URLs",
    description="Creates multiple shortened URLs in a single atomic transaction"
)
@limiter.limit("50/15 minutes")
async def create_batch_urls(
    request: Request,
    batch_request: BatchURLRequest,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Create multiple shortened URLs in a single transaction.
    
    Features:
    - Atomic: all URLs created or none
    - Fail-fast: validates all before creating any
    - Up to 50 URLs per batch
    - Same customization as single URL creation
    
    Args:
        request: FastAPI request object
        batch_request: Batch request with URLs to create
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        BatchURLResponse: List of created URLs
        
    Raises:
        HTTPException: If validation fails or database error
    """
    validation_result = validate_batch_request(batch_request)
    if not validation_result["valid"]:
        raise HTTPException(
            status_code=422,
            detail=validation_result["error"]
        )
    
    created_urls = []
    
    try:
        existing_codes = db.query(URL.short_code).all()
        existing_codes = [code[0] for code in existing_codes]
        
        short_codes_needed = []
        for url_item in batch_request.urls:
            if url_item.custom_slug:
                short_codes_needed.append(url_item.custom_slug)
            else:
                short_codes_needed.append(None)
        
        auto_gen_count = sum(1 for code in short_codes_needed if code is None)
        
        from app.batch import generate_short_codes
        auto_codes = generate_short_codes(auto_gen_count, existing_codes) if auto_gen_count > 0 else []
        
        auto_code_index = 0
        
        for idx, url_item in enumerate(batch_request.urls):
            if short_codes_needed[idx]:
                short_code = short_codes_needed[idx]
                existing = db.query(URL).filter(URL.short_code == short_code).first()
                if existing:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Custom slug '{short_code}' already exists"
                    )
            else:
                short_code = auto_codes[auto_code_index]
                auto_code_index += 1
            
            url = URL(
                short_code=short_code,
                original_url=url_item.original_url,
                user_id=user_id,
                expires_at=url_item.expires_at,
                description=url_item.description,
                tags=url_item.tags or []
            )
            
            if url_item.password:
                pwd_hasher = PasswordHasher()
                url.password_hash = pwd_hasher.hash(url_item.password)
            
            db.add(url)
            created_urls.append(url)
        
        db.commit()
        
        for url in created_urls:
            db.refresh(url)
        
        audit = AuditLog(
            user_id=user_id,
            action="CREATE_BATCH_URLS",
            resource_type="URL",
            resource_id=str(len(created_urls)),
            ip_address=request.client.host if hasattr(request, 'client') else None,
            details={"count": len(created_urls), "short_codes": [u.short_code for u in created_urls]}
        )
        db.add(audit)
        db.commit()
        
        return {
            "created": len(created_urls),
            "urls": [
                {
                    "id": url.id,
                    "short_code": url.short_code,
                    "original_url": url.original_url,
                    "created_at": url.created_at.isoformat() if url.created_at else "",
                    "is_active": url.is_active,
                    "expires_at": url.expires_at.isoformat() if url.expires_at else None,
                    "description": url.description or None,
                    "tags": url.tags or None
                }
                for url in created_urls
            ]
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create batch: {str(e)}"
        )


# ============================================================================
# Analytics Endpoints
# ============================================================================

@app.get(
    "/api/v1/urls/{url_id}/analytics",
    response_model=AnalyticsResponse,
    tags=["Analytics"],
    summary="Get URL Analytics",
    description="Retrieves comprehensive analytics and statistics for a specific shortened URL"
)
@limiter.limit("300/15 minutes")
async def get_analytics(
    request: Request,
    url_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Get detailed analytics for a shortened URL.
    
    Includes:
    - Total click count
    - Unique visitor count (by IP)
    - Top country and device
    - Device type breakdown
    - Geographic distribution
    
    Args:
        request: FastAPI request object
        url_id: URL record ID
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        AnalyticsResponse: Analytics data
        
    Raises:
        HTTPException: If URL not found or doesn't belong to user
    """
    url = db.query(URL).filter(
        URL.id == url_id,
        URL.user_id == user_id
    ).first()
    
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    
    clicks = db.query(Click).filter(Click.url_id == url_id).all()
    
    device_breakdown = {}
    country_breakdown = {}
    
    for click in clicks:
        if click.device_type:
            device_breakdown[click.device_type] = device_breakdown.get(click.device_type, 0) + 1
        if click.country:
            country_breakdown[click.country] = country_breakdown.get(click.country, 0) + 1
    
    top_country = max(country_breakdown, key=country_breakdown.get) if country_breakdown else None
    top_device = max(device_breakdown, key=device_breakdown.get) if device_breakdown else None
    
    unique_ips = db.query(func.count(func.distinct(Click.ip_address))).filter(
        Click.url_id == url_id
    ).scalar() or 0
    
    return {
        "total_clicks": url.total_clicks,
        "unique_visitors": unique_ips,
        "top_country": top_country,
        "top_device": top_device,
        "device_breakdown": device_breakdown,
        "country_breakdown": country_breakdown
    }

# ============================================================================
# Webhook Endpoints
# ============================================================================

@app.post(
    "/api/v1/webhooks",
    status_code=201,
    response_model=WebhookResponse,
    tags=["Webhooks"],
    summary="Create Webhook",
    description="Register a webhook to receive event notifications"
)
@limiter.limit("100/15 minutes")
async def create_webhook(
    request: Request,
    webhook_request: WebhookCreateRequest,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Create a webhook to receive event notifications.
    
    Supported events:
    - url.created: When a URL is created
    - url.clicked: When a URL is accessed
    - url.expired: When a URL expires
    - url.deleted: When a URL is deleted
    
    The webhook will receive POST requests with:
    - X-Webhook-Signature header (HMAC-SHA256)
    - X-Webhook-Event header (event type)
    - JSON payload with event data
    
    Args:
        request: FastAPI request object
        webhook_request: Webhook creation request
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        WebhookResponse: Created webhook data
        
    Raises:
        HTTPException: If webhook URL is invalid or user already has too many
    """
    # Check webhook count per user (max 10)
    webhook_count = db.query(Webhook).filter(
        Webhook.user_id == user_id
    ).count()
    
    if webhook_count >= 10:
        raise HTTPException(
            status_code=429,
            detail="Maximum 10 webhooks per user"
        )
    
    # Create webhook with secret
    webhook = Webhook(
        user_id=user_id,
        url=str(webhook_request.url),
        events=webhook_request.events,
        secret=generate_webhook_secret()
    )
    
    db.add(webhook)
    db.commit()
    db.refresh(webhook)
    
    # Log audit event
    audit = AuditLog(
        user_id=user_id,
        action="CREATE_WEBHOOK",
        resource_type="WEBHOOK",
        resource_id=str(webhook.id),
        ip_address=request.client.host if hasattr(request, 'client') else None,
        details={"webhook_url": str(webhook_request.url), "events": webhook_request.events}
    )
    db.add(audit)
    db.commit()
    
    return {
        "id": webhook.id,
        "url": webhook.url,
        "events": webhook.events,
        "is_active": webhook.is_active,
        "created_at": webhook.created_at.isoformat(),
        "last_triggered_at": webhook.last_triggered_at.isoformat() if webhook.last_triggered_at else None
    }


@app.get(
    "/api/v1/webhooks",
    response_model=List[WebhookResponse],
    tags=["Webhooks"],
    summary="List User's Webhooks",
    description="Returns all webhooks registered by the authenticated user"
)
@limiter.limit("300/15 minutes")
async def list_webhooks(
    request: Request,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    List all webhooks for the authenticated user.
    
    Returns:
        List[WebhookResponse]: User's webhooks
    """
    webhooks = db.query(Webhook).filter(
        Webhook.user_id == user_id
    ).order_by(Webhook.created_at.desc()).all()
    
    return [
        {
            "id": w.id,
            "url": w.url,
            "events": w.events,
            "is_active": w.is_active,
            "created_at": w.created_at.isoformat(),
            "last_triggered_at": w.last_triggered_at.isoformat() if w.last_triggered_at else None
        }
        for w in webhooks
    ]


@app.get(
    "/api/v1/webhooks/{webhook_id}",
    response_model=WebhookResponse,
    tags=["Webhooks"],
    summary="Get Webhook Details",
    description="Retrieves details about a specific webhook"
)
@limiter.limit("300/15 minutes")
async def get_webhook(
    request: Request,
    webhook_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Get details about a specific webhook.
    
    Args:
        request: FastAPI request object
        webhook_id: Webhook ID
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        WebhookResponse: Webhook details
        
    Raises:
        HTTPException: If webhook not found or doesn't belong to user
    """
    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.user_id == user_id
    ).first()
    
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    return {
        "id": webhook.id,
        "url": webhook.url,
        "events": webhook.events,
        "is_active": webhook.is_active,
        "created_at": webhook.created_at.isoformat(),
        "last_triggered_at": webhook.last_triggered_at.isoformat() if webhook.last_triggered_at else None
    }


@app.delete(
    "/api/v1/webhooks/{webhook_id}",
    status_code=204,
    tags=["Webhooks"],
    summary="Delete Webhook",
    description="Deletes a webhook"
)
@limiter.limit("300/15 minutes")
async def delete_webhook(
    request: Request,
    webhook_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Delete a webhook.
    
    Args:
        request: FastAPI request object
        webhook_id: Webhook ID
        db: Database session
        user_id: Authenticated user ID
        
    Raises:
        HTTPException: If webhook not found or doesn't belong to user
    """
    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.user_id == user_id
    ).first()
    
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    db.delete(webhook)
    db.commit()
    
    # Log audit event
    audit = AuditLog(
        user_id=user_id,
        action="DELETE_WEBHOOK",
        resource_type="WEBHOOK",
        resource_id=str(webhook_id),
        ip_address=request.client.host if hasattr(request, 'client') else None,
        details={"webhook_url": webhook.url}
    )
    db.add(audit)
    db.commit()


@app.get(
    "/api/v1/webhooks/{webhook_id}/logs",
    response_model=List[WebhookLogResponse],
    tags=["Webhooks"],
    summary="Get Webhook Delivery Logs",
    description="Returns delivery attempt logs for a specific webhook"
)
@limiter.limit("300/15 minutes")
async def get_webhook_logs(
    request: Request,
    webhook_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Get delivery logs for a specific webhook.
    
    Args:
        request: FastAPI request object
        webhook_id: Webhook ID
        limit: Maximum number of logs to return (max 100)
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        List[WebhookLogResponse]: Delivery logs
        
    Raises:
        HTTPException: If webhook not found or doesn't belong to user
    """
    # Verify webhook exists and belongs to user
    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.user_id == user_id
    ).first()
    
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    limit = min(limit, 100)  # Cap at 100
    
    logs = db.query(WebhookLog).filter(
        WebhookLog.webhook_id == webhook_id
    ).order_by(WebhookLog.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "event_type": log.event_type,
            "success": log.success,
            "http_status": log.http_status,
            "attempt_number": log.attempt_number,
            "created_at": log.created_at.isoformat(),
            "error_message": log.error_message
        }
        for log in logs
    ]

# ============================================================================
# Custom Domain Endpoints
# ============================================================================

@app.post(
    "/api/v1/domains",
    status_code=201,
    response_model=DomainResponse,
    tags=["Domains"],
    summary="Register Custom Domain",
    description="Register a custom domain for URL shortening"
)
@limiter.limit("100/15 minutes")
async def register_domain(
    request: Request,
    domain_request: DomainCreateRequest,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Register a custom domain for the user.
    
    The domain will be validated via DNS resolution.
    Users can have up to 5 custom domains.
    
    Args:
        request: FastAPI request object
        domain_request: Domain registration request
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        DomainResponse: Registered domain data
        
    Raises:
        HTTPException: If domain is invalid, already taken, or user has too many
    """
    # Check domain count per user (max 5)
    domain_count = db.query(CustomDomain).filter(
        CustomDomain.user_id == user_id
    ).count()
    
    if domain_count >= 5:
        raise HTTPException(
            status_code=429,
            detail="Maximum 5 custom domains per user"
        )
    
    # Check if domain already exists
    existing_domain = db.query(CustomDomain).filter(
        CustomDomain.domain == domain_request.domain
    ).first()
    
    if existing_domain:
        raise HTTPException(
            status_code=409,
            detail="Domain already registered by another user"
        )
    
    # Validate domain format
    if not is_valid_domain_format(domain_request.domain):
        raise HTTPException(
            status_code=422,
            detail="Invalid domain format"
        )
    
    # Validate DNS resolution
    dns_valid, dns_message = validate_domain_dns(domain_request.domain)
    
    if not dns_valid:
        raise HTTPException(
            status_code=422,
            detail=f"Domain validation failed: {dns_message}"
        )
    
    # Create domain record
    domain = CustomDomain(
        user_id=user_id,
        domain=domain_request.domain,
        is_verified=True,
        verified_at=datetime.now(timezone.utc),
        is_primary=domain_request.set_as_primary
    )
    
    # If setting as primary, unset other primary domains
    if domain_request.set_as_primary:
        db.query(CustomDomain).filter(
            CustomDomain.user_id == user_id,
            CustomDomain.is_primary == True
        ).update({"is_primary": False})
    
    db.add(domain)
    db.commit()
    db.refresh(domain)
    
    # Log audit event
    audit = AuditLog(
        user_id=user_id,
        action="REGISTER_DOMAIN",
        resource_type="DOMAIN",
        resource_id=str(domain.id),
        ip_address=request.client.host if hasattr(request, 'client') else None,
        details={"domain": domain_request.domain}
    )
    db.add(audit)
    db.commit()
    
    return {
        "id": domain.id,
        "domain": domain.domain,
        "is_verified": domain.is_verified,
        "is_primary": domain.is_primary,
        "created_at": domain.created_at.isoformat(),
        "verified_at": domain.verified_at.isoformat() if domain.verified_at else None
    }


@app.get(
    "/api/v1/domains",
    response_model=List[DomainResponse],
    tags=["Domains"],
    summary="List User's Custom Domains",
    description="Returns all custom domains registered by the authenticated user"
)
@limiter.limit("300/15 minutes")
async def list_domains(
    request: Request,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    List all custom domains for the authenticated user.
    
    Returns:
        List[DomainResponse]: User's custom domains
    """
    domains = db.query(CustomDomain).filter(
        CustomDomain.user_id == user_id
    ).order_by(CustomDomain.created_at.desc()).all()
    
    return [
        {
            "id": d.id,
            "domain": d.domain,
            "is_verified": d.is_verified,
            "is_primary": d.is_primary,
            "created_at": d.created_at.isoformat(),
            "verified_at": d.verified_at.isoformat() if d.verified_at else None
        }
        for d in domains
    ]


@app.get(
    "/api/v1/domains/{domain_id}",
    response_model=DomainResponse,
    tags=["Domains"],
    summary="Get Domain Details",
    description="Retrieves details about a specific custom domain"
)
@limiter.limit("300/15 minutes")
async def get_domain(
    request: Request,
    domain_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Get details about a specific custom domain.
    
    Args:
        request: FastAPI request object
        domain_id: Domain ID
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        DomainResponse: Domain details
        
    Raises:
        HTTPException: If domain not found or doesn't belong to user
    """
    domain = db.query(CustomDomain).filter(
        CustomDomain.id == domain_id,
        CustomDomain.user_id == user_id
    ).first()
    
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    return {
        "id": domain.id,
        "domain": domain.domain,
        "is_verified": domain.is_verified,
        "is_primary": domain.is_primary,
        "created_at": domain.created_at.isoformat(),
        "verified_at": domain.verified_at.isoformat() if domain.verified_at else None
    }


@app.delete(
    "/api/v1/domains/{domain_id}",
    status_code=204,
    tags=["Domains"],
    summary="Delete Custom Domain",
    description="Deletes a custom domain"
)
@limiter.limit("300/15 minutes")
async def delete_domain(
    request: Request,
    domain_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Delete a custom domain.
    
    Args:
        request: FastAPI request object
        domain_id: Domain ID
        db: Database session
        user_id: Authenticated user ID
        
    Raises:
        HTTPException: If domain not found or doesn't belong to user
    """
    domain = db.query(CustomDomain).filter(
        CustomDomain.id == domain_id,
        CustomDomain.user_id == user_id
    ).first()
    
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    db.delete(domain)
    db.commit()
    
    # Log audit event
    audit = AuditLog(
        user_id=user_id,
        action="DELETE_DOMAIN",
        resource_type="DOMAIN",
        resource_id=str(domain_id),
        ip_address=request.client.host if hasattr(request, 'client') else None,
        details={"domain": domain.domain}
    )
    db.add(audit)
    db.commit()


@app.patch(
    "/api/v1/domains/{domain_id}/set-primary",
    response_model=DomainResponse,
    tags=["Domains"],
    summary="Set Domain as Primary",
    description="Set a custom domain as the primary domain for this user"
)
@limiter.limit("300/15 minutes")
async def set_primary_domain(
    request: Request,
    domain_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    """
    Set a custom domain as the primary domain.
    
    Only one domain can be primary per user.
    
    Args:
        request: FastAPI request object
        domain_id: Domain ID to set as primary
        db: Database session
        user_id: Authenticated user ID
        
    Returns:
        DomainResponse: Updated domain data
        
    Raises:
        HTTPException: If domain not found or doesn't belong to user
    """
    domain = db.query(CustomDomain).filter(
        CustomDomain.id == domain_id,
        CustomDomain.user_id == user_id
    ).first()
    
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    # Unset other primary domains
    db.query(CustomDomain).filter(
        CustomDomain.user_id == user_id,
        CustomDomain.is_primary == True,
        CustomDomain.id != domain_id
    ).update({"is_primary": False})
    
    domain.is_primary = True
    db.commit()
    db.refresh(domain)
    
    return {
        "id": domain.id,
        "domain": domain.domain,
        "is_verified": domain.is_verified,
        "is_primary": domain.is_primary,
        "created_at": domain.created_at.isoformat(),
        "verified_at": domain.verified_at.isoformat() if domain.verified_at else None
    }

# ============================================================================
# Redirect Endpoint (Catch-all)
# ============================================================================

@app.get("/{short_code}", tags=["Redirects"])
@limiter.limit("1000/15 minutes")
async def redirect_to_original(
    short_code: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Redirect to original URL.
    
    Supports both default domain and custom domains.
    Custom domain must belong to the same user who created the URL.
    
    Args:
        short_code: Short code to redirect
        request: FastAPI request object
        db: Database session
        
    Returns:
        RedirectResponse: Redirect to original URL
        
    Raises:
        HTTPException: If URL not found, expired, or domain mismatch
    """
    # Get the domain from Host header
    host_header = request.headers.get("host", "").lower()
    
    # Extract domain (remove port if present)
    if ":" in host_header:
        request_domain = host_header.split(":")[0]
    else:
        request_domain = host_header
    
    # Find URL by short code
    url = db.query(URL).filter(URL.short_code == short_code).first()
    
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    
    if not url.is_active:
        raise HTTPException(status_code=410, detail="URL is no longer available")
    
    if url.expires_at and url.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="URL has expired")
    
    # Validate domain if it's a custom domain
    if request_domain != "localhost" and request_domain != "127.0.0.1":
        # Check if it's a custom domain
        custom_domain = db.query(CustomDomain).filter(
            CustomDomain.domain == request_domain,
            CustomDomain.is_verified == True
        ).first()
        
        if custom_domain:
            # Custom domain found - verify it belongs to same user
            if custom_domain.user_id != url.user_id:
                raise HTTPException(
                    status_code=403,
                    detail="This domain does not have access to this URL"
                )
        # If not a custom domain and not localhost, allow (could be default domain)
    
    # Password protection
    if url.password_hash:
        password = request.query_params.get("password")
        if not password:
            raise HTTPException(status_code=401, detail="Password required")
        
        pwd_hasher = PasswordHasher()
        try:
            pwd_hasher.verify(url.password_hash, password)
        except VerifyMismatchError:
            raise HTTPException(status_code=401, detail="Invalid password")
    
    # Record click
    ip_addr = "127.0.0.1"
    if request.client and request.client.host not in ["testclient"]:
        ip_addr = str(request.client.host)
    
    click = Click(
        url_id=url.id,
        clicked_at=datetime.now(timezone.utc),
        ip_address=ip_addr,
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer")
    )
    db.add(click)
    url.total_clicks += 1
    db.commit()
    
    # Trigger webhook event
    click_data = {
        "ip_address": ip_addr,
        "country": None,  # Could add geolocation here
        "device_type": None  # Could add device detection here
    }
    trigger_url_clicked_event(url.id, click_data)
    
    return RedirectResponse(url=url.original_url, status_code=307)


# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom exception handler for HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )


# ============================================================================
# Local Development
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
