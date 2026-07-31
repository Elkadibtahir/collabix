-- =========================================
-- Collabix
-- Version 20260840
-- Create checklists/checklist_items, add task fields, fix activity FKs
-- =========================================

-- =========================================
-- 1. TASK COLUMNS
-- =========================================

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS assignee_id UUID,
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20),
    ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_assignee
        FOREIGN KEY (assignee_id)
            REFERENCES users(id)
            ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status ON tasks(assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_status ON tasks(priority, status);

-- =========================================
-- 2. TASK STATUS ENUM EXPANSION
-- =========================================

-- Expand the TaskStatus CHECK or handle via application logic.
-- The enum in Java now supports: TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, COMPLETED, ARCHIVED, CANCELLED
-- The column length was 20, must handle longer names. Already VARCHAR(20), all fit.

-- =========================================
-- 3. ACTIVITIES FIX
-- =========================================

ALTER TABLE activities
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE activities
    DROP CONSTRAINT IF EXISTS fk_activities_task,
    ADD CONSTRAINT fk_activities_task
        FOREIGN KEY (task_id)
            REFERENCES tasks(id)
            ON DELETE CASCADE;

ALTER TABLE activities
    DROP CONSTRAINT IF EXISTS fk_activities_actor,
    ADD CONSTRAINT fk_activities_actor
        FOREIGN KEY (actor_id)
            REFERENCES users(id)
            ON DELETE CASCADE;

-- =========================================
-- 4. CREATE CHECKLISTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL,
    task_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_checklists_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checklists_task_id ON checklists(task_id);
CREATE INDEX IF NOT EXISTS idx_checklists_task_status ON checklists(task_id, status);
CREATE INDEX IF NOT EXISTS idx_checklists_created_at ON checklists(created_at);

-- =========================================
-- 5. CREATE CHECKLIST_ITEMS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL,
    checklist_id UUID NOT NULL,
    content VARCHAR(500) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_checklist_items_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_status ON checklist_items(checklist_id, status);
CREATE INDEX IF NOT EXISTS idx_checklist_items_sort_order ON checklist_items(checklist_id, sort_order);

-- =========================================
-- 6. FIX MISSING ON DELETE CASCADE ON TASK CHILD FKs
-- =========================================

ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS fk_tasks_sprint,
    ADD CONSTRAINT fk_tasks_sprint
        FOREIGN KEY (sprint_id)
            REFERENCES dev_sprints(id)
            ON DELETE SET NULL;

ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS fk_tasks_security_audit,
    ADD CONSTRAINT fk_tasks_security_audit
        FOREIGN KEY (security_audit_id)
            REFERENCES security_audits(id)
            ON DELETE SET NULL;

ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS fk_tasks_marketing_campaign,
    ADD CONSTRAINT fk_tasks_marketing_campaign
        FOREIGN KEY (marketing_campaign_id)
            REFERENCES marketing_campaigns(id)
            ON DELETE SET NULL;
