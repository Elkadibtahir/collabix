ALTER TABLE users
    ADD COLUMN employment_type VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE';

CREATE INDEX idx_users_employment_type ON users (employment_type);
