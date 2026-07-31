# Identity & Access Management (IAM) Architectural Audit

**Date:** 2026-07-24
**Scope:** Complete review of Authentication, Authorization, User Management, Roles, Permissions, JWT, Security, Account Lifecycle, Workspace/Department/Team Isolation
**Type:** Architectural Audit (no code modifications)

---

## 1. Executive Summary

The Collabix backend has undergone a significant authorization hardening sprint. The previous audit (6 existing permissions, 0 PermissionEvaluator, sub-module controllers without permission checks) has been substantially addressed: a PermissionEvaluator bean exists, 146 permission codes have been introduced via Flyway V20260810, and all ~44+ controllers now use the `@permissionEvaluator.hasPermission()` pattern.

**However, the system is NOT production-ready.** The audit reveals:

- **5 missing permission codes** referenced by controller annotations but not defined in any migration (authorization will always fail at runtime)
- **3 controller annotation bugs** where wrong permission codes are used for specific operations
- **4 workspace authorization bugs** where write operations use `canViewWorkspace` instead of `canUpdateWorkspace`
- **1 critical cross-workspace data access vulnerability** in the analytics API
- **1 broken security filter** that exposes `GET /api/auth/me` without authentication
- **1 non-functional audit system** (`CurrentAuditor` returns `Optional.empty()`)
- **3 missing CRUD permission categories** (ACTIVITY_CREATE/UPDATE/DELETE, MENTION_UPDATE, CANDIDATE_ATTACHMENT_UPDATE)
- **Duplicate permission assignments** from V1 and V20260810 migrations creating redundant `role_permissions` rows
- **Legacy `ORGANIZATION_READ`/`ORGANIZATION_WRITE`** still in the database alongside new granular codes, creating confusion
- **No JWT permission storage** — every request hits the database
- **No Super Admin role** despite references in code
- **No role management API** — roles are static data fixtures
- **Flat role model** with no hierarchy

### Verdict: ❌ Requires Major Refactoring

**The system has a correct architectural foundation but contains critical bugs that will break functionality at runtime.** The missing permission codes (`TEAM_MEMBER_READ`, `TEAM_MEMBER_UPDATE`) mean that no user can read or update team members — the authorization check will always fail because these database rows don't exist. This is a production-blocking defect.

---

## 2. Authentication Review

### 2.1 Expected Flow vs Current Implementation

| Step | Expected | Current | Status |
|------|----------|---------|--------|
| Account creation | Admin only | Admin only (self-registration removed) | ✅ |
| No password on creation | Admin does not provide password | Admin provides no password (CreateUserRequest) | ✅ |
| Activation token | Secure token generated | SecureRandom + Base64, configurable TTL | ✅ |
| Activation email | Sent with one-time link | Sent via EmailService.sendAccountActivationEmail | ✅ |
| Token validation | Validates existence, expiry, usage | AccountActivationServiceImpl.validateActivationToken | ✅ |
| Password setup | User sets password during activation | AuthServiceImpl.completeActivation | ✅ |
| Account activation | enabled=true, status=ACTIVE, token=USED | Correctly implemented | ✅ |
| Login | Email + password, BCrypt verified | BCryptPasswordEncoder, AuthenticationManager | ✅ |
| Brute-force protection | Lock after N failed attempts, auto-unlock | LoginSecurityProperties, registerFailedLoginAttempt | ✅ |
| Refresh tokens | JWT refresh with rotation | RefreshTokenService with rotate+revoke | ✅ |
| Forgot password | Secure reset token, email with link | PasswordResetService with SecureRandom | ✅ |
| Reset password | Validate token, encode new password | PasswordResetServiceImpl.resetPassword | ✅ |

### 2.2 Issues Found

**Critical: `GET /api/auth/me` is publicly accessible**
- `SecurityConfig` line 65-66: `.requestMatchers("/api/auth/**").permitAll()` 
- The `/api/auth/me` endpoint has no `@PreAuthorize` annotation
- While `AuthServiceImpl.me()` returns an error for unauthenticated users, the endpoint is still publicly reachable
- **Fix**: Add `@PreAuthorize("isAuthenticated()")` to `AuthController.me()` or restrict `SecurityConfig`

**Medium: No CSRF protection on auth endpoints**
- CSRF is disabled globally (`csrf.disable()`)
- Auth endpoints (`/login`, `/refresh`, `/logout`, `/activate`, `/resend-activation`) have no anti-CSRF tokens
- Mitigated by stateless JWT architecture, but password reset and activation endpoints could be vulnerable to CSRF if the frontend doesn't use SameSite cookies

**Medium: No rate limiting on auth endpoints**
- `/login`, `/forgot-password`, `/resend-activation` have no rate limiting
- Brute-force protection only locks individual accounts, not IP-based throttling

---

## 3. User Management Review

### 3.1 Lifecycle Coverage

| Feature | Status | Details |
|---------|--------|---------|
| Account creation (admin) | ✅ | Via UserController.create() with CreateUserRequest |
| Activation flow | ✅ | PENDING_ACTIVATION → activation email → password setup → ACTIVE |
| Profile update | ✅ | UserController.PUT /me with UpdateProfileRequest |
| Status management | ✅ | Activate, Deactivate, Suspend, Reactivate, Archive, Restore |
| Soft delete | ✅ | SOFT_DELETED status with restrictions |
| Search with 15 filters | ✅ | UserSpecification with mandatory workspace join |
| Pagination | ✅ | Spring Data Pageable |
| Statistics (12 metrics) | ✅ | UserStatisticsResponse |
| History (audit trail) | ✅ | UserHistory entity (immutable, append-only) |
| Workspace isolation | ✅ | All queries filter by workspaceId |

