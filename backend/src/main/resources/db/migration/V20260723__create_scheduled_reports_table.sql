CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    scope_type VARCHAR(20) NOT NULL,
    scope_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filter TEXT,
    format VARCHAR(10) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    cron_expression VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    last_execution TIMESTAMP WITH TIME ZONE,
    next_execution TIMESTAMP WITH TIME ZONE,
    execution_count BIGINT DEFAULT 0,
    last_execution_status VARCHAR(20),
    last_error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_schedule_workspace_name UNIQUE (workspace_id, name)
);

CREATE INDEX idx_sched_reports_status_next ON scheduled_reports (status, next_execution);
CREATE INDEX idx_sched_reports_workspace ON scheduled_reports (workspace_id);
