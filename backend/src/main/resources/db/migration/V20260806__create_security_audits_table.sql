CREATE TABLE security_audits (
    id UUID PRIMARY KEY,

    -- Relationships
    department_id UUID NOT NULL REFERENCES departments(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    team_id UUID REFERENCES teams(id),

    -- Basic info
    name VARCHAR(150) NOT NULL,
    description VARCHAR(2000),

    -- Classification
    audit_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',

    -- Dates
    start_date DATE,
    end_date DATE,
    completed_at DATE,

    -- Metrics
    total_tasks INT,
    completed_tasks INT,
    completion_percentage DOUBLE PRECISION,

    -- AuditableEntity fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0
);

-- Indexes for security audit queries
CREATE INDEX idx_audit_department_id   ON security_audits(department_id);
CREATE INDEX idx_audit_project_id      ON security_audits(project_id);
CREATE INDEX idx_audit_team_id         ON security_audits(team_id);
CREATE INDEX idx_audit_status          ON security_audits(status);
CREATE INDEX idx_audit_type            ON security_audits(audit_type);
CREATE INDEX idx_audit_priority        ON security_audits(priority);
CREATE INDEX idx_audit_dates           ON security_audits(start_date, end_date);
CREATE INDEX idx_audit_project_status  ON security_audits(project_id, status);

-- Add security_audit_id to existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS security_audit_id UUID REFERENCES security_audits(id);
CREATE INDEX idx_tasks_security_audit_id ON tasks(security_audit_id);
