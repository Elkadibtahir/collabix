import type {
  KPIMetric,
  ProductivityMetrics,
  WorkloadMetrics,
  PerformanceMetrics,
  DepartmentAnalytics,
  TeamAnalytics,
  ProjectAnalytics,
  ActivityTimelineEvent,
} from './analytics-types';

export const kpiMetrics: KPIMetric[] = [];

export const productivityMetrics: ProductivityMetrics = {
  tasksCompleted: 0,
  averageCompletionTime: 0,
  dailyProductivity: 0,
  weeklyProductivity: 0,
  monthlyProductivity: 0,
  tasksPerMember: 0,
  tasksPerTeam: 0,
  tasksPerDepartment: 0,
};

export const workloadMetrics: WorkloadMetrics = {
  capacity: 0,
  assignedTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  blockedTasks: 0,
  overloadedMembers: 0,
  availableCapacity: 0,
};

export const performanceMetrics: PerformanceMetrics = {
  taskCompletionRate: 0,
  projectSuccessRate: 0,
  deadlineCompliance: 0,
  averageDelay: 0,
  knowledgeContributions: 0,
  averageResolutionTime: 0,
};

export const projectProgressChart: { label: string; value: number }[] = [];
export const taskCompletionChart: { label: string; value: number }[] = [];
export const departmentProductivityChart: { label: string; value: number }[] = [];
export const taskStatusChart: { label: string; color: string; value: number; percentage: number }[] = [];
export const departmentAnalytics: DepartmentAnalytics[] = [];
export const teamAnalytics: TeamAnalytics[] = [];
export const projectAnalytics: ProjectAnalytics[] = [];
export const recentActivity: ActivityTimelineEvent[] = [];
