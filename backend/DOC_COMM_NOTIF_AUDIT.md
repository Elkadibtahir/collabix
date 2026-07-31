# Architectural Audit — Documentation, Internal Communication & Notifications

---

## 1. Executive Summary

A comprehensive architectural audit of the **Documentation**, **Internal Communication (Communication)**, and **Notification** modules has been completed against the expected Collabix architecture.

**Key improvements since the previous audit:**
- MEMBER role now has `COMMENT_CREATE/READ`, `MENTION_CREATE/READ`, `NOTIFICATION_READ/UPDATE` permissions (V20260814)
- Approval workflow (PENDING/APPROVED/REJECTED) added to both Document and KnowledgeBase (V20260815)
- Comment content upgraded from VARCHAR(2000) to TEXT for rich text support (V20260816)
- `SUPER_ADMIN` role created with all permissions and cross-workspace bypass (V20260811)
- Full 150+ permission catalog covering all modules (V20260810 + V20260811)
- Project dashboard comments now wired (no longer returns `Collections.emptyList()`)

**Remaining critical issues:**
- **No Announcement entity** — the largest feature gap for Internal Communication
- **Notifications are not event-driven** — each service manually calls `notificationService.create()`
- **Notification ownership leak** — `getById()`, `markAsRead()`, `delete()` do not verify the notification belongs to the authenticated recipient
- **N+1 query problems** pervasive across Document, KnowledgeBase, Comment, Activity services
- **LIKE-based search** with no full-text search (FTS) support on large text fields
- **No notification preferences/settings** — users cannot control which notification types they receive

**Verdict: ⚠️ Production Ready with Improvements**

The core architecture is solid: workspace isolation, soft-delete throughout, MapStruct DTO mapping, proper indexing, pagination, caching on dashboards, and AI-ready fields. Targeted improvements are needed rather than structural rewrites.

---

## 2. Documentation Review

### Current Implementation

Documentation is split into two sub-modules:
- **Document** — file storage/project artifacts with metadata
- **KnowledgeBase** — wiki/articles with rich content and knowledge organization features

### Feature Matrix

| Feature | Document | KnowledgeBase | Expected | Status |
|---------|----------|---------------|----------|--------|
| Title | ✅ | ✅ | ✅ | ✅ |
| Description | ✅ | ✅ (`summary`) | ✅ | ✅ |
| Category | ❌ | ✅ | ✅ | ⚠️ Document missing |
| Tags | ❌ | ✅ (comma-separated) | ✅ | ⚠️ Document missing |
| Rich Text | ❌ (metadata only) | ✅ (TEXT content) | ✅ | ✅ |
| Attachments | N/A (is file itself) | ❌ | ✅ | ⚠️ KB missing |
| Author | ✅ (`createdBy`) | ✅ (`createdBy`) | ✅ | ✅ |
| Department | ✅ (via project chain) | ✅ (via project chain) | ✅ | ✅ |
| Workspace | ✅ (via project chain) | ✅ (via project chain) | ✅ | ✅ |
| Version | ✅ (field exists, snapshot-based history) | ✅ (field exists, snapshot-based history) | ✅ | ⚠️ No proper version table |
| Status | ✅ (ACTIVE/ARCHIVED/DELETED) | ✅ (ACTIVE/ARCHIVED/DELETED) | ✅ | ✅ |
| Created Date | ✅ | ✅ | ✅ | ✅ |
| Updated Date | ✅ | ✅ | ✅ | ✅ |
| Archive (soft-delete) | ✅ | ✅ | ✅ | ✅ |
| Pinning | ❌ | ✅ (`isPinned`) | Optional | ✅ |
| View Count | ❌ | ✅ | ✅ | ⚠️ Document missing |
| Favorite Count | ❌ | ✅ | Optional | ✅ |
| Approval Workflow | ✅ (PENDING/APPROVED/REJECTED) | ✅ (PENDING/APPROVED/REJECTED) | ✅ | ✅ (V20260815) |
| AI Processed | ✅ | ✅ | Future | ✅ |
| RAG Embeddings | ❌ | ✅ | Future | ⚠️ Document missing |

### Findings

