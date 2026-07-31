# COLLABIX BACKEND — COMPLETE ARCHITECTURAL, SECURITY & TECHNICAL AUDIT

**Date:** July 23, 2026  
**Auditor:** Buffy (AI Agent)  
**Scope:** Entire Java/Spring Boot backend  
**Methodology:** Exhaustive reading of every package, entity, repository, service, controller, DTO, mapper, configuration, and reporting class.

---

## 1. OVERALL ARCHITECTURE

### Score: 8.2/10

**Strengths:**
✅ Clean layered architecture (Controller → Service → Repository → DB) is strictly followed.
✅ DTO/Entity separation is clean with MapStruct mappers.
✅ Package organization is logical: `entity`, `repository`, `service`, `controller`, `mapper`, `dto`, `config`, `security`.
✅ Service interfaces are separated from implementations — good for testability.
✅ Exception handling is centralized in `GlobalExceptionHandler`.
✅ `@Transactional` is consistently applied at the service layer.

**Weaknesses:**
⚠️ **Massive code duplication in authorization helpers.** Every `*ServiceImpl` duplicates the same `getAuthenticatedUserId()`, `assertActiveWorkspaceMember()`, and `assertWorkspaceAdminOrOwner()` private methods. There are at least **14 copies** of identical helper code across services (WorkspaceServiceImpl, DepartmentServiceImpl, TeamServiceImpl, TeamMemberServiceImpl, ProjectServiceImpl, TaskServiceImpl, DocumentServiceImpl, KnowledgeBaseServiceImpl, CommentServiceImpl, ActivityServiceImpl, AttachmentServiceImpl, MentionServiceImpl, NotificationServiceImpl, HandoverEntryServiceImpl, HandoverJournalServiceImpl). This is a serious SRP and DRY violation.
⚠️ **CommentServiceImpl does NOT implement CommentService interface.** It's a standalone class with the same methods but no `implements CommentService`. This breaks the dependency inversion principle for the comment module.
⚠️ No caching layer (Redis/CDN). All requests hit the database.
⚠️ No API versioning strategy visible in controllers (`/api/v1/...` vs `/api/...`).
⚠️ No rate limiting at the API gateway level.
⚠️ No integration tests exist beyond 3 unit tests for services.

**SOLID Assessment:**
- **S (SRP):** Violated. Many services do too much. The helper duplication is a clear SRP failure.
- **O (OCP):** Good. Interfaces + implementations allow extension.
- **L (LSP):** Satisfied.
- **I (ISP):** Good — service interfaces are focused.
- **D (DIP):** Partially broken — CommentServiceImpl doesn't implement CommentService interface.

---

## 2. DOMAIN MODEL

### Score: 8.5/10

