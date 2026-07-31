ALTER TABLE hr_candidate_attachments ADD COLUMN original_file_name VARCHAR(255);
ALTER TABLE hr_candidate_attachments ADD COLUMN stored_file_name VARCHAR(255);
ALTER TABLE hr_candidate_attachments ADD COLUMN file_extension VARCHAR(20);
ALTER TABLE hr_candidate_attachments ADD COLUMN description VARCHAR(1000);
ALTER TABLE hr_candidate_attachments ADD COLUMN uploaded_by UUID;
ALTER TABLE hr_candidate_attachments ADD COLUMN file_version INTEGER NOT NULL DEFAULT 1;

UPDATE hr_candidate_attachments SET original_file_name = file_name WHERE original_file_name IS NULL;
UPDATE hr_candidate_attachments SET stored_file_name = file_name WHERE stored_file_name IS NULL;

ALTER TABLE hr_candidate_attachments ALTER COLUMN original_file_name SET NOT NULL;
ALTER TABLE hr_candidate_attachments ALTER COLUMN stored_file_name SET NOT NULL;

CREATE INDEX idx_hr_ca_uploaded_by ON hr_candidate_attachments (uploaded_by);
CREATE INDEX idx_hr_ca_created_at ON hr_candidate_attachments (created_at);
