import { useSearchParams } from 'react-router-dom';
import { AIAnalyticsPage } from '../../components/ai/business';

export function AnalyticsAIPage() {
  const [searchParams] = useSearchParams();
  return <AIAnalyticsPage workspaceId={searchParams.get('ws') ?? ''} departmentId={searchParams.get('dept') ?? ''} />;
}