### 3.2 Issues Found

**Medium: `UserController.PUT /me` uses broad `isAuthenticated()`**
- `@PreAuthorize("isAuthenticated()")` — any authenticated user can update their profile
- No additional verification for email changes (e.g., confirmation email)
- **Risk**: Account takeover via email change without verification

**Low: No manager assignment or employment info**
- The User entity has no `managerId`, `employmentDate`, `position`, `department` (only `primaryDepartment`)
- These are tracked in the HR module (Employee entity), not the User entity
- Architectural concern: User and Employee are separate — User is the identity, Employee is the HR record

---

## 4. Roles Review

### 4.1 Role Architecture

| Aspect | Status | Details |
|--------|--------|---------|
| Role entity | ✅ | JPA entity with RoleName enum + description |
| RoleName enum | ✅ | ADMIN, MANAGER, MEMBER (3 values) |
| Multi-role support | ✅ | UserRole join table with composite key |
| Role assignment | ✅ | Via UserRoleRepository |
| Role hierarchy | ❌ | Flat model, no inheritance |
| Role management API | ❌ | RoleController is read-only (no CRUD) |
| Super Admin role | ❌ | Referenced in code but doesn't exist in DB |
| Department-specific roles | ❌ | No HR_MANAGER, DEV_LEAD, etc. |

### 4.2 Issues Found

**Critical: `SUPER_ADMIN` referenced but non-existent**
- `WorkspaceAuthorization.java:29`: `private static final String SUPER_ADMIN_AUTHORITY = "ROLE_SUPER_ADMIN";`
- `DepartmentAuthorization.java:36`: Same constant
- `RoleName.java` does NOT include `SUPER_ADMIN`
- No Super Admin role exists in the database
- No Super Admin permission codes exist
- **Impact**: The super admin bypass in workspace/department authorization methods will NEVER activate. This code path is dead.

**High: No role hierarchy**
- Roles are flat: ADMIN, MANAGER, MEMBER
- No inheritance model (e.g., MANAGER inherits all MEMBER permissions + extra)
- Cannot model real-world organizational structures
- **Impact**: Forces over-privileged assignments

**High: No role management API**
- `RoleController` only has `GET /` and `GET /{id}` — both read-only
- No `POST /roles`, `PUT /roles/{id}`, `DELETE /roles/{id}`
- No API to assign permissions to roles or remove permissions from roles
- **Impact**: Roles are static data fixtures seeded once by Flyway

**Medium: Multiple roles never tested**
- While the `UserRole` join table supports multiple roles per user, there is no code path that assigns more than one role
- The `CreateUserRequest.role` field is a single `RoleName`, not a `Set<RoleName>`
- No API exists to add/remove roles from an existing user
- **Risk**: Multi-role support is untested and may have edge cases

---

## 5. Permissions Review

### 5.1 Permission Catalog Coverage

The Flyway migration V20260810 creates 146 permission codes organized by module. The following modules have complete granular permission sets:

| Module | Has CRUD | Special Operations | Status |
|--------|---------|-------------------|--------|
| User | ✅ Complete | ACTIVATE, DEACTIVATE, SUSPEND, REACTIVATE, ARCHIVE, RESTORE | ✅ |
| Role | ✅ Basic | READ, UPDATE (V1) + CREATE, DELETE (V20260810) | ✅ |
| Permission | ✅ Basic | READ (V1) + CREATE, UPDATE, DELETE (V20260810) | ✅ |
| Workspace | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Department | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Team | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Team Member | ⚠️ Partial | ADD, REMOVE only — **MISSING: READ, UPDATE** | ❌ |
| Project | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Task | ✅ Complete | CREATE, READ, UPDATE, DELETE + ASSIGN | ✅ |
| Comment | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Document | ✅ Complete | UPLOAD, READ, UPDATE, DELETE | ✅ |
| Knowledge Base | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Attachment | ✅ Complete | UPLOAD, READ, UPDATE, DELETE | ✅ |
| Activity | ⚠️ Partial | **READ only** — **MISSING: CREATE, UPDATE, DELETE** | ❌ |
| Notification | ✅ Complete | READ, UPDATE, DELETE | ✅ |
| Mention | ⚠️ Partial | CREATE, READ, DELETE — **MISSING: UPDATE** | ❌ |
| Handover | ✅ Complete | CREATE, READ, UPDATE, DELETE, APPROVE + Entry CRUD | ✅ |
| Handover Entry | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Dashboard | ✅ Basic | VIEW | ✅ |
| Employee | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Candidate | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Interview | ✅ Complete | CREATE, READ, UPDATE, DELETE + CANCEL | ✅ |
| Interview Calendar | ✅ Basic | VIEW | ✅ |
| Onboarding | ✅ Complete | CREATE, READ, UPDATE, DELETE + TASK_MANAGE | ✅ |
| Performance Review | ✅ Complete | CREATE, READ, UPDATE, DELETE + SUBMIT, APPROVE | ✅ |
| Attendance | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Employee Document | ✅ Complete | UPLOAD, READ, UPDATE, DELETE + VERIFY | ✅ |
| Recruiter Note | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| Employee Skill | ✅ Complete | CREATE, READ, UPDATE, DELETE | ✅ |
| HR Notification | ✅ Basic | READ, DISMISS | ✅ |
| Candidate Attachment | ⚠️ Partial | UPLOAD, READ, DELETE — **MISSING: UPDATE** | ❌ |
| Campaign | ✅ Complete | CREATE, READ, UPDATE, ACTIVATE, COMPLETE, ARCHIVE | ✅ |
| Sprint | ✅ Complete | CREATE, READ, UPDATE, DELETE + ACTIVATE, COMPLETE, ARCHIVE | ✅ |
| Security Audit | ✅ Complete | CREATE, READ, UPDATE + START, COMPLETE, ARCHIVE | ✅ |
| AI Model | ✅ Complete | CREATE, READ, UPDATE, ARCHIVE | ✅ |
| Report | ✅ Basic | VIEW, EXPORT, SCHEDULE, HISTORY_VIEW | ✅ |
| Analytics | ✅ Basic | VIEW, EXPORT | ✅ |
| Admin | ✅ Basic | USER_UNLOCK | ✅ |

