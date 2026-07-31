import { useSearchParams } from 'react-router-dom';

export function useWorkspaceId(): string {
  const [searchParams] = useSearchParams();
  return searchParams.get('ws') ?? '';
}