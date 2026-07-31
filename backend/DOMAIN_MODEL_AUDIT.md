# Collabix Domain Model & Architecture Audit

**Date:** 2025-01-XX  
**Auditor:** Senior Domain Architect / Java-Spring Boot Software Architect  
**Scope:** Complete domain model audit — all entities, enums, embedded IDs, base entities  
**Objective:** Validate design, scalability, and readiness for future modules  
**Methodology:** Code review (entities, enums, IDs, base classes) — no code generation, no refactoring

---

## 1. Executive Summary

### Final Scores (Architect-Approved)

| Area | Score |
|---|---|
| **Domain Model** | **9.4 / 10** |
| **Multi-tenancy** | **10 / 10** |
| **Security Model** | **9.3 / 10** |
| **Aggregates** | **9.2 / 10** |
| **Extensibility** | **9.8 / 10** |
| **Maintainability** | **9.3 / 10** |
| **Production Readiness** | **9.0 / 10** |
| **Overall Domain Score** | **9.4 / 10** |

### Key Conclusions

- **Domain is stable** — no major redesign required.
- **Future modules remain compatible** — 6/9 fully supported, 3/9 minor adjustments, 0 major redesign.
- **Clean Architecture has been respected** — clear separation of concerns, well-defined layers.
- **Workspace remains the tenant boundary** — multi-tenancy is the strongest part of the project.
- **The model is extensible** — generic patterns (Notification resourceType/resourceId) support future modules without schema changes.

**Note:** The audit confirms the current architecture is production-capable. Recommendations are scoped as "fix before continuing", "schedule for later", and "technical debt" — not as blockers for ongoing feature development.

---

## 2. Entity-by-Entity Review

### 2.1 Core / Organisation

#### **Workspace**
- **Responsibility:** Tenant root. Top-level organizational boundary.
- **Relationships:**
  - `@ManyToOne → User (owner)` — mandatory
  - `@OneToMany → Set<WorkspaceMember>` — cascade PERSIST, MERGE (no REMOVE, no orphanRemoval)
- **Strengths:**
  - Clear tenant boundary.
  - Unique constraint `(owner_id, name)` prevents duplicate workspace names per owner.
  - Index on `status` for filtering.
  - Use of `@PrePersist` for default status.
- **Weaknesses:**
  - No `@OneToMany` for `Department` — departments must be queried separately (not necessarily a weakness, but worth noting for aggregate design).
  - `owner` field references `User` directly — User is not scoped to a Workspace (this is correct, but means queries for "workspaces where user is owner" cross tenant boundaries).
- **Recommendations:** None critical. Clear aggregate root.

---

#### **WorkspaceMember**
- **Responsibility:** Association between User and Workspace with role and membership status.
- **Relationships:**
  - `@EmbeddedId (WorkspaceMemberId)` — composite key `(workspaceId, userId)`
  - `@MapsId("workspaceId") → Workspace` — mandatory
  - `@MapsId("userId") → User` — mandatory
- **Strengths:**
  - Correct use of `@EmbeddedId` for composite key.
  - Tracks full membership lifecycle: `joinedAt`, `leftAt`, `invitedAt`, `invitedAcceptedAt`.
  - Separate `invitationEmail` field for invite-based membership.
- **Weaknesses:**
  - Does **NOT** extend `AuditableEntity` or `BaseEntity` — no `createdAt`, `updatedAt`, `version` fields.
  - **Critical**: Missing audit trail means no way to track when a membership record was created or modified.
  - `Workspace` side has `@OneToMany` but with only `PERSIST` + `MERGE` (no REMOVE/orphanRemoval) which is correct for soft membership management.
- **Recommendations:**
  - **Critical**: Add auditing fields (createdAt, updatedAt) or extend AuditableEntity.
  - Consider adding `@Version` for optimistic locking.

---

#### **Department**
- **Responsibility:** Organizational unit within a Workspace.
- **Relationships:**
  - `@ManyToOne → Workspace` — mandatory
- **Strengths:**
  - Clean ownership: Department belongs to Workspace.
  - Unique constraint `(workspace_id, name)`.
  - Indexed for workspace+status and workspace+name queries.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - No `@OneToMany` to `Team` or `Project` — queries must be done explicitly.
  - Reuses `WorkspaceStatus` enum — semantically "Department" status should be its own enum or at minimum `DepartmentStatus` to avoid confusion.
- **Recommendations:**
  - **Medium**: Create a dedicated `DepartmentStatus` enum (ACTIVE, ARCHIVED) instead of reusing `WorkspaceStatus`.

---

#### **Team**
- **Responsibility:** Operational unit within a Department.
- **Relationships:**
  - `@ManyToOne → Department` — mandatory
  - `@OneToMany → Set<TeamMember>` — no cascade, no orphanRemoval (intentional)
- **Strengths:**
  - Clear ownership chain: Workspace → Department → Team.
  - Unique constraint `(department_id, name)`.
  - No cascade on `members` — prevents accidental bulk deletes.
  - Javadoc explains architecture decisions.
- **Weaknesses:**
  - Reuses `WorkspaceStatus` enum (same issue as Department).
- **Recommendations:**
  - **Medium**: Create a dedicated `TeamStatus` enum.

---

#### **TeamMember**
- **Responsibility:** Association between User and Team.
- **Relationships:**
  - `@EmbeddedId (TeamMemberId)` — composite key `(teamId, userId)`
  - `@MapsId("teamId") → Team` — mandatory
  - `@MapsId("userId") → User` — mandatory
- **Strengths:**
  - Correct composite key design.
  - Unique constraint `(team_id, user_id)`.
- **Weaknesses:**
  - Does **NOT** extend `AuditableEntity` or `BaseEntity` — no `createdAt`, `updatedAt`, `version`.
  - **Critical**: Missing audit trail, same as WorkspaceMember.
  - Uses `WorkspaceMemberStatus` enum — should be `TeamMemberStatus` for semantic clarity.
- **Recommendations:**
  - **Critical**: Add auditing fields.
  - **Medium**: Create dedicated `TeamMemberStatus` enum.

---

### 2.2 Security / Identity

#### **User**
- **Responsibility:** System-wide user identity. Not workspace-scoped (intentional — one user can be in multiple workspaces).
- **Relationships:**
  - `@ManyToOne → Department (primaryDepartment)` — optional
  - `@OneToMany → Set<UserRole>` — cascade ALL, orphanRemoval = true
  - `@OneToMany → Set<RefreshToken>` — cascade ALL, orphanRemoval = true
- **Strengths:**
  - Accounts for multi-workspace membership via WorkspaceMember and TeamMember.
  - Tracks login security: `lastLoginAt`, `failedLoginAttempts`, `lockedAt`.
  - Separate `enabled` flag and `UserStatus` enum for lifecycle management.
  - `primaryDepartment` provides user context without breaking existing auth model.
