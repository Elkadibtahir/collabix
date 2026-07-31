import { DeptManagement } from '../common/DeptManagement';

export function CybersecurityManagementTab() {
  return (
    <DeptManagement data={{
      members: [
        { id: 'm1', name: 'Ahmed Hassan', role: 'CISO', team: 'Leadership', workload: 90, initials: 'AH', tone: 0 },
        { id: 'm2', name: 'Sofia Cruz', role: 'Security Engineer', team: 'AppSec', workload: 75, initials: 'SC', tone: 1 },
        { id: 'm3', name: 'James Doe', role: 'Compliance Specialist', team: 'Compliance', workload: 60, initials: 'JD', tone: 2 },
        { id: 'm4', name: 'Lisa Kim', role: 'Threat Analyst', team: 'AppSec', workload: 70, initials: 'LK', tone: 3 },
        { id: 'm5', name: 'Raj Mehta', role: 'Network Security', team: 'InfraSec', workload: 65, initials: 'RM', tone: 4 },
      ],
      teams: [
        { id: 't1', name: 'AppSec', lead: 'Sofia Cruz', members: 5 },
        { id: 't2', name: 'InfraSec', lead: 'Raj Mehta', members: 4 },
        { id: 't3', name: 'Compliance', lead: 'James Doe', members: 3 },
      ],
    }} />
  );
}
