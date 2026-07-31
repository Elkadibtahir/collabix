import { Shield, AlertTriangle, CheckCircle, FileText, Users, Lock } from 'lucide-react';
import { DeptActivity } from '../common/DeptActivity';

export function CybersecurityActivityTab() {
  return (
    <DeptActivity items={[
      { id: 'a1', icon: <AlertTriangle />, tone: 'warning', title: 'Critical incident: Ransomware attempt detected and blocked', timestamp: '10m ago' },
      { id: 'a2', icon: <Shield />, tone: 'success', title: 'Security audit completed - SOC 2 compliance verified', timestamp: '2h ago' },
      { id: 'a3', icon: <CheckCircle />, tone: 'accent', title: 'Vulnerability scan completed: 12 issues found, 8 resolved', timestamp: '4h ago' },
      { id: 'a4', icon: <FileText />, tone: 'info', title: 'Incident response plan updated to v4', timestamp: '1d ago' },
      { id: 'a5', icon: <Users />, tone: 'neutral', title: 'Security awareness training completed by 45 employees', timestamp: '2d ago' },
      { id: 'a6', icon: <Lock />, tone: 'info', title: 'Access control policy reviewed and approved', timestamp: '3d ago' },
    ]} />
  );
}
