CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id  UUID NOT NULL,
    name          VARCHAR(255),
    topic         VARCHAR(500),
    type          VARCHAR(20) NOT NULL,  -- WORKSPACE, DEPARTMENT, TEAM, DIRECT
    department_id UUID,
    team_id       UUID,
    is_private    BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
    last_message_at     TIMESTAMPTZ,
    last_message_preview VARCHAR(500),

    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ,
    created_by  UUID,
    updated_by  UUID,
    version     BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_conversations_workspace
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_department
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_conversations_team
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE INDEX idx_conversations_workspace_id ON conversations(workspace_id);
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_department_id ON conversations(department_id);
CREATE INDEX idx_conversations_team_id ON conversations(team_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_workspace_type ON conversations(workspace_id, type);
CREATE INDEX idx_conversations_is_archived ON conversations(is_archived);

CREATE TABLE conversation_members (
    conversation_id UUID NOT NULL,
    user_id         UUID NOT NULL,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at    TIMESTAMPTZ,
    role            VARCHAR(20) NOT NULL DEFAULT 'MEMBER',

    PRIMARY KEY (conversation_id, user_id),
    CONSTRAINT fk_cm_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_cm_user_id ON conversation_members(user_id);
CREATE INDEX idx_cm_conversation_id ON conversation_members(conversation_id);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id  UUID NOT NULL,
    sender_id        UUID NOT NULL,
    parent_message_id UUID,
    content          TEXT NOT NULL,
    message_type     VARCHAR(20) NOT NULL DEFAULT 'TEXT',  -- TEXT, SYSTEM, FILE, IMAGE
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EDITED, DELETED
    file_url         VARCHAR(500),
    file_name        VARCHAR(255),
    file_size        BIGINT,
    mime_type        VARCHAR(100),
    is_pinned        BOOLEAN NOT NULL DEFAULT FALSE,
    mentions         TEXT,

    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ,
    created_by  UUID,
    updated_by  UUID,
    version     BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_parent
        FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_parent_id ON messages(parent_message_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_is_pinned ON messages(is_pinned);
CREATE INDEX idx_messages_type ON messages(message_type);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_conversation_status ON messages(conversation_id, status);