**Strengths:**
✅ **Smart design of the ownership chain:** Workspace → Department → Team / Project → Task → Comment/Activity/Attachment → Mention. This creates clean multi-tenant isolation naturally through JPA relationships.
✅ All entities extend `AuditableEntity` with `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, and `version` for optimistic locking.
✅ UUID primary keys with `GenerationType.UUID` — excellent for distributed systems and security (no sequential ID guessing).
✅ Well-commented Javadoc on every entity explaining architectural intent.
✅ Soft delete via status enums consistently implemented.
✅ Composite IDs with `@EmbeddedId` and `@MapsId` for join tables (WorkspaceMember, TeamMember, UserRole, RolePermission).

### Entity Relationship Map

```
Workspace
├── WorkspaceMember (User + Role + Status)
│   └── User
├── Department
│   ├── Team
│   │   └── TeamMember (User + Status)
│   └── Project
│       ├── Task
│       │   ├── Comment
│       │   │   └── Mention
│       │   ├── Activity
│       │   └── Attachment (optional: Comment)
│       ├── Document (optional: Task)
│       ├── KnowledgeBase
│       └── HandoverEntry
│           └── HandoverJournal
├── Notification (recipient User + optional: Project/Task/Comment/Document/KB/HandoverEntry)
├── Role + Permission (global, not workspace-scoped)
└── RefreshToken (User)
```

**Issues:**

**Critical:**
🔴 **Role entity has `CascadeType.ALL` + orphanRemoval on `RolePermission`.** Since `Role` disassociates from `BaseEntity`/`AuditableEntity`, deleting a role could cascade-delete all permissions. This is dangerous.

**High:**
🟠 **KnowledgeBase entity has `@Column(name = "article_version")` but the field is named `articleVersion`** — database column name is inconsistent with earlier naming conventions. Same issue: Document has `documentVersion`.
🟠 **Comment entity uses `TaskStatus` (ACTIVE/ARCHIVED)** for its status. This is a **semantic mismatch** — Comment should have its own `CommentStatus` enum.
🟠 **Activity entity also uses `TaskStatus`** — same semantic mismatch.
🟠 **Document entity references `d.version` in `findAllVersions` query but the column is named `document_version`.** This query would break at runtime.

**Medium:**
🟡 `HandoverEntry` has a `@ManyToOne` on `Task` that is optional, but the DTO currently does not expose a taskId. The service acknowledges this with a comment.
🟡 `Notification` has **7 optional JPA relationships** (project, task, comment, document, knowledgeBase, handoverEntry) plus `resourceType/resourceId`. This is 7+ nullable foreign key columns per row.
🟡 `KnowledgeBase` has `LocalDateTime lastViewedAt` alongside `Instant createdAt/updatedAt` — mixing time types inconsistently.

---

## 3. REPOSITORY LAYER

### Score: 8.0/10

**Strengths:**
✅ All repositories enforce **workspace isolation** through JPA queries with `WHERE ... workspace.id = :workspaceId`.
✅ `JOIN FETCH` is used in key repositories (ActivityRepository, TeamMemberRepository, MentionRepository) to avoid N+1.
✅ Pre-indexed entities with `@Index` annotations on most tables.
✅ Soft-delete awareness in most queries (filtering by ACTIVE status).
✅ Dashboard-specific queries are co-located in the same repositories (good cohesion).

**Issues:**
**Critical:**
🔴 **ActivityRepository.findById() and NotificationRepository.findById() do NOT validate workspace scope.** `ActivityServiceImpl.getById()` fetches the activity by ID and then manually validates the hierarchy in Java code. This is a **tenant isolation gap** — if a workspace ID is faked, the service loads the entity anyway and only checks afterward. An attacker with a valid token could access resources from other workspaces before the Java-level check rejects them.

**High:**
🟠 **N+1 risk:** Several repositories return entities that trigger lazy loads. E.g., `TeamRepository.findAllByWorkspace_Id()` returns `Team` but the caller often accesses `team.getMembers()` which triggers N+1.
🟠 **No pagination defaults** on some query methods — `HandoverEntryRepository.findByProjectIdPaginated()` and other list methods could return thousands of rows without forced pagination.
🟠 **DocumentRepository.findAllVersions()** references `d.version` but Document entity column is `document_version`. This query will fail at runtime.

**Medium:**
🟡 `MentionRepository.softDelete()` uses `'INACTIVE'` status string, but the Mention entity's status enum uses `TaskStatus.ACTIVE` / `TaskStatus.ARCHIVED` — there is no `INACTIVE` value. This query would silently do nothing.

---

## 4. SERVICES

### Score: 6.5/10

**Strengths:**
✅ Transaction boundaries are appropriate (`@Transactional` on service, read-only on queries).
✅ Consistent validation of tenant hierarchy (workspace → department → project → task).
✅ Deep entity hierarchy validation in every write operation.
✅ `@Slf4j` logging present throughout.
✅ Account activation and password reset use `SecureRandom` — good security practice.

**Issues:**
**Critical:**
🔴 **Massive code duplication of authorization helpers.** 14+ service classes duplicate the same 3 private methods (`getAuthenticatedUserId()`, `assertActiveWorkspaceMember()`, `assertWorkspaceAdminOrOwner()`). A centralized `SecurityService` or base class is missing.
🔴 **CommentServiceImpl does NOT implement CommentService.** This is a compilation warning at best, and a design break at worst. The controller cannot properly inject `CommentService` via interface.

**High:**
🟠 **TaskServiceImpl**, **DocumentServiceImpl**, **KnowledgeBaseServiceImpl**, **CommentServiceImpl**, **ActivityServiceImpl**, **AttachmentServiceImpl**, **MentionServiceImpl**, **HandoverEntryServiceImpl**, and **HandoverJournalServiceImpl** all use hardcoded `@Transactional` on class level with additional `@Transactional(readOnly = true)` on read methods. This is redundant and can lead to unexpected read-only violations.
🟠 **`registerFailedLoginAttempt()`** updates `failedLoginAttempts` directly on the entity and saves. If multiple concurrent login attempts happen, there's a race condition — `@Version` optimistic lock exception may occur.
🟠 **`me()` in AuthServiceImpl** re-fetches the user from DB via email even though `CustomUserDetails` already contains all needed data. Unnecessary query.
🟠 **HandoverJournalServiceImpl** uses `handoverEntryRepository.findByProjectIdPaginated(projectId, Pageable.unpaged())` — this loads ALL entries for a project into memory for synthesis. This will cause OOM on large projects.

**Medium:**
🟡 The personal dashboard returns `Collections.emptyList()` for tasks since task assignment doesn't exist yet. This is honest but the service should track this as a TODO.
🟡 `normalizeName()` is duplicated across DepartmentServiceImpl, TeamServiceImpl, ProjectServiceImpl, KnowledgeBaseServiceImpl.
🟡 `DashboardServiceImpl` has 900+ lines with many private builders — becoming a god class.

---

## 5. CONTROLLERS

### Score: 7.5/10

**Strengths:**
✅ Consistent REST naming: `/api/workspaces/{workspaceId}/departments/{departmentId}/...`
✅ Workspace isolation via path variable in all nested resource controllers.
✅ `@PreAuthorize` with SpEL used in workspace and department controllers.
✅ Proper use of `@Validated` and `@Valid` annotations.
✅ Consistent response format via `ApiResponse<T>`.

**Issues:**
**High:**
🟠 Several controllers lack `@PreAuthorize` annotations (e.g., `TaskController`, `DocumentController`, `KnowledgeBaseController`, `CommentController`, `ActivityController`, `AttachmentController`, `MentionController`, `HandoverEntryController`, `NotificationController`). Authorization is done entirely in the service layer. **Authorization at the controller level (first line of defense) is missing.**
🟠 `AuthController` exposes `/api/auth/activate` as a GET endpoint with the token as a query parameter. This means tokens appear in server logs, browser history, and referrer headers.
🟠 The `me()` endpoint endpoints use `@GetMapping("/me")` but there's no guarantee of consistent naming across modules.

**Medium:**
🟡 No `@RequestMapping` at class level on some controllers — path is fully specified on each method.
🟡 Response status codes are inconsistent — some return 200 for creation, others might return 201.

---

## 6. DTO LAYER

### Score: 8.0/10

**Strengths:**
✅ Clear separation between request and response DTOs.
✅ `@JsonInclude(Include.NON_NULL)` on responses prevents exposing null fields.
✅ Validation annotations on request DTOs (`@NotBlank`, `@Size`, `@Email`).
✅ MapStruct configured with `unmappedTargetPolicy = ERROR` — guarantees no accidental unmapped fields.

**Issues:**
**Medium:**
🟡 `CreateWorkspaceRequest` exists in **two packages**: `dto/workspace/CreateWorkspaceRequest` and `validation/CreateWorkspaceRequest`. This is confusing.
🟡 `UpdateWorkspaceRequest` similarly in both packages.
🟡 No DTO for pagination metadata consistently (some use Spring's `Page`, some custom).

---

## 7. SECURITY

### Score: 8.0/10

**Strengths:**
✅ JWT with HS256 signing using configurable secret ≥32 chars.
✅ Access/Refresh token separation with type checking (`TokenType`).
✅ Token rotation on refresh (revokes old, creates new).
✅ **Brute-force protection**: `failedLoginAttempts`, auto-lock, `LOCKED` status, `canAutoUnlock()`.
✅ Account activation flow: user created as `PENDING_ACTIVATION` → must complete activation.
✅ Password validation: `@Password` annotation with strong regex.
✅ `SUPER_ADMIN` authority bypass in workspace/Department authorization.
✅ SpEL expressions for method-level security in controllers.

**Issues:**
**Critical:**
🔴 **ActivityService.getById()** — loads entity by ID without workspace scope filtering in the repository. The workspace check happens in Java code after the entity is loaded. This creates a **TOCTOU (time-of-check time-of-use)** vulnerability where an attacker could access any Activity before the check fails.
🔴 **NotificationService.getById()** — same pattern: loads by ID, checks workspace in Java.

**High:**
🟠 `CurrentAuditor.getCurrentAuditor()` returns `Optional.empty()` — **auditing is broken**. The `createdBy` and `updatedBy` fields will always be null because the auditor provider is not reading the JWT or security context. This affects every entity.
🟠 `PasswordValidator` regex is restrictive and may reject valid strong passwords (e.g., passwords with spaces or unicode characters).
🟠 No CSRF protection beyond disabling it (acceptable for JWT but no additional token mechanism).
🟠 The `registerFailedLoginAttempt` has a race condition under concurrent logins.

**Medium:**
🟡 No input sanitization beyond Bean Validation.
🟡 No security headers configured (HSTS, X-Content-Type-Options, etc.).
🟡 No rate limiting on `/api/auth/login` endpoint beyond the account lockout mechanism.

---

## 8. REPORTING MODULE

### Score: 8.5/10

**Strengths:**
✅ Well-designed strategy pattern for export (CSV, Excel, JSON, PDF exporters).
✅ Factory pattern (`ReportExporterFactory`) for exporter selection.
✅ Clean separation of builders (`*SectionBuilder`, `*ReportBuilder`).
✅ Validation layer with dedicated validators (`DateRangeValidator`, `PaginationValidator`, `ScopeAccessValidator`).
✅ Extensible architecture — adding new report types requires minimal changes.
✅ DTO hierarchy is well thought out (`ReportRequest` → `ReportResponse` with sections).

**Architecture Overview:**
```
ReportController
    ↓