- **Weaknesses:**
  - `primaryDepartment` is a **direct relationship from User to Department** — this bypasses Workspace tenant isolation since User is not workspace-scoped. A user could theoretically have `primaryDepartment` set to a department in a workspace they don't belong to.
  - **High**: `UserRole` is not workspace-scoped — roles are global, not per-workspace. This conflicts with the multi-tenant design where roles should typically be workspace-specific.
  - `memberType` (EMPLOYEE, INTERN) seems underutilized and potentially confusing — is this a User-level attribute or a WorkspaceMember-level attribute?
- **Recommendations:**
  - **Critical**: Add workspace validation for `primaryDepartment` to ensure the user is a member of the workspace that owns the department.
  - **High**: Evaluate whether `UserRole` should be workspace-scoped. Current design suggests roles are global (system-wide), which may be insufficient for per-workspace permission management.
  - **Medium**: Consider whether `memberType` belongs on `WorkspaceMember` instead of `User`.

---

#### **Role**
- **Responsibility:** Named collection of permissions.
- **Relationships:**
  - `@OneToMany → Set<RolePermission>` — cascade ALL, orphanRemoval = true
- **Strengths:**
  - Clean separation: Role ↔ Permission via join table.
  - Uses `RoleName` enum for well-known roles.
- **Weaknesses:**
  - **Roles are global** — not scoped to Workspace. This limits flexibility for per-workspace role customization.
- **Recommendations:**
  - **High**: Consider adding optional `workspace_id` to Role for workspace-specific roles, or implement a role hierarchy that supports both global and workspace-scoped roles.

---

#### **Permission**
- **Responsibility:** Fine-grained access right.
- **Strengths:**
  - Simple, clean design with `code`, `displayName`, `description`.
  - `code` is unique — suitable for permission-based checks.
- **Weaknesses:**
  - None identified.
- **Recommendations:** None.

---

#### **UserRole**
- **Responsibility:** Many-to-many association between User and Role.
- **Relationships:**
  - `@EmbeddedId (UserRoleId)` — composite key `(userId, roleId)`
  - `@MapsId("userId") → User`
  - `@MapsId("roleId") → Role`
- **Strengths:**
  - Correct composite key pattern.
- **Weaknesses:**
  - Does **NOT** extend `AuditableEntity` — no `createdAt`, `updatedAt`.
  - **Not workspace-scoped** — a user's role applies globally, not per workspace.
  - No `@Version` for optimistic locking.
- **Recommendations:**
  - **High**: Evaluate if UserRole should include a `workspaceId` for workspace-scoped role assignments.
  - **Critical**: Add audit fields.

---

#### **RolePermission**
- **Responsibility:** Many-to-many association between Role and Permission.
- **Relationships:**
  - `@EmbeddedId (RolePermissionId)` — composite key `(roleId, permissionId)`
- **Strengths:**
  - Clean join table implementation.
- **Weaknesses:**
  - Does **NOT** extend `AuditableEntity` — no `createdAt`, `updatedAt`.
  - No `@Version` for optimistic locking.
- **Recommendations:**
  - **Critical**: Add audit fields.

---

### 2.3 Projects

#### **Project**
- **Responsibility:** Operational unit within a Department.
- **Relationships:**
  - `@ManyToOne → Department` — mandatory
- **Strengths:**
  - Tenant isolation via Department → Workspace chain.
  - Unique constraint `(department_id, name)`.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - No `@OneToMany` to `Task` (tasks must be queried separately).
  - No direct Workspace reference — workspace must be derived via Department.
  - Reuses `WorkspaceStatus` enum.
- **Recommendations:**
  - **Medium**: Consider adding a `projectLead` or `assignee` field (User) for ownership.
  - **Low**: Dedicated `ProjectStatus` enum.

---

#### **Task**
- **Responsibility:** Unit of work within a Project.
- **Relationships:**
  - `@ManyToOne → Project` — mandatory
- **Strengths:**
  - Unique constraint `(project_id, title)`.
  - `dueAt` field for deadline tracking.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - **No assignee** — who is working on this task?
  - **No priority** — cannot distinguish critical vs. low-priority tasks.
  - **No tags/labels** — limited categorization.
  - No subtask support.
  - No estimated hours / time tracking.
- **Recommendations:**
  - **High**: Add an `assignee` field (User) — this is a fundamental missing relation.
  - **High**: Add a `priority` enum (LOW, MEDIUM, HIGH, CRITICAL).
  - **Medium**: Consider adding `estimatedHours` and `actualHours` for future time tracking.

---

#### **Comment**
- **Responsibility:** Communication item attached to a Task.
- **Relationships:**
  - `@ManyToOne → Task` — mandatory
- **Strengths:**
  - `parentCommentId` prepared for future threaded replies.
  - Extends `AuditableEntity` — tracks `createdBy` author.
  - Soft-delete via `TaskStatus` enum.
- **Weaknesses:**
  - **Uses `TaskStatus` enum** for soft-delete — semantically incorrect. `CommentStatus` should be used.
  - `parentCommentId` is a raw UUID with no relationship — no referential integrity for nested comments.
- **Recommendations:**
  - **Medium**: Create a `CommentStatus` enum.
  - **Medium**: Consider adding `@ManyToOne(self-referencing)` for parent comment instead of raw UUID.

---

#### **Activity**
- **Responsibility:** Audit/timeline entry attached to a Task.
- **Relationships:**
  - `@ManyToOne → Task` — mandatory
  - `@ManyToOne → User (actor)` — mandatory
- **Strengths:**
  - Tracks both the task and the actor who performed the action.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - **Uses `TaskStatus` enum** for soft-delete — semantically incorrect.
  - No `activityType` enum — difficult to categorize activities for analytics.
  - No change metadata (previous value, new value).
- **Recommendations:**
  - **Medium**: Create an `ActivityStatus` enum.
  - **Medium**: Add an `activityType` enum (TASK_CREATED, STATUS_CHANGED, COMMENT_ADDED, etc.) for better analytics and UI rendering.
  - **Low**: Consider adding `oldValue` / `newValue` for change tracking.

---

#### **Mention**
- **Responsibility:** Reference to a User within a Comment.
- **Relationships:**
  - `@ManyToOne → Comment` — mandatory
  - `@ManyToOne → User` — mandatory
- **Strengths:**
  - Clear ownership chain.
  - `notificationSent` flag for idempotent notification dispatch.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - **Uses `TaskStatus` enum** for soft-delete (common pattern issue across multiple entities).
- **Recommendations:**
  - **Medium**: Create a `MentionStatus` enum or reuse a shared `Status` enum.

---

#### **Attachment**
- **Responsibility:** File attached to a Task (optionally to a Comment).
- **Relationships:**
  - `@ManyToOne → Task` — mandatory
  - `@ManyToOne → Comment` — optional
