import { DeptManagement } from '../common/DeptManagement';

export function AIManagementTab() {
  return (
    <DeptManagement data={{
      members: [
        { id: 'm1', name: 'Dr. Rachel Lin', role: 'AI Director', team: 'Leadership', workload: 85, initials: 'DR', tone: 0 },
        { id: 'm2', name: 'Mark Kim', role: 'ML Engineering Lead', team: 'ML Engineering', workload: 78, initials: 'MK', tone: 1 },
        { id: 'm3', name: 'Anna Chen', role: 'Data Science Lead', team: 'Data Science', workload: 72, initials: 'AC', tone: 2 },
        { id: 'm4', name: 'Pete Briggs', role: 'Research Scientist', team: 'Research', workload: 60, initials: 'PB', tone: 3 },
        { id: 'm5', name: 'Sarah Yu', role: 'Automation Lead', team: 'Automation', workload: 55, initials: 'SY', tone: 4 },
      ],
      teams: [
        { id: 't1', name: 'ML Engineering', lead: 'Mark Kim', members: 6 },
        { id: 't2', name: 'Data Science', lead: 'Anna Chen', members: 5 },
        { id: 't3', name: 'Research', lead: 'Pete Briggs', members: 4 },
        { id: 't4', name: 'Automation', lead: 'Sarah Yu', members: 3 },
      ],
    }} />
  );
}
