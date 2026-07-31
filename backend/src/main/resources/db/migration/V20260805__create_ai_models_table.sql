CREATE TABLE ai_models (
    id UUID NOT NULL PRIMARY KEY,
    department_id UUID NOT NULL,
    project_id UUID NOT NULL,
    team_id UUID NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(2000) NULL,
    model_type VARCHAR(30) NOT NULL,
    model_version VARCHAR(50) NULL,
    objective VARCHAR(500) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNING',
    accuracy DOUBLE PRECISION NULL,
    owner_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_ai_model_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_model_project    FOREIGN KEY (project_id)    REFERENCES projects(id)    ON DELETE CASCADE,
    CONSTRAINT fk_ai_model_team       FOREIGN KEY (team_id)       REFERENCES teams(id)       ON DELETE SET NULL
);

CREATE INDEX idx_ai_model_department_id   ON ai_models(department_id);
CREATE INDEX idx_ai_model_project_id      ON ai_models(project_id);
CREATE INDEX idx_ai_model_team_id         ON ai_models(team_id);
CREATE INDEX idx_ai_model_status          ON ai_models(status);
CREATE INDEX idx_ai_model_type            ON ai_models(model_type);
CREATE INDEX idx_ai_model_owner           ON ai_models(owner_id);
CREATE INDEX idx_ai_model_project_status  ON ai_models(project_id, status);