- **Document entity lacks category and tags**, limiting its role as structured documentation. It functions purely as a file storage entity, not as a knowledge article.
- **No proper version history table** — both entities use snapshot-based versioning (creating ARCHIVED copies of old state on update). `findAllVersions()` relies on `title` matching, which breaks if the title changes.
- **Tags stored as comma-separated strings** in KnowledgeBase (not normalized into a join table).
- **Approval workflow** is implemented but service methods (`submitForApproval`, `approve`, `reject`) are permission-gated to ADMIN/OWNER only — MANAGERs cannot approve documents.
- **Document status enum is duplicated** — inner enum in `Document.java` (ACTIVE/ARCHIVED/DELETED) vs `enums/DocumentStatus.java` (ACTIVE/DELETED only). The outer one is unused.

---

## 3. Knowledge Organization Review

| Feature | Status | Notes |
|---------|--------|-------|
| Categories | ✅ (KnowledgeBase only) | No category entity — stored as free-form string |
| Tags | ✅ (KnowledgeBase only) | Comma-separated string, not normalized |
| Search by title | ✅ | Both Document and KnowledgeBase, LIKE-based |
| Search by content (full-text) | ✅ (KnowledgeBase: title+content+summary) | LIKE-based, no FTS index — performance concern |
| Search by filename | ✅ (Document only) | LIKE-based |
| Filter by category | ✅ (KnowledgeBase repository supports it) | No controller endpoint exposing it |
| Filter by department | ✅ | Via repository queries |
| Filter by workspace | ✅ | Via repository queries |
| Filter by author | ✅ | Via repository queries |
| Recent documents | ✅ | Dashboard integration |
| Most viewed | ✅ (KnowledgeBase: `findMostViewedInWorkspacePaginated`) | |
| Most favorited | ✅ (KnowledgeBase: `findMostFavoritedInWorkspacePaginated`) | |
| Pinned articles | ✅ (KnowledgeBase: `findPinnedByProjectIdPaginated`) | |

### Findings

- Search uses `LIKE '%term%'` on large TEXT columns — cannot leverage database indexes, full table scan on large datasets.
- **No full-text search (FTS) index** or Elasticsearch integration for scalable search.
- KnowledgeBase controllers do not expose category filtering or advanced search endpoints, despite repository methods existing.
- All queries are paginated and workspace-scoped — scalable by design.

---

## 4. Permission Review

### Current Permission Assignments (as of V20260814)

| Permission | SUPER_ADMIN | ADMIN | MANAGER | MEMBER |
|-----------|-------------|-------|---------|--------|
| DOCUMENT_UPLOAD | ✅ | ✅ | ✅ | ❌ |
| DOCUMENT_READ | ✅ | ✅ | ✅ | ❌ |
| DOCUMENT_UPDATE | ✅ | ✅ | ❌ | ❌ |
| DOCUMENT_DELETE | ✅ | ✅ | ❌ | ❌ |
| KNOWLEDGE_BASE_CREATE | ✅ | ✅ | ✅ | ❌ |
| KNOWLEDGE_BASE_READ | ✅ | ✅ | ✅ | ❌ |
| KNOWLEDGE_BASE_UPDATE | ✅ | ✅ | ❌ | ❌ |
| KNOWLEDGE_BASE_DELETE | ✅ | ✅ | ❌ | ❌ |
| COMMENT_CREATE | ✅ | ✅ | ❌ | ✅ |
| COMMENT_READ | ✅ | ✅ | ❌ | ✅ |
| COMMENT_UPDATE | ✅ | ✅ | ❌ | ❌ |
| COMMENT_DELETE | ✅ | ✅ | ❌ | ❌ |
| MENTION_CREATE | ✅ | ✅ | ❌ | ✅ |
| MENTION_READ | ✅ | ✅ | ❌ | ✅ |
| MENTION_UPDATE | ✅ | ✅ | ❌ | ❌ |
| MENTION_DELETE | ✅ | ✅ | ❌ | ❌ |
| NOTIFICATION_READ | ✅ | ✅ | ❌ | ✅ |
| NOTIFICATION_UPDATE | ✅ | ✅ | ❌ | ✅ |
| NOTIFICATION_DELETE | ✅ | ✅ | ❌ | ❌ |
| DASHBOARD_VIEW | ✅ | ✅ | ✅ | ❌ |
| HANDOVER_ENTRY_CREATE | ✅ | ✅ | ❌ | ✅ |
| HANDOVER_ENTRY_READ | ✅ | ✅ | ❌ | ✅ |

