import { useSearchParams } from 'react-router-dom';
import { AIHandoverPage } from '../../components/ai/business';

export function HandoverAIPage() {
  const [searchParams] = useSearchParams();
  return <AIHandoverPage workspaceId={searchParams.get('ws') ?? ''} departmentId={searchParams.get('dept') ?? ''} projectId={searchParams.get('proj') ?? ''} />;
}
