CREATE TABLE hr_attendances (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES hr_employees(id),
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    worked_hours DOUBLE PRECISION,
    break_duration INTEGER DEFAULT 0,
    overtime_hours DOUBLE PRECISION,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    CONSTRAINT uk_hr_att_employee_date UNIQUE (employee_id, attendance_date)
);

CREATE INDEX idx_hr_att_employee_id ON hr_attendances(employee_id);
CREATE INDEX idx_hr_att_date ON hr_attendances(attendance_date);
CREATE INDEX idx_hr_att_status ON hr_attendances(status);
CREATE INDEX idx_hr_att_employee_date_idx ON hr_attendances(employee_id, attendance_date);
CREATE INDEX idx_hr_att_employee_status ON hr_attendances(employee_id, status);
CREATE INDEX idx_hr_att_month ON hr_attendances(employee_id, attendance_date, status);
