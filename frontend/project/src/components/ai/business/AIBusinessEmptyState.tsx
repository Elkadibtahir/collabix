import { BarChart3, ScrollText, BookOpen, FileText } from 'lucide-react';
import { AIEmptyState } from '../AIEmptyState';
import { type AIModule } from './AIBusinessTypes';

interface AIBusinessEmptyStateProps {
  module: AIModule;
  onAction: () => void;
}

const icons = {
  analytics: <BarChart3 />,
  handover: <ScrollText />,
  knowledge: <BookOpen />,
  reports: <FileText />,
};

export function AIBusinessEmptyState({ module, onAction }: AIBusinessEmptyStateProps) {
  const messages: Record<AIModule, { title: string; description: string; action: string }> = {
    analytics: {
      title: 'No analysis yet',
      description: 'Select a workspace, department or project and ask Collabix AI to analyze your business metrics.',
      action: 'Start Analysis',
    },
    handover: {
      title: 'No handover review yet',
      description: 'Select a handover journal entry and ask Collabix AI to review it for risks and completeness.',
      action: 'Review Handover',
    },
    knowledge: {
      title: 'Search company knowledge',
      description: 'Select a knowledge category or ask a question to explore your company documentation.',
      action: 'Search Knowledge',
    },
    reports: {
      title: 'No reports generated',
      description: 'Select a workspace, project or department and generate an executive report.',
      action: 'Generate Report',
    },
  };

  const msg = messages[module];
  return <AIEmptyState icon={icons[module]} title={msg.title} description={msg.description} actionLabel={msg.action} onAction={onAction} />;
}
