ALTER TABLE hr_interviews ADD COLUMN title VARCHAR(255);
ALTER TABLE hr_interviews ADD COLUMN description VARCHAR(5000);
ALTER TABLE hr_interviews ADD COLUMN start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE hr_interviews ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE hr_interviews ADD COLUMN location VARCHAR(255);
ALTER TABLE hr_interviews ADD COLUMN meeting_link VARCHAR(500);
ALTER TABLE hr_interviews ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_hr_interviews_status ON hr_interviews (status);
CREATE INDEX idx_hr_interviews_department_status ON hr_interviews (candidate_id, status);

CREATE TABLE hr_interview_feedback (
    id UUID PRIMARY KEY,
    interview_id UUID NOT NULL,
    rating INTEGER,
    recommendation VARCHAR(50) NOT NULL,
    notes VARCHAR(5000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_hr_feedback_interview FOREIGN KEY (interview_id) REFERENCES hr_interviews(id)
);

CREATE INDEX idx_hr_feedback_interview_id ON hr_interview_feedback (interview_id);