### 5.2 Missing Permission Codes (Will Cause Runtime Failures)

The following permission codes are referenced in `@PreAuthorize` annotations but do **NOT** exist in any Flyway migration. Since `PermissionEvaluator.hasPermission()` checks `authentication.getAuthorities()` which is populated from the database, these checks will **always return false** — the operation can never succeed.

| Missing Permission | Used By | Operation | Impact |
|-------------------|---------|-----------|--------|
| `TEAM_MEMBER_READ` | TeamMemberController | GET /members, GET /members/{userId} | Cannot list or view team members |
| `TEAM_MEMBER_UPDATE` | TeamMemberController | PUT /members/{userId} | Cannot update team member role |
| `MENTION_UPDATE` | MentionController PUT | (currently uses MENTION_CREATE — bug) | No impact yet, but missing code |
| `ACTIVITY_CREATE` | ActivityController POST | (currently uses ACTIVITY_READ — bug) | No impact yet, but missing codes |
| `ACTIVITY_UPDATE` | ActivityController PUT | (currently uses ACTIVITY_READ — bug) | No impact yet, but missing codes |
| `ACTIVITY_DELETE` | ActivityController DELETE | (currently uses ACTIVITY_READ — bug) | No impact yet, but missing codes |
| `CANDIDATE_ATTACHMENT_UPDATE` | CandidateAttachmentController PUT | (currently uses UPLOAD — bug) | No impact yet, but missing code |

### 5.3 Controller Annotation Bugs

| Controller | Endpoint | Current Permission | Should Be |
|-----------|----------|------------------|-----------|
| ActivityController | POST / | ACTIVITY_READ | ACTIVITY_CREATE |
| ActivityController | PUT /{id} | ACTIVITY_READ | ACTIVITY_UPDATE |
| ActivityController | DELETE /{id} | ACTIVITY_READ | ACTIVITY_DELETE |
| MentionController | PUT /{mentionId} | MENTION_CREATE | MENTION_UPDATE |
| CandidateAttachmentController | PUT /candidates/{id}/attachments/{id} | CANDIDATE_ATTACHMENT_UPLOAD | CANDIDATE_ATTACHMENT_UPDATE |

### 5.4 Workspace Authorization Bugs

| Controller | Endpoint | Current Check | Should Be |
|-----------|----------|--------------|-----------|
| HrNotificationController | PUT /{notificationId}/read | canViewWorkspace | canUpdateWorkspace |
| HrNotificationController | PUT /read-all | canViewWorkspace | canUpdateWorkspace |
| HrNotificationController | PUT /{notificationId}/dismiss | canViewWorkspace | canUpdateWorkspace |
| ScheduledReportController | POST / | canViewWorkspace | canUpdateWorkspace (creating a schedule is a write) |

### 5.5 Legacy Permissions Not Removed

The V1 migration created `ORGANIZATION_READ` and `ORGANIZATION_WRITE` which were used to gate all department/team/project operations. The V20260810 migration introduced granular replacements (`DEPARTMENT_*`, `TEAM_*`, `PROJECT_*`, etc.) but did NOT:
- Remove `ORGANIZATION_READ` and `ORGANIZATION_WRITE` from the database
- Remove their assignments from `role_permissions`
- Update any controller to use the new codes

**Impact**: Both legacy and new permission sets exist simultaneously. ADMIN gets duplicate permissions. MANAGER still has the broad `ORGANIZATION_READ` which grants access to everything.

### 5.6 Duplicate Permission Assignments

The V1 migration assigns ADMIN ALL permissions via:
```sql
-- Line 260-267: CROSS JOIN on all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON TRUE WHERE r.name = 'ADMIN';
```

Then lines 283-295 assign ORGANIZATION_READ and ORGANIZATION_WRITE to ADMIN again (duplicate).

The V20260810 migration then assigns ADMIN all 146 new permissions via another CROSS JOIN. This creates duplicate `role_permissions` rows for the original 6 permissions.

**Impact**: `role_permissions` contains duplicate rows. While this doesn't break functionality (duplicate authorities are deduplicated by `LinkedHashSet` in `CustomUserDetails.buildAuthorities()`), it adds unnecessary database rows.

---

## 6. Authorization Review

### 6.1 Controller Authorization Summary

**Total controllers reviewed**: 39 (all controllers with `@PreAuthorize`)

