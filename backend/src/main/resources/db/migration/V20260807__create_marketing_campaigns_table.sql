CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY,

    -- Relationships
    department_id UUID NOT NULL REFERENCES departments(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    team_id UUID REFERENCES teams(id),

    -- Basic info
    name VARCHAR(150) NOT NULL,
    description VARCHAR(2000),

    -- Classification
    campaign_type VARCHAR(20) NOT NULL,
    objective VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    target_audience VARCHAR(500),

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

-- Indexes for campaign queries
CREATE INDEX idx_campaign_department_id   ON marketing_campaigns(department_id);
CREATE INDEX idx_campaign_project_id      ON marketing_campaigns(project_id);
CREATE INDEX idx_campaign_team_id         ON marketing_campaigns(team_id);
CREATE INDEX idx_campaign_status          ON marketing_campaigns(status);
CREATE INDEX idx_campaign_type            ON marketing_campaigns(campaign_type);
CREATE INDEX idx_campaign_priority        ON marketing_campaigns(priority);
CREATE INDEX idx_campaign_dates           ON marketing_campaigns(start_date, end_date);
CREATE INDEX idx_campaign_project_status  ON marketing_campaigns(project_id, status);

-- Add marketing_campaign_id to existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS marketing_campaign_id UUID REFERENCES marketing_campaigns(id);
CREATE INDEX idx_tasks_marketing_campaign_id ON tasks(marketing_campaign_id);