ReportService (interface + impl)
    ↓
WorkspaceReportBuilder (implements for workspace scope)
    ├── WorkspaceHeaderBuilder
    ├── WorkspaceExecutiveSummaryBuilder
    ├── WorkspaceStatisticsBuilder
    ├── TaskSectionBuilder
    ├── ProjectSectionBuilder
    ├── DocumentSectionBuilder
    ├── TeamSectionBuilder
    ├── NotificationSectionBuilder
    ├── ActivitySectionBuilder
    ├── CollaborationSectionBuilder
    └── DepartmentSectionBuilder
    ↓
ReportExporter (interface)
    ├── CsvReportExporter
    ├── ExcelReportExporter
    ├── JsonReportExporter
    └── PdfReportExporter
        ↑
ReportExporterFactory (interface + impl)
```

**Validation Layer:**
```
ReportFilterValidator → DateRangeValidator, PaginationValidator
ReportScopeValidator → ScopeAccessValidator
```

**Issues:**
**Medium:**
🟡 **WorkspaceReportBuilder** and related builders are the only implemented report types. Department, Team, and Project reports are not yet implemented.
🟡 PDF exporter likely uses a library not yet in the classpath (not in pom.xml).
🟡 No streaming support — reports are built entirely in memory.
🟡 No report history or scheduled reports yet.

---

## 9. DASHBOARD

### Score: 7.0/10

**Strengths:**
✅ 5 distinct dashboard scopes (Workspace, Personal, Department, Project, Team).
✅ Widget-based architecture with dedicated DTOs.
✅ Aggregation-only service — no owned data.
✅ JOIN FETCH used in queries to avoid N+1 in key areas.
✅ `@Transactional(readOnly = true)` at class level.

**Architecture:**
```
DashboardController
    ↓
