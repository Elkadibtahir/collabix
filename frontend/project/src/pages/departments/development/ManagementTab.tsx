import { DeptManagement } from '../common/DeptManagement';

export function DevelopmentManagementTab() {
  return (
    <DeptManagement data={{
      members: [
        { id: 'm1', name: 'Alex Kovac', role: 'Engineering Director', team: 'Leadership', workload: 88, initials: 'AK', tone: 0 },
        { id: 'm2', name: 'Sarah Nelson', role: 'Frontend Lead', team: 'Frontend', workload: 75, initials: 'SN', tone: 1 },
        { id: 'm3', name: 'David Wu', role: 'Backend Lead', team: 'Backend', workload: 82, initials: 'DW', tone: 2 },
        { id: 'm4', name: 'Luis Garcia', role: 'Mobile Lead', team: 'Mobile', workload: 60, initials: 'LG', tone: 3 },
        { id: 'm5', name: 'Maya Mishra', role: 'DevOps Lead', team: 'DevOps', workload: 70, initials: 'MM', tone: 4 },
      ],
      teams: [
        { id: 't1', name: 'Frontend', lead: 'Sarah Nelson', members: 8 },
        { id: 't2', name: 'Backend', lead: 'David Wu', members: 7 },
        { id: 't3', name: 'Mobile', lead: 'Luis Garcia', members: 5 },
        { id: 't4', name: 'DevOps', lead: 'Maya Mishra', members: 3 },
      ],
    }} />
  );
}