**Authorization patterns used**:
- `@permissionEvaluator.hasPermission(authentication, 'CODE')` — **Primary pattern** (36 controllers)
- `@workspaceAuth.canViewWorkspace()` — 30+ controllers
- `@workspaceAuth.canUpdateWorkspace()` — 25+ controllers
- `@workspaceAuth.canDeleteWorkspace()` — 10+ controllers
- `@departmentAuth.canViewDepartment()` — 3 controllers (ReportController)
- `@workspaceAuth.canAccessTeam()` — 2 controllers (ReportController)
- `@workspaceAuth.canCreateArtifact()` — 1 controller (HandoverJournalController)
- `isAuthenticated()` — 1 endpoint (UserController.PUT /me)
- No annotation — AuthController, ActivationController (7 endpoints)

### 6.2 Cross-Workspace Data Access Vulnerability

**Critical**: `WorkspaceAnalyticsController.POST /analytics`
- File: `reporting/analytics/controller/WorkspaceAnalyticsController.java:50-66`
- `@PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'ANALYTICS_VIEW')")` — **NO workspace check**
- Takes `workspaceId` from the request body, not the URL path
- Any user with `ANALYTICS_VIEW` can query analytics for ANY workspace
- **Impact**: Data leak across tenant boundaries

**High**: All 4 analytics controllers use `/api/v1/analytics/...` base path instead of the standard `/api/workspaces/{workspaceId}/...`
- WorkspaceAnalyticsController: `/api/v1/analytics/workspaces`
- DepartmentAnalyticsController: `/api/v1/analytics/departments`
- TeamAnalyticsController: `/api/v1/analytics/teams`
- ProjectAnalyticsController: `/api/v1/analytics/projects`
- This is an API design inconsistency and the workspaceId is in the path (correct for 3 of 4), but the POST endpoint on WorkspaceAnalyticsController takes workspaceId from the body

### 6.3 AuthController Missing Annotations

All `AuthController` and `ActivationController` endpoints have NO `@PreAuthorize` annotations:
- `POST /login` — Public (correct)
- `POST /register` — Removed (correct)
- `POST /refresh` — Public by design (uses refresh token)
- `POST /logout` — Public by design (service resolves user from token)
- `GET /me` — **Should require authentication** (currently public)
- `POST /forgot-password` — Public (correct)
- `POST /reset-password` — Public (correct)
- `GET /activate` — Public (correct)
- `POST /activate` — Public (correct)
- `POST /resend-activation` — Public (correct)

---

## 7. Workspace Isolation Review

### 7.1 Isolation Model

| Layer | Mechanism | Status |
|-------|-----------|--------|
| Workspace | `WorkspaceMember` join table with ACTIVE status | ✅ |
| Department | `WorkspaceStatus.ACTIVE` filter (no user-department check) | ⚠️ |
| Team | Delegates to workspace check | ⚠️ |

### 7.2 Issues

**Medium: No user-to-department authorization**
- `DepartmentAuthorization.canViewDepartment()` only checks:
  1. Is the user an active workspace member?
  2. Is the department ACTIVE?
- It does NOT check whether the user belongs to that department
- **Impact**: Any active workspace member can view any department's data

**Medium: No user-to-team authorization**
- `WorkspaceAuthorization.canAccessTeam()` delegates entirely to `canViewWorkspace()`
- No check that the user is a member of the team
- **Impact**: Any active workspace member can view any team's data

**Low: Department `canAccessDepartment` and `canAccessTeam` comments acknowledge this is for MVP**
- The Javadoc explicitly states "Department/Team are context only for MVP"
- Fine-grained department/team isolation is deferred

---

## 8. JWT Review

### 8.1 JWT Configuration

| Aspect | Status | Details |
|--------|--------|---------|
| Algorithm | ✅ | HS256 (symmetric) |
| Secret enforcement | ✅ | Minimum 32 bytes checked at startup |
| Access token expiration | ✅ | Configurable via `app.jwt.access-token-expiration` |
| Refresh token expiration | ✅ | Configurable via `app.jwt.refresh-token-expiration` |
| Token type distinction | ✅ | ACCESS vs REFRESH enforced |
| jti (unique ID) | ✅ | Generated per token |
| Issuer validation | ✅ | Configurable via `app.jwt.issuer` |
| Refresh token rotation | ✅ | Old token revoked, new token issued |
| Permission storage | ❌ | Not stored in JWT |

### 8.2 Issues

**High: Permissions not stored in JWT**
- JWT stores: `uid`, `memberType`, `role` (CSV of role names), `type`
- Every authenticated request triggers `CustomUserDetailsService.loadUserByUsername()` → database query with 4 JOINs
- **Impact**: No stateless authentication possible. Every request hits the database for authorization.
- **Fix**: Store permission codes in JWT claims. Estimated overhead: ~200 bytes for 50 permissions.

**Medium: JWT claims use CSV role string**
- `CLAIM_ROLE` stores roles as CSV: `"ADMIN,MANAGER"`
- Parsed back via `split(",")` — fragile if role names ever contain commas
- Consider JSON array instead

**Low: Access tokens cannot be individually revoked**
- No token blacklist
- Refresh token revocation exists, but access tokens remain valid until expiration
- Mitigated by short access token TTL (default: 15 minutes)

---

## 9. Database Review

### 9.1 Entity Relationships

| Relationship | Type | Cascade | Fetch | Indexed |
|-------------|------|---------|-------|---------|
| User → UserRole | OneToMany | ALL | LAZY | ✅ (user_id, role_id) |
| Role → RolePermission | OneToMany | ALL | LAZY | ✅ (role_id, permission_id) |
| UserRole → Role | ManyToOne | - | LAZY | ✅ |
| RolePermission → Permission | ManyToOne | - | LAZY | ✅ |
| User → RefreshToken | OneToMany | ALL | LAZY | ✅ (user_id) |
| User → WorkspaceMember | OneToMany | - | LAZY | ✅ |
| User → TeamMember | OneToMany | - | LAZY | ✅ |
| User → ActivationToken | OneToMany | - | LAZY | ✅ (user_id, token, status) |
| User → PasswordResetToken | OneToMany | - | LAZY | ✅ |

