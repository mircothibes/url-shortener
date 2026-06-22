# Infrastructure

This document describes how the application is deployed and how its components
connect, so the setup is reproducible and infrastructure changes are tracked.

## Stack

- **Backend:** FastAPI on Cloud Run (region `us-central1`, service `url-shortener`)
- **Database:** Cloud SQL for PostgreSQL 15 (instance `url-shortener-db`)
- **Cache:** Redis (Memorystore)
- **Project:** `url-shortener-prod-494217`

## Database connection (Cloud SQL via Unix socket)

Cloud Run connects to Cloud SQL through the built-in Cloud SQL connector
(Unix socket), not over a public IP. This keeps the database off the public
internet.

The Cloud SQL instance is attached to the Cloud Run service:

```bash
gcloud run services update url-shortener \
  --region=us-central1 \
  --add-cloudsql-instances=url-shortener-prod-494217:us-central1:url-shortener-db
```


The `DATABASE_URL` points at the socket instead of an IP and port:
```
postgresql://app_user:<PASSWORD>@/url_shortener?host=/cloudsql/url-shortener-prod-494217:us-central1:url-shortener-db
```

`app/database.py` consumes `DATABASE_URL` directly via SQLAlchemy
`create_engine`, so no code change is needed to switch between socket and TCP
connections.

## Network security

- The Cloud SQL instance has **no authorized networks** — the database is not
  reachable from the public internet. Only Cloud Run reaches it, through the
  socket.
- A public IP is still assigned to the instance but is unusable without an
  authorized network. Disabling it entirely (`--no-assign-ip`) is a possible
  future hardening step.

Verify there are no authorized networks (empty output is expected):

```bash
gcloud sql instances describe url-shortener-db \
  --format="value(settings.ipConfiguration.authorizedNetworks[].value)"
```

## Local database access

Local access uses the Cloud SQL Auth Proxy via `gcloud sql connect`, which
temporarily authorizes the current IP and opens a `psql` session:

```bash
gcloud auth application-default login
gcloud sql connect url-shortener-db --user=app_user --database=url_shortener
```

## Secrets

- Production configuration is stored as Cloud Run environment variables.
- `.env*` files are git-ignored and must never be committed.
- If a secret is ever exposed, rotate it — removing the file does not un-leak it.

## Schema migrations

Versioned SQL migrations live in `migrations/sql/`, applied via `psql`.
See that directory for the change history.

