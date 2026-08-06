import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MoreHorizontal,
  Edit2,
  UserX,
  Share2,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, type Tone } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { IconButton } from '../../components/ui/IconButton';
import { Progress } from '../../components/ui/Progress';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { Timeline, type TimelineItem } from '../../components/ui/Timeline';
import { BarChart } from '../../components/ui/Charts';
import { Dropdown, type DropdownItem } from '../../components/ui/Dropdown';
import { cn } from '../../lib/cn';
import { useToast } from '../../components/ui/Toast';
import type { MemberProfile } from './members-types';
import { membersList } from './members-data';

interface MemberDetailsPageProps {
  memberId: string;
  onBack: () => void;
}

export function MemberDetailsPage({ memberId, onBack }: MemberDetailsPageProps) {
  const { toast } = useToast();
  const member = membersList.find((m) => m.id === memberId) || membersList[0];
  const [activeTab, setActiveTab] = useState('overview');

  const tabItems: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects', count: member.currentProjects },
    { id: 'tasks', label: 'Tasks', count: member.currentTasks },
    { id: 'documents', label: 'Documents', count: 0 },
    { id: 'activity', label: 'Activity' },
    { id: 'performance', label: 'Performance' },
  ];

  const actionItems: DropdownItem[] = [
    { label: 'Edit Profile', icon: <Edit2 className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { label: 'Share Profile', icon: <Share2 className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { divider: true },
    { label: 'Deactivate Member', icon: <UserX className="h-4 w-4" />, danger: true, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
  ];

  const statusColor: Record<typeof member.status, string> = {
    active: 'success',
    away: 'warning',
    offline: 'neutral',
    inactive: 'danger',
  };

  const availabilityColor: Record<typeof member.availability, string> = {
    available: 'success',
    busy: 'danger',
    away: 'warning',
    offline: 'neutral',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-4">
              <Avatar name={member.name} size="lg" tone={member.tone} />
              <div>
                <h1 className="text-page font-semibold text-text-primary">{member.name}</h1>
                <p className="text-body text-text-secondary">{member.jobTitle}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge tone="accent" variant="soft">{member.department}</Badge>
                  <Badge tone={statusColor[member.status] as Tone} variant="soft" dot>
                    {member.status}
                  </Badge>
                  <Badge tone={availabilityColor[member.availability] as Tone} variant="soft" dot>
                    {member.availability}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="md" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Share</Button>
          <Dropdown trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal /></IconButton>} items={actionItems} align="right" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Briefcase />} label="Department" value={member.department} tone="accent" />
        <StatCard icon={<Users />} label="Team" value={member.team} tone="info" />
        <StatCard icon={<CheckCircle2 />} label="Tasks" value={`${member.currentTasks} / ${member.completedTasks}`} tone="success" />
        <StatCard icon={<TrendingUp />} label="Completion Rate" value={`${member.taskCompletionRate}%`} tone="success" />
      </div>

      {/* Tabs */}
      <Tabs items={tabItems} active={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab member={member} />}
      {activeTab === 'projects' && <ProjectsTab member={member} />}
      {activeTab === 'tasks' && <TasksTab member={member} />}
      {activeTab === 'documents' && <DocumentsTab member={member} />}
      {activeTab === 'activity' && <ActivityTab member={member} />}
      {activeTab === 'performance' && <PerformanceTab member={member} />}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  const bgColor: Record<string, string> = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
  };

  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bgColor[tone])}>
      <div className="flex items-center gap-2 mb-2">
        <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <p className="text-2xs font-medium opacity-75">{label}</p>
      </div>
      <p className="text-section font-semibold">{value}</p>
    </div>
  );
}

