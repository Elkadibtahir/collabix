CREATE TABLE hr_onboardings (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL UNIQUE REFERENCES hr_employees(id),
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    start_date DATE NOT NULL,
    expected_completion_date DATE,
    actual_completion_date DATE,
    assigned_hr_id UUID,
    assigned_manager_id UUID,
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID
);

CREATE TABLE hr_onboarding_tasks (
    id UUID PRIMARY KEY,
    onboarding_id UUID NOT NULL REFERENCES hr_onboardings(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    due_date DATE,
    completed_date DATE,
    assigned_user_id UUID,
    notes TEXT,
    task_order INTEGER,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID
);

CREATE INDEX idx_hr_ob_employee_id ON hr_onboardings(employee_id);
CREATE INDEX idx_hr_ob_status ON hr_onboardings(status);
CREATE INDEX idx_hr_ob_assigned_hr ON hr_onboardings(assigned_hr_id);
CREATE INDEX idx_hr_ob_start_date ON hr_onboardings(start_date);
CREATE INDEX idx_hr_ob_employee_status ON hr_onboardings(employee_id, status);

CREATE INDEX idx_hr_obt_onboarding_id ON hr_onboarding_tasks(onboarding_id);
CREATE INDEX idx_hr_obt_status ON hr_onboarding_tasks(status);
CREATE INDEX idx_hr_obt_assigned_user ON hr_onboarding_tasks(assigned_user_id);
CREATE INDEX idx_hr_obt_due_date ON hr_onboarding_tasks(due_date);