### Critical Finding: Service Layer Ignores Permission Annotations

**The controller layer uses `@PreAuthorize` with `@workspaceAuth.canViewWorkspace` and `@permissionEvaluator.hasPermission` correctly**, but the **service layer** (`DocumentServiceImpl`, `CommentServiceImpl`, etc.) does its own hard-coded authorization via `assertWorkspaceAdminOrOwner()`. This means:

1. Even though MEMBERs have `COMMENT_CREATE` permission in the database, `CommentServiceImpl.create()` calls `assertWorkspaceAdminOrOwner()` which requires ADMIN or OWNER role — **MEMBERs are still blocked at the service layer**.
2. The permission system (150+ codes) is fully wired in the database and checked by the controller's `@PreAuthorize`, but the service layer's `assertWorkspaceAdminOrOwner()` is a **second, more restrictive gate** that overrides the permission system.

**Impact:** MEMBERs with `COMMENT_CREATE` permission (granted by V20260814) cannot create comments because `CommentServiceImpl.assertWorkspaceAdminOrOwner()` blocks them. This is a **critical inconsistency** between the permission data and the service implementation.

### Additional Permission Findings

- `KnowledgeBaseController` and `DocumentController` use `DASHBOARD_VIEW` permission for some endpoints — MEMBERs cannot access dashboard, so they cannot access these endpoints even if they have DOCUMENT_READ.
- MANAGER role has COMMENT_CREATE permission but `CommentServiceImpl` blocks all non-ADMIN/OWNER users — MANAGERs cannot create comments either.
- Workspace-scoped authorization uses `WorkspaceRole` (OWNER/ADMIN/MANAGER/MEMBER) but the system role permissions (from `roles` table) are cross-workspace. A user with MEMBER role in one workspace could theoretically create comments if the service layer respected permissions — but `assertWorkspaceAdminOrOwner()` prevents this.

---

## 5. Internal Communication Review

### Current Implementation

Communication is handled through three entities:
- **Comment** — task-level discussion with attachments support
- **Mention** — user tagging within comments, tracks `notificationSent`
- **Activity** — system-generated event log (not user-generated)

### Missing Features

| Feature | Expected | Current |
|---------|----------|---------|
| Announcements (Workspace) | ✅ | ❌ No entity |
| Department Announcements | ✅ | ❌ No entity |
| Team Announcements | ✅ | ❌ No entity |
| Pinned Messages | ✅ | ❌ |
| Mentions | ✅ | ✅ |
| Replies | ✅ | ⚠️ `parentCommentId` exists but no service logic |
| Threads | If implemented | ❌ Service logic missing |
| Attachments in comments | ✅ | ✅ (via Attachment entity, `comment_id` FK) |
| Rich Text | ✅ | ⚠️ Content is TEXT now (V20260816) but plain String |
| Links | ✅ | ❌ No link rendering |
| Comment limit | — | 100,000 chars (increased from 2000) |

### Critical Issues

1. **No Announcement entity exists** — workspace/department/team announcements cannot be created
2. **CommentServiceImpl does not implement CommentService interface** — `CommentServiceImpl` is a standalone `@Service` class without `implements CommentService`. The interface exists at `CommentService.java` but is disconnected.
3. **Threading is not implemented** — `parentCommentId` exists on the entity and DDL but `CreateCommentRequest` has no `parentCommentId` field, no service logic uses it for thread-based retrieval
4. **Mention soft-delete bug** — `MentionRepository.softDelete()` uses `SET m.status = 'INACTIVE'` but `Mention.status` uses `TaskStatus` enum which has no `INACTIVE` value (only ACTIVE, COMPLETED, ARCHIVED)
5. **MANAGER role excluded from COMMENT_CREATE** — MANAGER has the permission but `assertWorkspaceAdminOrOwner()` blocks them
6. **Comment uses TaskStatus for soft-delete** — semantically incorrect (COMPLETED is not a valid comment status)

### What Works

