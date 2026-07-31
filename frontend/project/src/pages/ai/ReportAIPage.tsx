import { useSearchParams } from 'react-router-dom';
import { AIReportPage } from '../../components/ai/business';

export function ReportAIPage() {
  const [searchParams] = useSearchParams();
  return <AIReportPage workspaceId={searchParams.get('ws') ?? ''} departmentId={searchParams.get('dept') ?? ''} />;
}
