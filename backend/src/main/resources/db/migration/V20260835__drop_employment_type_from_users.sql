ALTER TABLE users DROP COLUMN IF EXISTS employment_type;

DROP INDEX IF EXISTS idx_users_employment_type;
