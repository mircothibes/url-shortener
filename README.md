# URL Shortener & Analytics SaaS

![Live](https://img.shields.io/badge/Status-Live-brightgreen)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)
![React](https://img.shields.io/badge/React-TypeScript-3178C6)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![Redis](https://img.shields.io/badge/Cache-Redis-DC382D)
![GCP](https://img.shields.io/badge/Cloud-GCP%20Cloud%20Run-orange)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF)
![License](https://img.shields.io/badge/License-MIT-yellow)

A production-grade, full-stack URL shortener with click analytics, geolocation, and link management. Python/FastAPI backend and a React + TypeScript frontend, deployed on Google Cloud Run with PostgreSQL and Redis.

## 🚀 Live Demo

| | URL |
|---|---|
| **App (frontend)** | https://url-shortener-frontend-1000156659602.us-central1.run.app |
| **API** | https://url-shortener-1000156659602.us-central1.run.app |
| **API Docs (Swagger)** | https://url-shortener-1000156659602.us-central1.run.app/docs |

**Demo login:** `demo@example.com` / `demo123`

## 🏗️ Architecture
```
Browser

│  HTTPS

▼

Frontend  ──  Cloud Run (nginx serving the Vite build, SPA fallback)

│  HTTPS · REST · Bearer auth

▼

Backend   ──  Cloud Run (FastAPI)

│

├──►  Redis (Memorystore)        short-code cache

└──►  PostgreSQL 15 (Cloud SQL)  via Unix socket — no public IP
```

The database is **not reachable from the public internet**: Cloud Run connects to Cloud SQL through the Cloud SQL connector (Unix socket), and the instance has no authorized networks. See [`docs/INFRA.md`](docs/INFRA.md) for the full connection and security setup.

## 🧠 Skills Demonstrated

**Language & Backend**
- **Python** as the core backend language
- **FastAPI** async REST API with OpenAPI/Swagger documentation
- Bearer-token authentication and per-endpoint / per-user rate limiting (`slowapi`)
- Full CRUD with partial updates (`PATCH`) and ownership checks

**Data & Performance**
- **PostgreSQL 15** with **SQLAlchemy** ORM and **Pydantic v2** schemas
- Versioned SQL migrations (`migrations/sql/`) and a schema-drift audit workflow
- Strategic indexing and SQL aggregation for fast analytics queries
- **Redis** caching for short-code lookups and **Celery** for background tasks

**Security**
- **Argon2** password hashing
- Secret management and credential rotation; no secrets committed to the repo
- Database isolated from the public internet (Cloud SQL via Unix socket)
- Environment-aware CORS configuration

**Cloud & DevOps**
- **GCP Cloud Run**, **Cloud SQL**, and **Memorystore (Redis)**
- Multi-stage **Docker** builds and **Cloud Build** pipelines
- **GitHub Actions** CI running the automated test suite

**Frontend**
- **React + TypeScript** SPA built with **Vite**
- **Tailwind CSS** with full dark mode, **React Router**, and **Axios**
- **Recharts** for the analytics dashboards

## 🎯 Features

**Core**
- URL shortening with auto-generated or custom short codes
- Click tracking with timestamps, referrer, device, and geolocation
- Analytics dashboard (totals, top URLs, country/device breakdowns)
- URL management UI: list, search, sort, edit, and delete
- QR code generation for short URLs

**Advanced**
- Four link expiration policies (date, days, clicks, combined)
- Password-protected short links
- Per-user rate limiting with admin overrides
- Webhook system for real-time event notifications
- Custom domains for branded short links
- Batch creation (up to 50 URLs atomically)

## 🛠️ Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Language | Python 3.11 |
| Framework | FastAPI 0.104 |
| Database | PostgreSQL 15 (Cloud SQL) |
| ORM | SQLAlchemy 1.4.46 |
| Validation | Pydantic v2 |
| Cache | Redis (Memorystore) |
| Background tasks | Celery |
| Auth & hashing | API keys, Argon2 |
| Rate limiting | slowapi |
| Server | Uvicorn (ASGI) |

### Frontend
| Component | Technology |
|-----------|-----------|
| Framework | React + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS (dark mode) |
| Routing | React Router |
| HTTP client | Axios |
| Charts | Recharts |
| Icons | Lucide React |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Compute | GCP Cloud Run (backend + frontend) |
| Build | Docker (multi-stage), Cloud Build |
| CI | GitHub Actions |
| Web server | nginx (static SPA + fallback) |

## 📚 API

Interactive documentation is available at `/docs` (Swagger) and `/redoc`.

**Create a short URL**
```bash
POST /api/v1/urls
Authorization: Bearer YOUR_API_KEY

{
  "original_url": "https://example.com",
  "description": "Optional description",
  "tags": ["tag1", "tag2"]
}
```

**Redirect (tracks the click)**
```bash
GET /{short_code}
```

**Update a URL (partial)**
```bash
PATCH /api/v1/urls/{url_id}
Authorization: Bearer YOUR_API_KEY

{ "description": "New description", "is_active": false }
```

**Get analytics**
```bash
GET /api/v1/urls/{url_id}/analytics
Authorization: Bearer YOUR_API_KEY

{
  "total_clicks": 42,
  "unique_visitors": 38,
  "top_country": "LU",
  "top_device": "Mobile",
  "device_breakdown": { },
  "country_breakdown": { },
  "top_referrers": { }
}
```

## 💻 Local Development

### Backend
```bash
git clone https://github.com/mircothibes/url-shortener.git
cd url-shortener
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

docker compose up -d        # PostgreSQL + Redis
uvicorn app.main:app --reload
```
API at `http://localhost:8000`, docs at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
Set `VITE_API_URL` and `VITE_API_KEY` in `frontend/.env`.

## 🧪 Testing

```bash
pytest tests/ -v
pytest tests/ --cov=app --cov-report=html
```
The test suite also runs automatically on every push via GitHub Actions.

## 📁 Project Structure
```
url-shortener/

├── app/                  # Backend (FastAPI)

│   ├── main.py           # Routes / endpoints

│   ├── models.py         # SQLAlchemy models

│   ├── database.py       # Engine / session

│   ├── cache.py          # Redis caching

│   ├── cors.py           # Environment-aware CORS

│   ├── geolocation.py    # IP geolocation

│   ├── webhooks.py       # Webhook delivery

│   └── ...               # batch, expiration, rate_limit, tasks, ...

├── frontend/             # Frontend (React + TypeScript)

│   ├── src/

│   │   ├── pages/        # Dashboard, URL Management, Analytics, Settings

│   │   ├── components/   # UI, Dashboard, Analytics, URLManagement

│   │   ├── services/     # api.ts, urls.ts (Axios + mapping)

│   │   └── contexts/     # Auth, Theme

│   ├── Dockerfile        # Multi-stage build (Vite -> nginx)

│   ├── nginx.conf        # SPA fallback

│   └── cloudbuild.yaml   # Cloud Build config

├── migrations/sql/       # Versioned SQL migrations

├── tests/                # Automated tests

├── docs/INFRA.md         # Infrastructure & connection setup

├── Dockerfile            # Backend image

└── docker-compose.yml    # Local Postgres + Redis
```

---

## 👨‍💻 Author
**Marcos Vinicius Thibes Kemer** 

## 📄 License
MIT License — see the LICENSE file for details.
