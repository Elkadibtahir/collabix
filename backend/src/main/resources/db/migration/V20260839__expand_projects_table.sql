-- =========================================
-- Collabix
-- Version 20260839
-- Expand projects table with new fields + fix child FKs
-- =========================================

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20),
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE,
    ADD COLUMN IF NOT EXISTS manager_id UUID,
    ADD COLUMN IF NOT EXISTS color VARCHAR(7),
    ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

ALTER TABLE projects
    ALTER COLUMN description TYPE VARCHAR(2000);

ALTER TABLE projects
    ADD CONSTRAINT fk_projects_manager
        FOREIGN KEY (manager_id)
            REFERENCES users(id)
            ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);

-- Fix child table FKs: ensure ON DELETE CASCADE for project-referencing tables

ALTER TABLE security_audits
    DROP CONSTRAINT IF EXISTS fk_security_audits_project,
    ADD CONSTRAINT fk_security_audits_project
        FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE CASCADE;

ALTER TABLE marketing_campaigns
    DROP CONSTRAINT IF EXISTS fk_marketing_campaigns_project,
    ADD CONSTRAINT fk_marketing_campaigns_project
        FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE CASCADE;

ALTER TABLE announcements
    DROP CONSTRAINT IF EXISTS fk_announcements_project,
    ADD CONSTRAINT fk_announcements_project
        FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE CASCADE;

ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS fk_notifications_project,
    ADD CONSTRAINT fk_notifications_project
        FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE CASCADE;
