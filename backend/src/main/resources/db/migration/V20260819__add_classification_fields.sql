-- =========================================
-- Collabix Classification Fields
-- Version 20260819
-- Add category, tags, view_count to documents
-- Add priority, category, group_key to notifications
-- =========================================

-- Documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category     VARCHAR(50);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags         VARCHAR(500);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS view_count   BIGINT NOT NULL DEFAULT 0;

-- Notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority   VARCHAR(10) NOT NULL DEFAULT 'NORMAL';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category   VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS group_key  VARCHAR(100);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_category     ON documents(category);
CREATE INDEX IF NOT EXISTS idx_notifications_priority  ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_category  ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_group_key ON notifications(group_key);