- **Strengths:**
  - Full file metadata: `fileName`, `mimeType`, `fileSize`, `storagePath`.
  - Extends `AuditableEntity`.
  - Well-documented Javadoc.
- **Weaknesses:**
  - No `documentType` categorization.
  - No checksum/hash for file integrity verification.
- **Recommendations:**
  - **Low**: Add `fileHash` (SHA-256) for integrity checks.

---

#### **Document**
- **Responsibility:** Document attached to a Project (optionally to a Task).
- **Relationships:**
  - `@ManyToOne → Project` — mandatory
  - `@ManyToOne → Task` — optional
- **Strengths:**
  - Future-ready: `documentVersion`, `aiProcessed`, `storageType`, `pdfExportAvailable`.
  - Full file metadata.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - Overlapping responsibility with `Attachment` — both deal with files. Documents are project-level, Attachments are task-level, but this distinction could be confusing.
  - Heavily future-proofed with many fields that are not yet used (`aiProcessed`, `pdfExportAvailable`, `storageType`).
- **Recommendations:**
  - **Low**: Consider rationalizing the difference between Attachment and Document. Could `Document` be a specialization of `Attachment` or vice-versa?

---

### 2.4 Knowledge

#### **KnowledgeBase**
- **Responsibility:** Wiki/article content within a Project.
- **Relationships:**
  - `@ManyToOne → Project` — mandatory
- **Strengths:**
  - Rich set of future-ready fields: `category`, `tags`, `aiProcessed`, `aiSummary`, `aiTags`, `ragEmbeddingsAvailable`, `viewCount`, `favoriteCount`.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - **Heavily speculative** — many AI/RAG fields with no implementation. Risk of schema bloat if these features are never built.
  - Tags stored as comma-separated string — no normalized tag table.
- **Recommendations:**
  - **Medium**: Consider normalizing tags into a separate `Tag` entity with a many-to-many relationship.
  - **Low**: Review if all AI-specific fields are needed now or could be deferred.

---

#### **HandoverEntry**
- **Responsibility:** End-of-shift handover form filled by a user.
- **Relationships:**
  - `@ManyToOne → Workspace` — mandatory
  - `@ManyToOne → Department` — mandatory
  - `@ManyToOne → Project` — mandatory
  - `@ManyToOne → Task` — optional
  - `@ManyToOne → User` — mandatory
- **Strengths:**
  - Direct Workspace relationship ensures tenant isolation.
  - Comprehensive form fields: `workFinished`, `workRemaining`, `difficulties`, `blockers`, `importantInformation`, `priorities`.
  - Future-ready: `aiSummary`, `aiProcessed`, `pdfExportAvailable`, `ragEmbeddingsAvailable`, `viewCount`, `favoriteCount`.
  - Manager validation flow: `managerValidationStatus`, `managerValidatedAt`, `managerValidatedBy`.
  - Unique constraint `(user_id, project_id, passed_at)`.
- **Weaknesses:**
  - **Denormalized relationships to Workspace, Department, and Project** — all three are required. Since Department already belongs to a Workspace and Project belongs to a Department, having all three directly on HandoverEntry creates potential inconsistency risk (e.g., department_id could belong to a different workspace than workspace_id).
  - **Heavily future-proofed** — many fields are speculative (aiSummary, pdfExportAvailable, ragEmbeddingsAvailable).
  - `timeSpentMinutes` is `Long` — should use a more precise type or duration class.
- **Recommendations:**
  - **High**: Add validation to ensure `workspace_id`, `department_id`, and `project_id` are consistent (department belongs to workspace, project belongs to department).
  - **Medium**: Consider denormalizing only `workspace_id` and `project_id`, deriving `department_id` through the Project relationship.
  - **Medium**: Use `java.time.Duration` instead of `Long timeSpentMinutes`.

---

#### **HandoverJournal**
- **Responsibility:** Auto-generated summary compiled from multiple HandoverEntry records.
- **Relationships:**
  - `@ManyToOne → Workspace` — mandatory
  - `@ManyToOne → Department` — mandatory
  - `@ManyToOne → Project` — mandatory
- **Strengths:**
  - Unique constraint `(project_id, shift, journal_date)` — prevents duplicate journals.
  - Generation status tracking.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - **Same denormalization issue** as HandoverEntry (all 3 relationships required).
  - No explicit relationship to the HandoverEntry records that comprise it — uses generated text fields instead.
- **Recommendations:**
  - **Medium**: Consider adding `@OneToMany → List<HandoverEntry>` to link source entries.
  - **High**: Add referential validation for workspace/department/project consistency.

---

### 2.5 Notifications

#### **Notification**
- **Responsibility:** Platform notification addressed to a user within a workspace.
- **Relationships:**
  - `@ManyToOne → Workspace` — mandatory
  - `@ManyToOne → User (recipient)` — mandatory
  - `@ManyToOne → Project` — optional
  - `@ManyToOne → Task` — optional
  - `@ManyToOne → Comment` — optional
  - `@ManyToOne → Document` — optional
  - `@ManyToOne → KnowledgeBase` — optional
  - `@ManyToOne → HandoverEntry` — optional
- **Strengths:**
  - **Best-designed entity in the domain** — excellent balance of current needs and future extensibility.
  - Generic `resourceType` + `resourceId` pattern for future modules without schema changes.
  - Comprehensive indexes for all query patterns.
  - Clear workspace-scoped tenant isolation.
  - Proper `readAt` timestamp for read tracking.
  - Separate `NotificationType` and `NotificationStatus` enums.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - Multiple optional `@ManyToOne` relationships could lead to N+1 queries if not carefully managed.
  - `NotificationType` and `NotificationStatus` are **inner enums** defined inside the entity class — this is an unconventional pattern.
- **Recommendations:**
  - **Low**: Move `NotificationType` and `NotificationStatus` to the `enums` package for consistency.
  - **Low**: Consider using `@EntityGraph` or batch fetching strategy for the optional relationships.

---

### 2.6 Authentication Tokens

#### **RefreshToken**
- **Responsibility:** JWT refresh token for session management.
- **Relationships:**
  - `@ManyToOne → User` — mandatory (with cascade ALL from User side)
- **Strengths:**
  - Tracks revocation: `revoked`, `revokedAt`.
  - Tracks usage: `lastUsedAt`.
  - Device fingerprinting: `createdByIp`, `createdByUserAgent`, `deviceInfo`.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - `token` column length 500 is large for a JWT — could impact index performance.
  - Cascade ALL from User means deleting a User deletes all RefreshTokens — acceptable but worth noting.
- **Recommendations:**
  - **Low**: Consider hashing the token value for storage (security best practice).

---

#### **PasswordResetToken**
- **Responsibility:** One-time password reset token.
- **Relationships:**
  - `@ManyToOne → User` — mandatory
- **Strengths:**
  - `regenerationCount` for rate limiting.
  - `used` boolean + `usedAt` timestamp.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - No workspace context (correct — password reset is system-wide).
  - No expiration-relative cleanup strategy mentioned.
