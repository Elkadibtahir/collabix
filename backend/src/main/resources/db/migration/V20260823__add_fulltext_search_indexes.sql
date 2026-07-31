-- =========================================
-- Collabix Full-Text Search Indexes
-- Version 20260823
-- Add GIN indexes for LIKE/text search on
-- large text columns across all modules
-- =========================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_title_trgm ON documents USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_documents_description_trgm ON documents USING GIN (description gin_trgm_ops);

-- Knowledge Base
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_title_trgm ON knowledge_bases USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_content_trgm ON knowledge_bases USING GIN (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_summary_trgm ON knowledge_bases USING GIN (summary gin_trgm_ops);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_content_trgm ON comments USING GIN (content gin_trgm_ops);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_title_trgm ON notifications USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_notifications_body_trgm ON notifications USING GIN (body gin_trgm_ops);

-- Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_title_trgm ON announcements USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_announcements_content_trgm ON announcements USING GIN (content gin_trgm_ops);
