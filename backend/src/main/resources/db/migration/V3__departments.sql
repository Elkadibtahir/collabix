-- =========================================
-- Collabix
-- Version 3
-- Departments and team-to-department linkage
-- =========================================

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_departments_workspace
        FOREIGN KEY (workspace_id)
            REFERENCES workspaces(id)
            ON DELETE CASCADE
);

CREATE INDEX idx_departments_workspace_id ON departments(workspace_id);
CREATE INDEX idx_departments_workspace_status ON departments(workspace_id, status);
CREATE INDEX idx_departments_workspace_name ON departments(workspace_id, name);

ALTER TABLE teams
    ADD COLUMN department_id UUID;

ALTER TABLE teams
    ADD CONSTRAINT fk_teams_department
        FOREIGN KEY (department_id)
            REFERENCES departments(id)
            ON DELETE CASCADE;

CREATE INDEX idx_teams_department_id ON teams(department_id);
CREATE INDEX idx_teams_department_name ON teams(department_id, name);
