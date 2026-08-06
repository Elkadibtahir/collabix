# Collabix Department Experience Polish Sprint

## Objective
Remove all placeholders and complete every department page with real backend data while preserving the Collabix Design System.

## Steps

### 1. Wire department-specific tabs in DepartmentDetailPage.tsx
- [ ] Detect department type (Development, AI, Marketing, Cybersecurity, HR) by name keyword
- [ ] Route each department to its rich, backend-connected tab components
- [ ] Fall back to generic tabs for unknown departments

### 2. Rebuild generic common/Dept* components with real backend data
- [ ] DeptOverview — real department + dashboard data
- [ ] DeptManagement — real members + teams
- [ ] DeptDocuments — real workspace documents with search/filter/upload/download/empty/loading/error
- [ ] DeptReports — real AI report history
- [ ] DeptAnalytics — real dashboard + workspace analytics charts (no fake data)
- [ ] DeptActivity — real department activity timeline
- [ ] DeptSettings — real department info + update, members, notifications

### 3. Fix Marketing placeholder tabs
- [ ] ManagementTab — real campaigns
- [ ] DocumentsTab — real documents
- [ ] ReportsTab — real reports
- [ ] OverviewTab — real overview
- [ ] ActivityTab — real activity

### 4. Add missing HR tabs
- [ ] Documents (exists as DocumentsTab — wire it)
- [ ] Reports
- [ ] Analytics
- [ ] Activity
- [ ] Settings

### 5. UI Polish
- [ ] Consistent loading/empty/error states
- [ ] Calm palette, generous spacing, professional typography

### 6. Verification
- [ ] Type-check frontend (npx tsc --noEmit)
- [ ] Confirm no "Coming soon"/placeholder remains in Department module
