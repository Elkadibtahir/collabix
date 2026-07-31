-- =========================================
-- Collabix Tag Normalization
-- Version 20260820
-- Create tags table and document-tag join
-- =========================================

CREATE TABLE IF NOT EXISTS tags (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    workspace_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uq_tags_name_workspace UNIQUE (workspace_id, name),
    CONSTRAINT fk_tags_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tags_workspace_id ON tags(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

CREATE TABLE IF NOT EXISTS document_tags (
    document_id UUID NOT NULL,
    tag_id      UUID NOT NULL,

    CONSTRAINT pk_document_tags PRIMARY KEY (document_id, tag_id),
    CONSTRAINT fk_dt_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_dt_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id ON document_tags(tag_id);
