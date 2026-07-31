-- =========================================
-- Collabix
-- Version 6
-- Password Reset Tokens
-- =========================================

CREATE TABLE password_reset_tokens (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    token VARCHAR(500) NOT NULL UNIQUE,

    user_id UUID NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    used_at TIMESTAMPTZ,

    used BOOLEAN NOT NULL DEFAULT FALSE,

    regeneration_count INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ,

    created_by UUID,

    updated_by UUID,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE

);

-- Indexes for performance

CREATE INDEX idx_prt_token
    ON password_reset_tokens(token);

CREATE INDEX idx_prt_user_id
    ON password_reset_tokens(user_id);

CREATE INDEX idx_prt_expires_at
    ON password_reset_tokens(expires_at);

CREATE INDEX idx_prt_user_used
    ON password_reset_tokens(user_id, used);
