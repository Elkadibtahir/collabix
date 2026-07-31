# Reporting Module — Architecture Design

**Architect:** Senior Java/Spring Boot Software Architect  
**Module:** Reporting (com.trio.backend.reporting)  
**Status:** Foundation Design — No Implementation  
**Supersedes:** N/A  
**Depends On:** Dashboard module (architectural patterns only), Organisation module (scope entities)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Package Architecture](#2-package-architecture)
3. [Report Scopes](#3-report-scopes)
4. [DTO Architecture](#4-dto-architecture)
5. [Filtering Model](#5-filtering-model)
6. [Service Architecture](#6-service-architecture)
7. [Controller Architecture](#7-controller-architecture)
8. [Export Architecture](#8-export-architecture)
9. [Validation Architecture](#9-validation-architecture)
10. [Multi-Tenancy & Authorization](#10-multi-tenancy--authorization)
11. [Performance & Scalability](#11-performance--scalability)
12. [Future Extensibility](#12-future-extensibility)

---

## 1. Executive Summary

The Reporting module is a **read-only, aggregation-only module** that produces structured reports across four scopes. It follows the same Clean Architecture principles as the Dashboard module: **Controller → Service → Repository**, with zero business logic leakage across layers.

Unlike the Dashboard module (which provides real-time snapshots), the Reporting module is designed as the **canonical data source** for:

- **Analytics** — historical aggregations, trends, statistical analysis
- **Collabix AI** — training data, inference context, report summaries
- **Future scheduled reports** — cron-driven report generation
- **Email reports** — async report delivery
- **Report history** — immutable report snapshots
- **Saved report templates** — persisted filter configurations

### Design Principles

| Principle | Application |
|---|---|
| **Single Responsibility** | Each package has exactly one concern |
| **Open/Closed** | New report types = new DTOs + builder methods, no existing code changes |
| **Interface Segregation** | ReportService defines granular methods, not monolithic interfaces |
| **Dependency Inversion** | Service depends on abstractions (interfaces), not concrete repositories |
| **Honest Data** | No invented metrics — null/empty where data is unavailable |
| **Multi-Tenant First** | Every method requires workspaceId |

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Separate module, not Dashboard extension** | Reporting is a data source for future modules; Dashboard is an aggregation view. Separation prevents coupling and allows independent evolution. |
| **Generic report structure enforced at DTO level** | Every report response extends a base `ReportResponse<T>` ensuring consistent Header → Filters → Executive Summary → Statistics → Detailed Records → Export Metadata. |
| **Filters as first-class DTO, not method parameters** | Filters are reusable across all reports and can be serialized/deserialized for saved templates and scheduled reports. |
| **Export strategy pattern** | Each export format is a separate strategy implementing `ReportExporter<T>`. New formats = new strategies, no changes to service or controller. |
| **Pagination built into base DTOs** | Every list-returning method supports `Pageable` from day one, even when the first implementation returns unpaginated results. This prevents API breaks later. |
| **Async-ready from foundation** | All service methods return types compatible with `CompletableFuture` wrapping: `ReportResponse<T>` can be wrapped in `CompletableFuture<ReportResponse<T>>` without signature changes. |

### What This Module Does NOT Do

| Not In Scope | Reason |
|---|---|
| PDF/Excel/CSV generation | Only interfaces and architecture defined |
| Report business logic | Only contracts defined |
| Modify existing modules | Clean Architecture boundary |
| Modify entities/repositories | Data ownership remains in existing modules |
| Duplicate Dashboard code | Reporting is a separate concern |

---

## 2. Package Architecture

```
com.trio.backend.reporting
│
├── ReportException.java                          # Base exception for reporting errors
├── ReportProcessingException.java                 # Thrown when report generation fails
├── ReportValidationException.java                 # Thrown when filter validation fails
├── ReportAccessDeniedException.java               # Thrown when scope access is denied
│
├── controller
│   └── ReportController.java                     # REST endpoints, zero business logic
│
├── service
│   ├── ReportService.java                        # Public contract (interface)
│   ├── WorkspaceReportService.java               # Interface: workspace-scoped reports
│   ├── DepartmentReportService.java              # Interface: department-scoped reports
│   ├── TeamReportService.java                    # Interface: team-scoped reports
│   ├── ProjectReportService.java                 # Interface: project-scoped reports
│   └── impl
│       ├── WorkspaceReportServiceImpl.java       # Implementation
│       ├── DepartmentReportServiceImpl.java      # Implementation
│       ├── TeamReportServiceImpl.java            # Implementation
│       └── ProjectReportServiceImpl.java         # Implementation
│
├── dto
│   ├── filter
│   │   ├── ReportFilter.java                     # Base filter (all reports)
│   │   ├── DateRangeFilter.java                  # Start/end date range
│   │   ├── WorkspaceFilter.java                  # Workspace-scoped filter
│   │   └── ScopeFilter.java                      # Department/Team/Project scope filter
│   │
│   ├── request
│   │   ├── ReportRequest.java                    # Generic report request wrapper
│   │   ├── WorkspaceReportRequest.java           # Workspace report request
│   │   ├── DepartmentReportRequest.java          # Department report request
│   │   ├── TeamReportRequest.java                # Team report request
│   │   └── ProjectReportRequest.java             # Project report request
│   │
│   ├── response
│   │   ├── ReportResponse.java                   # Generic report response wrapper
│   │   ├── WorkspaceReportResponse.java          # Workspace report
│   │   ├── DepartmentReportResponse.java         # Department report
│   │   ├── TeamReportResponse.java               # Team report
│   │   └── ProjectReportResponse.java            # Project report
│   │
│   ├── section
│   │   ├── ReportHeader.java                     # Title, generatedAt, scope metadata
│   │   ├── AppliedFiltersSummary.java            # Human-readable applied filter list
│   │   ├── ExecutiveSummary.java                 # Key insights, highlights, totals
│   │   ├── ReportStatistics.java                 # Aggregated metrics
│   │   ├── DetailedRecord.java                   # Single record in detailed section
│   │   └── ExportMetadata.java                   # Export format, size, generatedAt
│   │
│   ├── common
│   │   ├── PaginationInfo.java                   # Page, size, totalElements, totalPages
│   │   └── SortInfo.java                         # Sort field, direction
│   │
│   └── metadata
│       ├── ReportType.java                       # Enum: WORKSPACE, DEPARTMENT, TEAM, PROJECT
│       └── ReportFormat.java                     # Enum: JSON, PDF, EXCEL, CSV
│
├── mapper
│   ├── ReportMapper.java                         # DTO ↔ Domain mapping interface
│   └── FilterMapper.java                         # Request filter ↔ domain filter mapping
│
├── export
│   ├── ReportExporter.java                       # Generic exporter interface
│   ├── ReportExportRequest.java                  # Export request (data + format + options)
│   ├── ReportExportResult.java                   # Export result (byte[], metadata)
│   ├── strategy
│   │   ├── JsonReportExporter.java               # JSON export strategy (interface)
│   │   ├── PdfReportExporter.java                # PDF export strategy (interface)
│   │   ├── ExcelReportExporter.java              # Excel export strategy (interface)
│   │   └── CsvReportExporter.java                # CSV export strategy (interface)
│   └── factory
│       └── ReportExporterFactory.java            # Format → Strategy resolution
│
├── validation
│   ├── ReportFilterValidator.java                # Filter validation contract
│   ├── ReportScopeValidator.java                 # Scope access validation contract
│   └── validator
│       ├── DateRangeValidator.java               # Date range validation rules
│       ├── ScopeAccessValidator.java             # Workspace/Department/Team/Project access
│       └── PaginationValidator.java              # Pagination bounds validation
│
├── builder
│   └── impl
│       ├── WorkspaceReportBuilder.java           # Builds workspace report sections
│       ├── DepartmentReportBuilder.java          # Builds department report sections
│       ├── TeamReportBuilder.java                # Builds team report sections
│       └── ProjectReportBuilder.java             # Builds project report sections
│
└── util
    ├── ReportDateUtils.java                      # Date range calculation helpers
    ├── ReportStatisticsCalculator.java           # Common statistics aggregation
    └── ReportSectionAssembler.java              # Assembles full report from sections
```

### Package Responsibilities

| Package | Responsibility |
|---|---|
| `controller` | REST endpoint definitions, delegates to service, returns `ApiResponse<T>` |
| `service` | Public contracts (interfaces) + implementations; business logic orchestration |
| `service/impl` | Concrete implementations injected with builders and repositories |
| `dto/filter` | Reusable filter models shared across all report types |
| `dto/request` | Request DTOs — each scope gets its own request with scope-specific filters |
| `dto/response` | Response DTOs — each scope gets its own response extending the base structure |
| `dto/section` | Report section DTOs — the 6 mandatory sections every report contains |
| `dto/common` | Shared pagination and sorting DTOs |
| `dto/metadata` | Enums and constants for report types and formats |
| `mapper` | MapStruct/component mappers for DTO ↔ domain transformations |
| `export` | Export architecture: interfaces, request/result DTOs, strategy pattern |
| `export/strategy` | One interface per export format — no implementation |
| `export/factory` | Resolves the correct exporter strategy by format |
| `validation` | Validation contracts and rules for filters, scope access, pagination |
| `validation/validator` | Concrete validation rule implementations |
| `builder` | Report section builders — each scope has its own builder |
| `builder/impl` | Concrete builder implementations (one per scope) |
| `util` | Shared utility classes used across builders |

---

## 3. Report Scopes

The Reporting module mirrors the Dashboard scopes exactly, minus the Personal scope (reports are workspace-centric, not user-centric).

### 3.1 Workspace Report

| Property | Value |
|---|---|
| **Scope** | Entire workspace — all departments, teams, projects |
| **Audience** | Workspace Owners (OWNER) and Administrators (ADMIN) |
| **Multi-tenancy** | WorkspaceId required, validates membership |
| **Data span** | Full workspace lifecycle |

### 3.2 Department Report

| Property | Value |
|---|---|
| **Scope** | Single department within a workspace |
| **Audience** | Department managers, workspace admins |
| **Multi-tenancy** | WorkspaceId + DepartmentId, validates department belongs to workspace |
| **Data span** | Department-controlled projects only |

### 3.3 Team Report

| Property | Value |
|---|---|
| **Scope** | Single team within a department |
| **Audience** | Team leaders, workspace admins |
| **Multi-tenancy** | WorkspaceId + TeamId, validates team belongs to workspace |
| **Data span** | Team members, projects within parent department |

### 3.4 Project Report

| Property | Value |
|---|---|
| **Scope** | Single project within a department |
| **Audience** | Project members, workspace admins |
| **Multi-tenancy** | WorkspaceId + ProjectId, validates project belongs to workspace |
| **Data span** | Project tasks, activities, timeline |

### Scope Hierarchy

```
Workspace (workspaceId)
 ├── Department (workspaceId + departmentId)
 │    ├── Team (workspaceId + teamId)
 │    └── Project (workspaceId + projectId)
 └── ... (future modules: HR, ATS, etc.)
```

---

## 4. DTO Architecture

### 4.1 Generic Report Structure

Every report response follows exactly this structure:

```
ReportResponse<T>           ← Generic wrapper
 ├── header                 ← ReportHeader (title, generatedAt, scope)
 ├── appliedFilters         ← AppliedFiltersSummary
 ├── executiveSummary       ← ExecutiveSummary (generic)
 ├── statistics             ← ReportStatistics (generic)
 ├── detailedRecords        ← Page<DetailedRecord> or List<DetailedRecord>
 └── exportMetadata         ← ExportMetadata (format info, size)
```

### 4.2 Core Section DTOs

#### `ReportHeader`

| Field | Type | Description |
|---|---|---|
| `reportTitle` | String | Human-readable title (e.g., "Workspace Activity Report") |
| `reportType` | ReportType | Enum: WORKSPACE, DEPARTMENT, TEAM, PROJECT |
| `generatedAt` | Instant | Timestamp when report was generated |
| `generatedBy` | UUID | User ID who requested the report |
| `scopeId` | UUID | The scoped entity ID (workspaceId, departmentId, teamId, projectId) |
| `scopeName` | String | Human-readable name of the scoped entity |
| `workspaceId` | UUID | Tenant identifier (always present for multi-tenancy) |
| `reportPeriod` | String | Human-readable period description (e.g., "Q1 2024", "January 2024") |

#### `AppliedFiltersSummary`

| Field | Type | Description |
|---|---|---|
| `dateRange` | DateRangeFilter | Applied date range (null if not filtered) |
| `statuses` | List<String> | Applied status filters |
| `userIds` | List<UUID> | Applied user filters |
| `searchQuery` | String | Full-text search query (null if not searched) |
| `filterCount` | int | Total number of active filters |
| `filters` | List<AppliedFilter> | Human-readable list of applied filters |

**Inner DTO: `AppliedFilter`**

| Field | Type | Description |
|---|---|---|
| `field` | String | Filter field name |
| `operator` | String | Filter operator (EQ, IN, BETWEEN, CONTAINS) |
| `value` | String | Filter value (rendered as string) |

#### `ExecutiveSummary`

| Field | Type | Description |
|---|---|---|
| `totalRecords` | long | Total number of records in report scope |
| `periodActivity` | String | Summary of activity during the period |
| `keyHighlights` | List<String> | Highlight items (max 5) |
| `trendIndicator` | String | UP, DOWN, STABLE (compared to previous period) |
| `completionRate` | Double | Percentage of completed items (0.0 – 100.0) |
| `anomalyCount` | int | Number of anomalies detected (0 = none) |

#### `ReportStatistics`

| Field | Type | Description |
|---|---|---|
| `totalCount` | long | Total countable items |
| `activeCount` | long | Active/ongoing items |
| `completedCount` | long | Completed/resolved items |
| `overdueCount` | long | Overdue/past-due items |
| `pendingCount` | long | Pending/unresolved items |
| `archivedCount` | long | Archived items |
| `averageCompletionTime` | Duration | Average time to completion |
| `periodComparison` | PeriodComparison | Comparison with previous period |

**Inner DTO: `PeriodComparison`**

| Field | Type | Description |
|---|---|---|
| `previousPeriodTotal` | long | Total in previous period |
| `currentPeriodTotal` | long | Total in current period |
| `percentageChange` | Double | Percentage change (positive = increase) |
| `trend` | String | INCREASING, DECREASING, STABLE |

#### `DetailedRecord`

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Record identifier |
| `type` | String | Record type (TASK, PROJECT, ACTIVITY, etc.) |
| `title` | String | Record title |
| `status` | String | Current status |
| `createdAt` | Instant | Creation timestamp |
| `updatedAt` | Instant | Last update timestamp |
| `metadata` | Map<String, Object> | Extensible metadata (scope-specific fields) |

#### `ExportMetadata`

| Field | Type | Description |
|---|---|---|
| `exportableFormats` | List<ReportFormat> | Supported export formats |
| `estimatedRecordCount` | long | Estimated records for export |
| `maxExportableRecords` | long | Maximum records that can be exported in single request |
| `supportsStreaming` | boolean | Whether streaming export is supported for large datasets |

### 4.3 Filter DTOs

#### `ReportFilter`

| Field | Type | Description |
|---|---|---|
| `dateRange` | DateRangeFilter | Date range filter (optional) |
| `workspaceId` | UUID | Workspace filter (optional if already scoped) |
| `departmentIds` | List<UUID> | Department filters (optional) |
| `teamIds` | List<UUID> | Team filters (optional) |
| `projectIds` | List<UUID> | Project filters (optional) |
| `statuses` | List<String> | Status filters (optional) |
| `userIds` | List<UUID> | User filters (optional) |
| `searchQuery` | String | Full-text search query (optional) |
| `includeArchived` | boolean | Whether to include archived items (default: false) |

#### `DateRangeFilter`

| Field | Type | Description |
|---|---|---|
| `startDate` | Instant | Period start (inclusive) |
| `endDate` | Instant | Period end (inclusive) |
| `periodType` | String | CUSTOM, TODAY, THIS_WEEK, THIS_MONTH, THIS_QUARTER, THIS_YEAR, LAST_WEEK, LAST_MONTH, LAST_QUARTER, LAST_YEAR |
| `timezone` | String | Timezone for period calculation (default: UTC) |

### 4.4 Request DTOs

#### `ReportRequest<T extends ReportFilter>`

| Field | Type | Description |
|---|---|---|
| `filter` | T | Scope-specific filter |
| `page` | int | Page number (0-indexed, default: 0) |
| `size` | int | Page size (default: 20, max: 100) |
| `sort` | List<SortCriteria> | Sort criteria |
| `exportFormat` | ReportFormat | Optional: request export in specific format |
| `includeStatistics` | boolean | Whether to include statistics section (default: true) |
| `includeExecutiveSummary` | boolean | Whether to include executive summary (default: true) |

#### `WorkspaceReportRequest`

Extends `ReportRequest<ReportFilter>` — uses the base filter directly.

#### `DepartmentReportRequest`

| Field | Type | Description |
|---|---|---|
| `filter` | ReportFilter | Base filter (departmentIds pre-filled) |
| `departmentId` | UUID | Department identifier (required) |

#### `TeamReportRequest`

| Field | Type | Description |
|---|---|---|
| `filter` | ReportFilter | Base filter (teamIds pre-filled) |
| `teamId` | UUID | Team identifier (required) |

#### `ProjectReportRequest`

| Field | Type | Description |
|---|---|---|
| `filter` | ReportFilter | Base filter (projectIds pre-filled) |
| `projectId` | UUID | Project identifier (required) |

### 4.5 Response DTOs

#### `ReportResponse<T>`

| Field | Type | Description |
|---|---|---|
| `header` | ReportHeader | Report header metadata |
| `appliedFilters` | AppliedFiltersSummary | Summary of filters applied |
| `executiveSummary` | ExecutiveSummary | Key insights |
| `statistics` | ReportStatistics | Aggregated metrics |
| `detailedRecords` | Page<DetailedRecord> or List<DetailedRecord> | Paginated detailed records |
| `exportMetadata` | ExportMetadata | Export format info |

Each scope-specific response extends a base response DTO:

- `WorkspaceReportResponse extends ReportResponse<WorkspaceReportRequest>`
- `DepartmentReportResponse extends ReportResponse<DepartmentReportRequest>`
- `TeamReportResponse extends ReportResponse<TeamReportRequest>`
- `ProjectReportResponse extends ReportResponse<ProjectReportRequest>`

---

## 5. Filtering Model

### 5.1 Design Rationale

Filters are designed as **first-class DTOs** rather than method parameters because:

1. **Serializable** — Can be persisted for saved report templates and scheduled reports
2. **Validatable** — Centralized validation rules in `ReportFilterValidator`
3. **Extensible** — New filter criteria = new fields in `ReportFilter`, no method signature changes
4. **Reusable** — Same filter model across all 4 report scopes
5. **Composable** — Filters can be combined, overridden, or extended per scope

### 5.2 Filter Processing Pipeline

```
Request
  │
  ▼
Request DTO (e.g., WorkspaceReportRequest)
  │
  ▼
ReportFilterValidator.validate(request)
  │  ├── DateRangeValidator (startDate ≤ endDate, not in future beyond limit)
  │  ├── ScopeAccessValidator (workspaceId matches authenticated workspace)
  │  └── PaginationValidator (page ≥ 0, 1 ≤ size ≤ 100)
  │
  ▼
Validated ReportFilter
  │
  ▼
Builder uses filter to scope repository queries
  │
  ▼
AppliedFiltersSummary (rendered for response)
```

### 5.3 Filter Applicability Matrix

| Filter | Workspace | Department | Team | Project |
|---|---|---|---|---|
| Date Range | ✅ | ✅ | ✅ | ✅ |
| Workspace | ✅ (auto) | ✅ (auto) | ✅ (auto) | ✅ (auto) |
| Department | ✅ | ✅ (auto) | ✅ (auto via parent) | ✅ |
| Team | ✅ | ✅ | ✅ (auto) | ✅ |
| Project | ✅ | ✅ | ✅ | ✅ (auto) |
| Status | ✅ | ✅ | ✅ | ✅ |
| User | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ |

*(auto) = pre-filled by scope, not user-configurable

---

## 6. Service Architecture

### 6.1 `ReportService` Interface

```java
/**
 * Central contract for the Reporting module.
 *
 * <p>This interface defines the public API for generating structured reports
 * across all four scopes. Every method requires a workspaceId for multi-tenant
 * isolation. Reports are read-only aggregations — no data is mutated.</p>
 *
 * <p>All methods are designed to be:
 * <ul>
 *   <li>Pagination-compatible from day one</li>
 *   <li>Future async-ready (CompletableFuture-wrappable return types)</li>
 *   <li>Streaming-compatible (Page<T> results can be converted to streams)</li>
 *   <li>Extensible without breaking existing consumers</li>
 * </ul>
 * </p>
 */
public interface ReportService {

    // =========================================================================
    // Workspace Reports
    // =========================================================================

    /**
     * Generates a workspace-scoped report.
     *
     * <p>Covers all departments, teams, projects, tasks, and activities
     * within the specified workspace. Accessible to workspace OWNER and ADMIN
     * roles only.</p>
     *
     * @param workspaceId tenant identifier
     * @param request     report request with filters and pagination
     * @return structured workspace report
     */
    WorkspaceReportResponse generateWorkspaceReport(UUID workspaceId, WorkspaceReportRequest request);

    /**
     * Returns the list of all available workspace report types.
     *
     * @return list of report type descriptors
     */
    List<ReportTypeDescriptor> getAvailableWorkspaceReportTypes();

    // =========================================================================
    // Department Reports
    // =========================================================================

    /**
     * Generates a department-scoped report.
     *
     * <p>Covers all teams, projects, tasks, and activities within the
     * specified department. Accessible to workspace members who can view
     * the department.</p>
     *
     * @param workspaceId  tenant identifier
     * @param departmentId department identifier
     * @param request      report request with filters and pagination
     * @return structured department report
     */
    DepartmentReportResponse generateDepartmentReport(UUID workspaceId, UUID departmentId, DepartmentReportRequest request);

    /**
     * Returns the list of all available department report types.
     *
     * @param workspaceId  tenant identifier
     * @param departmentId department identifier
     * @return list of report type descriptors
     */
    List<ReportTypeDescriptor> getAvailableDepartmentReportTypes(UUID workspaceId, UUID departmentId);

    // =========================================================================
    // Team Reports
    // =========================================================================

    /**
     * Generates a team-scoped report.
     *
     * <p>Covers all team members, their activities, and projects within
     * the parent department. Accessible to workspace members who can view
     * the team.</p>
     *
     * @param workspaceId tenant identifier
     * @param teamId      team identifier
     * @param request     report request with filters and pagination
     * @return structured team report
     */
    TeamReportResponse generateTeamReport(UUID workspaceId, UUID teamId, TeamReportRequest request);

    /**
     * Returns the list of all available team report types.
     *
     * @param workspaceId tenant identifier
     * @param teamId      team identifier
     * @return list of report type descriptors
     */
    List<ReportTypeDescriptor> getAvailableTeamReportTypes(UUID workspaceId, UUID teamId);

    // =========================================================================
    // Project Reports
    // =========================================================================

    /**
     * Generates a project-scoped report.
     *
     * <p>Covers all tasks, comments, activities, documents, and attachments
     * within the specified project. Accessible to workspace members who can
     * view the project.</p>
     *
     * @param workspaceId tenant identifier
     * @param projectId   project identifier
     * @param request     project report request with filters and pagination
     * @return structured project report
     */
    ProjectReportResponse generateProjectReport(UUID workspaceId, UUID projectId, ProjectReportRequest request);

    /**
     * Returns the list of all available project report types.
     *
     * @param workspaceId tenant identifier
     * @param projectId   project identifier
     * @return list of report type descriptors
     */
    List<ReportTypeDescriptor> getAvailableProjectReportTypes(UUID workspaceId, UUID projectId);

    // =========================================================================
    // Export
    // =========================================================================

    /**
     * Exports a report in the specified format.
     *
     * <p>This method generates a report and immediately exports it.
     * For large reports, prefer generateReport() + export() separately
     * or use the future async export endpoint.</p>
     *
     * @param workspaceId tenant identifier
     * @param request     export request (contains scope info + export format)
     * @return export result containing byte[] and metadata
     */
    ReportExportResult exportReport(UUID workspaceId, ReportExportRequest request);

    // =========================================================================
    // Future Extensibility
    // =========================================================================

    /**
     * Checks if a specific report type is available for the given scope.
     * Used by Analytics and Collabix AI modules to discover available reports.
     *
     * @param workspaceId tenant identifier
     * @param reportType  the report type to check
     * @param scopeId     the scoped entity ID
     * @return true if the report type is available
     */
    boolean isReportTypeAvailable(UUID workspaceId, ReportType reportType, UUID scopeId);

    /**
     * Returns the list of all report types available in a scope.
     * Used by frontend to populate report type dropdowns dynamically.
     *
     * @param workspaceId tenant identifier
     * @param scopeId     the scoped entity ID
     * @param scopeType   the scope type (WORKSPACE, DEPARTMENT, TEAM, PROJECT)
     * @return list of available report type descriptors
     */
    List<ReportTypeDescriptor> getAvailableReportTypes(UUID workspaceId, UUID scopeId, ReportType scopeType);
}
```

### 6.2 Supporting Types

#### `ReportTypeDescriptor`

| Field | Type | Description |
|---|---|---|
| `type` | String | Report type identifier |
| `name` | String | Human-readable name |
| `description` | String | Report description |
| `supportedFormats` | List<ReportFormat> | Formats this report supports |
| `defaultPeriod` | String | Default period type |
| `requiredRoles` | List<WorkspaceRole> | Roles required to access this report |

#### `ReportExportRequest`

| Field | Type | Description |
|---|---|---|
| `scopeType` | ReportType | WORKSPACE, DEPARTMENT, TEAM, PROJECT |
| `scopeId` | UUID | Entity ID for the scope |
| `filter` | ReportFilter | Report filters |
| `format` | ReportFormat | Export format (JSON, PDF, EXCEL, CSV) |
| `options` | Map<String, Object> | Format-specific options (page size, orientation, etc.) |

### 6.3 Method Count Summary

| Category | Methods | Notes |
|---|---|---|
| Report Generation | 4 | One per scope |
| Report Type Discovery | 4 | One per scope + 2 central discovery methods |
| Export | 1 | Covers all scopes + formats |
| Utility | 1 | Report type availability check |
| **Total** | **12** | All methods return DTOs, never entities |

---

## 7. Controller Architecture

### 7.1 REST Endpoints

```
Base path: /api/workspaces/{workspaceId}/reports
```

#### Workspace Reports

| Method | Path | Description | Authorization |
|---|---|---|---|
| `GET` | `/workspace` | Generate workspace report | `@workspaceAuth.canViewWorkspace` |
| `GET` | `/workspace/types` | Available workspace report types | `@workspaceAuth.canViewWorkspace` |

#### Department Reports

| Method | Path | Description | Authorization |
|---|---|---|---|
| `GET` | `/departments/{departmentId}` | Generate department report | `@departmentAuth.canViewDepartment` |
| `GET` | `/departments/{departmentId}/types` | Available department report types | `@departmentAuth.canViewDepartment` |

#### Team Reports

| Method | Path | Description | Authorization |
|---|---|---|---|
| `GET` | `/teams/{teamId}` | Generate team report | `@workspaceAuth.canAccessTeam` |
| `GET` | `/teams/{teamId}/types` | Available team report types | `@workspaceAuth.canAccessTeam` |

#### Project Reports

| Method | Path | Description | Authorization |
|---|---|---|---|
| `GET` | `/projects/{projectId}` | Generate project report | `@workspaceAuth.canViewWorkspace` |
| `GET` | `/projects/{projectId}/types` | Available project report types | `@workspaceAuth.canViewWorkspace` |

#### Export

| Method | Path | Description | Authorization |
|---|---|---|---|
| `POST` | `/export` | Export a report in specified format | (scope-dependent) |

#### Future Endpoints (Reserved)

| Method | Path | Description | Future Module |
|---|---|---|---|
| `GET` | `/types` | List all report types for a workspace | Analytics, Frontend |
| `POST` | `/scheduled` | Schedule a recurring report | Scheduled Reports |
| `GET` | `/history` | Get report generation history | Report History |
| `GET` | `/templates` | List saved report templates | Saved Templates |
| `POST` | `/templates` | Save current filters as template | Saved Templates |

### 7.2 Controller Design Notes

1. **Zero business logic** — Controller only validates auth, delegates to service, wraps in `ApiResponse`
2. **Consistent response envelope** — All endpoints return `ApiResponse<T>`
3. **Request parameters via `@ModelAttribute`** — Filters and pagination are bound from query parameters
4. **Export uses `POST`** — Because export requests may be large (complex filter combinations)
5. **Type discovery endpoints return `ApiResponse<List<ReportTypeDescriptor>>`** — Enables dynamic UI rendering
6. **All responses are `@Transactional(readOnly = true)`** — No data mutation

### 7.3 Controller Skeleton

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workspaces/{workspaceId}/reports")
@Tag(name = "Reports", description = "Endpoints for report generation across all scopes")
public class ReportController {

    private final ReportService reportService;

    // Workspace
    @GetMapping("/workspace")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication)")
    public ApiResponse<WorkspaceReportResponse> getWorkspaceReport(
            @PathVariable UUID workspaceId,
            @ModelAttribute WorkspaceReportRequest request) { ... }

    // Department
    @GetMapping("/departments/{departmentId}")
    @PreAuthorize("@departmentAuth.canViewDepartment(#workspaceId, #departmentId, authentication)")
    public ApiResponse<DepartmentReportResponse> getDepartmentReport(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @ModelAttribute DepartmentReportRequest request) { ... }

    // Team
    @GetMapping("/teams/{teamId}")
    @PreAuthorize("@workspaceAuth.canAccessTeam(#workspaceId, #teamId, authentication)")
    public ApiResponse<TeamReportResponse> getTeamReport(
            @PathVariable UUID workspaceId,
            @PathVariable UUID teamId,
            @ModelAttribute TeamReportRequest request) { ... }

    // Project
    @GetMapping("/projects/{projectId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication)")
    public ApiResponse<ProjectReportResponse> getProjectReport(
            @PathVariable UUID workspaceId,
            @PathVariable UUID projectId,
            @ModelAttribute ProjectReportRequest request) { ... }

    // Export
    @PostMapping("/export")
    public ApiResponse<ReportExportResult> exportReport(
            @PathVariable UUID workspaceId,
            @RequestBody ReportExportRequest request) { ... }
}
```

---

## 8. Export Architecture

### 8.1 Strategy Pattern

```
ReportExporter<T extends ReportResponse<?>>
    ├── JsonReportExporter      (interface only)
    ├── PdfReportExporter       (interface only)
    ├── ExcelReportExporter     (interface only)
    └── CsvReportExporter       (interface only)
```

#### `ReportExporter<T>` Interface

```java
/**
 * Strategy interface for report export.
 *
 * <p>Each implementation handles exactly one export format.
 * New export formats are added by implementing this interface
 * and registering in {@link ReportExporterFactory}.</p>
 *
 * @param <T> the report response type
 */
public interface ReportExporter<T extends ReportResponse<?>> {

    /**
     * Returns the format this exporter handles.
     */
    ReportFormat supportedFormat();

    /**
     * Exports a report to bytes.
     *
     * @param report     the generated report
     * @param options    format-specific options
     * @return export result containing byte[] and metadata
     */
    ReportExportResult export(T report, Map<String, Object> options);

    /**
     * Returns the MIME type for this export format.
     */
    String getContentType();

    /**
     * Returns the default file extension (without dot).
     */
    String getFileExtension();

    /**
     * Whether this exporter supports streaming for large datasets.
     * If true, the implementor must provide a streaming variant.
     */
    boolean supportsStreaming();

    /**
     * Maximum supported record count for single export.
     * -1 means no limit.
     */
    long getMaxSupportedRecords();
}
```

### 8.2 `ReportExporterFactory`

```java
/**
 * Resolves the correct {@link ReportExporter} strategy for a given
 * {@link ReportFormat}. Follows the Factory pattern to decouple
 * export logic from service/controller layers.
 */
public interface ReportExporterFactory {

    /**
     * Returns the exporter for the given format.
     *
     * @param format the export format
     * @return the matching exporter strategy
     * @throws IllegalArgumentException if no exporter is registered for the format
     */
    ReportExporter<?> getExporter(ReportFormat format);

    /**
     * Returns all registered exporters.
     */
    List<ReportExporter<?>> getAllExporters();

    /**
     * Returns all supported formats.
     */
    List<ReportFormat> getSupportedFormats();

    /**
     * Registers a new exporter dynamically.
     * Used for plugin-like extensibility.
     */
    void registerExporter(ReportFormat format, ReportExporter<?> exporter);
}
```

### 8.3 `ReportExportResult`

| Field | Type | Description |
|---|---|---|
| `data` | byte[] | Exported file bytes |
| `format` | ReportFormat | Export format |
| `contentType` | String | MIME type |
| `fileName` | String | Generated file name |
| `fileSize` | long | File size in bytes |
| `recordCount` | long | Number of records exported |
| `generatedAt` | Instant | Export generation timestamp |
| `compressed` | boolean | Whether output is compressed |
| `pageCount` | int | Number of pages (PDF-specific) |

### 8.4 Export Applicability

| Format | Interface | Implementation Status | Streaming Support |
|---|---|---|---|
| JSON | `JsonReportExporter` | Not implemented (architecture only) | Yes |
| PDF | `PdfReportExporter` | Not implemented (architecture only) | No |
| Excel | `ExcelReportExporter` | Not implemented (architecture only) | No |
| CSV | `CsvReportExporter` | Not implemented (architecture only) | Yes |

---

## 9. Validation Architecture

### 9.1 Validation Layers

```
Layer 1: Request DTO Validation (Jakarta Validation)
 ├── @NotNull, @NotBlank on required fields
 ├── @Min/@Max on pagination bounds
 ├── @Future/@Past on date ranges
 └── Custom annotations for scope-specific rules

Layer 2: ReportFilterValidator (Spring Component)
 ├── validate(ReportRequest) → ValidationResult
 ├── validate(ReportFilter) → ValidationResult
 └── validate(ReportExportRequest) → ValidationResult

Layer 3: Scope-specific validators
 ├── DateRangeValidator (start ≤ end, period boundaries)
 ├── ScopeAccessValidator (entity exists + belongs to workspace)
 └── PaginationValidator (page ≥ 0, size ≤ 100)
```

### 9.2 `ReportFilterValidator` Interface

```java
/**
 * Validates report filters and requests before processing.
 *
 * <p>Validation is separated from service logic to:
 * <ul>
 *   <li>Keep services focused on report generation</li>
 *   <li>Enable reuse across sync and async paths</li>
 *   <li>Allow future AOP-based validation without service changes</li>
 * </ul>
 * </p>
 */
public interface ReportFilterValidator {

    /**
     * Validates a complete report request.
     *
     * @param request the report request to validate
     * @param <T>     the filter type
     * @return validation result (success or list of errors)
     */
    <T extends ReportFilter> ValidationResult validate(ReportRequest<T> request);

    /**
     * Validates filter criteria only.
     *
     * @param filter the filter to validate
     * @param <T>    the filter type
     * @return validation result
     */
    <T extends ReportFilter> ValidationResult validate(T filter);

    /**
     * Validates an export request.
     *
     * @param request the export request to validate
     * @return validation result
     */
    ValidationResult validate(ReportExportRequest request);
}
```

### 9.3 `ValidationResult`

| Field | Type | Description |
|---|---|---|
| `valid` | boolean | Whether validation passed |
| `errors` | List<ValidationError> | List of validation errors (if invalid) |

**Inner DTO: `ValidationError`**

| Field | Type | Description |
|---|---|---|
| `field` | String | Field name that failed validation |
| `message` | String | Human-readable error message |
| `rejectedValue` | Object | Rejected value (if applicable) |
| `code` | String | Error code for i18n |

### 9.4 Validation Rules

| Rule | Validator | Scope |
|---|---|---|
| `dateRange.startDate ≤ dateRange.endDate` | DateRangeValidator | All reports |
| `dateRange.endDate ≤ Instant.now()` | DateRangeValidator | All reports (no future dates beyond today) |
| `page ≥ 0` | PaginationValidator | All requests |
| `1 ≤ size ≤ 100` | PaginationValidator | All requests (max 100 records per page) |
| `workspaceId matches authenticated user` | ScopeAccessValidator | All scopes |
| `departmentId belongs to workspaceId` | ScopeAccessValidator | Department reports |
| `teamId belongs to workspaceId` | ScopeAccessValidator | Team reports |
| `projectId belongs to workspaceId` | ScopeAccessValidator | Project reports |
| `searchQuery length ≤ 200` | PaginationValidator | When search is provided |
| `At least one status filter` | ReportFilterValidator | When status is required |

---

## 10. Multi-Tenancy & Authorization

### 10.1 Multi-Tenancy Guarantees

1. **Every public method requires workspaceId** — No method exists without tenant context
2. **Entity validation scoped to workspace** — `findByIdAndWorkspace_Id(id, workspaceId)` pattern
3. **Repository queries include workspace scope** — No tenant-leaking raw queries
4. **Authorization delegates to existing beans** — `@workspaceAuth`, `@departmentAuth` from Security module

### 10.2 Authorization Mapping

| Endpoint | Authorization Bean | Method | Scope |
|---|---|---|---|
| Workspace Report | `workspaceAuth` | `canViewWorkspace` | Any active workspace member |
| Department Report | `departmentAuth` | `canViewDepartment` | Workspace member + department exists |
| Team Report | `workspaceAuth` | `canAccessTeam` | Workspace member + team exists |
| Project Report | `workspaceAuth` | `canViewWorkspace` | Any active workspace member |
| Export | (scope-dependent) | (same as report endpoint) | Matches report scope |

### 10.3 Future Authorization Enhancement Points

| Enhancement | When | Implementation |
|---|---|---|
| Fine-grained department RBAC | Post-MVP | Add `departmentAuth.canViewReport(departmentId, auth)` |
| Project-level access control | Post-MVP | New `projectAuth` bean with project membership checks |
| Report-specific permissions | Post-MVP | `REPORT_VIEW`, `REPORT_EXPORT` permissions in RolePermission |
| Report admin role | Post-MVP | `REPORT_ADMIN` role with cross-workspace access |

---

## 11. Performance & Scalability

### 11.1 Pagination Strategy

| Aspect | Decision | Rationale |
|---|---|---|
| **All list-returning methods paginated from day one** | ✅ Yes | Prevents API break when data grows |
| **Default page size** | 20 | Matches common UX patterns |
| **Maximum page size** | 100 | Prevents memory exhaustion |
| **Sort** | Multi-field, configurable per request | Future-proof without new endpoints |
| **Total count** | Always returned | Required for UI pagination controls |
| **Cursor-based pagination for streaming** | Future | Not needed until async exports |

### 11.2 Large Report Support

| Strategy | Mechanism | When to Use |
|---|---|---|
| **Pagination** | `Page<T>` return type | All synchronous requests |
| **Streaming** | `Stream<T>` in exporter | CSV/JSON exports of 10k+ records |
| **Async generation** | `@Async` + `CompletableFuture` | Reports exceeding 30s generation time |
| **Chunked export** | Splitting by date range | Reports spanning years of data |

### 11.3 Query Optimization Guidelines (For Implementation Phase)

| Technique | Apply When |
|---|---|
| `count()` queries instead of `findAll().size()` | Summary statistics only |
| `JOIN FETCH` for entity chains | Any builder traversing `a → b → c` |
| Batch queries (single query + Java grouping) | Multiple related statistics |
| Indexed date columns | Date range filtering on large tables |
| Materialized views | Frequently accessed aggregations |
| Read replicas | Heavy reporting workloads |

### 11.4 Async Readiness

All service method signatures are compatible with async wrapping:

```
// Current (synchronous) — compatible with all consumers
WorkspaceReportResponse generateWorkspaceReport(UUID workspaceId, WorkspaceReportRequest request);

// Future async (no signature change needed for consumers)
CompletableFuture<WorkspaceReportResponse> generateWorkspaceReportAsync(UUID workspaceId, WorkspaceReportRequest request);
```

The `ReportResponse<T>` DTO is serializable and thread-safe, making it suitable for:

- `CompletableFuture` chains
- Message queues (for scheduled reports)
- Distributed caching
- Response streaming

---

## 12. Future Extensibility

### 12.1 Compatibility Matrix

| Future Feature | Compatible | Required Changes |
|---|---|---|
| **Analytics module** | ✅ Full | Analytics calls `ReportService` methods directly; `isReportTypeAvailable()` for discovery |
| **Collabix AI** | ✅ Full | AI consumes `ReportResponse<T>` DTOs; `ExecutiveSummary` → AI summarization; `DetailedRecords` → training data |
| **Scheduled reports** | ✅ Full | `ReportFilter` is serializable → stored in DB; cron triggers `ReportService.generateXxx()` |
| **Email reports** | ✅ Full | `ReportExportResult.data` (byte[]) → email attachment; `AsyncConfig` handles async delivery |
| **Report history** | ✅ Full | `ReportResponse<T>` is immutable → snapshots stored as-is; `generatedAt` + `generatedBy` for audit trail |
| **Saved templates** | ✅ Full | `ReportFilter` is serializable → stored as JSON; `WorkspaceReportRequest` fully reconstructable |
| **New report types** | ✅ Full | New `service` interface + `builder` + optional new DTOs; no changes to existing contracts |
| **New export formats** | ✅ Full | New `ReportExporter` strategy + register in factory; no service/controller changes |
| **Streaming exports** | ✅ Full | `supportsStreaming()` in exporter interface; `Page<T>` convertible to `Stream<T>` |

### 12.2 Module Integration Points

#### Analytics Module

```
AnalyticsService
  ├── calls ReportService.generateXxxReport() for base data
  ├── consumes ExecutiveSummary, ReportStatistics for trend analysis
  └── uses isReportTypeAvailable() to discover reportable entities
```

#### Collabix AI Module

```
CollabixAIService
  ├── calls ReportService.generateXxxReport() for inference context
  ├── summarizes ExecutiveSummary.keyHighlights
  ├── uses DetailedRecords for pattern recognition
  └── consumes ReportStatistics.periodComparison for anomaly detection
```

### 12.3 Reserved Extension Points

| Extension Point | Package | What Can Be Added |
|---|---|---|
| `ReportFilter` extra fields | `dto/filter` | New filter criteria using `extends ReportFilter` |
| `ExecutiveSummary` extra fields | `dto/section` | AI-generated insights, predictions |
| `ReportStatistics` extra fields | `dto/section` | Custom metrics per module |
| `DetailedRecord` extra fields | `dto/section` | Module-specific record metadata |
| `ReportExporter<T>` implementations | `export/strategy` | New formats (XML, Parquet, etc.) |
| `ReportTypeDescriptor` entries | `dto/metadata` | New report type definitions |
| Builder implementations | `builder/impl` | New scope-specific builders |
| Validator implementations | `validation/validator` | New validation rules |

### 12.4 Prohibited Extension Points (Do Not Modify)

| Component | Reason |
|---|---|
| `ReportService` interface | Public contract — add new methods, do not change existing signatures |
| `ReportResponse<T>` base DTO | Canonical report structure — extend, do not modify existing fields |
| `ReportFilter` base DTO | Reusable filter model — extend, do not modify existing fields |
| `ReportExporter` interface | Strategy contract — do not change method signatures |
| `ReportExporterFactory` interface | Factory contract — do not change method signatures |
| `ReportFilterValidator` interface | Validation contract — do not change method signatures |

---

## Appendix A: Comparison with Dashboard Module

| Aspect | Dashboard | Reporting |
|---|---|---|
| **Purpose** | Real-time aggregation view | Structured, filterable reports |
| **Scopes** | 5 (Workspace, Personal, Dept, Team, Project) | 4 (Workspace, Dept, Team, Project) |
| **Personal scope** | ✅ Has personal dashboard | ❌ Reports are workspace-centric |
| **Filters** | None (fixed scope per endpoint) | First-class filter DTOs |
| **Pagination** | Inconsistent (some paginated, some not) | ✅ Consistent from day one |
| **Export** | None | Strategy pattern architecture |
| **Data source for** | UI dashboard widgets | Analytics, AI, Scheduled reports |
| **Response DTO** | Scope-specific (XxxDashboardResponse) | Generic ReportResponse<T> + scope extensions |
| **Async ready** | ✅ Read-only transactions | ✅ + CompletableFuture-wrappable types |
| **Streaming** | No | ✅ Future streaming via exporter support |

---

## Appendix B: Enum Definitions

#### `ReportType`

```java
public enum ReportType {
    WORKSPACE,
    DEPARTMENT,
    TEAM,
    PROJECT
}
```

#### `ReportFormat`

```java
public enum ReportFormat {
    JSON,
    PDF,
    EXCEL,
    CSV
}
```

---

## Appendix C: Exception Hierarchy

```
ReportException (RuntimeException)
 ├── ReportProcessingException    (report generation failure)
 ├── ReportValidationException     (filter/request validation failure)
 └── ReportAccessDeniedException  (scope access denied)
```

---

*End of Reporting Architecture Design Document*