DashboardService (interface + impl)
    ├── getWorkspaceDashboard(workspaceId)
    ├── getPersonalDashboard(workspaceId, userId)
    ├── getDepartmentDashboard(workspaceId, departmentId)
    ├── getProjectDashboard(workspaceId, projectId)
    └── getTeamDashboard(workspaceId, teamId)
        ↓
    Returns: Scope-specific response DTOs containing widgets
```

**Issues:**
**High:**
🟠 **DashboardServiceImpl is a god class**: 900+ lines, many private builder methods, 14 injected repositories. SRP is violated.
🟠 `buildDepartmentOverview()` loads ALL teams in a loop to count members, then loads ALL team members for each team. This is potentially **N+1 across teams** — could be optimized with a single aggregate query.
🟠 Personal dashboard returns empty lists for task-related widgets because task assignment doesn't exist yet. Should be documented as a known gap.

**Medium:**
🟡 Dashboard widget DTOs are numerous (30+ files in `dto/Dashboard/scope/widget/`). Could be consolidated.
🟡 No caching — every dashboard load hits the database with multiple count queries.

---

## 10. MULTI-TENANCY

### Score: 8.5/10

**Strengths:**
✅ Every nested resource endpoint includes `workspaceId` in the path.
✅ All service methods validate workspace membership before operations.
✅ `WorkspaceAuthorization` and `DepartmentAuthorization` provide reusable SpEL security checks.
✅ Repository queries consistently filter by workspace through JPA joins.
✅ Ownership chain (Workspace → Department → Project → Task → Comment/Activity) ensures natural isolation.

**Tenant Isolation Chain:**
```
HandoverEntry → Workspace (direct)
Notification → Workspace (direct)
Department → Workspace
Team → Department → Workspace
Project → Department → Workspace
Task → Project → Department → Workspace
Document → Project → Department → Workspace
KnowledgeBase → Project → Department → Workspace
Comment → Task → Project → Department → Workspace
Activity → Task → Project → Department → Workspace
Attachment → Task → Project → Department → Workspace
Mention → Comment → Task → Project → Department → Workspace
```

**Issues:**
**High:**
🟠 **Activity and Notification repositories** do NOT filter by workspace in their `findById()` queries. They rely on Java-level checks after loading. If a query is reused in a different context or if the Java check is bypassed, tenant isolation is broken.

---

## 11. PERFORMANCE

### Score: 6.5/10

**Issues:**
**Critical:**
🔴 **No query-level pagination enforcement** on several list endpoints. Large datasets could cause OOM.
🔴 **HandoverJournalServiceImpl** loads ALL handover entries for a project via `Pageable.unpaged()` — memory risk.

**High:**
🟠 Dashboard service fires 10+ separate count queries per dashboard load. No caching.
🟠 `JOIN FETCH` is used inconsistently — some repositories load lazy relations, others don't.
🟠 Many service methods re-fetch entities from DB that were already available (e.g., `AuthServiceImpl.me()` fetches user by email even though already in security context).

**Medium:**
🟡 No database connection pooling tuning visible (using HikariCP defaults).
🟡 No query analysis for slow queries.

---

## 12. FUTURE MODULES READINESS

### Score: 8.0/10

**Strengths:**
✅ KnowledgeBase has `aiProcessed`, `aiSummary`, `aiTags`, `ragEmbeddingsAvailable` fields ready for AI.
✅ HandoverEntry has `aiSummary`, `aiProcessed`, `ragEmbeddingsAvailable` for AI integration.
✅ Document has `aiProcessed`, `pdfExportAvailable`, `storageType` for cloud storage.
✅ Notification entity has `resourceType`/`resourceId` generic pattern for future module references.
✅ Reporting module is designed with extensibility in mind (Strategy + Factory + Builder patterns).
✅ Dashboard uses widget-based design that allows adding widgets without changing existing ones.

**Issues:**
**Medium:**
🟡 No vector search infrastructure (pgvector or similar) included yet for RAG.
🟡 No scheduled task infrastructure (`@Scheduled`) visible for report scheduling.
🟡 Analytics module not started — no aggregation tables or event sourcing.
🟡 No AI service skeleton or abstraction layer exists yet.

---

# OVERALL SCORES

| Category | Score | Assessment |
|---|---|---|
| **Architecture** | 8.2/10 | Strong layered architecture with some SRP violations |
| **Security** | 8.0/10 | Solid JWT/activation/reset, but broken auditing and tenant gaps |
| **Performance** | 6.5/10 | No caching, N+1 risks, unbounded pagination in places |
| **Maintainability** | 6.5/10 | Blessed by duplication (14x auth helpers, god dashboard class) |
| **Scalability** | 7.0/10 | UUIDs + stateless JWT good; no caching, no read replicas |
| **Readability** | 8.5/10 | Excellent Javadoc, consistent naming, clean structure |
| **Extensibility** | 8.0/10 | Reporting module exemplary; entities future-proofed for AI |
| **Testing Readiness** | 4.0/10 | Only 3 unit tests exist; no integration tests |
| **Production Readiness** | 6.5/10 | Blocked by broken auditing + tenant gaps + missing tests |
| **Overall Project Score** | **7.3/10** | Solid foundation with clear path to production |

---

# STRENGTHS

1. **Clean layered architecture** with strict separation of concerns.
2. **Excellent domain model design** with natural multi-tenant isolation through the Workspace→Department→Project→Task chain.
3. **Comprehensive security features**: JWT with refresh token rotation, brute-force protection, account activation, password reset, `@PreAuthorize` with SpEL.
4. **Consistent soft-delete pattern** across all entities.
5. **UUID primary keys** with optimistic locking (`@Version`).
6. **Reporting module** is well-designed with Strategy, Factory, and Builder patterns — the best engineered new module.
7. **Extensive future-proofing** in entities: AI fields, RAG fields, cloud storage fields, generic resource patterns.
8. **Thorough documentation** via Javadoc on entities and services.
9. **MapStruct with `unmappedTargetPolicy = ERROR`** for type-safe DTO mapping.
10. **Email templates** are already built for activation, password reset, notifications, etc.
11. **Consistent API response format** (`ApiResponse<T>`) across all endpoints.
12. **Multi-tenant isolation** enforced at every architectural layer.

---

# WEAKNESSES (Ranked)

## CRITICAL (Production Blockers)

| # | Issue | Location | Impact |
|---|---|---|---|
| C1 | **Auditing completely broken**: `CurrentAuditor.getCurrentAuditor()` returns `Optional.empty()` | `security/audit/CurrentAuditor.java` | All `createdBy`/`updatedBy` fields are null. No audit trail. |
| C2 | **Tenant isolation gap**: `ActivityRepository.findById()` and `NotificationRepository.findById()` don't filter by workspace. Java-level check can be bypassed in future refactoring. | `ActivityServiceImpl`, `NotificationServiceImpl` | Potential cross-workspace data access. |
| C3 | **CommentServiceImpl does NOT implement CommentService** | `service/CommentServiceImpl.java` | Breaks DI — controllers can't inject via interface. Compilation warnings. |
| C4 | **14+ copies of identical authorization helper code** across services | All `*ServiceImpl` classes | DRY violation. Any security change requires modifying 14+ files. High risk of inconsistency. |
| C5 | **Role entity has CascadeType.ALL on RolePermission** — deleting a role could cascade-delete permissions | `entity/Role.java` | Data integrity risk. |

## HIGH

| # | Issue | Location | Impact |
|---|---|---|---|
| H1 | **No controller-level authorization** on 8+ controllers (Task, Document, KB, Comment, Activity, Attachment, Mention, HandoverEntry, Notification) | Various controllers | Authorization only at service layer — first line of defense missing. |
| H2 | **HandoverJournalServiceImpl loads ALL entries with Pageable.unpaged()** | `HandoverJournalServiceImpl` | OOM risk on large projects. |
| H3 | **DashboardServiceImpl is a god class** (900+ lines, 14 repositories) | `DashboardServiceImpl` | SRP violation. Hard to test, maintain, extend. |
| H4 | **Dashboard's memberStatistics() loads teams in loop** — N+1 across teams | `DashboardServiceImpl` | Performance issue on large departments. |
| H5 | **DocumentRepository.findAllVersions()** references wrong column name (`version` vs `document_version`) | `DocumentRepository.java` | Runtime query failure. |
| H6 | **Race condition in `registerFailedLoginAttempt()`** under concurrent requests | `AuthServiceImpl` | Optimistic lock exception or inconsistent state. |
| H7 | **Activation token exposed as GET query parameter** | `ActivationController` | Token leaks in logs, browser history, referer headers. |

## MEDIUM

| # | Issue | Location | Impact |
|---|---|---|---|
| M1 | Comment and Activity entities misuse `TaskStatus` enum instead of having their own statuses | `entity/Comment.java`, `entity/Activity.java` | Semantic mismatch, confusion |
| M2 | No pagination defaults on many repository list methods | Various repositories | Potential OOM on large queries |
| M3 | No integration tests (only 3 unit tests exist) | `src/test/` | No confidence in module integration |
| M4 | No caching layer — all dashboard/reporting queries hit DB every time | All services | Performance degradation under load |
| M5 | `MentionRepository.softDelete()` references non-existent `'INACTIVE'` status | `MentionRepository.java` | Silent query failure |
| M6 | Duplicate DTOs in `validation/` and `dto/workspace/` packages | Two packages | Confusion, maintenance burden |
| M7 | No API versioning strategy | Controllers | Breaking changes impossible to manage |
| M8 | No rate limiting on auth endpoints | `AuthController` | Brute-force at network level |
| M9 | No security headers (HSTS, CSP, etc.) | `SecurityConfig` | Missing defense in depth |
| M10 | KnowledgeBase mixes `LocalDateTime` and `Instant` time types | `entity/KnowledgeBase.java` | Timezone inconsistencies |

---

# TECHNICAL DEBT CATEGORIZATION

## Critical Debt (Must fix before production)
1. Fix `CurrentAuditor` to read from JWT/SecurityContext
2. Add workspace-scoped filtering to Activity and Notification findById queries
3. Fix `CommentServiceImpl` to implement `CommentService` interface
4. Extract duplicate authorization helpers into a shared `SecurityService`
5. Remove `CascadeType.ALL` on `Role.rolePermissions`

## High Debt (Should fix before production)
1. Add `@PreAuthorize` to all controllers
2. Add forced pagination to repository list methods
3. Refactor `DashboardServiceImpl` into smaller focused services
4. Fix `DocumentRepository.findAllVersions()` column reference
5. Replace `Pageable.unpaged()` with real pagination in HandoverJournalServiceImpl
6. Add pessimistic lock or retry logic for `registerFailedLoginAttempt()`
7. Change activation endpoint from GET to POST

## Medium Debt (Fix within first 3 months)
1. Deduplicate normalization helpers (`normalizeName()`)
2. Add `@Scheduled` cleanup jobs for expired tokens
3. Add integration tests for all modules
4. Add caching layer for dashboard/reporting
5. Add API versioning
6. Consolidate dashboard widget DTOs
7. Add rate limiting middleware
8. Add security headers via Spring Security configuration

## Low Debt (Fix within 6 months)
1. Add proper `CommentStatus` and `ActivityStatus` enums
2. Consolidate duplicate DTO packages
3. Standardize time types across all entities
4. Add OpenAPI security scheme annotations
5. Add field-level comments on DTOs

---

# ROADMAP

## Phase 1 — Production Stabilization (2-3 weeks)

**Priority: CRITICAL**

| Task | Details | Effort |
|---|---|---|
| 1.1 Fix auditing | Update `CurrentAuditor` to extract user from JWT/SecurityContext | 1 day |
| 1.2 Fix tenant isolation gaps | Add workspace scope to `ActivityRepository.findById()` and `NotificationRepository.findById()` | 1 day |
| 1.3 Fix CommentServiceImpl | Add `implements CommentService` | 0.5 day |
| 1.4 Create shared SecurityService | Extract `getAuthenticatedUserId()`, `assertActiveWorkspaceMember()`, `assertWorkspaceAdminOrOwner()` into injectable `SecurityService` class | 2 days |
| 1.5 Fix Role cascade | Remove `CascadeType.ALL` from `Role.rolePermissions` | 0.5 day |
| 1.6 Add `@PreAuthorize` to all controllers | Add method-level security annotations | 1 day |
| 1.7 Fix DocumentRepository query | Correct `d.version` → `d.documentVersion` | 0.5 day |
| 1.8 Change activation to POST | Move activation token from GET query param to POST body | 0.5 day |

**Total: ~7-8 days**

## Phase 2 — Performance & Security Hardening (2-3 weeks)

**Priority: HIGH**

| Task | Details | Effort |
|---|---|---|
| 2.1 Add pagination enforcement | Add `Pageable` + max page size to all list endpoints | 2 days |
| 2.2 Refactor DashboardServiceImpl | Break into focused services (WorkspaceDashboardService, PersonalDashboardService, etc.) | 3 days |
| 2.3 Add Redis caching | Cache dashboard responses, report results, frequently accessed entities | 3 days |
| 2.4 Add rate limiting | Add Spring filter or gateway-level rate limiting on `/api/auth/**` | 1 day |
| 2.5 Add security headers | Configure HSTS, CSP, X-Content-Type-Options in `SecurityConfig` | 0.5 day |
| 2.6 Add API versioning | Add `/api/v1/` prefix to all controllers | 1 day |
| 2.7 Fix race condition | Add `@Version` retry logic or pessimistic lock for `registerFailedLoginAttempt()` | 1 day |

**Total: ~11-12 days**

## Phase 3 — Testing & Quality (2-3 weeks)

**Priority: HIGH**

| Task | Details | Effort |
|---|---|---|
| 3.1 Add integration tests | Repository + service integration tests for all modules | 5 days |
| 3.2 Add security tests | Test tenant isolation, authorization, authentication edge cases | 3 days |
| 3.3 Add performance benchmarks | JMeter/Gatling tests for critical endpoints (dashboard, reporting) | 2 days |
| 3.4 Set test coverage targets | Configure JaCoCo with minimum 70% coverage | 1 day |
| 3.5 Add unit tests for existing services | Cover existing service implementations | 3 days |

**Total: ~14 days**

## Phase 4 — Module Completion (4-6 weeks)

**Priority: MEDIUM**

| Task | Details | Effort |
|---|---|---|
| 4.1 Implement Department reports | New `DepartmentReportBuilder` and related | 3 days |
| 4.2 Implement Team reports | New `TeamReportBuilder` and related | 3 days |
| 4.3 Implement Project reports | New `ProjectReportBuilder` and related | 2 days |
| 4.4 Add report history | New `ReportHistory` entity, repository, and service | 3 days |
| 4.5 Add saved report templates | New `ReportTemplate` entity, CRUD, and application | 3 days |
| 4.6 Add scheduled reports | Use `@Scheduled`, create `ScheduledReportService` | 3 days |
| 4.7 Add email delivery for reports | Extend `EmailService` for report attachments | 2 days |
| 4.8 Complete HandoverJournal AI | Connect to AI service for actual synthesis | 4 days |

**Total: ~23 days**

## Phase 5 — Analytics Foundation (3-4 weeks)

**Priority: MEDIUM**

| Task | Details | Effort |
|---|---|---|
| 5.1 Design analytics tables | Create aggregate tables for workspace/department/project analytics | 2 days |
| 5.2 Add event-sourcing foundation | Create `AnalyticsEvent` entity and producer | 3 days |
| 5.3 Create AnalyticsService | Aggregate queries and trend calculations | 4 days |
| 5.4 Add time-series dashboard data | Weekly/monthly trends for tasks, projects, members | 3 days |
| 5.5 Add export for analytics | CSV/JSON/PDF export of analytics data | 2 days |

**Total: ~14 days**

## Phase 6 — AI Module Foundation (4-6 weeks)

**Priority: FUTURE**

| Task | Details | Effort |
|---|---|---|
| 6.1 Create CollabixAI service abstraction | Define interface for AI operations | 2 days |
| 6.2 Integrate vector database (pgvector) | Add pgvector extension, create embeddings table | 3 days |
| 6.3 Add AI processing pipeline | Async processing for documents, KB articles, handover entries | 5 days |
| 6.4 Implement executive summary generation | AI-generated workspace/department/project summaries | 4 days |
| 6.5 Build AI chat/query interface | REST endpoint for Q&A on workspace data | 5 days |
| 6.6 Add risk detection for handovers | AI analysis of handover entries for risk patterns | 3 days |

**Total: ~22 days**

## Phase 7 — Frontend Development (ongoing)

**Priority: PARALLEL**

| Task | Details | Effort |
|---|---|---|
| 7.1 Authentication UI | Login, register, activation, password reset pages | 5 days |
| 7.2 Workspace management UI | Create/list/manage workspaces | 3 days |
| 7.3 Organization management UI | Departments, teams, members CRUD | 5 days |
| 7.4 Project & Task management UI | Project list, kanban, task detail | 8 days |
| 7.5 Collaboration UI | Comments, attachments, mentions | 5 days |
| 7.6 Documentation & KB UI | Document viewer, KB article editor | 5 days |
| 7.7 Handover journal UI | Entry form, journal viewer | 4 days |
| 7.8 Dashboard UI | 5 dashboard scopes with widgets | 8 days |
| 7.9 Reporting UI | Report builder, viewer, export | 6 days |

**Total: ~49 days (can be parallelized across teams)**

---

# KEY ARCHITECTURAL DECISIONS TO VALIDATE

1. **Task Assignment Model**: Currently, tasks do not have assigned users. The personal dashboard returns empty task lists. A `TaskAssignment` entity (or a `assigneeId` on Task) needs to be introduced.

2. **File Storage Strategy**: Document and Attachment entities have `storagePath` and `storageType` fields, but the actual file upload/download endpoints and cloud storage integration are not implemented. This needs architectural decisions (local FS vs S3 vs GCS).

3. **Global Roles vs Workspace Roles**: `Role` and `Permission` entities are global (not workspace-scoped), while `WorkspaceRole` is workspace-scoped. The interaction between these two authorization systems needs clear documentation.

4. **AI Processing Model**: The project philosophy states "AI never modifies data automatically — only analyzes, summarizes, explains, recommends, forecasts, answers questions." The entities already have AI-related fields (`aiProcessed`, `aiSummary`, etc.), but the processing pipeline and AI service abstraction need to be built.

5. **Soft Delete Cascade**: When a Workspace is archived (soft-deleted), what happens to its Departments, Teams, Projects, Tasks, etc.? Currently, only the workspace status changes. A cascading soft-delete strategy needs to be defined.

---

# FINAL ASSESSMENT

Collabix backend is **substantially well-architected** with strong fundamentals. The domain model is excellent, multi-tenancy is well-designed, and security foundations are solid. The main blockers to production readiness are:

1. **The broken auditing system** — `createdBy`/`updatedBy` are always null
2. **The massive code duplication in service authorization helpers** — 14+ copies of identical code
3. **Missing controller-level authorization** for 8+ modules
4. **Lack of integration tests** — only 3 unit tests exist
5. **Tenant isolation gaps** in Activity and Notification repositories

Once these are addressed, the project is production-ready for the current modules. The architecture is well-prepared for future Analytics and AI modules with minimal redesign.

The **Reporting module** is the best-engineered module, demonstrating the team's ability to implement clean design patterns effectively. The **Dashboard module** needs refactoring to address the god class anti-pattern. The **service layer** needs consolidation to eliminate duplicate authorization logic.