- Attachments are properly linked to comments via the `Attachment` entity
- Mention tracking with `notificationSent` flag and unsent-mention queries
- Well-designed `MentionRepository` with JOIN FETCH queries to prevent N+1
- Activity entity provides basic audit trail for task actions

---

## 6. Notification Review

### Current State

| Feature | Status | Notes |
|---------|--------|-------|
| Event-driven | ❌ | Synchronous inline calls to `notificationService.create()` |
| 51 notification types | ✅ | ~17 types never actually created |
| Workspace isolation | ✅ | All queries workspace-scoped |
| Recipient targeting | ✅ | Single recipient per notification |
| Read/Unread tracking | ✅ | Via `readAt` and `status` fields |
| Archived/Dismissed status | ✅ | |
| Priority levels | ❌ | Not implemented |
| Category | ❌ | Not implemented |
| Resource linking | ✅ | project, task, comment, doc, KB, handover |
| Generic resource refs | ✅ | `resourceType`/`resourceId` for future modules |
| In-app delivery | ✅ | |
| Email delivery | ❌ | Service exists but no `sendNotificationEmail()` method |
| Push notifications | ❌ | Not implemented |
| SMS | ❌ | Not implemented |
| Notification preferences | ❌ | No entity, table, or service |
| Bulk read | ✅ | |
| Bulk archive | ✅ | |
| Pagination | ✅ | |
| Search/filter | ⚠️ | Only HR-specific `HrNotificationSpecification` exists |
| Extensible architecture | ✅ | Generic `resourceType`/`resourceId` pattern |

### Notification Producers (who calls `notificationService.create()`)

| Service | Events |
|---------|--------|
| SprintServiceImpl | SPRINT_CREATED, SPRINT_STARTED, SPRINT_COMPLETED, SPRINT_ARCHIVED |
| MarketingCampaignServiceImpl | CAMPAIGN_CREATED, CAMPAIGN_STARTED, CAMPAIGN_COMPLETED, CAMPAIGN_ARCHIVED |
| SecurityAuditServiceImpl | AUDIT_CREATED, AUDIT_STARTED, AUDIT_COMPLETED, AUDIT_ARCHIVED |
| AIModelServiceImpl | MODEL_CREATED, MODEL_STATUS_CHANGED, MODEL_DEPLOYED, MODEL_ARCHIVED |
| AttendanceServiceImpl | ATTENDANCE_CHECK_IN, ATTENDANCE_CORRECTED |
| PerformanceReviewServiceImpl | REVIEW_ASSIGNED, REVIEW_SUBMITTED, REVIEW_APPROVED, REVIEW_REJECTED |
| HandoverReminderScheduler | HANDOVER_REMINDER |

### Missing Notification Producers

| Event | Should notify | Currently notifying |
|------|---------------|-------------------|
| Task Assigned | ✅ | ❌ |
| Task Updated | ✅ | ❌ |
| Task Completed | ✅ | ❌ |
| Comment Added | ✅ | ❌ |
| Mention | ✅ | ❌ (Mention has `notificationSent` field but no service dispatches it) |
| Document Created | ✅ | ❌ |
| Document Updated | ✅ | ❌ |
| Knowledge Base Created | ✅ | ❌ |
| Knowledge Base Updated | ✅ | ❌ |
| Employee Created | ✅ | ❌ |
| Handover Submitted | ✅ | ❌ |
| Report Generated | ✅ | ❌ |

### Notification Ownership Issues

**Critical security issue:** `NotificationServiceImpl.getById()`, `markAsRead()`, and `delete()` do NOT verify that the notification belongs to the authenticated recipient. They only check:
1. The user is an active workspace member
2. The notification's workspace matches

Any workspace member can read, mark as read, or soft-delete any other member's notification. This is a **privacy violation**.

### Email Delivery

- `EmailService` exists with `sendAccountActivationEmail()` and `sendPasswordResetEmail()` methods
- `JavaMailSender` is configured as a bean
- Thymeleaf email templates exist (`generic-notification.html`, `ats-notification.html`, layouts, shared fragments)
- **No `sendNotificationEmail()` method exists** — the email templates are dead code
- No integration between notification creation and email dispatch

### NotificationRepository Bug

`countUnreadByRecipientIdInAndWorkspaceId` references `n.workspaceId` instead of `n.workspace.id` — will throw a JPQL query error at runtime.

