CREATE TABLE ai_history (
    id UUID NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    department_id UUID NOT NULL,
    provider VARCHAR(20) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    execution_time BIGINT NOT NULL,
    token_count INTEGER,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE ai_prompts (
    id UUID NOT NULL PRIMARY KEY,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(30) NOT NULL,
    prompt_template TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_ai_prompts_code UNIQUE (code)
);

CREATE INDEX idx_ai_history_user_id ON ai_history(user_id);
CREATE INDEX idx_ai_history_workspace_id ON ai_history(workspace_id);
CREATE INDEX idx_ai_history_department_id ON ai_history(department_id);
CREATE INDEX idx_ai_history_provider ON ai_history(provider);
CREATE INDEX idx_ai_history_created_at ON ai_history(created_at);
CREATE INDEX idx_ai_prompts_code ON ai_prompts(code);
CREATE INDEX idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX idx_ai_prompts_active ON ai_prompts(active);

-- Seed default prompts
INSERT INTO ai_prompts (id, code, name, category, prompt_template, active, description, version) VALUES
(
    gen_random_uuid(),
    'HANDOVER_SUMMARY',
    'Handover Summary',
    'HANDOVER',
    'Summarize the following handover notes concisely, highlighting key tasks, pending items, and critical handover information:\n\n{context}',
    TRUE,
    'Generates a concise summary of handover notes for shift or role transitions.',
    0
),
(
    gen_random_uuid(),
    'ANALYTICS_EXECUTIVE_SUMMARY',
    'Analytics Executive Summary',
    'ANALYTICS',
    'Provide an executive summary of the following analytics data, focusing on key metrics, trends, and actionable insights:\n\n{context}',
    TRUE,
    'Generates an executive summary from analytics data for leadership review.',
    0
),
(
    gen_random_uuid(),
    'KNOWLEDGE_SEARCH',
    'Knowledge Base Search',
    'KNOWLEDGE',
    'Search the knowledge base for information relevant to the following query and provide a comprehensive answer:\n\n{context}',
    TRUE,
    'Searches the knowledge base and returns relevant information.',
    0
);