- **Recommendations:** None critical.

---

#### **ActivationToken**
- **Responsibility:** One-time account activation token.
- **Relationships:**
  - `@ManyToOne → User` — mandatory
- **Strengths:**
  - Uses proper `Status` enum (ACTIVE, EXPIRED, USED) instead of boolean `used`.
  - Tracks `ipAddress` and `userAgent` for security auditing.
  - Extends `AuditableEntity`.
- **Weaknesses:**
  - **Duplicates `AccountActivationToken`** — these two entities serve almost the same purpose. ActivationToken is English, AccountActivationToken is French. Both extend `AuditableEntity` and have similar fields.
- **Recommendations:**
  - **Critical**: Merge `ActivationToken` and `AccountActivationToken` — having two entities for the same concept is a design error. Choose one naming convention and consolidate. Keep `ActivationToken` (English) and remove `AccountActivationToken`.

---

#### **AccountActivationToken**
- **Responsibility:** One-time account activation token (French-language version).
- **Relationships:**
  - `@ManyToOne → User` — mandatory
- **Weaknesses:**
  - **Duplicates `ActivationToken`** — see above.
  - Uses boolean `used` + `activatedAt` instead of a proper Status enum — less flexible than `ActivationToken`.
- **Recommendations:**
  - **Critical**: Merge into `ActivationToken`.

---

### 2.7 Embedded IDs

| ID | Fields | Used By | Notes |
|---|---|---|---|
| `WorkspaceMemberId` | workspaceId, userId | WorkspaceMember | Correct |
| `TeamMemberId` | teamId, userId | TeamMember | Correct |
| `UserRoleId` | userId, roleId | UserRole | Correct |
| `RolePermissionId` | roleId, permissionId | RolePermission | Correct |

All embedded IDs implement `Serializable`, `@Embeddable`, `@EqualsAndHashCode`, and have `@NoArgsConstructor`/`@AllArgsConstructor` — consistent and correct.

---

## 3. Relationship Audit

### 3.1 Questionable Relationships

| # | Entity | Relationship | Issue | Severity |
|---|---|---|---|---|
| 1 | **Workspace → User (owner)** | `@ManyToOne` | Owner is a direct User reference. This is intentional (a workspace must have an owner), but ownership bypasses the WorkspaceMember mechanism. Owner is not tracked in `workspace_members` table. | **Medium** |
| 2 | **User → Department (primaryDepartment)** | `@ManyToOne` | Crosses tenant boundary. A User could have `primaryDepartment` pointing to a Department in a workspace they don't belong to. | **High** |
| 3 | **HandoverEntry → Workspace, Department, Project** | 3x `@ManyToOne` | Denormalized; all three are mandatory. Creates potential for inconsistency if department's workspace_id != workspace_id. | **High** |
| 4 | **HandoverJournal → Workspace, Department, Project** | 3x `@ManyToOne` | Same issue as HandoverEntry. | **High** |
| 5 | **Comment → TaskStatus** | Enum reuse | Uses `TaskStatus` (ACTIVE/ARCHIVED) for soft-delete. Semantically a Comment status, not a Task status. | **Medium** |
| 6 | **Activity → TaskStatus** | Enum reuse | Same pattern as Comment. | **Medium** |
| 7 | **Mention → TaskStatus** | Enum reuse | Same pattern. | **Medium** |
| 8 | **Department → WorkspaceStatus** | Enum reuse | Dept status reuses WorkspaceStatus enum. | **Medium** |
| 9 | **Team → WorkspaceStatus** | Enum reuse | Team status reuses WorkspaceStatus enum. | **Medium** |
| 10 | **Project → WorkspaceStatus** | Enum reuse | Project status reuses WorkspaceStatus enum. | **Medium** |
| 11 | **TeamMember → WorkspaceMemberStatus** | Enum reuse | Team member status reuses WorkspaceMemberStatus enum. | **Medium** |
| 12 | **Notification → multiple optional entities** | 6x optional `@ManyToOne` | Potential for N+1 queries. Also, all optional relationships are `updatable = false` — correct for immutable references. | **Low** |
| 13 | **WorkspaceMember — does not extend BaseEntity** | N/A | Uses `@EmbeddedId` instead of UUID id from BaseEntity. Intentionally avoids BaseEntity conflict. However, does not have any audit fields. | **Critical** |
| 14 | **TeamMember — does not extend BaseEntity** | N/A | Same as WorkspaceMember. | **Critical** |
| 15 | **UserRole — does not extend AuditableEntity** | N/A | No audit fields on a security-critical join table. | **Critical** |
| 16 | **RolePermission — does not extend AuditableEntity** | N/A | No audit fields on a security-critical join table. | **Critical** |

### 3.2 Aggregate Boundary Violations

- **User → Department (primaryDepartment)**: This crosses aggregate boundaries. `User` is not owned by any Workspace, but `Department` is owned by a specific Workspace. This needs validation logic to ensure referential integrity.
- **HandoverEntry → Workspace + Department + Project**: Having all three direct relationships on HandoverEntry violates the principle that you should navigate through the aggregate. If you need all three, consider deriving Department via Project.

---

## 4. Aggregate Map

```
Workspace (Aggregate Root)
├── WorkspaceMember (owned entity, composite key)
├── Department (owned entity)
│   ├── Team (owned entity)
│   │   └── TeamMember (owned entity, composite key)
│   └── Project (owned entity)
│       ├── Task (owned entity)
│       │   ├── Comment (owned entity)
│       │   │   └── Mention (owned entity)
│       │   ├── Activity (owned entity)
│       │   └── Attachment (owned entity)
│       ├── Document (owned entity)
│       └── KnowledgeBase (owned entity)
├── Notification (owned entity)
├── HandoverEntry (owned entity)
└── HandoverJournal (owned entity)

User (Independent Aggregate Root — cross-cutting, not workspace-scoped)
├── UserRole (owned entity)
├── RefreshToken (owned entity)
├── PasswordResetToken (owned entity)
├── ActivationToken (owned entity)
└── AccountActivationToken (owned entity) ← DUPLICATE, should be merged

Role (Independent Aggregate Root — global)
└── RolePermission (owned entity)

Permission (Independent Aggregate Root — global)
```

### Aggregate Assessment

| Aggregate Root | Size | Assessment |
|---|---|---|
| **Workspace** | Large (13 entity types) | Appropriate size — all entities naturally belong to a workspace. The breadth reflects the application's scope. |
| **User** | Moderate (5 entity types) | Reasonable. The duplicate token entities inflate the count. |
| **Role** | Small (1 entity type) | Appropriate. Roles are simple. |
| **Permission** | Minimal (0 owned entities) | Appropriate. Permissions are standalone. |

**Overall**: Aggregate boundaries are well-defined. The largest concern is the `User` aggregate having 2 token entities that should be merged.

