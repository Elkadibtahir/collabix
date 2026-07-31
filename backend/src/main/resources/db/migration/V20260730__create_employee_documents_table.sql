CREATE TABLE hr_employee_documents (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES hr_employees(id),
    document_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(20),
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    checksum VARCHAR(255),
    uploaded_by UUID,
    file_version INTEGER NOT NULL DEFAULT 1,
    expiration_date DATE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID
);

CREATE INDEX idx_hr_ed_employee_id ON hr_employee_documents(employee_id);
CREATE INDEX idx_hr_ed_type ON hr_employee_documents(document_type);
CREATE INDEX idx_hr_ed_employee_type ON hr_employee_documents(employee_id, document_type);
CREATE INDEX idx_hr_ed_status ON hr_employee_documents(status);
CREATE INDEX idx_hr_ed_expiration_date ON hr_employee_documents(expiration_date);
CREATE INDEX idx_hr_ed_uploaded_by ON hr_employee_documents(uploaded_by);
CREATE INDEX idx_hr_ed_verified ON hr_employee_documents(verified);
CREATE INDEX idx_hr_ed_created_at ON hr_employee_documents(created_at);
