CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL,
    task_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_activities_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_activities_actor FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_activities_task_id ON activities(task_id);
CREATE INDEX IF NOT EXISTS idx_activities_actor_id ON activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_task_status ON activities(task_id, status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL,
    task_id UUID NOT NULL,
    comment_id UUID,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_attachments_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_attachments_comment FOREIGN KEY (comment_id) REFERENCES comments(id)
);

CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_comment_id ON attachments(comment_id);
CREATE INDEX IF NOT EXISTS idx_attachments_status ON attachments(status);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at);
CREATE INDEX IF NOT EXISTS idx_attachments_task_status ON attachments(task_id, status);

CREATE TABLE IF NOT EXISTS handover_journals (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL,
    workspace_id UUID NOT NULL,
    department_id UUID NOT NULL,
    project_id UUID NOT NULL,
    shift VARCHAR(20) NOT NULL,
    journal_date TIMESTAMP WITH TIME ZONE NOT NULL,
    generated_summary TEXT NOT NULL,
    main_done_work TEXT NOT NULL,
    main_remaining_work TEXT NOT NULL,
    blockers TEXT NOT NULL,
    difficulties TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    generation_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    generation_date TIMESTAMP WITH TIME ZONE,
    generation_processed_by UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_handover_journals_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
    CONSTRAINT fk_handover_journals_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_handover_journals_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_handover_journals_workspace_id ON handover_journals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_handover_journals_department_id ON handover_journals(department_id);
CREATE INDEX IF NOT EXISTS idx_handover_journals_project_id ON handover_journals(project_id);
CREATE INDEX IF NOT EXISTS idx_handover_journals_shift ON handover_journals(shift);
CREATE INDEX IF NOT EXISTS idx_handover_journals_date ON handover_journals(journal_date);
CREATE INDEX IF NOT EXISTS idx_handover_journals_status ON handover_journals(status);
CREATE INDEX IF NOT EXISTS idx_handover_journals_created_at ON handover_journals(created_at);

ALTER TABLE handover_journals ADD CONSTRAINT uk_handover_journals_project_shift_date UNIQUE (project_id, shift, journal_date);

CREATE TABLE IF NOT EXISTS mentions (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL,
    comment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notification_sent BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_mentions_comment FOREIGN KEY (comment_id) REFERENCES comments(id),
    CONSTRAINT fk_mentions_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_mentions_comment_id ON mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_mentions_user_id ON mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_created_at ON mentions(created_at);
