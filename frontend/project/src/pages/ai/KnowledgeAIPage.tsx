import { useSearchParams } from 'react-router-dom';
import { AIKnowledgePage } from '../../components/ai/business';

export function KnowledgeAIPage() {
  const [searchParams] = useSearchParams();
  return <AIKnowledgePage workspaceId={searchParams.get('ws') ?? ''} departmentId={searchParams.get('dept') ?? ''} />;
}
