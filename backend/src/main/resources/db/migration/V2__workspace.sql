-- =========================================
-- Collabix
-- Version 2
-- Workspace / Teams / Members
-- =========================================

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),

    status VARCHAR(20) NOT NULL,

    owner_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_workspaces_owner
        FOREIGN KEY (owner_id)
            REFERENCES users(id)
            ON DELETE CASCADE
);

CREATE TABLE team_members (

    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,

    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,

    joined_at TIMESTAMPTZ NOT NULL,
    left_at TIMESTAMPTZ,

    invitation_email VARCHAR(150),

    invited_at TIMESTAMPTZ,
    invited_accepted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,

    PRIMARY KEY (workspace_id, user_id),

    CONSTRAINT fk_team_members_workspace
        FOREIGN KEY (workspace_id)
            REFERENCES workspaces(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_team_members_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id UUID NOT NULL,

    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_teams_workspace
        FOREIGN KEY (workspace_id)
            REFERENCES workspaces(id)
            ON DELETE CASCADE
);

CREATE TABLE team_memberships (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    team_id UUID NOT NULL,
    user_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_team_memberships_team
        FOREIGN KEY (team_id)
            REFERENCES teams(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_team_memberships_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

    UNIQUE (team_id, user_id)
);

-- =========================================
-- INDEXES (alignés avec les entités)
-- =========================================

CREATE INDEX idx_workspaces_status ON workspaces(status);

CREATE INDEX idx_teams_workspace_id ON teams(workspace_id);
CREATE INDEX idx_teams_status ON teams(status);

-- workspace_members (entité WorkspaceMember) => table attendue: workspace_members
-- NOTE: la table est créée ici avec le nom workspace_members.
-- Si votre schéma actuel utilise un autre nom, adaptez.

ALTER TABLE team_members RENAME TO workspace_members;

CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);

-- team_members (entité TeamMember) : table attendue: team_members
-- NOTE: l'entité TeamMember utilise @Table(name="team_members").
-- Nous avions déjà créé workspace_members. Nous créons donc bien une table distincte.
-- On renomme team_memberships vers team_members si besoin.

ALTER TABLE team_memberships RENAME TO team_members;

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

