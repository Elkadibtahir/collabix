CREATE TABLE hr_candidates (
    id UUID PRIMARY KEY,
    department_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(150) NOT NULL,
    source VARCHAR(50),
    current_status VARCHAR(50) NOT NULL,
    recruiter_id UUID,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_hr_candidates_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT uk_hr_candidates_department_email UNIQUE (department_id, email)
);

CREATE INDEX idx_hr_candidates_department_id ON hr_candidates (department_id);
CREATE INDEX idx_hr_candidates_status ON hr_candidates (current_status);
CREATE INDEX idx_hr_candidates_email ON hr_candidates (email);
CREATE INDEX idx_hr_candidates_department_status ON hr_candidates (department_id, current_status);

CREATE TABLE hr_candidate_status_histories (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID,
    reason VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_hr_csh_candidate FOREIGN KEY (candidate_id) REFERENCES hr_candidates(id)
);

CREATE INDEX idx_hr_csh_candidate_id ON hr_candidate_status_histories (candidate_id);
CREATE INDEX idx_hr_csh_created_at ON hr_candidate_status_histories (created_at);

CREATE TABLE hr_recruiter_notes (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL,
    content VARCHAR(5000) NOT NULL,
    visibility VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_hr_notes_candidate FOREIGN KEY (candidate_id) REFERENCES hr_candidates(id)
);

CREATE INDEX idx_hr_notes_candidate_id ON hr_recruiter_notes (candidate_id);
CREATE INDEX idx_hr_notes_created_by ON hr_recruiter_notes (created_by);
CREATE INDEX idx_hr_notes_candidate_created ON hr_recruiter_notes (candidate_id, created_at);

CREATE TABLE hr_interviews (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    feedback VARCHAR(5000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_hr_interviews_candidate FOREIGN KEY (candidate_id) REFERENCES hr_candidates(id)
);

CREATE INDEX idx_hr_interviews_candidate_id ON hr_interviews (candidate_id);
CREATE INDEX idx_hr_interviews_scheduled_date ON hr_interviews (scheduled_date);
CREATE INDEX idx_hr_interviews_candidate_date ON hr_interviews (candidate_id, scheduled_date);

CREATE TABLE hr_interview_participants (
    id UUID PRIMARY KEY,
    interview_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(50),
    CONSTRAINT fk_hr_ip_interview FOREIGN KEY (interview_id) REFERENCES hr_interviews(id),
    CONSTRAINT fk_hr_ip_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uk_hr_ip_interview_user UNIQUE (interview_id, user_id)
);

CREATE INDEX idx_hr_ip_interview_id ON hr_interview_participants (interview_id);
CREATE INDEX idx_hr_ip_user_id ON hr_interview_participants (user_id);

CREATE TABLE hr_candidate_attachments (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL,
    attachment_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_hr_ca_candidate FOREIGN KEY (candidate_id) REFERENCES hr_candidates(id)
);

CREATE INDEX idx_hr_ca_candidate_id ON hr_candidate_attachments (candidate_id);
CREATE INDEX idx_hr_ca_type ON hr_candidate_attachments (attachment_type);
CREATE INDEX idx_hr_ca_candidate_type ON hr_candidate_attachments (candidate_id, attachment_type);
