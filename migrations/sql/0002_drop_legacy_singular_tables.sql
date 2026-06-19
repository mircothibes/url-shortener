-- Migration: 0002_drop_legacy_singular_tables
-- Date: 2026-06-19
-- Purpose: Drop orphaned legacy tables from a pre-redesign schema. These
--          singular-named tables were not mapped by any SQLAlchemy model and
--          were unused by the application. Verified empty before dropping,
--          except "user" which held a single duplicate test row already
--          present in the "users" table. A full backup was taken beforehand.
-- Dropped: audit_log, click, click_aggregate, url, user
-- Idempotent: safe to re-run.

DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS click CASCADE;
DROP TABLE IF EXISTS click_aggregate CASCADE;
DROP TABLE IF EXISTS url CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
