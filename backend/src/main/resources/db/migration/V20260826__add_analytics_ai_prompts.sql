CREATE TABLE analytics_reports (
    id UUID NOT NULL PRIMARY KEY,
    workspace_id UUID NOT NULL,
    department_id UUID NOT NULL,
    project_id UUID,
    report_date DATE NOT NULL,
    time_range_start DATE,
    time_range_end DATE,
    executive_summary TEXT NOT NULL,
    kpi_highlights TEXT NOT NULL,
    trends_summary TEXT NOT NULL,
    risk_assessment TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    detailed_report TEXT NOT NULL,
    generation_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    generation_date TIMESTAMP,
    generation_processed_by UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_analytics_reports_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
    CONSTRAINT fk_analytics_reports_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_analytics_reports_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_analytics_reports_workspace_id ON analytics_reports(workspace_id);
CREATE INDEX idx_analytics_reports_department_id ON analytics_reports(department_id);
CREATE INDEX idx_analytics_reports_project_id ON analytics_reports(project_id);
CREATE INDEX idx_analytics_reports_report_date ON analytics_reports(report_date);
CREATE INDEX idx_analytics_reports_status ON analytics_reports(status);
CREATE INDEX idx_analytics_reports_created_at ON analytics_reports(created_at);

-- Seed prompts for Analytics AI
INSERT INTO ai_prompts (id, code, name, category, prompt_template, active, description, version) VALUES
(
    gen_random_uuid(),
    'analytics_summary_analysis',
    'Analytics Summary - Analysis',
    'ANALYTICS',
    'You are an analytics analysis engine. Analyze the following workspace analytics data and return ONLY a structured JSON object.

Context:
- Workspace: {{workspaceName}}
- Report Date: {{reportDate}}
- Time Range: {{timeRangeStart}} to {{timeRangeEnd}}

Task Metrics:
- Active Tasks: {{tasks.activeCount}}
- Archived Tasks: {{tasks.archivedCount}}
- Overdue Tasks: {{tasks.overdueCount}}
- Due Today: {{tasks.dueTodayCount}}
- Due This Week: {{tasks.dueThisWeekCount}}
- Completion Rate: {{tasks.completionRate}}%
- Velocity: {{tasks.velocity}}

Document Metrics:
- Documents: {{documents.documentCount}}
- Knowledge Base Articles: {{documents.knowledgeBaseCount}}
- Total Storage: {{documents.totalSizeBytes}} bytes

Notification Metrics:
- Total: {{notifications.totalCount}}
- Unread: {{notifications.unreadCount}}
- Created Today: {{notifications.todayCount}}

Activities: {{activities.totalCount}}
Comments: {{commentCount}}
Members: {{memberCount}}
Projects: {{projectCount}}

Member Summary:
- Total: {{memberSummary.totalMembers}}
- Active: {{memberSummary.activeMembers}}
- Pending: {{memberSummary.pendingActivation}}
- Locked: {{memberSummary.lockedAccounts}}
- Suspended: {{memberSummary.suspendedAccounts}}

Project Summary:
- Total: {{projectSummary.totalProjects}}
- Active: {{projectSummary.activeProjects}}
- Archived: {{projectSummary.archivedProjects}}

Workspace Overview:
- Departments: {{workspaceSummary.departmentCount}}
- Teams: {{workspaceSummary.teamCount}}

{{#if projectName}}
Project: {{projectName}} ({{projectStatus}})
Progress: {{projectProgress.progressPercentage}}% complete ({{projectProgress.completedTasks}}/{{projectProgress.totalTasks}} tasks)
{{/if}}

Charts:
{{#each charts.charts}}
- {{title}} ({{type}}): {{labels}}
{{/each}}

Return ONLY valid JSON with this exact structure:
{
  "executiveSummary": "...",
  "kpiHighlights": "...",
  "trendsSummary": "...",
  "riskAssessment": ["...", "..."],
  "recommendations": ["...", "..."]
}',
    TRUE,
    'Analyzes workspace analytics data and returns structured JSON for executive report generation.',
    0
),
(
    gen_random_uuid(),
    'analytics_summary_generation',
    'Analytics Summary - Generation',
    'ANALYTICS',
    'You are an experienced analytics officer writing a professional executive analytics report. Based on the following analysis data, generate a comprehensive, well-structured executive report.

Analysis Data:
{{analysis}}

Write a professional analytics executive report with the following sections:

1. Executive Summary
   - Brief overview of the workspace/project performance
   - Key achievements and highlights
   - Overall health assessment

2. Key Performance Indicators
   - Task completion metrics and rates
   - Project progress overview
   - Member engagement and activity levels
   - Document and knowledge base growth

3. Trends & Insights
   - Notable patterns in the data
   - Areas of improvement or concern
   - Comparative analysis (if historical data available)

4. Risk Assessment
   - Current risks and blockers
   - Overdue tasks and bottlenecks
   - Member or resource constraints
   - Storage or notification fatigue

5. Recommendations
   - Actionable next steps
   - Prioritization suggestions
   - Resource optimization opportunities
   - Process improvement ideas

Use a professional, data-driven tone. Reference actual metrics from the analysis. Do not invent information. Format numbers clearly (percentages, counts, trends).',
    TRUE,
    'Generates a professional analytics executive report from structured analysis data.',
    0
);
