-- =========================================
-- Collabix Notification Preferences
-- Version 20260821
-- Allow users to control notification delivery
-- =========================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    workspace_id    UUID NOT NULL,
    notification_type VARCHAR(50),
    email_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
    digest_frequency VARCHAR(20) NOT NULL DEFAULT 'REALTIME',
    quiet_hours_start TIME,
    quiet_hours_end   TIME,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ,
    created_by      UUID,
    updated_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uq_notif_pref_user_workspace_type UNIQUE (user_id, workspace_id, notification_type),
    CONSTRAINT fk_notif_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_pref_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notif_pref_user_workspace ON notification_preferences(user_id, workspace_id);