### 9.2 Issues

**High: `CascadeType.ALL` on `User.userRoles`**
- `@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)`
- Saving a User cascades to ALL UserRoles — may trigger unexpected writes
- `orphanRemoval = true` means removing a role from the collection deletes it from DB
- **Risk**: Accidental data loss if the `userRoles` set is not loaded correctly

**High: `CascadeType.ALL` on `Role.rolePermissions`**
- Same pattern as above
- **Risk**: Modifying a Role's `rolePermissions` collection could cascade unexpectedly

**High: `CurrentAuditor` returns `Optional.empty()`**
- `createdBy` and `updatedBy` columns on every entity are NEVER populated
- Over 90% of entities extend `AuditableEntity`
- **Impact**: No audit trail for who created or modified any record
- The `UserHistory` system works around this for User entities, but all other entities have no creator/modifier tracking

**Medium: `UserHistory` tracks user operations but lacks entity-wide audit**
- `UserHistoryService` records user lifecycle events
- But no equivalent exists for Department, Team, Project, Task, etc.
- No general-purpose audit log

---

## 10. Security Review

### 10.1 Vulnerability Assessment

| Vulnerability | Severity | Vector | Impact |
|--------------|----------|--------|--------|
| Analytics cross-workspace data access | Critical | POST /analytics without workspace check | Read any workspace's analytics data |
| Missing TEAM_MEMBER_READ permission | Critical | Any team member listing operation | Feature broken — no user can list team members |
| Missing TEAM_MEMBER_UPDATE permission | Critical | Any team member update operation | Feature broken — no user can update team members |
| `/api/auth/me` publicly accessible | High | Unauthenticated GET request | Information disclosure (error message reveals authenticated user pattern) |
| ActivityController wrong permissions | High | All activity CRUD uses ACTIVITY_READ | No granular control — any user with ACTIVITY_READ can create, update, delete |
| CandidateAttachment wrong permission | Medium | PUT update uses UPLOAD code | Cannot distinguish upload from update |
| Mention wrong permission | Medium | PUT update uses MENTION_CREATE | Cannot distinguish create from update |
| HrNotification write uses canView | Medium | PUT operations use read-level workspace check | Context members can modify notifications |
| ScheduledReport write uses canView | Medium | POST schedule uses read-level workspace check | Context members can schedule reports |
| No Super Admin role | Medium | Referenced in code but non-existent | Dead code, no platform administration |
| No JWT permission storage | Medium | Every request queries database | Performance bottleneck |
| CSRF disabled globally | Low | No anti-CSRF tokens | Mitigated by stateless JWT |
| No rate limiting | Low | Brute-force on auth endpoints | Mitigated by account locking |
| Duplicate role_permissions | Low | Migration overlap | Wasteful but not harmful |

### 10.2 OWASP Top 10 Mapping

| OWASP Category | Status | Notes |
|----------------|--------|-------|
| A01: Broken Access Control | ❌ Critical Issues | Analytics cross-workspace access, missing permission codes |
| A02: Cryptographic Failures | ✅ | BCrypt for passwords, HS256 for JWT |
| A03: Injection | ✅ | Parameterized queries via Spring Data JPA |
| A04: Insecure Design | ⚠️ | Flat role model, no permission caching |
| A05: Security Misconfiguration | ⚠️ | CSRF disabled, `/api/auth/**` blanket permit |
| A06: Vulnerable Components | ✅ | Managed via Maven |
| A07: Identification Failures | ⚠️ | No MFA, no email verification for changes |
| A08: Data Integrity Failures | ⚠️ | No token blacklist for access tokens |
| A09: Logging Failures | ⚠️ | CurrentAuditor non-functional |
| A10: SSRF | ✅ | No external URL fetching from user input |

---

## 11. Performance Review

### 11.1 Permission Loading

```
Every authenticated request:
  JwtAuthenticationFilter.doFilterInternal()
  → JwtService.isTokenValid(token, ACCESS)
  → CustomUserDetailsService.loadUserByUsername(email)
    → UserRepository.findByEmailWithRolesAndPermissions(email)
      → LEFT JOIN FETCH userRoles
        → LEFT JOIN FETCH role
          → LEFT JOIN FETCH rolePermissions
            → LEFT JOIN FETCH permission
```

**Impact**: 4 JOINs on every request. For a user with 3 roles and 50 permissions, this produces up to 150 rows (deduplicated by Hibernate). Without caching, this is ~5-15ms per request.

### 11.2 N+1 Query Risks

- `Role.rolePermissions` uses `FetchType.LAZY` — if accessed outside the JOIN FETCH context, triggers N+1
- `User.userRoles` uses `CascadeType.ALL` — saving a User cascades to all UserRoles
- No 2nd-level Hibernate cache configured

### 11.3 Caching

**No caching at any level:**
- No 2nd-level Hibernate cache
- No Redis/Caffeine cache for permissions
- No JWT claim cache
- Every request queries the database for the full user-permission graph

### 11.4 JWT Size

Current token contains: `uid` (36 chars), `memberType` (~10 chars), `role` (~20 chars), `type` (~6 chars), standard claims (iss, sub, iat, exp, jti)

