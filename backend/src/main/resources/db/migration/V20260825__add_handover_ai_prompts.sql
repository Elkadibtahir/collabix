-- Seed prompts for Handover AI
INSERT INTO ai_prompts (id, code, name, category, prompt_template, active, description, version) VALUES
(
    gen_random_uuid(),
    'handover_executive_report_analysis',
    'Handover Executive Report - Analysis',
    'HANDOVER',
    'You are a handover analysis engine. Analyze the following handover information and return ONLY a structured JSON object.

Context:
- Project: {{projectName}}
- Report Date: {{reportDate}}
- Total Handover Entries: {{totalEntries}}
- Pending Tasks: {{pendingTaskCount}}
- Completed Tasks: {{completedTaskCount}}
- Recent Comments: {{recentCommentCount}}

Morning Shift Entries:
{{#each entriesMorning}}
- Author: {{authorName}}
  Work Finished: {{workFinished}}
  Work Remaining: {{workRemaining}}
  Difficulties: {{difficulties}}
  Blockers: {{blockers}}
  Important Info: {{importantInformation}}
  Priorities: {{priorities}}
{{/each}}

Evening Shift Entries:
{{#each entriesEvening}}
- Author: {{authorName}}
  Work Finished: {{workFinished}}
  Work Remaining: {{workRemaining}}
  Difficulties: {{difficulties}}
  Blockers: {{blockers}}
  Important Info: {{importantInformation}}
  Priorities: {{priorities}}
{{/each}}

Pending Tasks:
{{#each pendingTasks}}
- {{title}} (Priority: {{priority}})
{{/each}}

Completed Tasks:
{{#each completedTasks}}
- {{title}}
{{/each}}

Return ONLY valid JSON with this exact structure:
{
  "executiveSummary": "...",
  "completedWork": "...",
  "pendingWork": "...",
  "criticalRisks": ["...", "..."],
  "blockedTasks": ["...", "..."],
  "recommendations": ["...", "..."],
  "priorityActions": ["...", "..."],
  "workContinuity": "..."
}',
    TRUE,
    'Analyzes handover entries and returns structured JSON for executive report generation.',
    0
),
(
    gen_random_uuid(),
    'handover_executive_report_generation',
    'Handover Executive Report - Generation',
    'HANDOVER',
    'You are an experienced operations manager writing a professional handover journal. Based on the following analysis data, generate a comprehensive, well-structured handover report.

Analysis Data:
{{analysis}}

Write a professional handover journal with the following sections:

1. Executive Summary
   - Brief overview of the shift
   - Key achievements
   - Overall status

2. Completed Work
   - What was accomplished
   - Notable completions

3. Pending Work
   - What remains to be done
   - Next steps required

4. Critical Risks & Issues
   - Current blockers
   - Potential risks
   - Impact assessment

5. Recommendations
   - Suggested actions
   - Improvement opportunities

6. Priority Actions
   - What needs immediate attention
   - Urgent follow-ups

7. Work Continuity
   - Guidance for the next shift
   - Key handover points

Use a professional, clear tone. Be specific and reference actual data from the analysis. Do not invent information.',
    TRUE,
    'Generates a professional handover journal from structured analysis data.',
    0
);
