# COLLABIX Backend Foundation Modules — Comprehensive Audit Report

**Scope:** Authentication, Authorization, Roles & Permissions, User Management, Workspace, Departments, Teams, Team Members, Roles, Permissions, Admin, User History, Notifications, Dashboard.
**Codebase path:** `backend/src/main/java/com/trio/backend/...`
**Migrations:** `backend/src/main/resources/db/migration/` (authorization-relevant: V1, V20260810–V20260844)

---

## TABLE OF CONTENTS
1. [Authentication](#1-authentication)
2. [Authorization](#2-authorization)
3. [Roles & Permissions](#3-roles--permissions)
4. [User Management](#4-user-management)
5. [Workspace](#5-workspace)
6. [Departments](#6-departments)
7. [Teams & Team Members](#7-teams--team-members)
8. [Roles / Permissions (management)](#8-roles--permissions-management)
9. [User History](#9-user-history)
10. [Notifications](#10-notifications)
11. [Dashboard](#11-dashboard)
12. [Security Audit](#12-security-audit)
13. [Cross-cutting Findings](#13-cross-cutting-findings)
14. [Full Permission Catalog](#14-full-permission-catalog)

---

## 1. Authentication

### 1.1 Public (unauthenticated) endpoints
| Method | Path | Controller Method | Notes |
|--------|------|-------------------|-------|
| POST | `/api/auth/login` | `AuthController.login` | Validates user status (rejects LOCKED/SUSPENDED/INACTIVE/PENDING_ACTIVATION/ARCHIVED). Brute-force protection via `LoginSecurityProperties` (5 attempts → LOCKED). |
| POST | `/api/auth/refresh` | `AuthController.refreshToken` | Delegates to `RefreshTokenServiceImpl.refreshAccessToken` (rotates refresh token). |
| POST | `/api/auth/logout` | `AuthController.logout` | Revokes the refresh token; clears SecurityContext. |
| POST | `/api/auth/forgot-password` | `AuthController.forgotPassword` | Always returns generic success (no user enumeration). |
| POST | `/api/auth/reset-password` | `AuthController.resetPassword` | Validates token + password confirmation, encodes, invalidates other tokens. |
| GET  | `/api/auth/activate` | `ActivationController.activate` | **Validates** token only (does NOT consume it). |
| POST | `/api/auth/activate` | `ActivationController.completeActivation` | Validates token, sets password, enables account, marks token USED. |
| POST | `/api/auth/resend-activation` | `ActivationController.resendActivation` | Rejects if already active; invalidates old tokens; publishes email event. |

### 1.2 Authenticated endpoints (within auth namespace)
| Method | Path | Permission / PreAuthorize | Response |
|--------|------|---------------------------|----------|
| GET  | `/api/auth/me` | `@PreAuthorize("isAuthenticated()")` | `ApiResponse<UserResponse>` |
| POST | `/api/auth/change-password` | `@PreAuthorize("isAuthenticated()")` | `ApiResponse<Void>` |

### 1.3 JWT flow
- **`JwtService`** (`security/jwt/JwtService.java`): generates HS256 JWTs. Claims: `uid` (user id), `memberType`, `role` (list of RoleName names), `type` (ACCESS/REFRESH), `permissions` (list of permission codes derived from user roles).
- **Access token**: contains roles + permission claims (embedded, avoids DB hit). Expiration configurable.
- **Refresh token**: minimal claims (uid + type only), longer TTL, persisted in `refresh_tokens` table with `revoked`/`expiresAt`.
- **`JwtAuthenticationFilter`** (once-per-request): reads `Authorization: Bearer ...`, validates token type == ACCESS. If permissions present in token → builds `CustomUserDetails` with JWT claims (fast path). Otherwise falls back to `CustomUserDetailsService.loadUserByUsername` (DB 4-JOIN query). **Non-ACTIVE users are silently dropped** (no authentication set → 401 at filter chain).
- **Refresh rotation**: `RefreshTokenServiceImpl.refreshAccessToken` loads token with lock, revokes old, issues new pair. Reuse of a revoked token → revokes ALL user tokens (theft detection).
- **`CustomUserDetails`** builds authorities as both `ROLE_<RoleName>` and raw permission codes. `isEnabled()` returns `status == ACTIVE`.

### 1.4 Password reset
- `PasswordResetServiceImpl` (`service/PasswordResetServiceImpl.java`): generates `SecureRandom` + Base64url token, persists to `password_reset_tokens`. Token expiration default **1h** (`app.reset-password.token-expiration:3600000`). Resets password, marks token used, invalidates other active tokens.
- Front-end reset link URL default: `http://localhost:4200` (`app.reset-password.lowe-url`).
- **Hardcoded value**: admin seed password `$2a$10$0DXoz7ONsFrReq8kT9fT8.x1qBtbEqMRbi0dBoXcxdECScL/yJ2Xm` (plaintext `Admin@123456`) in `V20260830__seed_initial_admin.sql`.

### 1.5 Account activation
- `AccountActivationServiceImpl` (`service/AccountActivationServiceImpl.java`): token expiration default **24h** (`app.activation.token-expiration:86400000`), byte length 32. Single active token per user (old tokens invalidated). Status enum: ACTIVE/EXPIRED/USED.
- `AuthServiceImpl.completeActivation` duplicates much of the validation already in `AccountActivationService.validateActivationToken` (double validation — not a bug, but redundant).
- **Activation base URL** default `http://localhost:5173` (inconsistent with password-reset default of `http://localhost:4200`).

### 1.6 Brute-force / lockout
- `LoginSecurityProperties`: maxAttempts=5, lockDuration=30m, autoUnlock=true, enabled=true (by default). Seeded admin has `failed_login_attempts=0`.
- On lockout: status → LOCKED, `lockedAt` set, all refresh tokens revoked.
- Auto-unlock during login if `lockDuration` elapsed.

---

## 2. Authorization

### 2.1 Mechanism
Two complementary authorization beans, referenced via SpEL in `@PreAuthorize`:

1. **`@permissionEvaluator`** (`security/permission/PermissionEvaluator.java`) — a custom Spring component bean named `permissionEvaluator`. Checks whether the authentication's `GrantedAuthority` list **directly contains** the given permission code string. **This is NOT Spring Security's `org.springframework.security.access.PermissionEvaluator`** interface, but a homegrown class of the same simple name. It works because SpEL resolves `@permissionEvaluator.hasPermission(...)`.
   - Does **not** consider role hierarchy for permission-code checks (permissions are granted directly as authorities via JWT claims / `CustomUserDetails.buildAuthorities`).
   - `hasPermission`, `hasAnyPermission`, `hasAllPermissions` all exist.

2. **`@workspaceAuth`** (`security/workspace/WorkspaceAuthorization.java`) — workspace-scoped membership + role checks:
   - `canViewWorkspace` — SuperAdmin OR active workspace member (status ACTIVE).
   - `canUpdateWorkspace` — SuperAdmin OR OWNER/ADMIN WorkspaceRole.
   - `canDeleteWorkspace` — SuperAdmin OR OWNER only.
   - `canManageDepartmentHR`, `canAccessDepartment`, `canAccessTeam`, `canAccessProject`, `canManageTeam`, `canManageTeamMember`, `canCreateArtifact` — finer-grained helpers, several of which are **"For MVP" stubs** (see §13).

3. **`@departmentAuth`** (`security/department/DepartmentAuthorization.java`) — department-scoped: `canViewDepartment` (workspace admin/owner OR user's primaryDepartment == departmentId), `canManageDepartment` (workspace admin/owner only). Delegates tenant check to `workspaceAuthorization`.

### 2.2 Spring role hierarchy
`SecurityConfig.roleHierarchy()`: `"ROLE_SUPER_ADMIN > ROLE_ADMIN > ROLE_MANAGER > ROLE_MEMBER"`. This applies to `ROLE_`-prefixed authorities only. Because permission codes are granted **directly** as authorities (not via ROLE_ derivation), the hierarchy mainly affects any `hasRole(...)`-style checks (currently none in the foundation modules — all use `hasPermission(code)`).

### 2.3 Key authorization gaps (IDOR / over-privilege)
- **NotificationController.getById** — any workspace member with NOTIFICATION_READ can fetch **any** notification by ID; no per-user ownership scoping (§10).
- **NotificationController.markAllAsRead / delete** — require `canUpdateWorkspace`/`canDeleteWorkspace` (OWNER/ADMIN) to act on the **authenticated user's own** notifications (§10).

---

## 3. Roles & Permissions

### 3.1 Two distinct role concepts (important)
| Concept | Enum | Stored in | Purpose |
|---------|------|-----------|---------|
| **System roles** | `RoleName` (SUPER_ADMIN, ADMIN, MANAGER, MEMBER) | `roles` table + `user_roles` | Drive `@PreAuthorize` permission checks via `permissionEvaluator`. Embedded in JWT `role` claim. |
| **Workspace roles** | `WorkspaceRole` (OWNER, ADMIN, MANAGER, MEMBER) | `workspace_members` table | Drive `workspaceAuth.can*Workspace` membership checks (OWNER/ADMIN/MANAGER/MEMBER within a workspace). |

These are **orthogonal and easy to confuse**. A user's `UserRole` (system) determines their permission-code authorities; their `WorkspaceMember` role governs workspace-level admin rights.

### 3.2 Role definitions (seeded)
- `ADMIN` — "System administrator with full access"
- `MANAGER` — "Team manager"
- `MEMBER` — "Employee or intern"
- `SUPER_ADMIN` — "Platform super administrator with cross-workspace access" (created in V20260811)

### 3.3 Role-permission mapping (final state)

**SUPER_ADMIN** → ALL permission codes (cross join with entire `permissions` table).

**ADMIN** → ALL permission codes (granted incrementally across V1 + V20260810 + V20260811 + V20260818 + V20260836 + V20260842). Effectively all permissions.

**MANAGER** → read + moderate-write for most modules + full HR (V20260844). Includes HR permissions (EMPLOYEE_*, CANDIDATE_*, INTERVIEW_*, ONBOARDING_*, PERFORMANCE_REVIEW_*, ATTENDANCE_*, EMPLOYEE_DOCUMENT_*, EMPLOYEE_SKILL_*, RECRUITER_NOTE_*, HR_NOTIFICATION_*) — full DELETE included.

**MEMBER** → minimal self-service:
- `HANDOVER_ENTRY_CREATE`, `HANDOVER_ENTRY_READ` (V20260810)
- `COMMENT_CREATE`, `COMMENT_READ`, `MENTION_CREATE`, `MENTION_READ`, `NOTIFICATION_READ`, `NOTIFICATION_UPDATE` (V20260814)
- `ANNOUNCEMENT_READ` (V20260818)
- `WORKSPACE_READ` (V20260836)
- `CONVERSATION_READ`, `MESSAGE_CREATE`, `MESSAGE_READ`, `MESSAGE_UPDATE` (V20260842)

### 3.4 Missing from MEMBER — functional gaps
MEMBER does **NOT** have: `DASHBOARD_VIEW`, `DEPARTMENT_READ`, `TEAM_READ`, `TEAM_MEMBER_READ`, `PROJECT_READ`, `TASK_READ`, `USER_READ`, `ACTIVITY_READ`, `DOCUMENT_READ`, `KNOWLEDGE_BASE_READ`, `ATTACHMENT_READ`, `DASHBOARD_VIEW`. 

→ A regular employee (MEMBER) **cannot view any dashboard**, cannot list departments/teams/projects/tasks, and cannot read other users. Combined with the `@PreAuthorize` requiring BOTH workspace membership AND the granular permission code, regular members are effectively locked out of most read endpoints. This is likely an **unfinished permission rollout**.

### 3.5 Hardcoded role assignment
The seeded admin (`tahirelkadib36@gmail.com`, `V20260830`) is assigned only the **ADMIN** system role (not SUPER_ADMIN). The `isSuperAdmin()` bypass in `WorkspaceAuthorization` / `DepartmentAuthorization` checks for authority `ROLE_SUPER_ADMIN`, which **no seeded user possesses**. → The SuperAdmin bypass is effectively dead code for a default deployment; it only activates if an operator manually grants the role.

### 3.6 Legacy cleanup
- V20260812 deleted `ORGANIZATION_READ` / `ORGANIZATION_WRITE` (defined in V1, removed before use). No remaining references. Clean.
- V1 assigned `ORGANIZATION_READ`/`ORGANIZATION_WRITE` to ADMIN and `ORGANIZATION_READ` to MANAGER — all correctly removed in V20260812.

---

## 4. User Management

Base path: `/api/workspaces/{workspaceId}/users`

| Method | Path | Permission (`@PreAuthorize`) | Response | Service op |
|--------|------|------------------------------|----------|-----------|
| POST | `/api/workspaces/{workspaceId}/users` | `canUpdateWorkspace` + `USER_CREATE` | `ApiResponse<UserResponse>` | Create user + temp password + PENDING_ACTIVATION + activation email + history |
| GET | `/api/workspaces/{workspaceId}/users` | `canViewWorkspace` + `USER_READ` | `ApiResponse<List<UserResponse>>` | List all workspace users |
| GET | `/api/workspaces/{workspaceId}/users/search` | `canViewWorkspace` + `USER_READ` | `ApiResponse<Page<UserResponse>>` | Paginated search |
| GET | `/api/workspaces/{workspaceId}/users/{id}` | `canViewWorkspace` + `USER_READ` | `ApiResponse<UserResponse>` | Single user |
| PUT | `/api/workspaces/{workspaceId}/users/{id}` | `canUpdateWorkspace` + `USER_UPDATE` | `ApiResponse<UserResponse>` | Partial update (status/role/team/department) |
| PUT | `/api/workspaces/{workspaceId}/users/me` | `isAuthenticated()` | `ApiResponse<UserProfileResponse>` | Self profile update |
| DELETE | `/api/workspaces/{workspaceId}/users/{id}` | `canUpdateWorkspace` + `USER_DELETE` | `void` (204) | Soft delete → SOFT_DELETED |
| PUT | `/api/workspaces/{workspaceId}/users/{id}/activate` | `canUpdateWorkspace` + `USER_ACTIVATE` | `ApiResponse<UserResponse>` | PENDING_ACTIVATION → ACTIVE |
| PUT | `/.../deactivate` | `canUpdateWorkspace` + `USER_DEACTIVATE` | `ApiResponse<UserResponse>` | ACTIVE → INACTIVE |
| PUT | `/.../suspend` | `canUpdateWorkspace` + `USER_SUSPEND` | `ApiResponse<UserResponse>` | ACTIVE → SUSPENDED |
| PUT | `/.../reactivate` | `canUpdateWorkspace` + `USER_REACTIVATE` | `ApiResponse<UserResponse>` | INACTIVE/SUSPENDED → ACTIVE |
| PUT | `/.../archive` | `canUpdateWorkspace` + `USER_ARCHIVE` | `ApiResponse<UserResponse>` | → ARCHIVED + archivedAt |
| PUT | `/.../roles` | `canUpdateWorkspace` + `ROLE_UPDATE` | `ApiResponse<UserResponse>` | **Replace** system roles (deletes all, then assigns) |
| PUT | `/.../restore` | `canUpdateWorkspace` + `USER_RESTORE` | `ApiResponse<UserResponse>` | ARCHIVED → ACTIVE |
| GET | `/api/workspaces/{workspaceId}/users/statistics` | `canViewWorkspace` + `USER_READ` | `ApiResponse<UserStatisticsResponse>` | Counts per status/dept/team/role + recent hires |

### 4.1 Key behaviors
- **`CreateUserRequest`** (DTO `dto/auth/CreateUserRequest.java`): fields `firstName, lastName, email, memberType (MemberType), role (RoleName), departmentId, teamId`. The `role` is a **system** RoleName, not a workspace role.
- **Temp password**: `UserServiceImpl.generateTemporaryPassword` uses `SecureRandom(12 bytes)`. Encoded with BCrypt. User starts PENDING_ACTIVATION + disabled.
- **Workspace assignment on create**: new user is added as `WorkspaceMember` with `WorkspaceRole.MEMBER` (hardcoded). **No option to create a user as OWNER or ADMIN of the workspace via this endpoint.**
- **`assignRoles`** (`UserService.assignRoles`): **full replacement** semantics — deletes ALL existing `UserRole` then saves the new set. Method name is misleading (sounds additive). No delta computation; the whole set is replaced.
- **Status transition validation** (`UserServiceImpl.isValidTransition`): enforced in `update`. Transitions: PENDING_ACTIVATION→ACTIVE; ACTIVE→{INACTIVE,SUSPENDED,ARCHIVED,SOFT_DELETED}; INACTIVE/SUSPENDED→{ACTIVE,ARCHIVED,SOFT_DELETED}; ARCHIVED/SOFT_DELETED/LOCKED→ACTIVE only.
- **`updateProfile`** (self): records UserHistory entries for email/name/picture changes.

### 4.2 Bugs / inconsistencies
- **Dead-code branch** in `UserServiceImpl.update` (lines ~277–281): an `else if` that checks every field is null then executes an empty `{}` block — no-op, leftover logic.
- **`update` allows role change** when `role != null` in `UpdateUserRequest`, but `UpdateUserRequest` does not expose a `role` field per the DTO path read; verify DTO. The `assignRoles` endpoint is the dedicated path. (Need to confirm `UpdateUserRequest` has `role`.)
- **`assignRoles` permission is `ROLE_UPDATE`** — semantically odd. Assigning user roles is gated by the same permission as editing role definitions (ROLE_UPDATE), not USER_* permissions. Acceptable but the code could use a dedicated `USER_ASSIGN_ROLE`.
- **`me`/`updateProfile`** bypass workspace authorization entirely (`isAuthenticated()` only) — profile is cross-workspace (a user belongs to multiple workspaces). Email uniqueness is global (`users.email` unique), so changing email affects the global identity. OK by design.
- **`getAuthenticatedUserId()`** returns `null` when not authenticated (in `update`) — `UserHistory.record` is called with `null` performedBy; `UserHistoryService.record` handles null gracefully (performedBy = null). OK but produces audit gaps.

---

## 5. Workspace

Base path: `/api/workspaces`

| Method | Path | Permission | Response |
|--------|------|-----------|----------|
| POST | `/api/workspaces` | `WORKSPACE_CREATE` | `ApiResponse<WorkspaceResponse>` |
| GET | `/api/workspaces` | `WORKSPACE_READ` | `ApiResponse<List<WorkspaceSummaryResponse>>` |
| GET | `/api/workspaces/archived` | `WORKSPACE_READ` | `ApiResponse<List<WorkspaceSummaryResponse>>` |
| GET | `/api/workspaces/{workspaceId}` | `canViewWorkspace` + `WORKSPACE_READ` | `ApiResponse<WorkspaceResponse>` |
| PUT | `/api/workspaces/{workspaceId}` | `canUpdateWorkspace` + `WORKSPACE_UPDATE` | `ApiResponse<WorkspaceResponse>` |
| PUT | `/.../archive` | `canDeleteWorkspace` + `WORKSPACE_DELETE` | `ApiResponse<WorkspaceResponse>` |
| PUT | `/.../restore` | `canUpdateWorkspace` + `WORKSPACE_UPDATE` | `ApiResponse<WorkspaceResponse>` |
| DELETE | `/api/workspaces/{workspaceId}` | `canDeleteWorkspace` + `WORKSPACE_DELETE` | `void` (204) |

### 5.1 Behaviors
- **`create`**: authenticated user becomes `WorkspaceMember` with `WorkspaceRole.OWNER`. Enforces `uk_workspaces_owner_id_name` uniqueness (owner+name).
- **`getById`**: re-queries membership (`isMember`). Response includes `memberCount`, `teamCount`, `projectCount` (project count wrapped in try/catch — swallows errors, logs warning).
- **`listByCurrentUser`**: only ACTIVE workspace members in ACTIVE workspaces, sorted by createdAt desc (or name). Includes memberCount/teamCount.
- **`archive`/`delete`**: both set status ARCHIVED. `archive` returns the (now-archived) workspace; `delete` returns 204.

### 5.2 Bugs / inconsistencies
- **Duplicate archive behavior**: `archive` (PUT `/archive` → `WORKSPACE_DELETE`) and `delete` (DELETE `/{id}` → `WORKSPACE_DELETE`) **both** set `WorkspaceStatus.ARCHIVED` and require `canDeleteWorkspace` (OWNER). They are functionally identical soft-deletes. The `archive` endpoint's permission is `WORKSPACE_DELETE` which is misleading (archive ≠ delete). **Redundant, inconsistent design.**
- **HTTP method inconsistency**: archive uses `PUT`, delete uses `DELETE`, restore uses `PUT`. Other modules (Department, Team) use `DELETE` for archival and `PUT /restore`. No unified convention.
- **`WorkspaceResponse.createdBy` / `updatedBy`** are typed `String` while the entity (`AuditableEntity.createdBy`) is `UUID` — relies on mapper conversion; minor type smell.
- **`restore` uses POST in some modules, PUT in others**: Workspace `restore` is `PUT`; verify consistency per-module (see §6, §7).

---

## 6. Departments

Base path: `/api/workspaces/{workspaceId}/departments`

| Method | Path | Permission | Response |
|--------|------|-----------|----------|
| POST | `/api/workspaces/{workspaceId}/departments` | `canUpdateWorkspace` + `DEPARTMENT_CREATE` | `ApiResponse<DepartmentResponse>` |
| GET | `/.../departments` | `canViewWorkspace` + `DEPARTMENT_READ` | `ApiResponse<List<DepartmentSummaryResponse>>` |
| GET | `/.../departments/{id}` | `canViewWorkspace` + `DEPARTMENT_READ` | `ApiResponse<DepartmentResponse>` |
| GET | `/.../departments/{id}/details` | `canViewWorkspace` + `DEPARTMENT_READ` | `ApiResponse<DepartmentDetailsResponse>` |
| PUT | `/.../departments/{id}` | `canUpdateWorkspace` + `DEPARTMENT_UPDATE` | `ApiResponse<DepartmentResponse>` |
| PUT | `/.../departments/{id}/restore` | `canUpdateWorkspace` + `DEPARTMENT_UPDATE` | `ApiResponse<DepartmentResponse>` |
| DELETE | `/.../departments/{id}` | `canDeleteWorkspace` + `DEPARTMENT_DELETE` | `void` (204) |

### 6.1 Behaviors
- Names **normalized** (trim + lower-case via `Locale.ROOT`) and unique per workspace (`uk_departments_workspace_id_name`).
- **`delete`**: soft → ARCHIVED; refuses if active teams exist (`teamRepository.existsByDepartment_IdAndStatus`).
- **`restore`**: only if currently ARCHIVED.
- Service-side authorization mirrors controller annotations (defense-in-depth): `assertActiveWorkspaceMember` + `assertWorkspaceAdminOrOwner` (owner for delete).

### 6.2 Bugs / inconsistencies
- **`restore` permission mismatch**: controller `@PreAuthorize` requires `canUpdateWorkspace` + `DEPARTMENT_UPDATE` for restore — correct (ADMIN/OWNER). Consistent.
- **No archived-list endpoint** for departments (unlike workspaces which have `/archived`). Minor feature gap.
- **`getById`/`getDetails`**: archived departments return 404 (throws `ResourceNotFoundException` if status != ACTIVE). Intentional hiding. OK.

---

## 7. Teams & Team Members

### 7.1 Teams — `/api/workspaces/{workspaceId}/departments/{departmentId}/teams`

| Method | Path | Permission | Response |
|--------|------|-----------|----------|
| POST | `/teams` | `canUpdateWorkspace` + `TEAM_CREATE` | `ApiResponse<TeamResponse>` |
| GET | `/teams` | `canViewWorkspace` + `TEAM_READ` | `ApiResponse<List<TeamSummaryResponse>>` |
| GET | `/teams/{id}` | `canViewWorkspace` + `TEAM_READ` | `ApiResponse<TeamResponse>` |
| GET | `/teams/{id}/details` | `canViewWorkspace` + `TEAM_READ` | `ApiResponse<TeamDetailsResponse>` |
| PUT | `/teams/{id}` | `canUpdateWorkspace` + `TEAM_UPDATE` | `ApiResponse<TeamResponse>` |
| DELETE | `/teams/{id}` | `canDeleteWorkspace` + `TEAM_DELETE` | `void` (204) |

- Names normalized + unique per department.
- **No `restore` endpoint** for teams (DELETE = soft ARCHIVED, but cannot un-archive). **Missing endpoint.**
- TODO comments: "verifiesr ressources actives (Tasks, Documents...) quand modules existeront" — team deletion does NOT currently check for active child resources. Incomplete guard.

### 7.2 Team Members — `/api/workspaces/{workspaceId}/departments/{departmentId}/teams/{teamId}/members`

| Method | Path | Permission | Response |
|--------|------|-----------|----------|
| POST | `/members` | `canUpdateWorkspace` + `TEAM_MEMBER_ADD` | `ApiResponse<TeamMemberResponse>` |
| GET | `/members` | `canViewWorkspace` + `TEAM_MEMBER_READ` | `ApiResponse<List<TeamMemberResponse>>` |
| GET | `/members/{userId}` | `canViewWorkspace` + `TEAM_MEMBER_READ` | `ApiResponse<TeamMemberResponse>` |
| PUT | `/members/{userId}` | `canUpdateWorkspace` + `TEAM_MEMBER_UPDATE` | `ApiResponse<TeamMemberResponse>` |
| DELETE | `/members/{userId}` | `canDeleteWorkspace` + `TEAM_MEMBER_REMOVE` | `void` (204) |

- `addMember` requires the target user to be an **ACTIVE workspace member** (cross-check). Prevents cross-workspace team assignment.
- `delete` = soft → `LEFT` status. Idempotent.
- **`TeamMember` entity has no role/lead field** — only `status` (reuses `WorkspaceMemberStatus`). The javadoc comments repeatedly note "TEAM LEADER non implémenté pour le MVP" and `canManageTeamMember`'s `targetUserId` is "intentionally not used yet (no fine-grained team member permissions exist)". → **Team-lead functionality is stubbed/aspirational.**

---

## 8. Roles & Permissions (management)

Base paths: `/api/roles`, `/api/permissions`

| Method | Path | Permission | Response |
|--------|------|-----------|----------|
| GET | `/api/roles` | `ROLE_READ` | `ApiResponse<List<RoleResponse>>` |
| GET | `/api/roles/{id}` | `ROLE_READ` | `ApiResponse<RoleResponse>` |
| GET | `/api/permissions` | `PERMISSION_READ` | `ApiResponse<List<PermissionResponse>>` |
| GET | `/api/permissions/{id}` | `PERMISSION_READ` | `ApiResponse<PermissionResponse>` |

- **Read-only** — no create/update/delete endpoints despite `ROLE_CREATE`, `ROLE_DELETE`, `PERMISSION_CREATE/UPDATE/DELETE` permission codes existing in the DB. → **Permissions defined but no corresponding management endpoints.**
- `RoleServiceImpl.findAll` has an N+1 smell: maps each role, then re-queries the DB for the same role + `userCount` per row.
- `RoleResponse.permissions` is `List<String>` (codes), populated by mapper.
- **`AdminUserController`** `/api/admin/users/{userId}/unlock` — `ADMIN_USER_UNLOCK`, delegates to `AuthService.unlockAccount`. Only admin operation on users; no other admin endpoints (suspend/reactivate are in UserController).

---

## 9. User History

Base path: `/api/workspaces/{workspaceId}/users/history`

| Method | Path | Permission | Response |
|--------|------|-----------|----------|
| GET | `/history` | `canViewWorkspace` + `USER_READ` | `ApiResponse<Page<UserHistoryResponse>>` |
| GET | `/history/statistics` | `canViewWorkspace` + `USER_READ` | `ApiResponse<UserHistoryStatisticsResponse>` |

- Audit trail written via `UserHistoryService.record` from `UserServiceImpl` (create, status changes, role assignments, profile/email/picture updates).
- **`departmentTransfers` statistic** queries `ACTION_DEPARTMENT_CHANGED`, but **no code path ever records** `ACTION_DEPARTMENT_CHANGED` (only `ACTION_PROFILE_UPDATED` etc. are emitted). → statistic is always 0. **Dead metric.**
- `UserHistoryService.record` wraps `RuntimeException("User not found")` for missing users — non-specific exception type.

---

## 10. Notifications

Base path: `/api/workspaces/{workspaceId}/notifications`

| Method | Path | Permission | Response |
|--------|------|-----------|----------|
| GET | `/{notificationId}` | `canViewWorkspace` + `NOTIFICATION_READ` | `ApiResponse<NotificationResponse>` |
| GET | `/` | `canViewWorkspace` + `NOTIFICATION_READ` | `ApiResponse<Page<NotificationResponse>>` |
| GET | `/unread` | `canViewWorkspace` + `NOTIFICATION_READ` | `ApiResponse<Page<NotificationResponse>>` |
| GET | `/unread/count` | `canViewWorkspace` + `NOTIFICATION_READ` | `ApiResponse<Long>` |
| PUT | `/{notificationId}/read` | `canUpdateWorkspace` + `NOTIFICATION_UPDATE` | `ApiResponse<NotificationResponse>` |
| PUT | `/read-all` | `canUpdateWorkspace` + `NOTIFICATION_UPDATE` | `ApiResponse<Void>` |
| DELETE | `/{notificationId}` | `canDeleteWorkspace` + `NOTIFICATION_DELETE` | `void` (204) |

### 10.1 Bugs
- **IDOR on getById**: any workspace member can read **any** notification by ID. No ownership check in the controller or (apparently) in the service. Should at minimum verify the notification belongs to the authenticated user (for read/update/delete) unless the user is workspace admin.
- **Over-strict write/delete**: `markAsRead`, `markAllAsRead`, and `delete` all require `canUpdateWorkspace`/`canDeleteWorkspace` (ADMIN/OWNER), yet they act on the **caller's own** notifications. A regular MEMBER cannot mark their own notifications as read. Should require only workspace membership + `NOTIFICATION_UPDATE`/`NOTIFICATION_DELETE`.

---

## 11. Dashboard

Base path: `/api/workspaces/{workspaceId}`

| Method | Path | Permission | Response |
|--------|------|-----------|----------|
| GET | `/dashboard/workspace` | `canViewWorkspace` + `DASHBOARD_VIEW` | `ApiResponse<WorkspaceDashboardResponse>` |
| GET | `/dashboard/me` | `canViewWorkspace` + `DASHBOARD_VIEW` | `ApiResponse<PersonalDashboardResponse>` |
| GET | `/departments/{departmentId}/dashboard` | `departmentAuth.canViewDepartment` + `DASHBOARD_VIEW` | `ApiResponse<DepartmentDashboardResponse>` |
| GET | `/projects/{projectId}/dashboard` | `workspaceAuth.canAccessProject` + `DASHBOARD_VIEW` | `ApiResponse<ProjectDashboardResponse>` |
| GET | `/teams/{teamId}/dashboard` | `workspaceAuth.canAccessTeam` + `DASHBOARD_VIEW` | `ApiResponse<TeamDashboardResponse>` |

### 11.1 Bug (critical)
- `DASHBOARD_VIEW` is **not granted to the MEMBER role**. Since dashboards are the post-login landing page, regular employees are entirely locked out. `DASHBOARD_VIEW` should be granted to MEMBER.

---

## 12. Security Audit

Base path: `/api/workspaces/{workspaceId}/departments/{departmentId}/audits`

| Method | Path | Permission | Response |
|--------|------|-----------|----------|
| POST | `/audits` | `canUpdateWorkspace` + `SECURITY_AUDIT_CREATE` | `ApiResponse<SecurityAuditResponse>` |
| GET | `/audits/{id}` | `canViewWorkspace` + `SECURITY_AUDIT_READ` | `ApiResponse<SecurityAuditResponse>` |
| GET | `/audits` | `canViewWorkspace` + `SECURITY_AUDIT_READ` | `ApiResponse<Page<SecurityAuditResponse>>` |
| GET | `/audits/stats` | `canViewWorkspace` + `SECURITY_AUDIT_READ` | `ApiResponse<SecurityAuditStatistics>` |
| PUT | `/audits/{id}` | `canUpdateWorkspace` + `SECURITY_AUDIT_UPDATE` | `ApiResponse<SecurityAuditResponse>` |
| PUT | `/audits/{id}/start` | `canUpdateWorkspace` + `SECURITY_AUDIT_START` | `ApiResponse<SecurityAuditResponse>` |
| PUT | `/audits/{id}/complete` | `canUpdateWorkspace` + `SECURITY_AUDIT_COMPLETE` | `ApiResponse<SecurityAuditResponse>` |
| PUT | `/audits/{id}/archive` | `canUpdateWorkspace` + `SECURITY_AUDIT_ARCHIVE` | `ApiResponse<SecurityAuditResponse>` |

- No DELETE (archival is the terminal state). Consistent with the domain.
- Permission `SECURITY_AUDIT_DELETE` is **defined in migrations but never referenced** by any controller. → **Orphaned permission code.**

---

## 13. Cross-cutting Findings

### 13.1 TODOs / MVP stubs (non-exhaustive of foundation modules)
- `TeamServiceImpl.java:50` — "TEAM LEADER non implémenté pour le MVP".
- `TeamServiceImpl.java:86-87` — `existsByWorkspace_IdAndName` referenced as placeholder while actual call uses `existsByWorkspace_IdAndDepartment_IdAndName` (outdated comment).
- `TeamServiceImpl.java:191` — "OWNER attendu, MVP élargit" — delete allows ADMIN+OWNER, not OWNER-only as originally intended.
- `TeamServiceImpl.java:204` — "TODO: verifiesr ressources actives (Tasks, Documents...)".
- `DepartmentServiceImpl.java:53` — "verification sera faite par the method TeamRepository lorsque ce module sera branché" (but it IS now wired — `teamRepository.existsByDepartment_IdAndStatus` is called). Comment is stale.
- `WorkspaceAuthorization.canManageTeamMember` — "targetUserId is intentionally not used yet (no fine-grained team member permissions exist)".
- `WorkspaceAuthorization.canCreateArtifact` — "Artifacts creation is governed by workspace ADMIN/OWNER. Department/Team are context only for MVP."
- `SecurityAudit` (AIOrchestrator) — `"placeholder"` literal at `AIOrchestratorServiceImpl.java:47`.

### 13.2 Hardcoded values
- Seed admin password in `V20260830__seed_initial_admin.sql`: `Admin@123456`.
- `SecurityConfig` CSP `connect-src 'self' http://localhost:5173` — hardcoded, not configurable.
- `app.activation.base-url` default `http://localhost:5173` vs `app.reset-password.lowe-url` default `http://localhost:4200` — **inconsistent default front-end ports**.
- `JwtProperties` secret defaults to **empty** (warns only at startup, does not fail fast) — if unset, `getSigningKey()` throws `IllegalStateException` at first token operation.

### 13.3 Bugs / inconsistencies
1. **Redundant workspace soft-delete** — `archive` (PUT) and `delete` (DELETE) both ARCHIVED; identical effect.
2. **Workspace `restore` HTTP method** is PUT; Team/Project modules have no restore; Department restore is PUT — no consistent convention.
3. **`assignRoles` full-replacement semantics** — method name implies additive but it wipes+replaces the entire role set.
4. **Dead-code no-op branch** in `UserServiceImpl.update` (line ~277–281).
5. **`ORGANIZATION_READ/WRITE`** — legacy permission codes defined then removed; ensure no controller still references them (none do).
6. **Role name collision** — custom `PermissionEvaluator` class shares the name with Spring Security's `PermissionEvaluator` interface; works via SpEL `@beanName` resolution but is a readability hazard.
7. **SUPER_ADMIN role never seeded** — `isSuperAdmin()` bypass unreachable for default deployments.
8. **`JwtFilter` silently drops non-ACTIVE users** (no authentication context set → 401 instead of a meaningful 403/426). Acceptable but degrades UX for suspended/locked accounts hitting protected endpoints.
9. **`WorkspaceResponse.createdBy/updatedBy`** are `String` not `UUID`.
10. **`RoleServiceImpl.findAll`** N+1 query pattern.
11. **Missing team restore endpoint** (teams can be archived but not un-archived).
12. **Notification IDOR + over-strict write gating** (§10).
13. **Dashboard VIEW missing for MEMBER** (§11).

### 13.4 Missing endpoints
- **Team restore** (archive-only, no restore).
- **Role/Permission CRUD** (POST/PUT/DELETE) — `ROLE_CREATE/ROLE_DELETE`, `PERMISSION_CREATE/UPDATE/DELETE`, `USER_ACTIVATE/DEACTIVATE/SUSPEND/...` (via UserController, present), `TEAM_RESTORE` — none implemented.
- **Workspace member promotion** — no endpoint to change a `WorkspaceMember`'s `WorkspaceRole` (OWNER/ADMIN/MANAGER/MEMBER); only fixed MEMBER on user-create.
- **Department archived-list**.

### 13.5 Mock data / test artifacts in production code
- `RoleController`/`PermissionController` class-level javadoc: "Proemptys endpoints" (typo of "Prepares"/"Provides"). Cosmetic.
- Many controllers/services carry French/English mixed javadoc with recurring typos ("resorteved", "proemptyd", "expiressd", "lowe", "sortedm", "namebre", "logical métiér"). Cosmetic; no functional impact.
- `AIOrchestratorServiceImpl` hardcodes `"placeholder"` (line 47) — outside foundation scope but flagged.

### 13.6 Data model notes
- Composite IDs (`WorkspaceMemberId`, `TeamMemberId`, `UserRoleId`, `RolePermissionId`) — all embeddable IDs with `@EmbeddedId` + `@MapsId`.
- `User.teamMembers`/`User.workspaceMembers` collections have `@BatchSize(20)`; `userRoles` also batched. `Department`/`Team` use `WorkspaceStatus` enum for their status (shared enum).
- `User.primaryDepartment` — added in V20260834; single-valued department for authorization isolation; not a replacement for the workspace/team membership model.

---

## 14. Full Permission Catalog (ordered by definition)

| Code | Category | Defined in | Assigned to (final) |
|------|----------|------------|---------------------|
| USER_CREATE | User | V1 | ADMIN |
| USER_READ | User | V1 | ADMIN, MANAGER |
| USER_UPDATE | User | V1 | ADMIN, MANAGER |
| USER_DELETE | User | V1 | ADMIN |
| USER_ACTIVATE | User lifecycle | V20260810 | ADMIN |
| USER_DEACTIVATE | User lifecycle | V20260810 | ADMIN |
| USER_SUSPEND | User lifecycle | V20260810 | ADMIN |
| USER_REACTIVATE | User lifecycle | V20260810 | ADMIN, MANAGER |
| USER_ARCHIVE | User lifecycle | V20260810 | ADMIN |
| USER_RESTORE | User lifecycle | V20260810 | ADMIN |
| ROLE_READ | Role | V1 | ADMIN, MANAGER |
| ROLE_UPDATE | Role | V1 | ADMIN |
| ROLE_CREATE | Role | V20260810 | ADMIN |
| ROLE_DELETE | Role | V20260810 | ADMIN |
| PERMISSION_READ | Permission | V1 | ADMIN, MANAGER |
| PERMISSION_CREATE | Permission | V20260810 | ADMIN |
| PERMISSION_UPDATE | Permission | V20260810 | ADMIN |
| PERMISSION_DELETE | Permission | V20260810 | ADMIN |
| WORKSPACE_CREATE | Workspace | V20260810 | ADMIN |
| WORKSPACE_READ | Workspace | V20260810 | ADMIN, MANAGER, **MEMBER** (V20260836) |
| WORKSPACE_UPDATE | Workspace | V20260810 | ADMIN, MANAGER |
| WORKSPACE_DELETE | Workspace | V20260810 | ADMIN |
| DEPARTMENT_CREATE | Department | V20260810 | ADMIN |
| DEPARTMENT_READ | Department | V20260810 | ADMIN, MANAGER |
| DEPARTMENT_UPDATE | Department | V20260810 | ADMIN, MANAGER |
| DEPARTMENT_DELETE | Department | V20260810 | ADMIN |
| TEAM_CREATE | Team | V20260810 | ADMIN |
| TEAM_READ | Team | V20260810 | ADMIN, MANAGER |
| TEAM_UPDATE | Team | V20260810 | ADMIN, MANAGER |
| TEAM_DELETE | Team | V20260810 | ADMIN |
| TEAM_MEMBER_ADD | Team member | V20260810 | ADMIN, MANAGER |
| TEAM_MEMBER_READ | Team member | V20260811 | ADMIN, MANAGER |
| TEAM_MEMBER_REMOVE | Team member | V20260810 | ADMIN, MANAGER |
| TEAM_MEMBER_UPDATE | Team member | V20260811 | ADMIN |
| PROJECT_CREATE | Project | V20260810 | ADMIN, MANAGER |
| PROJECT_READ | Project | V20260810 | ADMIN, MANAGER |
| PROJECT_UPDATE | Project | V20260810 | ADMIN, MANAGER |
| PROJECT_DELETE | Project | V20260810 | ADMIN |
| TASK_CREATE | Task | V20260810 | ADMIN, MANAGER |
| TASK_READ | Task | V20260810 | ADMIN, MANAGER |
| TASK_UPDATE | Task | V20260810 | ADMIN, MANAGER |
| TASK_DELETE | Task | V20260810 | ADMIN |
| TASK_ASSIGN | Task | V20260810 | ADMIN, MANAGER |
| COMMENT_CREATE | Comment | V20260810, V20260814(MEMBER) | ADMIN, MANAGER, **MEMBER** |
| COMMENT_READ | Comment | V20260810, V20260814(MEMBER) | ADMIN, MANAGER, **MEMBER** |
| COMMENT_UPDATE | Comment | V20260810 | ADMIN, MANAGER |
| COMMENT_DELETE | Comment | V20260810 | ADMIN |
| DOCUMENT_UPLOAD | Document | V20260810 | ADMIN, MANAGER |
| DOCUMENT_READ | Document | V20260810 | ADMIN, MANAGER |
| DOCUMENT_UPDATE | Document | V20260810 | ADMIN, MANAGER |
| DOCUMENT_DELETE | Document | V20260810 | ADMIN |
| KNOWLEDGE_BASE_CREATE | KB | V20260810 | ADMIN, MANAGER |
| KNOWLEDGE_BASE_READ | KB | V20260810 | ADMIN, MANAGER |
| KNOWLEDGE_BASE_UPDATE | KB | V20260810 | ADMIN, MANAGER |
| KNOWLEDGE_BASE_DELETE | KB | V20260810 | ADMIN |
| ATTACHMENT_UPLOAD | Attachment | V20260810 | ADMIN, MANAGER |
| ATTACHMENT_READ | Attachment | V20260810 | ADMIN, MANAGER |
| ATTACHMENT_UPDATE | Attachment | V20260810 | ADMIN, MANAGER |
| ATTACHMENT_DELETE | Attachment | V20260810 | ADMIN |
| ACTIVITY_READ | Activity | V20260810 | ADMIN, MANAGER |
| ACTIVITY_CREATE | Activity | V20260811 | ADMIN, MANAGER |
| ACTIVITY_UPDATE | Activity | V20260811 | ADMIN, MANAGER |
| ACTIVITY_DELETE | Activity | V20260811 | ADMIN, MANAGER |
| NOTIFICATION_READ | Notification | V20260810, V20260814(MEMBER) | ADMIN, MANAGER, **MEMBER** |
| NOTIFICATION_UPDATE | Notification | V20260810, V20260814(MEMBER) | ADMIN, MANAGER, **MEMBER** |
| NOTIFICATION_DELETE | Notification | V20260810 | ADMIN |
| MENTION_CREATE | Mention | V20260810, V20260814(MEMBER) | ADMIN, MANAGER, **MEMBER** |
| MENTION_READ | Mention | V20260810, V20260814(MEMBER) | ADMIN, MANAGER, **MEMBER** |
| MENTION_UPDATE | Mention | V20260811 | ADMIN, MANAGER |
| MENTION_DELETE | Mention | V20260810 | ADMIN |
| HANDOVER_CREATE | Handover | V20260810 | ADMIN, MANAGER |
| HANDOVER_READ | Handover | V20260810 | ADMIN, MANAGER |
| HANDOVER_UPDATE | Handover | V20260810 | ADMIN, MANAGER |
| HANDOVER_DELETE | Handover | V20260810 | ADMIN |
| HANDOVER_APPROVE | Handover | V20260810 | ADMIN, MANAGER |
| HANDOVER_ENTRY_CREATE | Handover entry | V20260810, V20260810(MEMBER) | ADMIN, MANAGER, **MEMBER** |
| HANDOVER_ENTRY_READ | Handover entry | V20260810, V20260810(MEMBER) | ADMIN, MANAGER, **MEMBER** |
| HANDOVER_ENTRY_UPDATE | Handover entry | V20260810 | ADMIN |
| HANDOVER_ENTRY_DELETE | Handover entry | V20260810 | ADMIN |
| DASHBOARD_VIEW | Dashboard | V20260810 | ADMIN, MANAGER — **NOT MEMBER** (gap) |
| EMPLOYEE_CREATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_UPDATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| CANDIDATE_CREATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| CANDIDATE_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| CANDIDATE_UPDATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| CANDIDATE_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| INTERVIEW_CREATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| INTERVIEW_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| INTERVIEW_UPDATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| INTERVIEW_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| INTERVIEW_CANCEL | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| INTERVIEW_CALENDAR_VIEW | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| ONBOARDING_CREATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| ONBOARDING_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| ONBOARDING_UPDATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| ONBOARDING_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| ONBOARDING_TASK_MANAGE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| PERFORMANCE_REVIEW_CREATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| PERFORMANCE_REVIEW_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| PERFORMANCE_REVIEW_UPDATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| PERFORMANCE_REVIEW_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| PERFORMANCE_REVIEW_SUBMIT | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| PERFORMANCE_REVIEW_APPROVE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| ATTENDANCE_CREATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| ATTENDANCE_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| ATTENDANCE_UPDATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| ATTENDANCE_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_DOCUMENT_UPLOAD | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_DOCUMENT_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_DOCUMENT_UPDATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_DOCUMENT_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_DOCUMENT_VERIFY | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| RECRUITER_NOTE_CREATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| RECRUITER_NOTE_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| RECRUITER_NOTE_UPDATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| RECRUITER_NOTE_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_SKILL_CREATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_SKILL_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_SKILL_UPDATE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| EMPLOYEE_SKILL_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| HR_NOTIFICATION_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| HR_NOTIFICATION_DISMISS | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| CANDIDATE_ATTACHMENT_UPLOAD | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| CANDIDATE_ATTACHMENT_READ | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| CANDIDATE_ATTACHMENT_UPDATE | HR | V20260810, V20260811, V20260844(MANAGER) | ADMIN, MANAGER |
| CANDIDATE_ATTACHMENT_DELETE | HR | V20260810, V20260844(MANAGER) | ADMIN, MANAGER |
| CAMPAIGN_CREATE | Marketing | V20260810 | ADMIN, MANAGER |
| CAMPAIGN_READ | Marketing | V20260810 | ADMIN, MANAGER |
| CAMPAIGN_UPDATE | Marketing | V20260810 | ADMIN, MANAGER |
| CAMPAIGN_ACTIVATE | Marketing | V20260810 | ADMIN, MANAGER |
| CAMPAIGN_COMPLETE | Marketing | V20260810 | ADMIN, MANAGER |
| CAMPAIGN_ARCHIVE | Marketing | V20260810 | ADMIN |
| SPRINT_CREATE | Dev | V20260810 | ADMIN, MANAGER |
| SPRINT_READ | Dev | V20260810 | ADMIN, MANAGER |
| SPRINT_UPDATE | Dev | V20260810 | ADMIN, MANAGER |
| SPRINT_DELETE | Dev | V20260810 | ADMIN |
| SPRINT_ACTIVATE | Dev | V20260810 | ADMIN, MANAGER |
| SPRINT_COMPLETE | Dev | V20260810 | ADMIN, MANAGER |
| SPRINT_ARCHIVE | Dev | V20260810 | ADMIN |
| SECURITY_AUDIT_CREATE | Cyber | V20260810 | ADMIN, MANAGER |
| SECURITY_AUDIT_READ | Cyber | V20260810 | ADMIN, MANAGER |
| SECURITY_AUDIT_UPDATE | Cyber | V20260810 | ADMIN, MANAGER |
| SECURITY_AUDIT_START | Cyber | V20260810 | ADMIN, MANAGER |
| SECURITY_AUDIT_COMPLETE | Cyber | V20260810 | ADMIN, MANAGER |
| SECURITY_AUDIT_ARCHIVE | Cyber | V20260810 | ADMIN, MANAGER |
| SECURITY_AUDIT_DELETE | Cyber | **(orphaned)** | none — defined but no controller uses it |
| AI_MODEL_CREATE | AI | V20260810 | ADMIN, MANAGER |
| AI_MODEL_READ | AI | V20260810 | ADMIN, MANAGER |
| AI_MODEL_UPDATE | AI | V20260810 | ADMIN, MANAGER |
| AI_MODEL_ARCHIVE | AI | V20260810 | ADMIN, MANAGER |
| REPORT_VIEW | Report | V20260810 | ADMIN, MANAGER |
| REPORT_EXPORT | Report | V20260810 | ADMIN, MANAGER |
| REPORT_SCHEDULE | Report | V20260810 | ADMIN, MANAGER |
| REPORT_HISTORY_VIEW | Report | V20260810 | ADMIN, MANAGER |
| REPORT_CREATE | Report | V20260836 | ADMIN, MANAGER |
| REPORT_UPDATE | Report | V20260836 | ADMIN, MANAGER |
| REPORT_READ | Report | V20260836 | ADMIN, MANAGER |
| ANALYTICS_VIEW | Analytics | V20260810 | ADMIN, MANAGER |
| ANALYTICS_EXPORT | Analytics | V20260810 | ADMIN, MANAGER |
| CONVERSATION_CREATE | Communication | V20260842 | ADMIN, MANAGER |
| CONVERSATION_READ | Communication | V20260842 | ADMIN, MANAGER, **MEMBER** |
| CONVERSATION_UPDATE | Communication | V20260842 | ADMIN, MANAGER |
| CONVERSATION_DELETE | Communication | V20260842 | ADMIN |
| MESSAGE_CREATE | Communication | V20260842 | ADMIN, MANAGER, **MEMBER** |
| MESSAGE_READ | Communication | V20260842 | ADMIN, MANAGER, **MEMBER** |
| MESSAGE_UPDATE | Communication | V20260842 | ADMIN, MANAGER, **MEMBER** |
| MESSAGE_DELETE | Communication | V20260842 | ADMIN |
| ANNOUNCEMENT_CREATE | Announcement | V20260818 | ADMIN, MANAGER |
| ANNOUNCEMENT_READ | Announcement | V20260818 | ADMIN, MANAGER, **MEMBER** |
| ANNOUNCEMENT_UPDATE | Announcement | V20260818 | ADMIN |
| ANNOUNCEMENT_DELETE | Announcement | V20260818 | ADMIN |
| ADMIN_USER_UNLOCK | Admin | V20260810 | ADMIN |

### Orphaned permission codes (defined, never referenced in any `@PreAuthorize`)
- `SECURITY_AUDIT_DELETE`
- `ROLE_CREATE`, `ROLE_DELETE`, `PERMISSION_CREATE`, `PERMISSION_UPDATE`, `PERMISSION_DELETE` (no CRUD endpoints exist for roles/permissions)
- `TEAM_DELETE` — referenced (TeamController DELETE). Not orphaned.
- `MESSAGE_DELETE`, `CONVERSATION_DELETE` — referenced? (Not in foundation controllers read; used by ConversationController/MessageController.)

### Permissions referenced in controllers NOT in seed data
- (verified) all `@PreAuthorize` codes used by foundation controllers exist in migrations. The full list of codes used: USER_CREATE/READ/UPDATE/DELETE/ACTIVATE/DEACTIVATE/SUSPEND/REACTIVATE/ARCHIVE/RESTORE, ROLE_READ/UPDATE, PERMISSION_READ, WORKSPACE_CREATE/READ/UPDATE/DELETE, DEPARTMENT_CREATE/READ/UPDATE/DELETE, TEAM_CREATE/READ/UPDATE/DELETE, TEAM_MEMBER_ADD/READ/REMOVE/UPDATE, ADMIN_USER_UNLOCK, NOTIFICATION_READ/UPDATE/DELETE, DASHBOARD_VIEW. All present in migrations. ✓