If permissions were stored in the JWT, estimated size increase: ~200-400 bytes for 50 permissions. This is acceptable.

---

## 12. Scalability Review

### 12.1 Permission Model

The entity-based permission model scales well:
- New permissions can be added as database rows
- Assignments happen via `role_permissions` rows
- No code changes needed for new permission codes (except for `@PreAuthorize` annotations which require deployment)

### 12.2 Role Model

The flat role model does NOT scale:
- 3 roles with no hierarchy
- Cannot model HR_MANAGER, DEV_LEAD, MARKETING_SPECIALIST
- No custom roles per workspace
- WorkspaceRole (OWNER, ADMIN) is separate from RoleName (ADMIN, MANAGER, MEMBER) — this dual system adds complexity

### 12.3 Authorization Throughput

- Current throughput: ~5-15ms per request for permission loading
- Without caching: ~66-200 requests/second per database connection
- With caching: ~1000+ requests/second
- For 10,000+ requests/second, caching is mandatory

---

## 13. Future Compatibility Review

### 13.1 Super Admin: ❌ Not Compatible

- `ROLE_SUPER_ADMIN` referenced in `WorkspaceAuthorization` and `DepartmentAuthorization`
- No `SUPER_ADMIN` in `RoleName` enum
- No Super Admin role in database
- No Super Admin permission codes
- No cross-workspace query capability
- **Required**: Add SUPER_ADMIN to enum, create role + permissions, implement bypass logic

### 13.2 Platform Administration: ❌ Not Compatible

- `AdminUserController` has only one operation (unlock)
- No admin-only permission codes beyond `ADMIN_USER_UNLOCK`
- No global audit log endpoint
- No system configuration endpoints

### 13.3 Collabix AI: ⚠️ Partially Compatible

- AI model permissions exist (`AI_MODEL_*`)
- No distinction between AI administrator and AI user
- No cross-departmental data access for model training

### 13.4 Multi-Workspace Administration: ❌ Not Compatible

- `WorkspaceAuthorization` is inherently single-workspace
- No "bypass workspace isolation" mechanism exists at runtime (Super Admin bypass is dead code)
- No permission codes that span workspaces

### 13.5 Future SaaS Deployment: ❌ Not Compatible

- No plan-based permission tiers
- No self-service workspace admin role management
- No permission limit enforcement
- No tenant-level feature flags

### 13.6 External Identity Providers: ❌ Not Compatible

- No OAuth2/OIDC integration
- No SAML support
- No LDAP/AD integration
- No social login (Google, Microsoft, etc.)

---

## 14. RBAC Matrix

### 14.1 Current State (with V20260810 permissions)

| Operation | ADMIN | MANAGER | MEMBER |
|-----------|-------|---------|--------|
| USER_CREATE | ✅ | ❌ | ❌ |
| USER_READ | ✅ | ✅ | ❌ |
| USER_UPDATE | ✅ | ✅ | ❌ |
| USER_DELETE | ✅ | ❌ | ❌ |
| USER_ACTIVATE | ✅ | ✅ | ❌ |
| USER_DEACTIVATE | ✅ | ✅ | ❌ |
| USER_SUSPEND | ✅ | ❌ | ❌ |
| USER_REACTIVATE | ✅ | ✅ | ❌ |
| USER_ARCHIVE | ✅ | ❌ | ❌ |
| USER_RESTORE | ✅ | ❌ | ❌ |
| WORKSPACE_CREATE | ✅ | ❌ | ❌ |
| WORKSPACE_READ | ✅ | ✅ | ❌ |
| WORKSPACE_UPDATE | ✅ | ✅ | ❌ |
| WORKSPACE_DELETE | ✅ | ❌ | ❌ |
| DEPARTMENT_* | ✅ Full | ✅ READ + UPDATE | ❌ |
| TEAM_* | ✅ Full | ✅ READ + UPDATE + MEMBER_ADD/REMOVE | ❌ |
| TEAM_MEMBER_ADD/REMOVE | ✅ | ✅ | ❌ |
| TEAM_MEMBER_READ | ❌ | ❌ | ❌ |
| TEAM_MEMBER_UPDATE | ❌ | ❌ | ❌ |
| PROJECT_* | ✅ Full | ✅ READ + CREATE + UPDATE | ❌ |
| TASK_* | ✅ Full | ✅ READ + CREATE + UPDATE + ASSIGN | ❌ |
| COMMENT_* | ✅ Full | ✅ READ + CREATE | ❌ |
| DOCUMENT_* | ✅ Full | ✅ READ + UPLOAD | ❌ |
| KNOWLEDGE_BASE_* | ✅ Full | ✅ READ + CREATE | ❌ |
| ATTACHMENT_* | ✅ Full | ✅ READ + UPLOAD | ❌ |
| ACTIVITY_READ | ✅ | ✅ | ❌ |
| NOTIFICATION_* | ✅ Full | ✅ READ + UPDATE | ❌ |
| MENTION_* | ✅ Full | ✅ READ + CREATE | ❌ |
| HANDOVER_* | ✅ Full | ✅ READ + CREATE | ❌ |
| DASHBOARD_VIEW | ✅ | ✅ | ❌ |
| All HR Permissions | ✅ Full | ✅ Moderate | ❌ |
| CAMPAIGN_* | ✅ Full | ✅ Moderate (no archive) | ❌ |
| SPRINT_* | ✅ Full | ✅ Moderate (no archive/delete) | ❌ |
| SECURITY_AUDIT_* | ✅ Full | ✅ Moderate | ❌ |
| AI_MODEL_* | ✅ Full | ✅ Moderate | ❌ |
| REPORT_* | ✅ Full | ✅ Full | ❌ |
| ANALYTICS_* | ✅ Full | ✅ VIEW | ❌ |
| ADMIN_USER_UNLOCK | ✅ | ❌ | ❌ |
| Legacy ORGANIZATION_* | ✅ (duplicate) | ✅ READ | ❌ |

