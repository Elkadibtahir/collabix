import { useToast } from '../../ui/Toast';

type AISuccessAction =
  | 'report-generated'
  | 'analysis-complete'
  | 'summary-saved'
  | 'conversation-created'
  | 'prompt-saved'
  | 'export-complete';

const actionLabels: Record<AISuccessAction, { title: string; description: string }> = {
  'report-generated': { title: 'Report generated', description: 'Your AI report is ready to view.' },
  'analysis-complete': { title: 'Analysis complete', description: 'AI analysis has finished processing.' },
  'summary-saved': { title: 'Summary saved', description: 'The AI summary has been saved to your workspace.' },
  'conversation-created': { title: 'Conversation created', description: 'A new AI conversation has been started.' },
  'prompt-saved': { title: 'Prompt saved', description: 'Your prompt has been added to the library.' },
  'export-complete': { title: 'Export complete', description: 'Your file has been exported successfully.' },
};

export function useAISuccessToast() {
  const { toast } = useToast();

  function success(action: AISuccessAction) {
    const { title, description } = actionLabels[action];
    toast({ title, description, tone: 'success' });
  }

  return { success };
}
