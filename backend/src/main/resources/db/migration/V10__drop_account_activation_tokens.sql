-- =========================================
-- Collabix
-- Version 10
-- Drop account_activation_tokens table
-- =========================================
--
-- Why this migration is necessary:
-- The AccountActivationToken entity has been consolidated into
-- the richer ActivationToken entity (table: activation_tokens).
-- AccountActivationToken and AccountActivationTokenRepository
-- are now removed from the codebase.
--
-- This migration drops the obsolete table to clean up the schema.

DROP TABLE IF EXISTS account_activation_tokens;
