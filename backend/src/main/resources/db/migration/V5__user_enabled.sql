-- =========================================
-- Collabix
-- Version 5
-- Add enabled column for Account Activation
-- =========================================

ALTER TABLE users
    ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT FALSE;

