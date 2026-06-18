-- Migration: 0001_add_webhooks_webhook_logs_user_rate_limits
-- Date: 2026-06-18
-- Purpose: Create tables defined in app/models.py but missing from Cloud SQL
--          (schema drift audit). Tables: webhooks, webhook_logs, user_rate_limits.
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS webhooks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events JSONB NOT NULL,
    is_active BOOLEAN NOT NULL,
    secret VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_triggered_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS ix_webhooks_user_id ON webhooks (user_id);
CREATE INDEX IF NOT EXISTS ix_webhooks_is_active ON webhooks (is_active);
CREATE INDEX IF NOT EXISTS ix_webhooks_created_at ON webhooks (created_at);

CREATE TABLE IF NOT EXISTS webhook_logs (
    id BIGSERIAL PRIMARY KEY,
    webhook_id BIGINT NOT NULL REFERENCES webhooks (id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    http_status BIGINT,
    response_body TEXT,
    error_message TEXT,
    attempt_number BIGINT NOT NULL,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    next_retry_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS ix_webhook_logs_webhook_id ON webhook_logs (webhook_id);
CREATE INDEX IF NOT EXISTS ix_webhook_logs_success ON webhook_logs (success);
CREATE INDEX IF NOT EXISTS ix_webhook_logs_created_at ON webhook_logs (created_at);

CREATE TABLE IF NOT EXISTS user_rate_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    create_url_limit VARCHAR(50) NOT NULL,
    list_urls_limit VARCHAR(50) NOT NULL,
    analytics_limit VARCHAR(50) NOT NULL,
    redirect_limit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_user_rate_limits_user_id ON user_rate_limits (user_id);
