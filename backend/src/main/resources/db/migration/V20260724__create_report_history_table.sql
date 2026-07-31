CREATE TABLE report_history (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    scope_type VARCHAR(20) NOT NULL,
    scope_id UUID NOT NULL,
    report_name VARCHAR(255),
    generated_by UUID,
    trigger_type VARCHAR(20) NOT NULL,
    schedule_id UUID,
    export_format VARCHAR(10),
    generation_status VARCHAR(20) NOT NULL,
    generation_start TIMESTAMP WITH TIME ZONE,
    generation_end TIMESTAMP WITH TIME ZONE,
    execution_duration BIGINT,
    file_name VARCHAR(255),
    file_size BIGINT,
    storage_location TEXT,
    content_type VARCHAR(100),
    generated_record_count BIGINT,
    generated_page_count INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_report_history_ws_start ON report_history (workspace_id, generation_start DESC);
CREATE INDEX idx_report_history_ws_scope ON report_history (workspace_id, scope_type);
CREATE INDEX idx_report_history_ws_trigger ON report_history (workspace_id, trigger_type);
CREATE INDEX idx_report_history_schedule ON report_history (schedule_id);
CREATE INDEX idx_report_history_generated_by ON report_history (workspace_id, generated_by);
