import { useMemo } from 'react';
import { useWorkspaceId } from '../../hooks/useWorkspaceId';
import { useDepartmentList } from '../../services/department-hooks';
import { useWorkspaceTeams } from '../../services/team-hooks';
import type { WorkspaceTeam } from '../../services/team-hooks';
import type { Team } from './types';

const mockManagers = ['Alice Chen', 'Bob Martinez', 'Carol Johnson', 'David Kim', 'Eve Williams'];

const statusMap: Record<string, Team['status']> = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

function mapWorkspaceTeamToTeam(t: WorkspaceTeam): Team {
  return {
    id: t.id,
    name: t.name,
    description: '',
    department: t.departmentName ?? '',
    manager: 'Unassigned',
    managerTone: 0,
    members: [],
    memberCount: t.memberCount ?? 0,
    activeProjects: 0,
    openTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    workload: 0,
    status: statusMap[t.status] ?? 'active',
    createdAt: '',
    projects: [],
    activity: [],
    upcomingDeadlines: 0,
  };
}

export function useTeamsData() {
  const wsId = useWorkspaceId();
  const { data: deptList } = useDepartmentList(wsId);
  const { data: workspaceTeams } = useWorkspaceTeams(wsId);

  const departments = useMemo(() => {
    if (deptList && deptList.length > 0) {
      return deptList.map((d) => d.name);
    }
    return ['Engineering', 'Product', 'Marketing', 'People & Culture', 'Data & AI', 'Security', 'Finance'];
  }, [deptList]);

  const teams: Team[] = useMemo(
    () => (workspaceTeams ?? []).map(mapWorkspaceTeamToTeam),
    [workspaceTeams],
  );

  return { teams, departments, managers: mockManagers };
}
