ALTER TABLE hr_recruiter_notes ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE hr_recruiter_notes ADD COLUMN category VARCHAR(20) NOT NULL DEFAULT 'GENERAL';
ALTER TABLE hr_recruiter_notes ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM';

CREATE INDEX idx_hr_notes_category ON hr_recruiter_notes (category);
CREATE INDEX idx_hr_notes_priority ON hr_recruiter_notes (priority);
