-- =============================================================================
-- Rework Handover module to the sender/receiver workflow model
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Rework handover_entries
--    Old: shift-based form (work_finished/remaining, blockers, shift, passed_at)
--    New: sender/receiver workflow (title, content, priority, status, due_date)
-- -----------------------------------------------------------------------------

DROP INDEX IF EXISTS idx_handover_entries_shift;
DROP INDEX IF EXISTS idx_handover_entries_passed_at;
DROP INDEX IF EXISTS idx_handover_entries_manager_validation_status;
ALTER TABLE handover_entries DROP CONSTRAINT IF EXISTS uk_handover_entries_user_project_passed_at;

ALTER TABLE handover_entries
    DROP COLUMN IF EXISTS work_finished,
    DROP COLUMN IF EXISTS work_remaining,
    DROP COLUMN IF EXISTS difficulties,
    DROP COLUMN IF EXISTS blockers,
    DROP COLUMN IF EXISTS important_information,
    DROP COLUMN IF EXISTS priorities,
    DROP COLUMN IF EXISTS time_spent_minutes,
    DROP COLUMN IF EXISTS need_help,
    DROP COLUMN IF EXISTS additional_notes,
    DROP COLUMN IF EXISTS shift,
    DROP COLUMN IF EXISTS passed_at,
    DROP COLUMN IF EXISTS ai_summary,
    DROP COLUMN IF EXISTS ai_processed,
    DROP COLUMN IF EXISTS pdf_export_available,
    DROP COLUMN IF EXISTS rag_embeddings_available,
    DROP COLUMN IF EXISTS search_index_version,
    DROP COLUMN IF EXISTS view_count,
    DROP COLUMN IF EXISTS favorite_count,
    DROP COLUMN IF EXISTS manager_validation_status,
    DROP COLUMN IF EXISTS manager_validated_at,
    DROP COLUMN IF EXISTS manager_validated_by;

ALTER TABLE handover_entries RENAME COLUMN user_id TO sender_id;

ALTER TABLE handover_entries
    ADD COLUMN receiver_id UUID,
    ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN content TEXT NOT NULL DEFAULT '',
    ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN due_date TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN sent_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN accepted_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN rejected_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN completed_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN archived_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE handover_entries
    ADD CONSTRAINT fk_handover_entries_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_handover_entries_receiver_id ON handover_entries(receiver_id);
CREATE INDEX idx_handover_entries_priority ON handover_entries(priority);
CREATE INDEX IF NOT EXISTS idx_handover_entries_status ON handover_entries(status);
CREATE INDEX idx_handover_entries_due_date ON handover_entries(due_date);
CREATE INDEX idx_handover_entries_sent_at ON handover_entries(sent_at);
CREATE INDEX idx_handover_entries_deleted ON handover_entries(deleted);

-- -----------------------------------------------------------------------------
-- 2) handover_attachments
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS handover_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handover_entry_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    content_type VARCHAR(120),
    storage_key VARCHAR(500) NOT NULL,
    uploaded_by UUID,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_handover_attachments_entry
        FOREIGN KEY (handover_entry_id) REFERENCES handover_entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_handover_attachments_uploader
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_handover_attachments_entry ON handover_attachments(handover_entry_id);

-- -----------------------------------------------------------------------------
-- 3) handover_comments
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS handover_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handover_entry_id UUID NOT NULL,
    author_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_handover_comments_entry
        FOREIGN KEY (handover_entry_id) REFERENCES handover_entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_handover_comments_author
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_handover_comments_entry ON handover_comments(handover_entry_id);

-- -----------------------------------------------------------------------------
-- 4) handover_timeline_events (journal timeline)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS handover_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handover_entry_id UUID NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    description VARCHAR(500),
    actor_id UUID,
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_handover_timeline_entry
        FOREIGN KEY (handover_entry_id) REFERENCES handover_entries(id) ON DELETE CASCADE
);

CREATE INDEX idx_handover_timeline_entry ON handover_timeline_events(handover_entry_id);

-- -----------------------------------------------------------------------------
-- 5) Rework handover_journals to date-based workflow aggregation
-- -----------------------------------------------------------------------------

DROP INDEX IF EXISTS idx_handover_journals_shift;
ALTER TABLE handover_journals DROP CONSTRAINT IF EXISTS uk_handover_journals_project_shift_date;
ALTER TABLE handover_journals DROP COLUMN IF EXISTS shift;

ALTER TABLE handover_journals
    ADD COLUMN total_handovers BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN pending_handovers BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN completed_handovers BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN rejected_handovers BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN urgent_handovers BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN overdue_handovers BIGINT NOT NULL DEFAULT 0;

ALTER TABLE handover_journals
    ADD CONSTRAINT uk_handover_journals_project_date UNIQUE (project_id, journal_date);
