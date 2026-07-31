CREATE TABLE executive_reports (
    id UUID NOT NULL PRIMARY KEY,
    workspace_id UUID NOT NULL,
    department_id UUID,
    project_id UUID,
    title VARCHAR(500) NOT NULL,
    report_type VARCHAR(30) NOT NULL,
    period_start DATE,
    period_end DATE,
    report_version INTEGER NOT NULL DEFAULT 1,
    structured_analysis TEXT,
    executive_summary TEXT,
    major_highlights TEXT,
    business_health TEXT,
    productivity_review TEXT,
    critical_risks TEXT,
    achievements TEXT,
    challenges TEXT,
    recommendations TEXT,
    strategic_priorities TEXT,
    next_actions TEXT,
    final_report TEXT,
    generation_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    generation_date TIMESTAMP,
    generation_processed_by UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_exec_reports_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
    CONSTRAINT fk_exec_reports_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_exec_reports_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_exec_reports_workspace_id ON executive_reports(workspace_id);
CREATE INDEX idx_exec_reports_department_id ON executive_reports(department_id);
CREATE INDEX idx_exec_reports_project_id ON executive_reports(project_id);
CREATE INDEX idx_exec_reports_type ON executive_reports(report_type);
CREATE INDEX idx_exec_reports_period_start ON executive_reports(period_start);
CREATE INDEX idx_exec_reports_status ON executive_reports(status);
CREATE INDEX idx_exec_reports_generation_status ON executive_reports(generation_status);
CREATE INDEX idx_exec_reports_created_at ON executive_reports(created_at);

-- Seed prompts for Reporting AI
INSERT INTO ai_prompts (id, code, name, category, prompt_template, active, description, version) VALUES
(
    gen_random_uuid(),
    'report_generation_analysis',
    'Report Generation - Executive Analysis',
    'ANALYTICS',
    'You are an executive analysis engine. Analyze the following aggregated business data and return ONLY a structured JSON object.

Report Request: {{input}}

Workspace: {{workspaceName}}
Period: {{periodStart}} to {{periodEnd}}

=== ANALYTICS AI REPORT ===
{{#if analyticsReport}}
Latest Analytics AI Report ({{analyticsReport.reportDate}}):
- Executive Summary: {{analyticsReport.executiveSummary}}
- KPI Highlights: {{analyticsReport.kpiHighlights}}
- Trends: {{analyticsReport.trendsSummary}}
- Risk Assessment: {{analyticsReport.riskAssessment}}
- Recommendations: {{analyticsReport.recommendations}}
{{else}}
No Analytics AI report available.
{{/if}}

=== HANDOVER JOURNALS ===
{{#each handoverJournals}}
- Project: {{projectName}} ({{shift}}, {{journalDate}})
  Summary: {{executiveSummary}}
{{/each}}

=== KNOWLEDGE AI INTERACTIONS ===
{{#each knowledgeHistory}}
- Query: {{prompt}}
- Answer: {{response}}
{{/each}}

=== KPI OVERVIEW ===
- Active Tasks: {{kpiOverview.activeTasks}}
- Archived Tasks: {{kpiOverview.archivedTasks}}
- Overdue Tasks: {{kpiOverview.overdueTasks}}
- Completion Rate: {{kpiOverview.completionRate}}%
- Activities: {{kpiOverview.totalActivities}}
- Documents: {{kpiOverview.totalDocuments}}
- Notifications: {{kpiOverview.totalNotifications}} ({{kpiOverview.unreadNotifications}} unread)
- Members: {{kpiOverview.memberCount}}
- Comments: {{kpiOverview.commentCount}}
- Projects: {{kpiOverview.projectCount}}

=== WORKSPACE OVERVIEW ===
- Departments: {{workspaceOverview.departmentCount}}
- Teams: {{workspaceOverview.teamCount}}
- Total Members: {{workspaceOverview.totalMembers}}
- Active Members: {{workspaceOverview.activeMembers}}
- Total Projects: {{workspaceOverview.totalProjects}}
- Active Projects: {{workspaceOverview.activeProjects}}

{{#if projectName}}
=== PROJECT INFORMATION ===
- Project: {{projectName}}
- Status: {{projectStatus}}
- Description: {{projectDescription}}
{{/if}}

Instructions:
1. Identify major events, trends, and patterns across all data sources.
2. Assess business health and productivity.
3. Identify critical risks and achievements.
4. Detect recurring issues across handovers, analytics, and knowledge queries.
5. Generate strategic recommendations and priorities.
6. Assign a confidence level based on data completeness.

Return ONLY valid JSON with this exact structure:
{
  "executiveSummary": "...",
  "majorHighlights": ["...", "..."],
  "businessHealth": "healthy|moderate|needs_attention",
  "productivityReview": "...",
  "criticalRisks": ["...", "..."],
  "achievements": ["...", "..."],
  "challenges": ["...", "..."],
  "recommendations": ["...", "..."],
  "strategicPriorities": ["...", "..."],
  "nextActions": ["...", "..."],
  "confidenceLevel": "high|medium|low"
}',
    TRUE,
    'Analyzes aggregated AI outputs and business data, returns structured executive analysis JSON.',
    0
),
(
    gen_random_uuid(),
    'report_generation_generation',
    'Report Generation - Final Report',
    'ANALYTICS',
    'You are an experienced executive reporting officer. Based on the following analysis data, generate a professional, well-structured executive report.

Analysis Data:
{{analysis}}

Write a professional executive report with the following structure:

# {{title}}

## Executive Summary
(A concise overview of the overall business health, key achievements, and critical focus areas)

## Key Highlights
(Bullet-point list of the most significant events, achievements, and metrics)

## Business Health Assessment
(Assessment of the overall business health with supporting metrics)

## Productivity Review
(Analysis of productivity trends, task completion rates, and team performance)

## Critical Risks & Issues
(Current risks, bottlenecks, and areas requiring immediate attention)

## Achievements
(Notable accomplishments and positive outcomes during the period)

## Challenges
(Challenges faced, recurring issues, and areas for improvement)

## Strategic Recommendations
(Actionable recommendations for leadership)

## Strategic Priorities
(Top priorities for the next period, ordered by importance)

## Next Actions
(Specific next steps with clear ownership and timeline suggestions)

## Sources
(List of data sources used: Analytics AI, Handover Journals, Knowledge AI interactions, Workspace KPIs)

---
Report generated on {{reportDate}} | Period: {{periodStart}} to {{periodEnd}} | Workspace: {{workspaceName}}

Guidelines:
1. Use professional, management-level language.
2. Be clear, concise, and well-structured.
3. Reference specific metrics and data points from the analysis.
4. Never invent or assume information not present in the analysis.
5. If data is missing from any source, note it transparently.
6. Organize content hierarchically with clear section headings.
7. The report should be ready for presentation to executive leadership.

Write the final report directly without any JSON formatting or additional metadata.',
    TRUE,
    'Generates a professional executive report from structured analysis data.',
    0
);