### 14.2 Permission Gaps (Runtime Failures)

| Operation | Required Permission | Exists in DB? | Controller Uses? |
|-----------|-------------------|---------------|------------------|
| List team members | TEAM_MEMBER_READ | ❌ | ✅ |
| Update team member | TEAM_MEMBER_UPDATE | ❌ | ✅ |
| Update mention | MENTION_UPDATE | ❌ | ❌ (uses MENTION_CREATE) |
| Create activity | ACTIVITY_CREATE | ❌ | ❌ (uses ACTIVITY_READ) |
| Update activity | ACTIVITY_UPDATE | ❌ | ❌ (uses ACTIVITY_READ) |
| Delete activity | ACTIVITY_DELETE | ❌ | ❌ (uses ACTIVITY_READ) |
| Update candidate attachment | CANDIDATE_ATTACHMENT_UPDATE | ❌ | ❌ (uses UPLOAD) |

### 14.3 Overly Broad Permissions

- MANAGER has `USER_UPDATE` — allows status changes to any user, no distinction between "edit profile" and "suspend/archive"
- MANAGER has `WORKSPACE_UPDATE` — too powerful for a manager role
- MANAGER has full `ANALYTICS_VIEW` and `REPORT_*` — no read-only variant

---

## 15. Critical Issues

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| C1 | `TEAM_MEMBER_READ` missing from DB | TeamMemberController GET endpoints | Team member listing BROKEN at runtime | Add to V20260810 migration |
| C2 | `TEAM_MEMBER_UPDATE` missing from DB | TeamMemberController PUT endpoint | Team member update BROKEN at runtime | Add to V20260810 migration |
| C3 | Analytics cross-workspace data leak | WorkspaceAnalyticsController POST /analytics | Any ANALYTICS_VIEW user can query any workspace | Add workspace check |
| C4 | No Super Admin role | WorkspaceAuthorization.java:29 | Dead code, no platform administration | Add SUPER_ADMIN to RoleName + DB |

## 16. High Priority Issues

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| H1 | ActivityController uses ACTIVITY_READ for CRUD | ActivityController POST/PUT/DELETE | No granular activity permissions | Fix annotations + add ACTIVITY_CREATE/UPDATE/DELETE |
| H2 | MentionController PUT uses MENTION_CREATE | MentionController PUT | Cannot distinguish create from update | Fix annotation + add MENTION_UPDATE |
| H3 | CandidateAttachment PUT uses UPLOAD | CandidateAttachmentController PUT | Cannot distinguish upload from update | Fix annotation + add CANDIDATE_ATTACHMENT_UPDATE |
| H4 | HrNotification PUT uses canViewWorkspace | HrNotificationController 3 PUT endpoints | Write operations use read-level check | Fix to canUpdateWorkspace |
| H5 | ScheduledReport POST uses canViewWorkspace | ScheduledReportController POST | Write operation uses read-level check | Fix to canUpdateWorkspace |
| H6 | `/api/auth/me` publicly accessible | SecurityConfig + AuthController | Unauthenticated endpoint | Add @PreAuthorize("isAuthenticated()") |
| H7 | CurrentAuditor returns Optional.empty() | CurrentAuditor.java | No createdBy/updatedBy auditing | Implement auditor from SecurityContext |
| H8 | Permissions not stored in JWT | JwtService | Every request queries DB | Add permission codes to JWT claims |
| H9 | No role management API | RoleController (read-only) | Cannot manage roles at runtime | Add CRUD endpoints |
| H10 | Legacy ORGANIZATION_READ/WRITE not removed | V1 + V20260810 overlap | Confusion, duplicate assignments | Deprecate or remove legacy codes |

## 17. Medium Priority Issues

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| M1 | No role hierarchy | Role model | Over-privileged assignments | Implement role inheritance |
| M2 | No department-specific roles | RoleName enum | Cannot model org structure | Add HR_MANAGER, DEV_LEAD, etc. |
| M3 | Multi-role untested | No assignment API | Edge case bugs | Add multi-role assignment + tests |
| M4 | `UserController.PUT /me` uses `isAuthenticated()` | UserController | No email change verification | Add email change confirmation |
| M5 | `CascadeType.ALL` on User.userRoles | User entity | Risk of cascading writes | Review cascade types |
| M6 | No rate limiting on auth endpoints | AuthController | Brute-force potential | Add RateLimiter |
| M7 | WorkspaceRole vs RoleName duality | Two role systems | Complexity | Clarify separation |
| M8 | No user-to-department isolation | DepartmentAuthorization | Any member views any department | Add membership check |
| M9 | No user-to-team isolation | WorkspaceAuthorization | Any member views any team | Add membership check |
| M10 | Analytics controllers use `/api/v1/` path | 4 analytics controllers | API inconsistency | Align with `/api/workspaces/{id}/...` |

