-- =========================================
-- Collabix Member Read Access
-- Version 20260845
-- Grant MEMBER core read-only permissions so
-- regular members can browse the workspace:
-- departments, teams, projects, tasks, documents,
-- knowledge base, attachments, activities, handovers,
-- sprints, users, dashboards and analytics.
-- Write/management actions remain ADMIN/MANAGER only.
-- =========================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'MEMBER'
  AND p.code IN (
    'DEPARTMENT_READ',
    'TEAM_READ',
    'PROJECT_READ',
    'TASK_READ',
    'DOCUMENT_READ',
    'KNOWLEDGE_BASE_READ',
    'ATTACHMENT_READ',
    'ACTIVITY_READ',
    'HANDOVER_READ',
    'SPRINT_READ',
    'DASHBOARD_VIEW',
    'USER_READ',
    'ANALYTICS_VIEW'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;
