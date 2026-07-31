import { BookMarked, FileText, ScrollText, Heart, Search, Sparkles } from 'lucide-react';
import { AIEmptyState } from '../AIEmptyState';

interface HistoryEmptyStateProps {
  variant: 'no-history' | 'no-reports' | 'no-summaries' | 'no-favorites' | 'no-results' | 'no-category';
  searchQuery?: string;
  onClearSearch?: () => void;
  onStartAction?: () => void;
}

export function HistoryEmptyState({ variant, searchQuery, onClearSearch, onStartAction }: HistoryEmptyStateProps) {
  if (variant === 'no-results') {
    return (
      <AIEmptyState
        icon={<Search />}
        title="No results found"
        description={searchQuery ? `No history items matching "${searchQuery}". Try a different search or adjust your filters.` : 'No items match your current filters.'}
        actionLabel="Clear Search"
        onAction={onClearSearch}
      />
    );
  }

  if (variant === 'no-favorites') {
    return (
      <AIEmptyState
        icon={<Heart />}
        title="No favorites yet"
        description="Save your most important conversations, reports and summaries as favorites. Click the heart icon on any history item to add it here."
      />
    );
  }

  if (variant === 'no-reports') {
    return (
      <AIEmptyState
        icon={<FileText />}
        title="No reports generated"
        description="Reports you generate with Collabix AI will appear here. Try generating an executive report or weekly summary."
        actionLabel="Generate a Report"
        onAction={onStartAction}
      />
    );
  }

  if (variant === 'no-summaries') {
    return (
      <AIEmptyState
        icon={<ScrollText />}
        title="No summaries yet"
        description="Summaries created by Collabix AI will appear here. Try summarizing a document or generating a handover summary."
        actionLabel="Create a Summary"
        onAction={onStartAction}
      />
    );
  }

  if (variant === 'no-category') {
    return (
      <AIEmptyState
        icon={<BookMarked />}
        title="No items in this category"
        description="There are no history items matching the selected category. Try a different filter."
      />
    );
  }

  return (
    <AIEmptyState
      icon={<BookMarked />}
      title="No AI history yet"
      description="Your AI activity timeline will appear here. Start a conversation, generate a report or create a summary with Collabix AI to populate your history."
      actionLabel="Start a Conversation"
      onAction={onStartAction}
    />
  );
}