## 18. Low Priority Issues

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| L1 | Duplicate role_permissions rows | V1 + V20260810 | Wasteful DB rows | Clean up migration |
| L2 | isActiveMember() and isMember() dead code | WorkspaceAuthorization | Cognitive load | Remove unused methods |
| L3 | Unused workspaceMemberRepository in DeptAuth | DepartmentAuthorization | Dead field | Remove unused field |
| L4 | JWT role CSV parsing fragile | JwtService | Comma-in-role vulnerability | Use JSON array |
| L5 | No permission documentation endpoint | No API | Cannot display permissions in UI | Create grouped endpoint |
| L6 | Permission code naming convention undocumented | All permissions | Inconsistency risk | Document convention |

---

## 19. Recommendations

### Critical (Fix Before Any Deployment)

| # | Recommendation | Effort | Files |
|---|---------------|--------|-------|
| R1 | Add TEAM_MEMBER_READ and TEAM_MEMBER_UPDATE to Flyway migration | 30 min | 1 SQL file |
| R2 | Fix WorkspaceAnalyticsController POST /analytics to check workspace membership | 1 hour | 1 controller |
| R3 | Add SUPER_ADMIN to RoleName enum, create role in DB, add permission codes | 4 hours | 1 enum, 1 migration, 1 data |

### High (Fix Before Production)

| # | Recommendation | Effort | Files |
|---|---------------|--------|-------|
| R4 | Fix ActivityController annotations (CREATE/UPDATE/DELETE) + add missing permissions | 2 hours | 1 controller, 1 migration |
| R5 | Fix MentionController PUT to use MENTION_UPDATE + add missing permission | 30 min | 1 controller, 1 migration |
| R6 | Fix CandidateAttachmentController PUT to use CANDIDATE_ATTACHMENT_UPDATE + add permission | 30 min | 1 controller, 1 migration |
| R7 | Fix HrNotificationController PUT endpoints to use canUpdateWorkspace | 30 min | 1 controller |
| R8 | Fix ScheduledReportController POST to use canUpdateWorkspace | 15 min | 1 controller |
| R9 | Add @PreAuthorize("isAuthenticated()") to AuthController.me() | 15 min | 1 controller |
| R10 | Implement CurrentAuditor from SecurityContext | 2 hours | 1 file |
| R11 | Add permission caching (Caffeine or Redis) | 2-3 days | Config + UserDetailsService |
| R12 | Create role management API (CRUD) | 3-5 days | Controller, Service, DTOs |
| R13 | Remove or deprecate legacy ORGANIZATION_READ/WRITE | 1 day | Migration, all controllers |

### Medium (Next Sprint)

| # | Recommendation | Effort | Files |
|---|---------------|--------|-------|
| R14 | Store permissions in JWT claims | 2-3 days | JwtService, filter |
| R15 | Implement role hierarchy | 3-5 days | New model, CustomUserDetails |
| R16 | Add department-specific roles | 5-7 days | Enum, migration, assignment API |
| R17 | Add rate limiting on auth endpoints | 1-2 days | Filter + config |
| R18 | Review CascadeType.ALL on collections | 1 day | Entity files |
| R19 | Add email change confirmation flow | 2-3 days | Service + email |
| R20 | Add multi-role assignment API | 1-2 days | UserService expansion |

### Low (Future)

| # | Recommendation | Effort | Files |
|---|---------------|--------|-------|
| R21 | Remove dead code from WorkspaceAuthorization | 30 min | 1 file |
| R22 | Remove unused field from DepartmentAuthorization | 15 min | 1 file |
| R23 | Create permission documentation endpoint | 1-2 days | Controller + Service |
| R24 | Align analytics controllers to standard API path | 1 day | 4 controllers |
| R25 | Clean up duplicate role_permissions | 30 min | 1 migration |

---

## 20. Effort Summary

| Priority | Count | Estimated Effort |
|----------|-------|-----------------|
| Critical | 3 | 5.5 hours |
| High | 10 | 9-16 days |
| Medium | 10 | 19-28 days |
| Low | 6 | 2-3 days |
| **Total** | **29** | **29-48 days** |

---

## 21. Final Verdict

### ❌ Requires Major Refactoring

**The system has a correct architectural foundation.** The PermissionEvaluator pattern, workspace isolation, multi-role support, BCrypt password hashing, JWT with refresh token rotation, activation flow, and granular permission codes are all well-implemented. The authorization sprint that added 146 permission codes and the PermissionEvaluator bean was largely successful.

**However, the system has critical runtime defects that make it not production-ready:**

1. **Two missing permission codes (`TEAM_MEMBER_READ`, `TEAM_MEMBER_UPDATE`) will cause authorization failures at runtime** — no user can list or update team members because the database rows don't exist.

2. **A cross-workspace data access vulnerability exists** in the analytics API — any user with `ANALYTICS_VIEW` can query any workspace's analytics.

3. **Five controller annotation bugs** mean the wrong permissions are checked for create/update/delete operations on activities, mentions, and candidate attachments.

4. **Four workspace authorization bugs** allow write operations with read-level workspace checks.

5. **The `CurrentAuditor` is non-functional** — no entity audit trail exists despite every entity extending `AuditableEntity`.

6. **The `SUPER_ADMIN` role is dead code** — referenced in authorization beans but non-existent in enum and database.

**Until these defects are fixed, the platform should not go to production.** The fixes for the critical issues (R1-R3) are estimated at 5.5 hours. With those plus the high-priority fixes (R4-R13), estimated at 9-16 days total, the system would be production-ready.

The good news: no architectural redesign is needed. The existing patterns are correct and only need to be consistently applied. The permission model is database-driven and scalable. The workspace isolation foundation is sound.
