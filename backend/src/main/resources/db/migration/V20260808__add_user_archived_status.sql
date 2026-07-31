-- =========================================
-- Collabix
-- Version V20260808
-- Add ARCHIVED user status support
-- =========================================

ALTER TABLE users
    ADD COLUMN archived_at TIMESTAMPTZ;

COMMENT ON COLUMN users.archived_at
    IS 'Timestamp when the user was archived. NULL if not archived.';
