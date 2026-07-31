-- =========================================
-- Collabix
-- Version 4
-- Align team_members schema with TeamMember entity
-- =========================================

ALTER TABLE team_members
    ADD COLUMN IF NOT EXISTS status VARCHAR(20);

UPDATE team_members
SET status = 'ACTIVE'
WHERE status IS NULL;

ALTER TABLE team_members
    ALTER COLUMN status SET NOT NULL;
