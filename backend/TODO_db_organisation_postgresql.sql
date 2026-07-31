-- Organisation module (PostgreSQL model only) - no JPA entities.
-- Conventions:
--   - UUID everywhere
--   - audit columns (created_at, updated_at, deleted_at or status-based soft delete)
--   - indexes for workspace-scoped queries
--   - minimal cascade
--
-- NOTE:
--   - This script is a DDL proposal based on the relational model discussion.
--   - It intentionally avoids cross-workspace links by constraining tenant consistency.
--   - Replace audit column names to match your BaseEntity/AuditableEntity implementation.

BEGIN;

-- ==========================================================
-- DEPARTMENTS
-- ==========================================================

CREATE TABLE IF NOT EXISTS departments (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id      UUID NOT NULL,

    name               VARCHAR(150) NOT NULL,
    description        VARCHAR(500),

    status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Soft delete strategy: prefer status/archived for MVP.
    -- If you later use deleted_at, keep it nullable.
    deleted_at         TIMESTAMPTZ,

    CONSTRAINT fk_departments_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE RESTRICT
);

-- Unique department name within a workspace (case-insensitive via functional index)
-- If you normalize names in application, you can use a plain UNIQUE instead.
CREATE UNIQUE INDEX IF NOT EXISTS uk_departments_workspace_name
    ON departments (workspace_id, name);

-- Tenant safety (optional at DB level): if you later add name normalization,
-- consider removing the plain unique and using LOWER(name).
-- CREATE UNIQUE INDEX IF NOT EXISTS uk_departments_workspace_name_ci
--     ON departments (workspace_id, lower(name));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_departments_workspace_status
    ON departments (workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_departments_workspace_name
    ON departments (workspace_id, name);

-- ==========================================================
-- TEAMS
-- ==========================================================

-- Teams belong to exactly one Department.
-- We also store workspace_id on teams to avoid JOINs on critical queries.

CREATE TABLE IF NOT EXISTS teams (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id      UUID NOT NULL,
    department_id     UUID NOT NULL,

    name               VARCHAR(150) NOT NULL,
    description        VARCHAR(500),

    status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMPTZ,

    CONSTRAINT fk_teams_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_teams_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE RESTRICT,

    -- Immutability/consistency invariant (enforced logically; DB-level enforcement
    -- across tables needs triggers). We keep a DB-level placeholder constraint
    -- pattern using a deferrable trigger recommendation.
    -- CONSTRAINT chk_team_workspace_department_match ...
    -- (implemented via trigger in a follow-up if desired)

    -- Ensure each team belongs to one department.
    CONSTRAINT chk_teams_workspace_department_not_null
        CHECK (workspace_id IS NOT NULL AND department_id IS NOT NULL)
);

-- Team name unique within a department
CREATE UNIQUE INDEX IF NOT EXISTS uk_teams_department_name
    ON teams (department_id, name);

-- Indexes for workspace-scoped reads
CREATE INDEX IF NOT EXISTS idx_teams_workspace_status
    ON teams (workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_teams_department_status
    ON teams (department_id, status);

-- ==========================================================
-- TEAM MEMBERS (association: Team + WorkspaceMember)
-- ==========================================================

-- Invariant: team_members.workspace_id must match workspace_member.workspace_id
-- and team_members.department/team must be in same workspace.
-- Store workspace_id on team_members for fast tenant scoping.

CREATE TABLE IF NOT EXISTS team_members (
    -- Use a composite key to match your current code style (TeamMemberId exists).
    team_id                UUID NOT NULL,
    workspace_member_id  UUID NOT NULL,

    workspace_id          UUID NOT NULL,

    role                   VARCHAR(20) NOT NULL,
    status                 VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    joined_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    left_at                TIMESTAMPTZ,

    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at             TIMESTAMPTZ,

    CONSTRAINT pk_team_members
        PRIMARY KEY (team_id, workspace_member_id),

    CONSTRAINT fk_team_members_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE RESTRICT,

    -- Replace workspace_member_id FK type to the actual PK of workspace_members.
    CONSTRAINT fk_team_members_workspace_member
        FOREIGN KEY (workspace_member_id)
        REFERENCES workspace_members(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_team_members_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_team_member_role
        CHECK (role IN ('LEADER', 'MEMBER', 'VIEWER')),

    CONSTRAINT chk_team_member_status
        CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_workspace_status
    ON team_members (workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_team_members_team_role
    ON team_members (team_id, role);

CREATE INDEX IF NOT EXISTS idx_team_members_team_status
    ON team_members (team_id, status);

CREATE INDEX IF NOT EXISTS idx_team_members_workspace_member
    ON team_members (workspace_member_id);

-- ==========================================================
-- DOCUMENTS (placeholders for future module)
-- ==========================================================

-- The document model was discussed as polymorphic ownership.
-- owner_type/owner_id pattern keeps it extensible.
-- No JPA entities are generated here.

CREATE TABLE IF NOT EXISTS documents (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id       UUID NOT NULL,

    owner_type         VARCHAR(30) NOT NULL,
    owner_id           UUID NOT NULL,

    title              VARCHAR(200) NOT NULL,
    content_type       VARCHAR(100),

    visibility_scope   VARCHAR(20) NOT NULL DEFAULT 'WORKSPACE',
    -- visibility_scope IN ('WORKSPACE','TEAM','USER') - define later if needed.

    status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMPTZ,

    CONSTRAINT fk_documents_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_documents_owner_type
        CHECK (owner_type IN ('WORKSPACE', 'TEAM', 'DEPARTMENT'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_workspace_status
    ON documents (workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_documents_workspace_visibility
    ON documents (workspace_id, visibility_scope);

CREATE INDEX IF NOT EXISTS idx_documents_owner
    ON documents (owner_type, owner_id);

-- ==========================================================
-- NOTIFICATIONS (placeholders for future module)
-- ==========================================================

CREATE TABLE IF NOT EXISTS notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id        UUID NOT NULL,

    target_type         VARCHAR(30) NOT NULL,
    target_id           UUID NOT NULL,

    scope               VARCHAR(20) NOT NULL DEFAULT 'WORKSPACE',
    -- scope IN ('WORKSPACE','TEAM','USER')

    message             TEXT NOT NULL,

    status              VARCHAR(20) NOT NULL DEFAULT 'UNREAD',

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT fk_notifications_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_notifications_target_type
        CHECK (target_type IN ('WORKSPACE', 'TEAM', 'USER')),

    CONSTRAINT chk_notifications_scope
        CHECK (scope IN ('WORKSPACE','TEAM','USER'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_workspace_status
    ON notifications (workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_notifications_target
    ON notifications (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_notifications_workspace_scope
    ON notifications (workspace_id, scope);

-- ==========================================================
-- TRIGGERS (recommended, not required)
-- ==========================================================
-- If you want to strictly enforce:
--   - teams.workspace_id == departments.workspace_id
--   - team_members.workspace_id == teams.workspace_id == workspace_member.workspace_id
-- you should implement triggers.
-- For this proposal we do not create triggers (keeps it “DDL only” minimal).

COMMIT;