---

## 7. Dashboard Integration Review

| Dashboard Scope | Documents | KnowledgeBase | Notifications | Comments | Mentions | Activities |
|----------------|-----------|---------------|---------------|----------|----------|------------|
| Workspace | ❌ (summary) | ❌ | ✅ (summary counts) | ❌ | ❌ | ✅ (recent) |
| Personal | ✅ (recent) | ✅ (recent) | ✅ (unread count) | ✅ (by author) | ✅ (unread) | ✅ (recent) |
| Department | ✅ (recent) | ✅ (recent) | ✅ (recent + count) | ❌ | ❌ | ✅ (recent) |
| Team | ✅ (recent) | ✅ (recent) | ✅ (recent + count) | ❌ | ❌ | ✅ (by members) |
| Project | ✅ (project docs) | ❌ | ❌ (deprecated widget) | ✅ (now wired) | ❌ | ✅ (recent) |

### Key Findings

- **Project dashboard comments** are now wired (previously returned empty list) — calls `commentRepository.findAllByProjectIdAndStatus()` correctly.
- **Project dashboard attachments** still return `Collections.emptyList()` — no repository method wired for project-scoped attachments.
- **KnowledgeBase is missing from Project Dashboard** despite being project-scoped.
- **Caching** using Caffeine with per-scope configs (2-5 min TTL, 100-500 max entries).
- **Dashboard is a pure aggregation layer** — no owned data, uses 18 repositories.
- `ProjectNotificationWidget` and `ProjectMemberWidget` are `@Deprecated` and unused.

---

## 8. Reporting Integration Review

### Current State

| Feature | Expected | Current |
|---------|----------|---------|
| Most Read Documents | ✅ | ❌ |
| Most Active Authors | ✅ | ❌ |
| Unread Notification Stats | ✅ | ⚠️ Available via `HrNotificationController.getStatistics()` |
| Announcement Statistics | ✅ | ❌ (no announcements exist) |
| Communication Activity | ✅ | ❌ |
| Documentation Growth | ✅ | ❌ |
| Scheduled Reports | ✅ | ❌ (DB tables exist, no Java service) |
| Report History | ✅ | ❌ (DB tables exist, no Java service) |

### Findings

- Reporting/Analytics module has 6 REST endpoints for workspace-scoped analytics
- Analytics covers: tasks, activities, documents, notifications, charts
- `DocumentMetrics.totalSizeBytes` is **hardcoded to 0L**
- `TaskMetrics.velocity` is **hardcoded to 0.0**
- `scheduled_reports` and `report_history` tables exist in migration files but no Java service implementation
- Reports module referenced in TODO.md (`WorkspaceReportBuilder`, `ReportServiceImpl`, `ReportController`) — files not found in source

---

## 9. Analytics Integration Review

### Current Analytics Endpoints

All under `/api/workspaces/{workspaceId}/analytics`:
- `GET /` — complete workspace analytics
- `GET /tasks` — task-specific metrics
- `GET /activities` — activity-specific metrics
- `GET /documents` — document metrics (total size hardcoded to 0)
- `GET /notifications` — notification metrics
- `GET /charts` — chart data (2 charts: task-status-distribution, tasks-due-soon)

### Missing Analytics

- No per-department analytics
- No per-project analytics
- No per-user analytics
- No trend/growth analytics over time
- No analytics export functionality
- `ANALYTICS_EXPORT` permission exists but not used

---

## 10. Performance Review

| Concern | Status | Notes |
|---------|--------|-------|
| Entity relationships use LAZY fetch | ✅ | |
| Indexes on FK columns | ✅ | Comprehensive indexes on notifications, documents, knowledge_bases |
| N+1 query prevention | ⚠️ | Inconsistent — some repos use JOIN FETCH, most don't |
| Pagination on all list endpoints | ✅ | |
| Search performance | ❌ | LIKE-based search on TEXT columns (no FTS) |
| Notification scalability | ✅ | Indexed by recipient, status, type, workspace |
| Attachment management | ✅ | File size tracking, storage path |
| Dashboard caching | ✅ | Caffeine with per-scope TTL (2-5 min) |

### N+1 Query Hotspots

