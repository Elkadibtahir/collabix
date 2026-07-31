-- =========================================
-- Collabix
-- Version 20260838
-- Fix department constraints
-- =========================================
--
-- 1. Add the unique constraint that was declared in the entity (@UniqueConstraint)
--    but never created in the V3 migration.
-- 2. Ensure ai_history.department_id has an FK constraint (missing in V3).

ALTER TABLE departments
    ADD CONSTRAINT uk_departments_workspace_id_name
        UNIQUE (workspace_id, name);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_ai_history_department'
          AND table_name = 'ai_history'
    ) THEN
        ALTER TABLE ai_history
            ADD CONSTRAINT fk_ai_history_department
                FOREIGN KEY (department_id)
                    REFERENCES departments(id)
                    ON DELETE SET NULL;
    END IF;
END $$;
