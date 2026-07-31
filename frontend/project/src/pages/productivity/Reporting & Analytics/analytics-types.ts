export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'heatmap' | 'scatter';
export type DateRange = 'today' | 'this-week' | 'this-month' | 'this-quarter' | 'this-year' | 'custom';
export type ComparisonType = 'department' | 'team' | 'project' | 'member';

export interface KPIMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  isClickable: boolean;
  icon?: string;
  color?: string;
}

export interface ChartData {
  id?: string;
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface AnalyticsChart {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  data: ChartData[];
  isClickable: boolean;
  insights?: string[];
}

export interface ActivityTimelineEvent {
  id: string;
  type: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
  icon?: string;
  details?: string;
}

export interface AnalyticsDashboard {
  workspace: string;
  department?: string;
  team?: string;
  project?: string;
  member?: string;
  dateRange: DateRange;
  kpis: KPIMetric[];
  charts: AnalyticsChart[];
  recentActivity: ActivityTimelineEvent[];
}

export interface DepartmentAnalytics {
  id: string;
  name: string;
  overview: {
    activeMembers: number;
    activeProjects: number;
    completedTasks: number;
    pendingTasks: number;
    averageProductivity: number;
  };
  productivity: {
    tasksCompleted: number;
    averageCompletionTime: number;
    completionRate: number;
  };
  projects: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
  }>;
  members: Array<{
    id: string;
    name: string;
    tasksCompleted: number;
    workload: number;
  }>;
}

export interface TeamAnalytics {
  id: string;
  name: string;
  department: string;
  members: number;
  overview: {
    activeProjects: number;
    tasksCompleted: number;
    pendingTasks: number;
    averageVelocity: number;
  };
  sprintProgress?: {
    tasksCompleted: number;
    totalTasks: number;
    progress: number;
  };
  workload: {
    assigned: number;
    completed: number;
    pending: number;
    blocked: number;
  };
  performance: {
    completionRate: number;
    onTimeDelivery: number;
    qualityScore: number;
  };
}

export interface ProjectAnalytics {
  id: string;
  name: string;
  department: string;
  manager: string;
  overview: {
    progress: number;
    status: 'on-track' | 'at-risk' | 'blocked';
    startDate: string;
    endDate: string;
    deadline: string;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    blocked: number;
  };
  milestones: Array<{
    name: string;
    completionDate: string;
    status: 'completed' | 'pending' | 'overdue';
  }>;
  members: Array<{
    name: string;
    role: string;
    tasksCompleted: number;
  }>;
}

export interface ProductivityMetrics {
  tasksCompleted: number;
  averageCompletionTime: number;
  dailyProductivity: number;
  weeklyProductivity: number;
  monthlyProductivity: number;
  tasksPerMember: number;
  tasksPerTeam: number;
  tasksPerDepartment: number;
}

export interface WorkloadMetrics {
  capacity: number;
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  overloadedMembers: number;
  availableCapacity: number;
}

export interface PerformanceMetrics {
  taskCompletionRate: number;
  projectSuccessRate: number;
  deadlineCompliance: number;
  averageDelay: number;
  knowledgeContributions: number;
  averageResolutionTime: number;
}

export interface AnalyticsFilter {
  workspace?: string;
  department?: string;
  team?: string;
  project?: string;
  member?: string;
  dateRange?: DateRange;
  status?: string;
  priority?: string;
}