| Service | Method | Issue |
|---------|--------|-------|
| `DocumentServiceImpl` | `getById()` | Loads document, then lazy-loads project → department → workspace chain |
| `DocumentServiceImpl` | `list()` | Lazy-loads project for each document in page |
| `DocumentServiceImpl` | `update()` | Loads document, then lazy-loads project chain for department/workspace validation |
| `KnowledgeBaseServiceImpl` | `getById()` | Same lazy-load chain |
| `CommentServiceImpl` | `list()` | `buildCommentResponse()` queries `attachmentRepository.findByCommentId()` per comment |
| `CommentServiceImpl` | `getById()` | Loads comment, then lazy-loads task → project → department → workspace chain |
| `ActivityServiceImpl` | `getById()` | Loads activity, then lazy-loads task → project → department → workspace chain |
| `ActivityRepository` | `findAllByTask_IdAndStatus()` | No JOIN FETCH — N+1 for actor + task + project per activity |

### Search Performance

- `DocumentRepository.searchByTitleInProjectPaginated()` uses `LOWER(title) LIKE LOWER(CONCAT('%', :keyword, '%'))`
- `KnowledgeBaseRepository.searchByContentInWorkspacePaginated()` searches `title+content+summary` with LIKE
- These queries cannot use database indexes (left-side wildcard)
- **No full-text search (FTS) index** on any TEXT column

---

## 11. Scalability Review

| Concern | Status | Notes |
|---------|--------|-------|
| Unpaginated document queries | ❌ | Some queries return `List` without pagination |
| Notification cleanup | ⚠️ | `findReadBefore`/`findArchivedBefore` queries exist but no scheduled cleanup |
| Mention soft-delete bug | ❌ | Uses 'INACTIVE' string not valid for `TaskStatus` enum |
| Tags normalization | ❌ | Comma-separated string — no tag entity/table |
| Version table | ❌ | No separate version history table |
| Email delivery | ❌ | No notification email dispatch |
| WebSocket/push delivery | ❌ | No real-time notification delivery |
| File storage operations | ❌ | Document/Attachment controllers manage metadata only — no upload/download endpoints |

---

## 12. Future AI Compatibility

| Feature | Ready |
|---------|-------|
| KnowledgeBase has `aiProcessed`, `aiSummary`, `aiTags` | ✅ |
| KnowledgeBase has `ragEmbeddingsAvailable` | ✅ |
| Document has `aiProcessed`, `pdfExportAvailable` | ✅ |
| Generic `resourceType`/`resourceId` in Notifications for future AI job types | ✅ |
| Comment content available for NLP processing | ✅ (TEXT content) |
| Activity log available for pattern analysis | ✅ |
| Handover Journal integration (via existing module) | ✅ |
| KnowledgeBase `findUnprocessedByAiPaginated` / `findWithoutRagEmbeddingsPaginated` | ✅ |

The architecture is **AI-ready** with minimal changes required. KnowledgeBase articles already have dedicated fields for AI processing, RAG embeddings, AI summaries, and AI-generated tags.

---

## 13. Missing Features

### Critical
1. **Announcement entity** — no workspace/department/team announcement support
2. **Event-driven notifications** — no domain events, no `ApplicationEventPublisher` usage

### High
3. **Notification ownership checks** — getById/markAsRead/delete don't verify recipient
4. **Service-layer permissions inconsistent with database permissions** — `assertWorkspaceAdminOrOwner()` blocks MEMBER and MANAGER from COMMENT_CREATE
5. **Project dashboard attachments** — return empty list
6. **Email notification delivery** — templates exist but not used
7. **Mention notification dispatch** — `notificationSent` flag exists but no service dispatches the notification
8. **Document entity lacks category, tags, view count** — cannot be categorized in knowledge organization

### Medium
9. **No version history table** — snapshot-based versioning with title-matching is fragile
10. **No notification preferences** — users cannot control notification types or channels
11. **No push notification support** — no WebSocket/SSE/STOMP
12. **CommentServiceImpl doesn't implement CommentService** — compile-time contract enforcement lost
13. **Mention soft-delete bug** — 'INACTIVE' not valid for `TaskStatus` enum
14. **No full-text search indexes** — LIKE-based search on TEXT columns
15. **KnowledgeBase category filtering not exposed via controller** — repository methods exist but no endpoint
16. **Tags stored as comma-separated strings** — not normalized
17. **Document status enum duplicated** — inner enum vs `enums/DocumentStatus.java`

