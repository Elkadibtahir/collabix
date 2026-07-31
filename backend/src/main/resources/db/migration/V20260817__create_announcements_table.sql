-- =========================================
-- Collabix Announcements Module
-- Version 20260817
-- Create announcements table for internal
-- communication (workspace/department/team)
-- =========================================

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id  UUID NOT NULL,
    department_id UUID,
    team_id       UUID,
    project_id    UUID,

    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    -- AuditableEntity
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ,
    created_by  UUID,
    updated_by  UUID,
    version     BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_announcements_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_announcements_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_announcements_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_announcements_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_announcements_workspace_id ON announcements(workspace_id);
CREATE INDEX idx_announcements_department_id ON announcements(department_id);
CREATE INDEX idx_announcements_team_id ON announcements(team_id);
CREATE INDEX idx_announcements_project_id ON announcements(project_id);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_is_pinned ON announcements(is_pinned);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);
CREATE INDEX idx_announcements_workspace_status ON announcements(workspace_id, status);
CREATE INDEX idx_announcements_workspace_pinned ON announcements(workspace_id, is_pinned, status);
