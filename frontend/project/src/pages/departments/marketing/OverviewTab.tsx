import { Users, Target, BarChart3, Globe, Mail, Share2 } from 'lucide-react';
import { DeptOverview } from '../common/DeptOverview';

export function MarketingOverviewTab() {
  return (
    <DeptOverview data={{
      description: '',
      stats: [],
      projects: [],
      team: [],
    }} />
  );
}
