# URL Shortener API - Complete Guide

## Overview
Production-grade URL shortening service with analytics, expiration policies, and webhook support.

**Base URL**: `http://localhost:8000`
**API Version**: 1.0.0
**Auth**: Bearer token in `Authorization` header

---

## Authentication

All endpoints (except `/docs` and `/redoc`) require authentication.

**Get API Key**: Register and generate in dashboard
**Usage**:
```bash
curl -H "Authorization: Bearer your-api-key" http://localhost:8000/api/v1/urls
```

---

## Core Endpoints

### 1. Create Short URL
**POST** `/api/v1/urls`

**Request**:
```json
{
  "original_url": "https://github.com/mircothibes",
  "custom_slug": "my-github",
  "expiration_policy": "days",
  "expires_after_days": 30,
  "tags": ["portfolio", "github"],
  "description": "My GitHub profile"
}
```

**Response** (201):
```json
{
  "id": 1,
  "short_code": "my-github",
  "original_url": "https://github.com/mircothibes",
  "created_at": "2026-05-18T10:30:00Z",
  "total_clicks": 0,
  "is_active": true,
  "expires_at": "2026-06-18T10:30:00Z",
  "description": "My GitHub profile"
}
```

---

### 2. Redirect to Original URL
**GET** `/{short_code}`

**Usage**:
```bash
curl -L http://localhost:8000/my-github
# Redirects to https://github.com/mircothibes
```

**Status Codes**:
- `307`: Temporary redirect
- `401`: Password required
- `403`: Domain access denied
- `404`: URL not found
- `410`: URL expired

---

### 3. List Your URLs
**GET** `/api/v1/urls`

**Response**:
```json
[
  {
    "id": 1,
    "short_code": "my-github",
    "original_url": "https://github.com/mircothibes",
    "created_at": "2026-05-18T10:30:00Z",
    "total_clicks": 42,
    "is_active": true
  }
]
```

---

### 4. Get URL Details
**GET** `/api/v1/urls/{url_id}`

**Response**:
```json
{
  "id": 1,
  "short_code": "my-github",
  "original_url": "https://github.com/mircothibes",
  "created_at": "2026-05-18T10:30:00Z",
  "total_clicks": 42,
  "is_active": true,
  "expires_at": "2026-06-18T10:30:00Z"
}
```

---

### 5. Get Analytics
**GET** `/api/v1/urls/{url_id}/analytics`

**Response**:
```json
{
  "total_clicks": 42,
  "unique_visitors": 38,
  "top_country": "US",
  "top_device": "Desktop",
  "device_breakdown": {
    "Desktop": 25,
    "Mobile": 17
  },
  "country_breakdown": {
    "US": 30,
    "BR": 8,
    "DE": 4
  }
}
```

---

### 6. Create Batch URLs
**POST** `/api/v1/urls/batch`

**Request**:
```json
{
  "urls": [
    {
      "original_url": "https://github.com",
      "expiration_policy": "days",
      "expires_after_days": 30
    },
    {
      "original_url": "https://linkedin.com",
      "custom_slug": "my-linkedin"
    }
  ]
}
```

**Response** (201):
```json
{
  "created": 2,
  "urls": [
    {"id": 2, "short_code": "abc123", ...},
    {"id": 3, "short_code": "my-linkedin", ...}
  ]
}
```

---

## Expiration Policies

### Policy Types
| Type | Description | Example |
|------|-------------|---------|
| `date` | Expires on specific date | `expires_at: "2026-06-18T10:30:00Z"` |
| `days` | Expires after N days | `expires_after_days: 30` |
| `clicks` | Expires after N clicks | `expires_after_clicks: 100` |
| `combined` | Expires on date OR after N clicks | Both `expires_at` and `expires_after_clicks` |

### Check Expiration
**GET** `/api/v1/urls/{url_id}/expiration`

**Response**:
```json
{
  "expiration_policy": "days",
  "expires_after_days": 30,
  "is_expired": false,
  "is_expiring_soon": false,
  "time_remaining": "29 days, 23 hours"
}
```

---

## Webhooks

### Register Webhook
**POST** `/api/v1/webhooks`

**Request**:
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["url.created", "url.clicked", "url.deleted"]
}
```

---

## Error Handling

**Standard Error Response**:
```json
{
  "detail": "Invalid URL format. Must start with http:// or https://"
}
```

**Common Status Codes**:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (e.g., slug already exists)
- `422`: Validation Error
- `429`: Rate Limited

---

## Rate Limits

- Create URL: **100 requests per 15 minutes**
- Redirect: **1000 requests per 15 minutes**
- List URLs: **300 requests per 15 minutes**

---

## Interactive Documentation

Visit these URLs to explore the API:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Examples

### cURL
```bash
# Create short URL
curl -X POST http://localhost:8000/api/v1/urls \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "original_url": "https://github.com/mircothibes",
    "custom_slug": "github"
  }'

# Redirect
curl -L http://localhost:8000/github

# Get analytics
curl http://localhost:8000/api/v1/urls/1/analytics \
  -H "Authorization: Bearer your-api-key"
```

### Python
```python
import requests

API_KEY = "your-api-key"
BASE_URL = "http://localhost:8000"

headers = {"Authorization": f"Bearer {API_KEY}"}

# Create URL
response = requests.post(
    f"{BASE_URL}/api/v1/urls",
    json={"original_url": "https://github.com"},
    headers=headers
)
short_code = response.json()["short_code"]

# Get analytics
analytics = requests.get(
    f"{BASE_URL}/api/v1/urls/1/analytics",
    headers=headers
).json()
print(f"Total clicks: {analytics['total_clicks']}")
```

---

## Support

For issues or questions:
- GitHub: https://github.com/mircothibes/url-shortener
- Email: mircothibes@gmail.com
