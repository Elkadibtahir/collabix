-- =========================================
-- Collabix
-- Version V20260809
-- Create user_history table for immutable audit trail
-- =========================================

CREATE TABLE user_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    workspace_id UUID,
    performed_by UUID,
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_history_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_history_workspace
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_history_performed_by
        FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_history_user_id ON user_history(user_id);
CREATE INDEX idx_user_history_workspace_id ON user_history(workspace_id);
CREATE INDEX idx_user_history_action ON user_history(action);
CREATE INDEX idx_user_history_performed_by ON user_history(performed_by);
CREATE INDEX idx_user_history_created_at ON user_history(created_at);
