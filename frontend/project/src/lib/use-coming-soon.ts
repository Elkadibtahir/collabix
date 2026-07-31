import { useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

export function useComingSoon() {
  const { toast } = useToast();
  return useCallback((feature?: string) => {
    toast({ title: feature ? `${feature} — Coming soon` : 'Coming soon', tone: 'info' });
  }, [toast]);
}
