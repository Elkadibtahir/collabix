import { Users, Code, GitBranch, Clock, BookOpen, Bug } from 'lucide-react';
import { DeptOverview } from '../common/DeptOverview';

export function DevelopmentOverviewTab() {
  return (
    <DeptOverview data={{
      description: 'The Development department builds and maintains the core product, from backend APIs to frontend interfaces and mobile applications.',
      stats: [
        { label: 'Team Members', value: 28, icon: <Users />, sub: '4 squads', tone: 'accent' },
        { label: 'Active Sprints', value: 3, icon: <GitBranch />, sub: '2 in progress', tone: 'success' },
        { label: 'Open Issues', value: 45, icon: <Bug />, sub: '23 bugs, 22 features', tone: 'warning' },
        { label: 'Sprint Velocity', value: '42 pts', icon: <Clock />, sub: '+5% this sprint', tone: 'info' },
      ],
      projects: [
        { name: 'API Gateway v3', progress: 75, status: 'active', team: 'Backend Squad' },
        { name: 'Dashboard Redesign', progress: 30, status: 'active', team: 'Frontend Squad' },
        { name: 'Mobile App v2', progress: 15, status: 'pending', team: 'Mobile Squad' },
      ],
      team: [
        { initials: 'AK', name: 'Alex Kovac', role: 'Engineering Director' },
        { initials: 'SN', name: 'Sarah Nelson', role: 'Frontend Lead' },
        { initials: 'DW', name: 'David Wu', role: 'Backend Lead' },
        { initials: 'LG', name: 'Luis Garcia', role: 'Mobile Lead' },
        { initials: 'MM', name: 'Maya Mishra', role: 'DevOps Lead' },
      ],
    }} />
  );
}
