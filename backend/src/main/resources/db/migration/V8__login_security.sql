-- =========================================
-- Collabix
-- Version 8
-- Login Security (Brute-Force Protection)
-- =========================================
--
-- Adds columns to track failed login attempts
-- and account lockout timestamps.
--
-- These columns support the brute-force protection
-- feature without affecting any existing data.

ALTER TABLE users
    ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
    ADD COLUMN locked_at TIMESTAMPTZ;

COMMENT ON COLUMN users.failed_login_attempts
    IS 'Number of consecutive failed login attempts. Resets to 0 on successful login.';

COMMENT ON COLUMN users.locked_at
    IS 'Timestamp when the account was automatically locked due to excessive failed login attempts. NULL if not locked.';