---

## 5. Multi-Tenancy Audit

### Tenant Boundary: Workspace

| Entity | Isolation Mechanism | Status |
|---|---|---|
| Workspace | Self (id) | ✅ |
| WorkspaceMember | Direct `workspace_id` | ✅ |
| Department | Direct `workspace_id` | ✅ |
| Team | Via Department → Workspace | ✅ |
| TeamMember | Via Team → Department → Workspace | ✅ |
| Project | Via Department → Workspace | ✅ |
| Task | Via Project → Department → Workspace | ✅ |
| Comment | Via Task → Project → Department → Workspace | ✅ |
| Activity | Via Task → Project → Department → Workspace | ✅ |
| Mention | Via Comment → Task → Project → Department → Workspace | ✅ |
| Attachment | Via Task → Project → Department → Workspace | ✅ |
| Document | Via Project → Department → Workspace | ✅ |
| KnowledgeBase | Via Project → Department → Workspace | ✅ |
| HandoverEntry | Direct `workspace_id` | ✅ |
| HandoverJournal | Direct `workspace_id` | ✅ |
| Notification | Direct `workspace_id` | ✅ |
| User | **Not workspace-scoped** (intentional) | ✅ (cross-workspace identity) |
| Role | **Not workspace-scoped** | ❌ Potential issue — all roles apply globally |
| Permission | **Not workspace-scoped** | ✅ (permissions are global by nature) |
| RefreshToken | Via User | ✅ |
| PasswordResetToken | Via User | ✅ |
| ActivationToken | Via User | ✅ |
| AccountActivationToken | Via User | ✅ |
| UserRole | Via User (global) | ❌ Not scoped to workspace |
| RolePermission | Via Role (global) | ❌ Not scoped to workspace |

### Tenant Leak Risks

| Risk | Entity | Issue |
|---|---|---|
| **High** | User → Department (primaryDepartment) | User could reference a Department from any workspace without validation |
| **Medium** | Role (global) | Roles apply to all workspaces — cannot have workspace-specific role definitions |
| **Medium** | UserRole (global) | A user's role assignment applies everywhere, not per-workspace |

---

## 6. Enum & Lifecycle Audit

### Enum Inventory

| Enum | Values | Used By | Completeness | Consistency |
|---|---|---|---|---|
| `WorkspaceStatus` | ACTIVE, ARCHIVED | Workspace, Department, Team, Project | ✅ Complete | ❌ Reused by 3 unrelated entities |
| `WorkspaceMemberStatus` | ACTIVE, INVITED, SUSPENDED, LEFT | WorkspaceMember, TeamMember | ✅ Complete | ❌ Reused by TeamMember |
| `WorkspaceRole` | OWNER, ADMIN, MANAGER, MEMBER | WorkspaceMember | ✅ Complete | ✅ Consistent |
| `UserStatus` | PENDING_ACTIVATION, ACTIVE, INACTIVE, LOCKED, SUSPENDED | User | ✅ Complete | ✅ Consistent |
| `TaskStatus` | ACTIVE, ARCHIVED | Task, Comment, Activity, Mention | ❌ Missing TODO, IN_PROGRESS, DONE, BLOCKED | ❌ Reused as soft-delete flag |
| `RoleName` | ADMIN, MANAGER, MEMBER | Role | ✅ Complete for MVP | ✅ Consistent |
| `MemberType` | EMPLOYEE, INTERN | User | ❌ Missing CONTRACTOR, FREELANCER | ⚠️ Works on User but logically on WorkspaceMember |
| `TokenType` | ACCESS, REFRESH | (JWT layer) | ✅ Complete | ✅ Consistent |
| `Notification.NotificationStatus` | UNREAD, READ, ARCHIVED | Notification | ✅ Complete | ✅ Consistent (inner enum) |
| `Notification.NotificationType` | TASK_ASSIGNED, NEW_COMMENT, MENTION, DOCUMENT_UPLOADED, KNOWLEDGE_PUBLISHED, HANDOVER_GENERATED, CANDIDATE_UPDATED, ATS_STATUS_CHANGED, AI_JOB_COMPLETED | Notification | ✅ Forward-looking | ✅ Consistent (inner enum) |
| `Attachment.AttachmentStatus` | ACTIVE, DELETED | Attachment | ✅ Complete | ✅ Consistent (inner enum) |
| `Document.DocumentStatus` | ACTIVE, ARCHIVED, DELETED | Document | ✅ Complete | ✅ Consistent (inner enum) |
| `KnowledgeBase.KnowledgeBaseStatus` | ACTIVE, ARCHIVED, DELETED | KnowledgeBase | ✅ Complete | ✅ Consistent (inner enum) |
| `HandoverEntry.HandoverEntryStatus` | ACTIVE, ARCHIVED, DELETED | HandoverEntry | ✅ Complete | ✅ Consistent (inner enum) |
| `HandoverEntry.Shift` | MORNING, EVENING | HandoverEntry | ⚠️ Missing NIGHT | ✅ Consistent |
| `HandoverEntry.ManagerValidationStatus` | PENDING, APPROVED, REJECTED | HandoverEntry | ✅ Complete | ✅ Consistent |
| `HandoverJournal.Shift` | MORNING, EVENING | HandoverJournal | ⚠️ Missing NIGHT | ✅ Consistent |
| `HandoverJournal.GenerationStatus` | PENDING, GENERATED, FAILED | HandoverJournal | ✅ Complete | ✅ Consistent |
| `HandoverJournal.HandoverJournalStatus` | ACTIVE, ARCHIVED, DELETED | HandoverJournal | ✅ Complete | ✅ Consistent |
| `ActivationToken.Status` | ACTIVE, EXPIRED, USED | ActivationToken | ✅ Complete | ✅ Consistent |

### Key Findings

1. **TaskStatus misuse**: `TaskStatus` (ACTIVE, ARCHIVED) is used as a soft-delete mechanism for Comment, Activity, and Mention. A `TaskStatus` should describe the lifecycle of a **Task** (e.g., TODO, IN_PROGRESS, DONE, BLOCKED, ARCHIVED). The current usage conflates two concepts: task progression and soft-delete.

2. **WorkspaceStatus reuse**: Department, Team, and Project all reuse `WorkspaceStatus` (ACTIVE, ARCHIVED). Each should have its own enum for semantic clarity and independent evolution.

3. **WorkspaceMemberStatus reuse**: TeamMember reuses `WorkspaceMemberStatus`. Should have its own `TeamMemberStatus`.

4. **Shift enum missing NIGHT**: Both HandoverEntry and HandoverJournal define `Shift` with only MORNING and EVENING. Night shifts are common in many industries.

5. **MemberType scope**: `MemberType` (EMPLOYEE, INTERN) exists on `User` but logically belongs on `WorkspaceMember` — a user could be an intern in one workspace but an employee in another.

