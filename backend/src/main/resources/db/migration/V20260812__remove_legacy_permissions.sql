-- =========================================
-- Collabix Authorization Cleanup
-- Version 20260812
-- Remove legacy ORGANIZATION_READ/ORGANIZATION_WRITE
-- =========================================

-- Remove legacy permission assignments
DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions
    WHERE code IN ('ORGANIZATION_READ', 'ORGANIZATION_WRITE')
);

-- Remove legacy permissions
DELETE FROM permissions
WHERE code IN ('ORGANIZATION_READ', 'ORGANIZATION_WRITE');
