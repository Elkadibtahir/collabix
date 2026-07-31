import { useMemo } from 'react';
import { useWorkspaceId } from '../../hooks/useWorkspaceId';
import { useDepartmentList } from '../../services/department-hooks';
import type { Team } from './types';

const mockTeams: Team[] = [
  {
    id: 'team-1', name: 'Platform Engineering', description: 'Core platform, infrastructure and DevOps.',
    department: 'Engineering', manager: 'Alice Chen', managerTone: 0,
    members: [], memberCount: 8, activeProjects: 3, openTasks: 12, completedTasks: 45,
    completionRate: 78, workload: 72, status: 'active', createdAt: 'Jan 2026',
    projects: [], activity: [], upcomingDeadlines: 3,
  },
  {
    id: 'team-2', name: 'Product Design', description: 'UX/UI design, design system and product research.',
    department: 'Product', manager: 'Bob Martinez', managerTone: 1,
    members: [], memberCount: 5, activeProjects: 2, openTasks: 8, completedTasks: 32,
    completionRate: 82, workload: 65, status: 'active', createdAt: 'Feb 2026',
    projects: [], activity: [], upcomingDeadlines: 2,
  },
  {
    id: 'team-3', name: 'Growth Marketing', description: 'Demand generation, content marketing and SEO.',
    department: 'Marketing', manager: 'Carol Johnson', managerTone: 2,
    members: [], memberCount: 6, activeProjects: 4, openTasks: 15, completedTasks: 28,
    completionRate: 65, workload: 85, status: 'active', createdAt: 'Mar 2026',
    projects: [], activity: [], upcomingDeadlines: 5,
  },
  {
    id: 'team-4', name: 'People Operations', description: 'HR operations, payroll and employee experience.',
    department: 'People & Culture', manager: 'David Kim', managerTone: 3,
    members: [], memberCount: 4, activeProjects: 2, openTasks: 6, completedTasks: 20,
    completionRate: 90, workload: 55, status: 'active', createdAt: 'Apr 2026',
    projects: [], activity: [], upcomingDeadlines: 1,
  },
];

const mockManagers = ['Alice Chen', 'Bob Martinez', 'Carol Johnson', 'David Kim', 'Eve Williams'];

export function useTeamsData() {
  const wsId = useWorkspaceId();
  const { data: deptList } = useDepartmentList(wsId);

  const departments = useMemo(() => {
    if (deptList && deptList.length > 0) {
      return deptList.map((d) => d.name);
    }
    return ['Engineering', 'Product', 'Marketing', 'People & Culture', 'Data & AI', 'Security', 'Finance'];
  }, [deptList]);

  return { teams: mockTeams, departments, managers: mockManagers };
}