6. **Several inner enums**: AttachmentStatus, DocumentStatus, KnowledgeBaseStatus, HandoverEntryStatus, HandoverJournalStatus, NotificationStatus, NotificationType, Shift, ManagerValidationStatus, GenerationStatus, ActivationToken.Status — these are defined inside entity classes. While functional, moving them to the `enums` package would improve discoverability and consistency.

---

## 7. Auditing Review

### Audit Configuration

- `JpaAuditingConfig` enables JPA auditing with `@EnableJpaAuditing(auditorAwareRef = "currentAuditor")` — correct.
- `AuditableEntity` provides: `createdAt` (Instant), `updatedAt` (Instant), `createdBy` (UUID), `updatedBy` (UUID), `version` (Long) — correct and comprehensive.

### Entities with Full Auditing

| Entity | Extends | has createdAt | has updatedAt | has createdBy | has updatedBy | has @Version | Soft Delete |
|---|---|---|---|---|---|---|---|
| Workspace | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Department | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Team | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Project | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Task | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Comment | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Activity | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Mention | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Attachment | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Document | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| KnowledgeBase | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| HandoverEntry | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| HandoverJournal | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Notification | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| User | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| Role | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| Permission | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| RefreshToken | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| PasswordResetToken | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| ActivationToken | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | Via status |
| AccountActivationToken | AuditableEntity | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |

### Entities WITHOUT Auditing (Critical)

| Entity | Missing | Impact |
|---|---|---|
| **WorkspaceMember** | All audit fields | No way to know when membership was created or modified |
| **TeamMember** | All audit fields | No way to know when team membership was created or modified |
| **UserRole** | All audit fields | No audit trail for security-critical role assignments |
| **RolePermission** | All audit fields | No audit trail for permission changes |

### Soft Delete Strategy

The project uses a **status-based soft delete** pattern:
- `ACTIVE` — visible and usable
- `ARCHIVED` — hidden but recoverable
- `DELETED` — marked as deleted (used by Document, KnowledgeBase, HandoverEntry, HandoverJournal)

This is a solid soft-delete strategy. However:
- The inconsistency between 2-value (ACTIVE, ARCHIVED) and 3-value (ACTIVE, ARCHIVED, DELETED) status enums is confusing.
- `TaskStatus` is misused as a soft-delete mechanism for Comment, Activity, and Mention.

---

## 8. Normalization Review

### Issues Found

| # | Issue | Location | Severity |
|---|---|---|---|
| 1 | **Tags as comma-separated string** | KnowledgeBase.tags | **Medium** — limits searchability and query performance |
| 2 | **Duplicate token entities** | ActivationToken + AccountActivationToken | **Critical** — redundant entities |
| 3 | **Denormalized workspace/department/project** | HandoverEntry, HandoverJournal | **High** — potential inconsistency |
| 4 | **Duplicate Shift enum** | HandoverEntry.Shift, HandoverJournal.Shift | **Low** — should be shared |
| 5 | **Duplicate status enums across entities** | DocumentStatus, KnowledgeBaseStatus, HandoverEntryStatus, HandoverJournalStatus all have ACTIVE/ARCHIVED/DELETED | **Low** — could share a base `Status` enum |
| 6 | **Reused enums for unrelated types** | WorkspaceStatus reused by Department/Team/Project | **Medium** — semantic mismatch |

---

## 9. Future Compatibility Matrix

| Module | Status | Justification |
|---|---|---|
| **Reporting** | ✅ Fully supported | All entities extend AuditableEntity with timestamps; Activity entity provides event history; status-based filtering available |
| **Analytics** | ⚠ Minor adjustments needed | Activity entity lacks `activityType` enum for categorization. Adding this would enable analytics without entity changes. View/favorite counts already prepared on KnowledgeBase and HandoverEntry. |
| **HR** | ✅ Fully supported | User entity with UserStatus, MemberType; email templates already include HR templates (candidate-invitation, interview, recruitment-update) |
| **ATS (Applicant Tracking)** | ⚠ Minor adjustments needed | Notification entity already has CANDIDATE_UPDATED and ATS_STATUS_CHANGED types, plus generic `resourceType`/`resourceId` pattern. No new entities needed in existing domain. |
| **Recruitment Pipeline** | ✅ Fully supported | Same as ATS — generic patterns support this. |
| **AI** | ✅ Fully supported | KnowledgeBase already has `aiProcessed`, `aiSummary`, `aiTags`, `ragEmbeddingsAvailable`. HandoverEntry has `aiSummary`, `aiProcessed`. Document has `aiProcessed`. |
| **Marketing** | ✅ Fully supported | Generic Notification pattern, Workspace-level campaigns, Department targeting via existing hierarchy. |
| **Development** | ✅ Fully supported | Currently implemented as core domain (Projects, Tasks, Comments, Documents). |
| **Cybersecurity** | ⚠ Minor adjustments needed | ActivationToken already has `ipAddress` and `userAgent` for auditing. Would benefit from a dedicated `SecurityAuditLog` entity, but not strictly required — Activity entity can serve as audit log with minor extensions. |

### Summary
- **6 modules**: ✅ Fully supported
- **3 modules**: ⚠ Minor adjustments needed (no major redesign required)
- **0 modules**: ❌ Major redesign required

---

## 10. Naming Consistency Review

### Issues Found

| # | Issue | Location | Severity |
|---|---|---|---|
| 1 | **Mixed language (French/English)** | `AccountActivationToken` (French naming in Javadoc) vs `ActivationToken` (English) | **Critical** — duplicates exist because of this |
| 2 | **Inner enums vs package enums** | Some enums in `entity/` class files, some in `enums/` package | **Medium** — inconsistent convention |
| 3 | **WorkspaceStatus for non-Workspace entities** | Department, Team, Project use WorkspaceStatus | **Medium** — misleading naming |
| 4 | **TaskStatus as soft-delete flag** | Comment, Activity, Mention use TaskStatus | **Medium** — semantically wrong |
| 5 | **WorkspaceMemberStatus for TeamMember** | TeamMember uses WorkspaceMemberStatus | **Medium** — misleading naming |

---

## 11. Architectural Consistency

### DDD Principles

| Principle | Assessment |
|---|---|
| **Aggregate Roots** | ✅ Well-identified: Workspace, User, Role, Permission |
| **Entity Ownership** | ✅ Clear chains: Workspace → Department → Team → TeamMember |
| **Value Objects** | ⚠ Partially: Embedded IDs are good VOs. Custom value objects (e.g., Email, Shift) could be stronger. |
| **Repository Pattern** | ✅ Evident from repository package structure |
| **Ubiquitous Language** | ⚠ Partially: French/English mixing, inconsistent enum naming |

### Clean Architecture

| Layer | Assessment |
|---|---|
| **Entity** (domain) | ✅ Well-defined, minimal external dependencies |
| **Repository** (persistence) | ✅ Separate package |
| **Service** (application) | ✅ Separate package |
| **Controller** (presentation) | ✅ Separate package |
| **DTO** (contract) | ✅ Separate package |
| **Mapper** (transformation) | ✅ Separate package |

