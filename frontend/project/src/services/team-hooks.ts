import { useQuery } from '@tanstack/react-query';
import { listDepartments, type DepartmentSummary } from './department-service';
import { teamService, type TeamSummary } from './team-service';

export interface WorkspaceTeam extends TeamSummary {
  departmentId: string;
  departmentName: string;
}

export function useWorkspaceTeams(wsId: string | undefined) {
  return useQuery<WorkspaceTeam[]>({
    queryKey: ['workspace', 'teams', wsId],
    queryFn: async () => {
      const departments = await listDepartments(wsId!);
      const allTeams = await Promise.all(
        departments.map(async (dept: DepartmentSummary) => {
          try {
            const teams = await teamService(wsId!).listByDepartment(dept.id);
            return teams.map((t: TeamSummary) => ({
              ...t,
              departmentId: dept.id,
              departmentName: dept.name,
            }));
          } catch {
            return [];
          }
        }),
      );
      return allTeams.flat();
    },
    enabled: !!wsId,
  });
}
