-- =========================================
-- Collabix Version History
-- Version 20260822
-- Dedicated version history for documents
-- and knowledge base articles
-- =========================================

CREATE TABLE IF NOT EXISTS version_history (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id      UUID NOT NULL,
    resource_type     VARCHAR(50) NOT NULL,
    resource_id       UUID NOT NULL,
    version_number    INTEGER NOT NULL,
    title             VARCHAR(255),
    content           TEXT,
    file_name         VARCHAR(255),
    mime_type         VARCHAR(100),
    file_size         BIGINT,
    storage_path      VARCHAR(500),
    created_by        UUID,
    created_at        TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_vh_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vh_resource ON version_history(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_vh_resource_version ON version_history(resource_type, resource_id, version_number);
CREATE INDEX IF NOT EXISTS idx_vh_workspace ON version_history(workspace_id);
CREATE INDEX IF NOT EXISTS idx_vh_created_at ON version_history(created_at);