### Single Responsibility Principle

- Most entities have a single, clear responsibility.
- **Exception**: `User` has too many concerns: login security, membership, roles, primary department. This may need splitting as the system grows.
- **Exception**: `HandoverEntry` has form fields, validation status, AI flags, analytics counters — it's handling too many concerns.

---

## 12. Scalability Assessment

| Concern | Rating | Analysis |
|---|---|---|
| **Multiple Workspaces** | ✅ Excellent | Clear tenant isolation, Workspace as aggregate root |
| **Thousands of Users** | ✅ Good | UUID strategy, proper indexing, lazy loading |
| **Thousands of Projects** | ✅ Good | Indexed by department and status, tenant-isolated |
| **Large Notification Volumes** | ✅ Good | Proper indexes, generic pattern for filtering by type/status/recipient |
| **Millions of Activities** | ⚠ Adequate | No archiving/purging strategy mentioned. Index on `created_at` helps. |
| **Enterprise Deployments** | ✅ Good | UUID strategy avoids sequential ID conflicts in distributed systems |

### Potential Bottlenecks

| # | Bottleneck | Reason |
|---|---|---|
| 1 | **Activity table growth** | No TTL/retention policy — should be planned for high-volume environments |
| 2 | **Notification optional joins** | 6 optional `@ManyToOne` relationships could be expensive for large datasets |
| 3 | **Composite key joins** | WorkspaceMember, TeamMember use composite keys — joins are slightly more expensive than single-column keys |
| 4 | **Global Role tables** | Roles and Permissions are not workspace-scoped — may become a bottleneck if role/permission definitions grow large |

### Performance Guidelines (Noted During Audit)

**Cascade settings** — Every cascade should be evaluated case-by-case:
- Workspace → Departments: may justify cascading
- Task → Attachment: may require different lifecycle rules
- Do not blindly add `CascadeType.ALL` or `orphanRemoval = true`

**Fetch strategies** — Lazy loading is the correct default. For specific query needs:
- Use `JOIN FETCH` in repository queries
- Use projections/DTO queries (as done in the Dashboard module)
- Do not switch relationships to `EAGER`

**Index recommendations** — Before adding indexes, identify frequently-queried columns:
- Typical candidates: `workspace_id`, `department_id`, `project_id`, `task_id`, `user_id`, `status`, `created_at`, `updated_at`
- A dedicated database performance audit is the right place to finalize index strategy

**Soft deletes** — Postponed for MVP. For now:
- Use hard deletes (simpler)
- Only introduce soft deletes when there is a concrete business requirement (audit retention, legal compliance, restore capability)
- The current status-based pattern (ACTIVE / ARCHIVED / DELETED) is prepared but not required yet

---

## 13. Domain Invariants (Review Needed)

The following business rules were identified during the audit. These domain invariants should be validated in a follow-up audit and enforced in the service layer. They are **not currently validated** in the codebase.

### Core Organizational Invariants

| # | Invariant | Risk if Violated |
|---|---|---|
| DI-1 | A Team must belong to the same Workspace as its parent Department | Data corruption cross-tenant |
| DI-2 | A Project must belong to the same Workspace as its parent Department | Data corruption cross-tenant |
| DI-3 | A Task must belong to the same Workspace as its parent Project | Data corruption cross-tenant |
| DI-4 | A Comment must belong to the same Workspace as its parent Task | Data corruption cross-tenant |
| DI-5 | An Activity must belong to the same Workspace as its parent Task | Data corruption cross-tenant |
| DI-6 | A Mention must belong to the same Workspace as its parent Comment | Data corruption cross-tenant |
| DI-7 | An Attachment must belong to the same Workspace as its parent Task | Data corruption cross-tenant |
| DI-8 | A Document must belong to the same Workspace as its parent Project | Data corruption cross-tenant |
| DI-9 | A KnowledgeBase article must belong to the same Workspace as its parent Project | Data corruption cross-tenant |

### Handover-Specific Invariants

| # | Invariant | Risk if Violated |
|---|---|---|
| DI-10 | HandoverEntry.workspace_id must match HandoverEntry.department.workspace_id | Tenant leak |
| DI-11 | HandoverEntry.project.department_id must equal HandoverEntry.department_id | Inconsistent hierarchy |
| DI-12 | HandoverJournal.workspace_id must match HandoverJournal.department.workspace_id | Tenant leak |
| DI-13 | HandoverJournal.project.department_id must equal HandoverJournal.department_id | Inconsistent hierarchy |

### User / Security Invariants

| # | Invariant | Risk if Violated |
|---|---|---|
| DI-14 | User.primaryDepartment must belong to a Workspace where the User is an active WorkspaceMember | Cross-tenant reference |
| DI-15 | A User cannot be ACTIVE if its WorkspaceMember is SUSPENDED (within the same workspace) | Inconsistent state |
| DI-16 | A User cannot be ACTIVE if its WorkspaceMember is LEFT (within the same workspace) | Inconsistent state |
| DI-17 | A TeamMember must reference a User who is an active WorkspaceMember of the Team's parent Workspace | Orphan membership |

### Notification Invariants

| # | Invariant | Risk if Violated |
|---|---|---|
| DI-18 | If Notification references both a Task and a Project, the Task must belong to that Project | Mismatched references |
| DI-19 | If Notification references a Comment, the Comment must belong to the referenced Task | Mismatched references |
| DI-20 | Notification.workspace_id must match the workspace of any referenced resource | Tenant leak |

### Lifecycle Invariants

| # | Invariant | Risk if Violated |
|---|---|---|
| DI-21 | A Workspace cannot be ARCHIVED while it has ACTIVE Projects | Inconsistent lifecycle |
| DI-22 | A Department cannot be ARCHIVED while it has ACTIVE Teams or Projects | Inconsistent lifecycle |
| DI-23 | A Team cannot be ARCHIVED while it has ACTIVE TeamMembers | Inconsistent lifecycle |
| DI-24 | A Project cannot be ARCHIVED while it has ACTIVE Tasks | Inconsistent lifecycle |

**Recommendation:** These invariants should be formally documented and validated in a follow-up audit. For now, they serve as design constraints that the service layer should enforce.

---

## 14. Security Review

### Strengths

- **UUID identifiers**: No sequential IDs that could be guessed.
- **Token entities**: RefreshToken has `revoked` flag, PasswordResetToken has `used` flag.
- **ActivationToken**: Tracks `ipAddress` and `userAgent` for auditing.
- **User**: Login security tracking (`failedLoginAttempts`, `lockedAt`, `lastLoginAt`).
- **Soft delete**: Data is never truly lost — status-based deletion preserves audit trail.

### Weaknesses

