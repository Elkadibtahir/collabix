CREATE TABLE hr_employees (
    id UUID PRIMARY KEY,
    employee_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    date_of_birth DATE,
    nationality VARCHAR(100),
    emergency_contact VARCHAR(255),
    position VARCHAR(150) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    team_id UUID REFERENCES teams(id),
    manager_id UUID REFERENCES hr_employees(id),
    employment_type VARCHAR(50) NOT NULL,
    employment_status VARCHAR(50) NOT NULL DEFAULT 'ONBOARDING',
    start_date DATE NOT NULL,
    end_date DATE,
    profile_picture_path VARCHAR(500),
    candidate_id UUID REFERENCES hr_candidates(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    CONSTRAINT uk_hr_employees_employee_number UNIQUE (employee_number),
    CONSTRAINT uk_hr_employees_email UNIQUE (email),
    CONSTRAINT uq_hr_employees_candidate_id UNIQUE (candidate_id)
);

CREATE INDEX idx_hr_employees_department_id ON hr_employees(department_id);
CREATE INDEX idx_hr_employees_team_id ON hr_employees(team_id);
CREATE INDEX idx_hr_employees_manager_id ON hr_employees(manager_id);
CREATE INDEX idx_hr_employees_status ON hr_employees(employment_status);
CREATE INDEX idx_hr_employees_type ON hr_employees(employment_type);
CREATE INDEX idx_hr_employees_department_status ON hr_employees(department_id, employment_status);

CREATE TABLE hr_employee_event_logs (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES hr_employees(id),
    event_type VARCHAR(50) NOT NULL,
    previous_value VARCHAR(255),
    new_value VARCHAR(255),
    description TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID
);

CREATE INDEX idx_hr_employee_event_logs_employee_id ON hr_employee_event_logs(employee_id);
CREATE INDEX idx_hr_employee_event_logs_event_type ON hr_employee_event_logs(event_type);
CREATE INDEX idx_hr_employee_event_logs_created_at ON hr_employee_event_logs(employee_id, created_at DESC);
