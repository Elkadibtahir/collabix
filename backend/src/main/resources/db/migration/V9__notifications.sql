-- =========================================
-- Collabix
-- Version 9
-- Notification Entity
-- =========================================

CREATE TABLE notifications (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Mandatory context
    workspace_id UUID NOT NULL,
    recipient_id UUID NOT NULL,

    -- Notification content
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body VARCHAR(2000),
    link_url VARCHAR(500),

    -- Optional business resource references
    project_id UUID,
    task_id UUID,
    comment_id UUID,
    document_id UUID,
    knowledge_base_id UUID,
    handover_entry_id UUID,

    -- Generic resource reference (future modules)
    resource_type VARCHAR(50),
    resource_id UUID,

    -- Read tracking & soft delete
    read_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',

    -- AuditableEntity
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,

    -- Foreign keys
    CONSTRAINT fk_notifications_workspace
        FOREIGN KEY (workspace_id)
            REFERENCES workspaces(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_notifications_project
        FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE SET NULL,

    CONSTRAINT fk_notifications_task
        FOREIGN KEY (task_id)
            REFERENCES tasks(id)
            ON DELETE SET NULL,

    CONSTRAINT fk_notifications_comment
        FOREIGN KEY (comment_id)
            REFERENCES comments(id)
            ON DELETE SET NULL,

    CONSTRAINT fk_notifications_document
        FOREIGN KEY (document_id)
            REFERENCES documents(id)
            ON DELETE SET NULL,

    CONSTRAINT fk_notifications_knowledge_base
        FOREIGN KEY (knowledge_base_id)
            REFERENCES knowledge_bases(id)
            ON DELETE SET NULL,

    CONSTRAINT fk_notifications_handover_entry
        FOREIGN KEY (handover_entry_id)
            REFERENCES handover_entries(id)
            ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_notifications_workspace_id
    ON notifications(workspace_id);
CREATE INDEX idx_notifications_recipient_id
    ON notifications(recipient_id);
CREATE INDEX idx_notifications_recipient_status
    ON notifications(recipient_id, status);
CREATE INDEX idx_notifications_recipient_created
    ON notifications(recipient_id, created_at);
CREATE INDEX idx_notifications_type
    ON notifications(notification_type);
CREATE INDEX idx_notifications_status
    ON notifications(status);
CREATE INDEX idx_notifications_created_at
    ON notifications(created_at);
CREATE INDEX idx_notifications_resource_type_id
    ON notifications(resource_type, resource_id);
CREATE INDEX idx_notifications_project_id
    ON notifications(project_id);
CREATE INDEX idx_notifications_task_id
    ON notifications(task_id);
CREATE INDEX idx_notifications_read_at
    ON notifications(read_at);