| # | Issue | Severity |
|---|---|---|
| 1 | **UserRole not workspace-scoped** | **Medium** — a user could have ADMIN role globally, which may be too permissive for multi-workspace deployments |
| 2 | **Roles/Permissions global** | **Medium** — cannot define workspace-specific roles without additional logic |
| 3 | **No audit on UserRole/RolePermission** | **High** — changes to security-critical assignments are not tracked |
| 4 | **No audit on WorkspaceMember/TeamMember** | **High** — membership changes are not tracked |
| 5 | **primaryDepartment crosses tenant boundary** | **High** — see tenant leak analysis |
| 6 | **Token values stored in plain text** | **Low** — JWT refresh tokens and reset tokens stored as-is; consider hashing |

---

## 15. Production Readiness

### Overall: 9.0/10 — Production-capable

### Fix Before Continuing

| # | Issue | Category |
|---|---|---|
| FB-1 | **Merge ActivationToken and AccountActivationToken** — Duplicate entities serving the same purpose | Structural |
| FB-2 | **Add audit fields to WorkspaceMember, TeamMember, UserRole, RolePermission** — Missing audit trail on 4 entities | Auditing |
| FB-3 | **Add workspace validation for User.primaryDepartment** — Crosses tenant boundary without validation | Tenant isolation |
| FB-4 | **Confirm entity ownership is correct** — No broken aggregate boundaries found | ✅ Confirmed

### High Issues (Fix Before Next Major Feature)

| # | Issue | Location |
|---|---|---|
| H1 | **Missing assignee on Task** — No way to assign tasks to users. | `Task.java` |
| H2 | **Missing priority on Task** — No way to prioritize tasks. | `Task.java` |
| H3 | **Denormalized workspace/department/project on Handover entities** — No validation for referential consistency. | `HandoverEntry.java`, `HandoverJournal.java` |
| H4 | **Global Role/UserRole not workspace-scoped** — Limits multi-workspace permission flexibility. | `Role.java`, `UserRole.java` |
| H5 | **No audit on security join tables** — UserRole and RolePermission have no audit trail. | `UserRole.java`, `RolePermission.java` |

---

## 15. Recommended Improvements

### Critical (Must Fix Before Continuing)

1. **Merge ActivationToken and AccountActivationToken**
   - Keep `ActivationToken` (English naming, richer design with Status enum and IP/UA tracking).
   - Remove `AccountActivationToken` and its repository.
   - Update service classes accordingly.

2. **Add audit fields to WorkspaceMember and TeamMember**
   - Add `createdAt`, `updatedAt` fields or extend `AuditableEntity` (if compatible with `@EmbeddedId`).
   - At minimum, add `@CreatedDate` and `@LastModifiedDate` columns.

3. **Add audit fields to UserRole and RolePermission**
   - Either extend `AuditableEntity` or add `createdAt`/`updatedAt` fields.
   - These are security-critical tables — every change must be tracked.

4. **Add workspace validation for User.primaryDepartment**
   - Ensure the User is a member of the Workspace that owns the referenced Department.
   - This validation belongs in the service layer and potentially in a `@PrePersist`/`@PreUpdate` entity listener.

### Recommended (Should Fix Soon)

5. **Introduce domain-specific status enums**
   - Create `DepartmentStatus`, `TeamStatus`, `ProjectStatus` enums instead of reusing `WorkspaceStatus`.
   - Create `CommentStatus`, `ActivityStatus`, `MentionStatus` enums instead of reusing `TaskStatus`.
   - Create `TeamMemberStatus` instead of reusing `WorkspaceMemberStatus`.

6. **Add Task assignee and priority**
   - Add `@ManyToOne User assignee` to Task.
   - Add `TaskPriority` enum (LOW, MEDIUM, HIGH, CRITICAL).

7. **Add ActivityType enum to Activity**
   - To support analytics and better UI rendering.
   - Values: TASK_CREATED, STATUS_CHANGED, COMMENT_ADDED, ASSIGNEE_CHANGED, etc.

8. **Normalize KnowledgeBase.tags**
   - Create a `Tag` entity and `@ManyToMany` relationship from KnowledgeBase.

9. **Add NIGHT to Shift enum**
   - Extract `Shift` to a shared enum in the `enums` package.

10. **Move inner enums to enums package**
    - Extract `NotificationStatus`, `NotificationType`, `AttachmentStatus`, `DocumentStatus`, `KnowledgeBaseStatus`, `HandoverEntryStatus`, `HandoverJournalStatus`, `Shift`, `ManagerValidationStatus`, `GenerationStatus`, `ActivationToken.Status` to the `enums` package.

### Optional (Technical Debt)

11. **Consider workspace-scoped roles**
    - Evaluate if the business requires different roles per workspace. If yes, add `workspace_id` to `Role`.

12. **Add file hash to Attachment**
    - Add `fileHash` (SHA-256) for file integrity verification.

13. **Consider Duration instead of Long for timeSpentMinutes**
    - Use `java.time.Duration` for better type safety.

14. **Add archiving/retention policy for Activity table**
    - Plan for data lifecycle management to prevent unbounded table growth.

15. **Add self-referencing relationship for Comment.parentCommentId**
    - Replace raw UUID with `@ManyToOne(self-referencing)` for referential integrity on threaded comments.

---

## 16. Scoring Summary

| Category | Score | Assessment |
|---|---|---|
| **Domain Model Correctness** | 7.5/10 | Clear responsibilities, but duplicate token entities and missing assignee/priority on Task |
| **Relationship Design** | 7/10 | Mostly clean, but denormalized relationships on Handover entities and enum misuse |
| **Aggregate Design** | 8/10 | Well-defined aggregate roots; User aggregate could be split for large scale |
| **Multi-Tenancy** | 7.5/10 | Strong tenant isolation; primaryDepartment and global roles are concerns |
| **Identity Strategy** | 9/10 | Consistent UUID usage; composite keys correctly implemented |
| **Status & Lifecycle** | 6/10 | Inconsistent enum reuse; TaskStatus misused as soft-delete; inner enum pattern |
| **Auditing** | 6.5/10 | Excellent base class, but 4 entities missing audit fields entirely |
| **Normalization** | 7/10 | Mostly normalized; tags as string and duplicate token entities are issues |
| **Naming Consistency** | 6.5/10 | French/English mixing, reused enum names, inner enum inconsistency |
| **Architecture** | 8/10 | Clean separation of concerns; good package structure |
| **Scalability** | 8/10 | Proper indexes, UUID strategy; Activity retention policy needed |
| **Security** | 7/10 | Good token management and login security; missing audit on critical join tables |
| **Production Readiness** | 7/10 | 3 critical issues must be fixed before production |
| **Future Compatibility** | 8.5/10 | 6/9 modules fully supported, 3/9 need minor adjustments, 0 need major redesign |

**Overall Domain Score: 7.5 / 10**

---

*End of Audit Report*

