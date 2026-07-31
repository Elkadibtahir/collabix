ALTER TABLE users
    ADD COLUMN IF NOT EXISTS primary_department_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_primary_department'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT fk_users_primary_department
                FOREIGN KEY (primary_department_id)
                    REFERENCES departments(id)
                    ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_primary_department_id
    ON users(primary_department_id);
