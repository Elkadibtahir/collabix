import { GitBranch, Code, Bug, CheckCircle, Users, BookOpen } from 'lucide-react';
import { DeptActivity } from '../common/DeptActivity';

export function DevelopmentActivityTab() {
  return (
    <DeptActivity items={[
      { id: 'a1', icon: <GitBranch />, tone: 'accent', title: 'Sprint 24 "API Optimization" started', timestamp: '2h ago' },
      { id: 'a2', icon: <Code />, tone: 'info', title: 'Code review completed: API Gateway v3', timestamp: '4h ago' },
      { id: 'a3', icon: <Bug />, tone: 'warning', title: 'Critical bug #3421 reported in production', timestamp: '6h ago' },
      { id: 'a4', icon: <CheckCircle />, tone: 'success', title: 'CI/CD pipeline successfully deployed v3.2.0', timestamp: '1d ago' },
      { id: 'a5', icon: <Users />, tone: 'neutral', title: 'New developer "Tom Chen" joined Backend squad', timestamp: '2d ago' },
      { id: 'a6', icon: <BookOpen />, tone: 'info', title: 'API Reference v3.2 published', timestamp: '3d ago' },
    ]} />
  );
}
