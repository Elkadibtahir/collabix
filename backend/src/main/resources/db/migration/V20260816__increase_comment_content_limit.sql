-- =========================================
-- Collabix Rich Text Comments
-- Version 20260816
-- Increase comment content from VARCHAR(2000) to TEXT
-- =========================================

ALTER TABLE comments ALTER COLUMN content TYPE TEXT;
