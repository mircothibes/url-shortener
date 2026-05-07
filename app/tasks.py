# app/tasks.py
from celery import Celery, shared_task
from datetime import datetime, timezone
import os

from app.database import SessionLocal
from app.models import URL, Click, ClickAggregate, Webhook, WebhookLog, AuditLog

# Create Celery app instance
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
app = Celery(
    "url_shortener",
    broker=REDIS_URL,
    backend=REDIS_URL
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@shared_task(bind=True, max_retries=3)
def process_click(self, url_id: int, ip_address: str, user_agent: str, referrer: str):
    """
    Background task: track a click with geolocation & device detection
    """
    try:
        db_session = SessionLocal()
        
        # Geolocation
        geo_data = geoip_db.get(ip_address) or {}
        country = geo_data.get('country', {}).get('iso_code', 'XX')
        
        # Device detection (from user_agent)
        device_type = parse_device_type(user_agent)
        
        # Save click
        click = Click(
            url_id=url_id,
            country=country,
            device_type=device_type,
            user_agent=user_agent,
            referrer=referrer,
            ip_address=ip_address
        )
        db_session.add(click)
        db_session.commit()
        
        # Trigger aggregation update (async)
        update_hourly_aggregates.delay(url_id)
        
    except Exception as exc:
        self.retry(exc=exc, countdown=60)
    finally:
        db_session.close()

@shared_task
def update_hourly_aggregates(url_id: int):
    """
    Aggregate clicks by hour for fast analytics queries
    """
    db_session = SessionLocal()
    
    hour_start = datetime.now().replace(minute=0, second=0, microsecond=0)
    
    # Query clicks from this hour
    clicks = db_session.query(Click).filter(
        Click.url_id == url_id,
        Click.clicked_at >= hour_start
    ).all()
    
    # Aggregate
    device_counts = {}
    country_counts = {}
    
    for click in clicks:
        device_counts[click.device_type] = device_counts.get(click.device_type, 0) + 1
        country_counts[click.country] = country_counts.get(click.country, 0) + 1
    
    # Save or update aggregate
    agg = db_session.query(ClickAggregate).filter_by(
        url_id=url_id,
        date_hour=hour_start
    ).first()
    
    if agg:
        agg.total_clicks = len(clicks)
        agg.device_breakdown = device_counts
        agg.country_breakdown = country_counts
    else:
        agg = ClickAggregate(
            url_id=url_id,
            date_hour=hour_start,
            total_clicks=len(clicks),
            device_breakdown=device_counts,
            country_breakdown=country_counts
        )
        db_session.add(agg)
    
    db_session.commit()
    db_session.close()

@shared_task
def cleanup_expired_urls():
    """
    Scheduled task (daily): delete expired URLs and their clicks
    """
    db_session = SessionLocal()
    
    expired = db_session.query(URL).filter(
        URL.expires_at < datetime.now(),
        URL.is_active == True
    ).all()
    
    for url in expired:
        url.is_active = False
    
    db_session.commit()
    db_session.close()

# ============================================================================
# Webhook Tasks
# ============================================================================

from app.webhooks import deliver_webhook, calculate_next_retry
from app.models import Webhook, WebhookLog

@shared_task(bind=True, max_retries=5)
def deliver_webhook_event(self, webhook_id: int, event_type: str, event_payload: dict, attempt_number: int = 1):
    """
    Deliver webhook event to external endpoint with exponential backoff retry.
    
    Args:
        webhook_id: ID of webhook to deliver to
        event_type: Type of event (url.clicked, url.created, etc)
        event_payload: Event data as dict
        attempt_number: Current attempt number (1-5)
    """
    import asyncio
    
    db_session = SessionLocal()
    try:
        # Get webhook
        webhook = db_session.query(Webhook).filter(
            Webhook.id == webhook_id,
            Webhook.is_active == True
        ).first()
        
        if not webhook:
            return
        
        # Check if webhook is subscribed to this event
        if event_type not in webhook.events:
            return
        
        # Attempt delivery (using asyncio.run for async function)
        success, status_code, response_body = asyncio.run(deliver_webhook(
            webhook_url=webhook.url,
            event_type=event_type,
            event_payload=event_payload,
            secret=webhook.secret,
            timeout=10
        ))
        
        # Log attempt
        log = WebhookLog(
            webhook_id=webhook_id,
            event_type=event_type,
            event_data=event_payload,
            http_status=status_code,
            response_body=response_body,
            success=success,
            attempt_number=attempt_number
        )
        
        if success:
            webhook.last_triggered_at = datetime.now(timezone.utc)
        else:
            # Schedule retry with exponential backoff
            if attempt_number < 5:
                next_retry = calculate_next_retry(attempt_number)
                if next_retry:
                    log.next_retry_at = next_retry
                    log.error_message = f"HTTP {status_code}: {response_body}"
                    
                    # Schedule retry
                    deliver_webhook_event.apply_async(
                        args=[webhook_id, event_type, event_payload, attempt_number + 1],
                        eta=next_retry
                    )
            else:
                log.error_message = "Max retries exceeded"
        
        db_session.add(log)
        db_session.commit()
        
    except Exception as exc:
        db_session.rollback()
        raise
    finally:
        db_session.close()



@shared_task
def dispatch_event_to_all_webhooks(user_id: str, event_type: str, event_payload: dict):
    """
    Dispatch event to all active webhooks for a user.
    
    Args:
        user_id: User ID (as string from UUID)
        event_type: Type of event
        event_payload: Event data
    """
    from uuid import UUID
    
    db_session = SessionLocal()
    try:
        webhooks = db_session.query(Webhook).filter(
            Webhook.user_id == UUID(user_id),
            Webhook.is_active == True
        ).all()
        
        for webhook in webhooks:
            if event_type in webhook.events:
                deliver_webhook_event.delay(
                    webhook.id,
                    event_type,
                    event_payload
                )
    finally:
        db_session.close()


# ============================================================================
# Event Trigger Helpers
# ============================================================================

def trigger_url_clicked_event(url_id: int, click_data: dict):
    """Trigger url.clicked webhook event"""
    db_session = SessionLocal()
    try:
        url = db_session.query(URL).filter(URL.id == url_id).first()
        if not url:
            return
        
        event_payload = {
            "event_type": "url.clicked",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "url_id": url.id,
            "short_code": url.short_code,
            "original_url": url.original_url,
            "total_clicks": url.total_clicks,
            "ip_address": click_data.get("ip_address"),
            "country": click_data.get("country"),
            "device_type": click_data.get("device_type")
        }
        
        dispatch_event_to_all_webhooks.delay(str(url.user_id), "url.clicked", event_payload)
    finally:
        db_session.close()


def trigger_url_created_event(url_id: int):
    """Trigger url.created webhook event"""
    db_session = SessionLocal()
    try:
        url = db_session.query(URL).filter(URL.id == url_id).first()
        if not url:
            return
        
        event_payload = {
            "event_type": "url.created",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "url_id": url.id,
            "short_code": url.short_code,
            "original_url": url.original_url,
            "user_id": str(url.user_id)
        }
        
        dispatch_event_to_all_webhooks.delay(str(url.user_id), "url.created", event_payload)
    finally:
        db_session.close()


def trigger_url_deleted_event(url_id: int, short_code: str, original_url: str, user_id: str):
    """Trigger url.deleted webhook event"""
    event_payload = {
        "event_type": "url.deleted",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "url_id": url_id,
        "short_code": short_code,
        "original_url": original_url
    }
    
    dispatch_event_to_all_webhooks.delay(user_id, "url.deleted", event_payload)    