### Low
18. **No FAQ-specific documentation type**
19. **No thread implementation** — `parentCommentId` field unused in service logic
20. **No scheduled report generation** — DB tables exist, no Java service
21. **No notification grouping/batching**
22. **17 unused notification type enum values**
23. **`ProjectNotificationWidget` and `ProjectMemberWidget` deprecated dead code**
24. **Hardcoded placeholder values** — `DocumentMetrics.totalSizeBytes = 0L`, `TaskMetrics.velocity = 0.0`
25. **Mixed French/English in comments and Javadoc**

---

## 14. Critical Issues

| # | Issue | Module | Impact |
|---|-------|--------|--------|
| C1 | **Service-layer permission enforcement is inconsistent with DB permissions** | Permissions | MEMBERs with `COMMENT_CREATE`/`MENTION_CREATE` permission are blocked by `assertWorkspaceAdminOrOwner()` at the service layer. MANAGERs are also blocked. The permission system is wired but ignored by service implementations. |
| C2 | **No Announcement entity** | Internal Communication | Cannot create or publish workspace/department/team announcements as described in the architecture |
| C3 | **Notification ownership verification missing** | Notifications | Any workspace member can read, mark as read, or delete any other member's notification — privacy violation |

---

## 15. High Priority Issues

| # | Issue | Module | Impact |
|---|-------|--------|--------|
| H1 | **Notifications not event-driven** | Notifications | Each service manually calls `notificationService.create()`, leading to scattered notification logic. Adding new notification types requires modifying each source service. Missing notifications: task-assigned, document-created, mention-dispatched, comment-added, handover-submitted. |
| H2 | **Email notification delivery not configured** | Notifications | Templates exist, `JavaMailSender` configured, but `sendNotificationEmail()` method does not exist |
| H3 | **N+1 queries in Document, KnowledgeBase, Comment, Activity services** | Documentation/Communication | Performance degrades as dataset grows |
| H4 | **Mention notification dispatch not implemented** | Communication | `Mention.notificationSent` flag exists but no service dispatches the notification — the flag is always `false` |
| H5 | **Project dashboard attachments return empty list** | Dashboard | No repository method wired for project-scoped attachments |

---

## 16. Medium Priority Issues

| # | Issue | Module | Impact |
|---|-------|--------|--------|
| M1 | No version history table — snapshot-based versioning is fragile | Documentation |
| M2 | Document entity lacks category, tags, view count | Documentation |
| M3 | No notification preferences/settings | Notifications |
| M4 | No push notification support (WebSocket) | Notifications |
| M5 | CommentServiceImpl does not implement CommentService interface | Communication |
| M6 | Mention soft-delete uses invalid TaskStatus value ('INACTIVE') | Communication |
| M7 | No full-text search indexes — LIKE-based search on TEXT columns | Documentation |
| M8 | Tags stored as comma-separated strings (not normalized) | Documentation |
| M9 | KnowledgeBase category filtering endpoint missing | Documentation |
| M10 | Document status enum duplicated | Documentation |
| M11 | Reporting/Analytics has hardcoded placeholder values | Reporting |
| M12 | KnowledgeBase missing from Project Dashboard | Dashboard |
| M13 | No notification priority or category fields | Notifications |

---

## 17. Low Priority Issues

| # | Issue |
|---|-------|
| L1 | No FAQ-specific documentation type |
| L2 | No thread implementation (parentCommentId unused) |
| L3 | No scheduled report generation/delivery |
| L4 | 17 unused NotificationType enum values |
| L5 | ProjectNotificationWidget and ProjectMemberWidget deprecated dead code |
| L6 | Mixed French/English in comments and Javadoc |
| L7 | No notification grouping/batching |
| L8 | Comment uses TaskStatus enum (COMPLETED semantically incorrect) |

---

## 18. Recommendations

