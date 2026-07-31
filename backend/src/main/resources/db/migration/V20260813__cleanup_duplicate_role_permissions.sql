-- =========================================
-- Collabix Authorization Cleanup
-- Version 20260813
-- Remove duplicate role_permissions rows
-- =========================================

-- Remove duplicates keeping only one row per (role_id, permission_id)
DELETE FROM role_permissions
WHERE ctid NOT IN (
    SELECT MIN(ctid)
    FROM role_permissions
    GROUP BY role_id, permission_id
);
