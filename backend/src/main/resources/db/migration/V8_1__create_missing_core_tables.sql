CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_projects_department
        FOREIGN KEY (department_id)
            REFERENCES departments(id)
            ON DELETE CASCADE,
    CONSTRAINT uk_projects_department_id_name
        UNIQUE (department_id, name)
);
CREATE INDEX idx_projects_department_id ON projects(department_id);
CREATE INDEX idx_projects_department_status ON projects(department_id, status);
CREATE INDEX idx_projects_department_name ON projects(department_id, name);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(20) NOT NULL,
    due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE CASCADE,
    CONSTRAINT uk_tasks_project_id_title
        UNIQUE (project_id, title)
);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_project_title ON tasks(project_id, title);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    parent_comment_id UUID,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_comments_task
        FOREIGN KEY (task_id)
            REFERENCES tasks(id)
            ON DELETE CASCADE
);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_task_status ON comments(task_id, status);
CREATE INDEX idx_comments_created_at ON comments(created_at);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    task_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    category VARCHAR(50),
    tags VARCHAR(500),
    view_count BIGINT DEFAULT 0,
    storage_path VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL,
    document_version INT NOT NULL DEFAULT 1,
    ai_processed BOOLEAN DEFAULT FALSE,
    storage_type VARCHAR(20) DEFAULT 'LOCAL',
    pdf_export_available BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_documents_project
        FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_documents_task
        FOREIGN KEY (task_id)
            REFERENCES tasks(id)
            ON DELETE SET NULL
);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_task_id ON documents(task_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_project_status ON documents(project_id, status);
CREATE INDEX idx_documents_created_by ON documents(created_by);

CREATE TABLE knowledge_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    category VARCHAR(100),
    tags TEXT,
    status VARCHAR(20) NOT NULL,
    article_version INT NOT NULL DEFAULT 1,
    is_pinned BOOLEAN DEFAULT FALSE,
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_summary TEXT,
    ai_tags TEXT,
    rag_embeddings_available BOOLEAN DEFAULT FALSE,
    view_count BIGINT DEFAULT 0,
    favorite_count BIGINT DEFAULT 0,
    last_viewed_at TIMESTAMP,
    last_viewed_by UUID,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_knowledge_bases_project
        FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE CASCADE
);
CREATE INDEX idx_knowledge_bases_project_id ON knowledge_bases(project_id);
CREATE INDEX idx_knowledge_bases_status ON knowledge_bases(status);
CREATE INDEX idx_knowledge_bases_created_at ON knowledge_bases(created_at);
CREATE INDEX idx_knowledge_bases_project_status ON knowledge_bases(project_id, status);
CREATE INDEX idx_knowledge_bases_created_by ON knowledge_bases(created_by);
CREATE INDEX idx_knowledge_bases_category ON knowledge_bases(category);
CREATE INDEX idx_knowledge_bases_is_pinned ON knowledge_bases(is_pinned);

CREATE TABLE handover_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    department_id UUID NOT NULL,
    project_id UUID NOT NULL,
    task_id UUID,
    user_id UUID NOT NULL,
    work_finished TEXT NOT NULL,
    work_remaining TEXT NOT NULL,
    difficulties TEXT NOT NULL,
    blockers TEXT NOT NULL,
    important_information TEXT NOT NULL,
    priorities TEXT NOT NULL,
    time_spent_minutes BIGINT NOT NULL,
    need_help BOOLEAN NOT NULL,
    additional_notes TEXT,
    shift VARCHAR(20) NOT NULL,
    passed_at TIMESTAMP NOT NULL,
    ai_summary TEXT,
    ai_processed BOOLEAN NOT NULL DEFAULT FALSE,
    pdf_export_available BOOLEAN NOT NULL DEFAULT FALSE,
    rag_embeddings_available BOOLEAN NOT NULL DEFAULT FALSE,
    search_index_version INT DEFAULT 0,
    view_count BIGINT NOT NULL DEFAULT 0,
    favorite_count BIGINT NOT NULL DEFAULT 0,
    manager_validation_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    manager_validated_at TIMESTAMP,
    manager_validated_by UUID,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_handover_entries_workspace
        FOREIGN KEY (workspace_id)
            REFERENCES workspaces(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_handover_entries_department
        FOREIGN KEY (department_id)
            REFERENCES departments(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_handover_entries_project
        FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_handover_entries_task
        FOREIGN KEY (task_id)
            REFERENCES tasks(id)
            ON DELETE SET NULL,
    CONSTRAINT fk_handover_entries_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
    CONSTRAINT uk_handover_entries_user_project_passed_at
        UNIQUE (user_id, project_id, passed_at)
);
CREATE INDEX idx_handover_entries_workspace_id ON handover_entries(workspace_id);
CREATE INDEX idx_handover_entries_department_id ON handover_entries(department_id);
CREATE INDEX idx_handover_entries_project_id ON handover_entries(project_id);
CREATE INDEX idx_handover_entries_user_id ON handover_entries(user_id);
CREATE INDEX idx_handover_entries_task_id ON handover_entries(task_id);
CREATE INDEX idx_handover_entries_status ON handover_entries(status);
CREATE INDEX idx_handover_entries_shift ON handover_entries(shift);
CREATE INDEX idx_handover_entries_passed_at ON handover_entries(passed_at);
CREATE INDEX idx_handover_entries_created_at ON handover_entries(created_at);
CREATE INDEX idx_handover_entries_manager_validation_status ON handover_entries(manager_validation_status);
