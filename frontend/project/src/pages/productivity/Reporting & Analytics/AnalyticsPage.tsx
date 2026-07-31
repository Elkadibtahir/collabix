import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Filter,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Target,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';
import { BarChart, LineChart as LineChartComponent, PieChart as PieChartComponent } from '../../../components/ui/Charts';
import { Avatar, AvatarGroup } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { Timeline, type TimelineItem } from '../../../components/ui/Timeline';
import { cn } from '../../../lib/cn';
import {
  kpiMetrics,
  projectProgressChart,
  taskCompletionChart,
  departmentProductivityChart,
  taskStatusChart,
  departmentAnalytics,
  teamAnalytics,
  projectAnalytics,
  recentActivity,
  productivityMetrics,
  workloadMetrics,
  performanceMetrics,
} from './analytics-data';

type ViewMode = 'overview' | 'departments' | 'teams' | 'projects';

export function AnalyticsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [search, setSearch] = useState('');

  const tabItems: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'departments', label: 'Departments', count: departmentAnalytics.length },
    { id: 'teams', label: 'Teams', count: teamAnalytics.length },
    { id: 'projects', label: 'Projects', count: projectAnalytics.length },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Analytics & Reporting</h1>
        <p className="text-body text-text-secondary">
          Comprehensive insights into workspace productivity, team performance, and project progress.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-2">
          <Dropdown
            trigger={
              <Button variant="outline">
                {dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : dateRange === 'quarter' ? 'This Quarter' : 'This Year'}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'This Week', onClick: () => setDateRange('week') },
              { label: 'This Month', onClick: () => setDateRange('month') },
              { label: 'This Quarter', onClick: () => setDateRange('quarter') },
              { label: 'This Year', onClick: () => setDateRange('year') },
            ]}
          />

          <Dropdown
            trigger={
              <Button variant="outline">
                View
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'Overview', onClick: () => setViewMode('overview') },
              { label: 'By Department', onClick: () => setViewMode('departments') },
              { label: 'By Team', onClick: () => setViewMode('teams') },
              { label: 'By Project', onClick: () => setViewMode('projects') },
            ]}
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="outline" leftIcon={<Download />}>
            Export Report
          </Button>
          <Button leftIcon={<Plus />}>
            Custom Report
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      {viewMode === 'overview' && (
        <div>
          <h2 className="text-section font-semibold text-text-primary mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {kpiMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      {viewMode === 'overview' && (
        <div>
          <h2 className="text-section font-semibold text-text-primary mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Project Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Progress
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {projectProgressChart.map((project) => (
                    <div key={project.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body font-medium text-text-primary">
                          {project.label}
                        </span>
                        <span className="text-body font-semibold text-text-primary">
                          {project.value}%
                        </span>
                      </div>
                      <Progress value={project.value} />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Task Completion Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Task Completion Trend
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="flex items-end justify-around gap-2 h-48">
                  {taskCompletionChart.map((week) => (
                    <div key={week.label} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-accent-500 rounded-t"
                        style={{ height: `${(week.value / 50) * 100}%` }}
                      />
                      <span className="text-2xs text-text-tertiary">{week.label}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Department Productivity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Department Productivity
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {departmentProductivityChart.map((dept) => (
                    <div key={dept.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-body font-medium text-text-primary">
                          {dept.label}
                        </span>
                        <span className="text-body font-semibold text-text-primary">
                          {dept.value}%
                        </span>
                      </div>
                      <Progress value={dept.value} />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Task Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {taskStatusChart.map((status) => (
                    <div key={status.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: status.color === 'success' ? '#10b981' : 
                                              status.color === 'info' ? '#3b82f6' :
                                              status.color === 'warning' ? '#f59e0b' : '#ef4444'
                            }}
                          />
                          <span className="text-body text-text-primary">{status.label}</span>
                        </div>
                        <span className="text-body font-semibold text-text-primary">
                          {status.value} ({status.percentage}%)
                        </span>
                      </div>
                      <Progress value={status.percentage || 0} />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Department View */}
      {viewMode === 'departments' && (
        <div className="space-y-4">
          <h2 className="text-section font-semibold text-text-primary">Department Analytics</h2>
          {departmentAnalytics.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      )}

      {/* Team View */}
      {viewMode === 'teams' && (
        <div className="space-y-4">
          <h2 className="text-section font-semibold text-text-primary">Team Performance</h2>
          {teamAnalytics.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      {/* Project View */}
      {viewMode === 'projects' && (
        <div className="space-y-4">
          <h2 className="text-section font-semibold text-text-primary">Project Overview</h2>
          {projectAnalytics.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Recent Activity */}
      {viewMode === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border-subtle last:pb-0 last:border-0">
                  <div className="text-xl shrink-0">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-text-primary">
                      <span className="font-semibold">{activity.actor}</span>{' '}
                      <span className="text-text-secondary">{activity.action}</span>
                    </p>
                    <p className="text-caption text-text-tertiary">{activity.entity}</p>
                    <p className="text-2xs text-text-tertiary mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ metric }: { metric: any }) {
  const bgColor = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
    danger: 'bg-danger-50 dark:bg-danger-100 text-danger-700 dark:text-danger-200',
  } as const;

  const trendIcon = metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                    metric.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null;

  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bgColor[metric.color])}>
      <p className="text-2xs font-medium opacity-75 mb-2">{metric.label}</p>
      <div className="flex items-center justify-between">
        <p className="text-section font-bold">{metric.value}</p>
        {trendIcon && metric.trendValue && (
          <div className="flex items-center gap-1">
            {trendIcon}
            <span className="text-2xs font-semibold">{Math.abs(metric.trendValue)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DepartmentCard({ department }: { department: any }) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <h3 className="text-body font-semibold text-text-primary mb-2">
            {department.name}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <InfoBox label="Members" value={department.overview.activeMembers} />
            <InfoBox label="Projects" value={department.overview.activeProjects} />
            <InfoBox label="Completed" value={department.overview.completedTasks} />
            <InfoBox label="Pending" value={department.overview.pendingTasks} />
            <InfoBox label="Productivity" value={`${department.overview.averageProductivity}%`} />
          </div>
        </div>

        <div>
          <p className="text-caption font-medium text-text-secondary mb-3">Active Projects</p>
          <div className="space-y-2">
            {department.projects.map((project: any) => (
              <div key={project.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-caption text-text-primary">{project.name}</span>
                  <Badge
                    tone={
                      project.status === 'on-track'
                        ? 'success'
                        : project.status === 'at-risk'
                          ? 'warning'
                          : 'danger'
                    }
                    variant="soft"
                   
                  >
                    {project.status}
                  </Badge>
                </div>
                <Progress value={project.progress} />
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function TeamCard({ team }: { team: any }) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-body font-semibold text-text-primary">
              {team.name}
            </h3>
            <p className="text-caption text-text-secondary">{team.department}</p>
          </div>
          <Badge tone="accent" variant="soft">
            {team.members} members
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoBox label="Projects" value={team.overview.activeProjects} />
          <InfoBox label="Completed" value={team.overview.tasksCompleted} />
          <InfoBox label="Pending" value={team.overview.pendingTasks} />
          <InfoBox label="Velocity" value={team.overview.averageVelocity} />
        </div>

        {team.sprintProgress && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-caption font-medium text-text-secondary">Sprint Progress</p>
              <span className="text-body font-semibold text-text-primary">
                {team.sprintProgress.progress}%
              </span>
            </div>
            <Progress value={team.sprintProgress.progress} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border-subtle">
          <PerformanceMetric label="Completion" value={team.performance.completionRate} />
          <PerformanceMetric label="On-Time" value={team.performance.onTimeDelivery} />
          <PerformanceMetric label="Quality" value={team.performance.qualityScore} />
        </div>
      </CardBody>
    </Card>
  );
}

function ProjectCard({ project }: { project: any }) {
  const statusColor = {
    'on-track': 'success',
    'at-risk': 'warning',
    blocked: 'danger',
  } as const;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-body font-semibold text-text-primary">
              {project.name}
            </h3>
            <p className="text-caption text-text-secondary">
              Manager: {project.manager} • {project.department}
            </p>
          </div>
          <Badge tone={statusColor[project.overview.status]} variant="soft">
            {project.overview.status}
          </Badge>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-caption font-medium text-text-secondary">Overall Progress</p>
            <span className="text-body font-semibold text-text-primary">
              {project.overview.progress}%
            </span>
          </div>
          <Progress value={project.overview.progress} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoBox label="Tasks" value={project.tasks.total} />
          <InfoBox label="Completed" value={project.tasks.completed} />
          <InfoBox label="Pending" value={project.tasks.pending} />
          <InfoBox label="Blocked" value={project.tasks.blocked} />
        </div>

        <div>
          <p className="text-caption font-medium text-text-secondary mb-2">Milestones</p>
          <div className="space-y-1">
            {project.milestones.map((milestone: any) => (
              <div key={milestone.name} className="flex items-center justify-between p-2 rounded bg-surface-2">
                <span className="text-caption text-text-primary">{milestone.name}</span>
                <Badge
                  tone={
                    milestone.status === 'completed'
                      ? 'success'
                      : milestone.status === 'pending'
                        ? 'info'
                        : 'danger'
                  }
                  variant="soft"
                 
                >
                  {milestone.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function InfoBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 p-2 text-center">
      <p className="text-2xs text-text-tertiary mb-1">{label}</p>
      <p className="text-body font-bold text-text-primary">{value}</p>
    </div>
  );
}

function PerformanceMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xs text-text-tertiary mb-1">{label}</p>
      <div className="flex items-center gap-1">
        <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-500"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-2xs font-semibold text-text-primary">{value}%</span>
      </div>
    </div>
  );
}
