-- =========================================
-- Collabix Authorization Sprint
-- Version 20260837
-- Fixes missing/malformed workspace constraints
-- =========================================

-- =========================================
-- PART 1: ADD MISSING UNIQUE CONSTRAINT
-- =========================================
ALTER TABLE workspaces ADD CONSTRAINT uk_workspaces_owner_id_name UNIQUE (owner_id, name);

-- =========================================
-- PART 2: ADD ON DELETE CASCADE TO
--          EXISTING FOREIGN KEYS
-- =========================================

ALTER TABLE analytics_reports DROP CONSTRAINT IF EXISTS fk_analytics_reports_workspace;
ALTER TABLE analytics_reports ADD CONSTRAINT fk_analytics_reports_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE executive_reports DROP CONSTRAINT IF EXISTS fk_exec_reports_workspace;
ALTER TABLE executive_reports ADD CONSTRAINT fk_exec_reports_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE handover_journals DROP CONSTRAINT IF EXISTS fk_handover_journals_workspace;
ALTER TABLE handover_journals ADD CONSTRAINT fk_handover_journals_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- =========================================
-- PART 3: ADD MISSING FOREIGN KEYS
-- =========================================

ALTER TABLE ai_history ADD CONSTRAINT fk_ai_history_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE scheduled_reports ADD CONSTRAINT fk_sched_reports_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE report_history ADD CONSTRAINT fk_report_history_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