function OverviewTab({ member }: { member: MemberProfile }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <InfoRow label="Email" value={member.email} icon={<Mail />} />
            {member.phone && <InfoRow label="Phone" value={member.phone} icon={<Phone />} />}
            {member.location && <InfoRow label="Location" value={member.location} icon={<MapPin />} />}
            {member.timezone && <InfoRow label="Timezone" value={member.timezone} icon={<Clock />} />}
          </CardBody>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <InfoRow label="Job Title" value={member.jobTitle} />
            <InfoRow label="Department" value={member.department} />
            <InfoRow label="Team" value={member.team} />
            <InfoRow label="Role" value={member.role.charAt(0).toUpperCase() + member.role.slice(1)} />
            <InfoRow label="Employment Type" value={member.employmentType.replace('-', ' ')} />
            {member.reportsTo && <InfoRow label="Reports To" value={member.reportsTo} />}
            <InfoRow label="Joined" value={member.joinedDate} icon={<Calendar />} />
          </CardBody>
        </Card>

        {/* Skills */}
        {member.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <Badge key={skill} tone="accent" variant="soft">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Bio */}
        {member.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-body text-text-secondary leading-relaxed">{member.bio}</p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-6">
        {/* Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section">Workload</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-caption font-medium text-text-tertiary">Current</span>
                <span className="text-body font-semibold text-text-primary">{member.workload}%</span>
              </div>
              <Progress value={member.workload} size="md" />
            </div>
            <div className="text-caption text-text-tertiary">
              Average: <span className="font-semibold text-text-primary">{member.averageWorkload}%</span>
            </div>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section">Statistics</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <StatItem label="Active Projects" value={member.currentProjects} />
            <StatItem label="Current Tasks" value={member.currentTasks} />
            <StatItem label="Completed Tasks" value={member.completedTasks} />
            <StatItem label="Completion Rate" value={`${member.taskCompletionRate}%`} />
            {member.directReports > 0 && <StatItem label="Direct Reports" value={member.directReports} />}
          </CardBody>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section">Status</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-caption text-text-secondary">Current Status</span>
              <Badge tone={member.status === 'active' ? 'success' : 'neutral'} variant="soft" dot>
                {member.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-text-secondary">Availability</span>
              <Badge tone={member.availability === 'available' ? 'success' : 'neutral'} variant="soft" dot>
                {member.availability}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-text-secondary">Last Active</span>
              <span className="text-caption font-medium text-text-tertiary">{member.lastActive}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {icon && <span className="shrink-0 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
      <div>
        <p className="text-2xs text-text-tertiary">{label}</p>
        <p className="text-body font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-caption text-text-secondary">{label}</span>
      <span className="text-body font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function ProjectsTab({ member }: { member: MemberProfile }) {
  return (
    <div className="py-6">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 text-center">
        <p className="text-body text-text-secondary mb-2">
          Member is currently assigned to {member.currentProjects} project{member.currentProjects !== 1 ? 's' : ''}.
        </p>
        <p className="text-caption text-text-tertiary">Projects tab will display assigned projects when implemented.</p>
      </div>
    </div>
  );
}

function TasksTab({ member }: { member: MemberProfile }) {
  return (
    <div className="py-6">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 text-center">
        <p className="text-body text-text-secondary mb-2">
          Member has {member.currentTasks} active task{member.currentTasks !== 1 ? 's' : ''} out of {member.completedTasks} total completed.
        </p>
        <p className="text-caption text-text-tertiary">Tasks tab will display task details when implemented.</p>
      </div>
    </div>
  );
}

function DocumentsTab({ member }: { member: MemberProfile }) {
  return (
    <div className="py-6">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 text-center">
        <p className="text-body text-text-secondary">No documents found for this member.</p>
        <p className="text-caption text-text-tertiary mt-1">Documents tab will display shared documents when implemented.</p>
      </div>
    </div>
  );
}

function ActivityTab({ member }: { member: MemberProfile }) {
  const activities: TimelineItem[] = [
    {
      id: '1',
      icon: <CheckCircle2 />,
      tone: 'success',
      title: 'Completed task "Implement OAuth2 flow"',
      timestamp: '2h ago',
    },
    {
      id: '2',
      icon: <Briefcase />,
      tone: 'info',
      title: 'Assigned to project "API Gateway v2"',
      timestamp: '5h ago',
    },
    {
      id: '3',
      icon: <Users />,
      tone: 'accent',
      title: 'Joined Backend Team',
      timestamp: '1d ago',
    },
    {
      id: '4',
      icon: <TrendingUp />,
      tone: 'success',
      title: 'Workload increased to 75%',
      timestamp: '2d ago',
    },
  ];

  return (
    <div className="py-6">
      <Card>
        <CardBody>
          <Timeline items={activities} />
        </CardBody>
      </Card>
    </div>
  );
}

function PerformanceTab({ member }: { member: MemberProfile }) {
  const chartData = [
    { label: 'Week 1', value: 8 },
    { label: 'Week 2', value: 12 },
    { label: 'Week 3', value: 10 },
    { label: 'Week 4', value: 15 },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks Completed This Month</CardTitle>
          <CardDescription>Breakdown by week</CardDescription>
        </CardHeader>
        <CardBody>
          <BarChart data={chartData} height={250} tone="accent" />
        </CardBody>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <MetricRow label="Completion Rate" value={`${member.taskCompletionRate}%`} />
          <MetricRow label="Avg Workload" value={`${member.averageWorkload}%`} />
          <MetricRow label="On-Time Tasks" value="92%" />
          <MetricRow label="Quality Score" value="8.5/10" />
        </CardBody>
      </Card>

      {/* Productivity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Workload Trend</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardBody>
          <BarChart data={[
            { label: 'W1', value: 60 },
            { label: 'W2', value: 70 },
            { label: 'W3', value: 75 },
            { label: 'W4', value: 75 },
          ]} height={250} tone="warning" />
        </CardBody>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          <AchievementBadge label="Perfect Week" icon="🏆" />
          <AchievementBadge label="Team Player" icon="⭐" />
          <AchievementBadge label="On Time" icon="✅" />
        </CardBody>
      </Card>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border-subtle last:pb-0 last:border-b-0">
      <span className="text-caption text-text-secondary">{label}</span>
      <span className="text-body font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function AchievementBadge({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface p-2">
      <span className="text-lg">{icon}</span>
      <span className="text-caption font-medium text-text-primary">{label}</span>
    </div>
  );
}
