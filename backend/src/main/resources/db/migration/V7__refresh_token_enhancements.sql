-- =========================================
-- Collabix
-- Version 7
-- Refresh Token Enhancements
-- =========================================

-- Add session-tracking columns to refresh_tokens table.

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS revoked_at       TIMESTAMPTZ;

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS last_used_at     TIMESTAMPTZ;

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS created_by_ip    VARCHAR(45);

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS created_by_user_agent VARCHAR(500);

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS device_info      VARCHAR(255);

-- Index for token lookup (already exists via unique constraint, but explicit index for queries).
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
    ON refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_revoked
    ON refresh_tokens(user_id, revoked);

