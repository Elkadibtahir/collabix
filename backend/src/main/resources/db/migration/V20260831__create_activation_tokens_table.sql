CREATE TABLE IF NOT EXISTS activation_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    regeneration_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_activation_tokens_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_token ON activation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_user_id ON activation_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_status ON activation_tokens(status);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_expires_at ON activation_tokens(expires_at);
