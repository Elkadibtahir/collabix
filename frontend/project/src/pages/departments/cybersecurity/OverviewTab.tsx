import { Shield, AlertTriangle, CheckCircle, Users, Lock, Activity } from 'lucide-react';
import { DeptOverview } from '../common/DeptOverview';

export function CybersecurityOverviewTab() {
  return (
    <DeptOverview data={{
      description: 'The Cybersecurity department protects organizational assets, monitors threats, and ensures compliance with security standards.',
      stats: [
        { label: 'Team Members', value: 12, icon: <Users />, sub: '2 teams', tone: 'accent' },
        { label: 'Security Score', value: '86/100', icon: <Shield />, sub: '+4 this quarter', tone: 'success' },
        { label: 'Open Incidents', value: 3, icon: <AlertTriangle />, sub: '2 critical', tone: 'warning' },
        { label: 'Compliance Rate', value: '94%', icon: <CheckCircle />, sub: 'across all standards', tone: 'info' },
      ],
      projects: [
        { name: 'SOC 2 Type II Certification', progress: 78, status: 'active', team: 'Compliance Team' },
        { name: 'Endpoint Security Upgrade', progress: 55, status: 'active', team: 'InfraSec Team' },
        { name: 'Security Awareness Training', progress: 90, status: 'active', team: 'All Teams' },
      ],
      team: [
        { initials: 'AH', name: 'Ahmed Hassan', role: 'CISO' },
        { initials: 'SC', name: 'Sofia Cruz', role: 'Security Engineer' },
        { initials: 'JD', name: 'James Doe', role: 'Compliance Specialist' },
        { initials: 'LK', name: 'Lisa Kim', role: 'Threat Analyst' },
        { initials: 'RM', name: 'Raj Mehta', role: 'Network Security' },
      ],
    }} />
  );
}
