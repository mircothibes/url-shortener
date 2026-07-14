-- Migration 0003: add a nullable "name" column to the users table.
--
-- The application derives a display name from the email when this is NULL,
-- so existing users are unaffected. New registrations can now store the
-- name provided at sign-up.
--
-- Idempotent: safe to run more than once.

ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