### Immediate (Must Fix)
1. **C1**: Fix service-layer permission enforcement — replace `assertWorkspaceAdminOrOwner()` with granular checks that respect COMMENT_CREATE, MENTION_CREATE, DOCUMENT_UPLOAD, KNOWLEDGE_BASE_CREATE permissions. Allow MEMBERs and MANAGERs to create comments and mentions as permitted.
2. **C3**: Add recipient ownership verification to `NotificationServiceImpl.getById()`, `markAsRead()`, `delete()`. Verify `notification.getRecipient().getId().equals(authenticatedUserId)`.
3. **H4**: Implement mention notification dispatch — when a mention is created, call `notificationService.create()` with type `MENTION`.

### Short Term
4. **H1**: Introduce an event bus (Spring `ApplicationEventPublisher`) and create a centralized `NotificationEventListener` that handles all domain events and creates notifications. Add missing notification producers (task assigned, document created, etc.).
5. **H2**: Implement `sendNotificationEmail()` in `EmailService` and integrate with notification creation using the existing Thymeleaf templates.
6. **H3**: Add `JOIN FETCH` queries to `DocumentRepository`, `KnowledgeBaseRepository`, `CommentRepository`, and `ActivityRepository` for all list/get methods to prevent N+1.
7. **C2**: Create a minimal `Announcement` entity with fields: workspace, department (nullable), team (nullable), title, content, isPinned, status. Expose CRUD via REST with appropriate permission checks.
8. **M2**: Add `category`, `tags`, `viewCount` fields to the `Document` entity.

### Medium Term
9. **M1**: Create a version history table for Document and KnowledgeBase (separate entity with FK, content snapshot, version number, and timestamp).
10. **M3**: Create `NotificationPreference` entity and service to allow per-user opt-in/out of notification types.
11. **M4**: Add WebSocket support (STOMP over Spring WebSocket) for real-time notification delivery.
12. **M11**: Wire actual values for `DocumentMetrics.totalSizeBytes` and `TaskMetrics.velocity` — implement the repository queries and business logic.
13. **M7**: Add PostgreSQL full-text search (FTS) indexes on Document.title, KnowledgeBase.title+content+summary, or integrate Elasticsearch.
14. **M5**: Fix `CommentServiceImpl` to implement `CommentService` interface.

### Long Term
15. **M6**: Fix Mention soft-delete — either add `INACTIVE` to `TaskStatus` enum or create a dedicated `MentionStatus` enum.
16. **M8**: Normalize tags into a `knowledge_base_tags` join table with a `Tag` entity.
17. **L2**: Implement thread support using the existing `parentCommentId` — update `CreateCommentRequest` to accept `parentCommentId`, add thread-based retrieval to `CommentServiceImpl`.
18. **L3**: Implement scheduled report generation with cron expressions and email delivery using the existing `scheduled_reports` and `report_history` tables.
19. **M13**: Add `priority` (LOW, MEDIUM, HIGH, CRITICAL) and `category` fields to the `Notification` entity for better management.

---

## 19. Final Verdict

**⚠️ Production Ready with Improvements**

The Documentation, Internal Communication, and Notification modules have a solid, well-architected foundation:

- ✅ Proper tenant isolation via Workspace→Department→Project hierarchy
- ✅ Soft-delete, indexing, lazy loading, pagination throughout
- ✅ MapStruct DTO mapping
- ✅ Comprehensive Notification entity with 51 types and extensible resource references
- ✅ AI-ready fields on KnowledgeBase and Document entities
- ✅ Dashboard integration across 5 scopes with Caffeine caching
- ✅ Full 150+ permission catalog with all roles defined
- ✅ Approval workflow for documentation
- ✅ Recent improvements: MEMBER communication permissions, SUPER_ADMIN role, comment content upgrade

The **critical issues** that must be fixed before production deployment:

1. **Service-layer permissions override database permissions** — MEMBERs and MANAGERs with valid permissions are blocked by `assertWorkspaceAdminOrOwner()` -- the permission system is wired but service implementations ignore it
2. **Notification ownership verification missing** — any workspace member can access any other member's notifications
3. **No Announcement entity** — the largest feature gap for Internal Communication
4. **Notifications are not event-driven** — scattered synchronous calls, missing key notification types (task assigned, document created, mention dispatched)

No structural rewrites are needed. The existing architecture patterns (workspace hierarchy, soft-delete, MapStruct mapping, repository design) are correct and should be followed for new additions. The module is production-ready with targeted improvements.
