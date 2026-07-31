CREATE TABLE hr_employee_skills (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES hr_employees(id),
    skill_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL,
    years_of_experience INTEGER,
    last_used_date DATE,
    certification_name VARCHAR(255),
    certification_issuer VARCHAR(255),
    certification_date DATE,
    certification_expiration DATE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMP,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    CONSTRAINT uk_hr_es_employee_skill UNIQUE (employee_id, skill_name)
);

CREATE INDEX idx_hr_es_employee_id ON hr_employee_skills(employee_id);
CREATE INDEX idx_hr_es_category ON hr_employee_skills(category);
CREATE INDEX idx_hr_es_level ON hr_employee_skills(proficiency_level);
CREATE INDEX idx_hr_es_verified ON hr_employee_skills(verified);
CREATE INDEX idx_hr_es_active ON hr_employee_skills(active);
CREATE INDEX idx_hr_es_employee_category ON hr_employee_skills(employee_id, category);
CREATE INDEX idx_hr_es_cert_expiration ON hr_employee_skills(certification_expiration);
