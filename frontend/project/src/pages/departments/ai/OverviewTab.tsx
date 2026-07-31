import { Users, Cpu, FlaskConical, Rocket, Brain, Lightbulb } from 'lucide-react';
import { DeptOverview } from '../common/DeptOverview';

export function AIOverviewTab() {
  return (
    <DeptOverview data={{
      description: 'The AI department drives innovation through machine learning, automation, and intelligent systems that enhance products and operations.',
      stats: [
        { label: 'Team Members', value: 18, icon: <Users />, sub: '3 teams', tone: 'accent' },
        { label: 'Active Projects', value: 8, icon: <Cpu />, sub: '4 in deployment', tone: 'success' },
        { label: 'Active Experiments', value: 12, icon: <FlaskConical />, sub: '7 running', tone: 'info' },
        { label: 'Automation Rate', value: '76%', icon: <Rocket />, sub: '+8% this quarter', tone: 'warning' },
      ],
      projects: [
        { name: 'Customer Chatbot v2', progress: 60, status: 'active', team: 'ML Team' },
        { name: 'Document Classification', progress: 85, status: 'active', team: 'Data Team' },
        { name: 'Predictive Analytics Engine', progress: 25, status: 'pending', team: 'Research' },
      ],
      team: [
        { initials: 'DR', name: 'Dr. Rachel Lin', role: 'AI Director' },
        { initials: 'MK', name: 'Mark Kim', role: 'ML Engineering Lead' },
        { initials: 'AC', name: 'Anna Chen', role: 'Data Science Lead' },
        { initials: 'PB', name: 'Pete Briggs', role: 'Research Scientist' },
        { initials: 'SY', name: 'Sarah Yu', role: 'Automation Lead' },
      ],
    }} />
  );
}
