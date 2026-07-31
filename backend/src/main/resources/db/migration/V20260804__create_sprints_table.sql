CREATE TABLE dev_sprints (
    id UUID PRIMARY KEY,

    -- Relationships
    department_id UUID NOT NULL REFERENCES departments(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    team_id UUID REFERENCES teams(id),

    -- Basic info
    name VARCHAR(150) NOT NULL,
    goal VARCHAR(500),
    description VARCHAR(2000),

    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',

    -- Capacity and metrics
    capacity INT,
    velocity DOUBLE PRECISION,
    completed_story_points INT,
    total_story_points INT,
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

-- Add sprint_id to existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES dev_sprints(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS story_points INT;

-- Indexes for sprint queries
CREATE INDEX idx_dev_sprint_department_id ON dev_sprints(department_id);
CREATE INDEX idx_dev_sprint_project_id ON dev_sprints(project_id);
CREATE INDEX idx_dev_sprint_team_id ON dev_sprints(team_id);
CREATE INDEX idx_dev_sprint_status ON dev_sprints(status);
CREATE INDEX idx_dev_sprint_dates ON dev_sprints(start_date, end_date);
CREATE INDEX idx_dev_sprint_project_status ON dev_sprints(project_id, status);

-- Index for task sprint queries
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
