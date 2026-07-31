export type ReportStatus = 'pending' | 'completed' | 'archived';
export type Shift = 'morning' | 'afternoon' | 'evening' | 'night';

export interface HandoverReport {
  id: string;
  reportNumber: string;
  department: string;
  team?: string;
  project?: string;
  shift: Shift;
  date: string;
  generatedAt: string;
  status: ReportStatus;
  submittedEntries: number;
  contributors: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  criticalIssues: number;
  overallProgress: number;
}

export interface HandoverReportDetails {
  id: string;
  reportNumber: string;
  department: string;
  team?: string;
  project?: string;
  shift: Shift;
  date: string;
  generatedAt: string;
  executiveSummary: string;
  projectsCovered: Array<{
    name: string;
    progress: number;
    status: 'on-track' | 'at-risk' | 'blocked';
  }>;
  completedWork: Array<{
    title: string;
    contributor: string;
    project: string;
  }>;
  pendingWork: Array<{
    title: string;
    assignee: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
  blockers: Array<{
    title: string;
    type: 'technical' | 'business' | 'dependency';
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recommendations: string[];
  statistics: {
    employees: number;
    entriesSubmitted: number;
    tasksCompleted: number;
    tasksPending: number;
    blockedTasks: number;
    averageProgress: number;
    averageRemainingTime: string;
    overallCompletionRate: number;
  };
  acknowledgements: string[];
}
