import { MessageSquare, Search, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Button } from '../../ui/Button';

interface ConversationEmptyStateProps {
  variant: 'no-conversations' | 'no-messages' | 'no-search-results' | 'select-conversation';
  onAction?: () => void;
  actionLabel?: string;
  searchQuery?: string;
}

const config = {
  'no-conversations': {
    icon: MessageSquare,
    title: 'No conversations yet',
    description: 'Start your first conversation with Collabix AI to analyze, summarize, and generate insights.',
    defaultLabel: 'Start a Conversation',
  },
  'no-messages': {
    icon: Sparkles,
    title: 'No messages in this conversation',
    description: 'Send your first message to begin the conversation.',
    defaultLabel: 'Send a Message',
  },
  'no-search-results': {
    icon: Search,
    title: 'No conversations found',
    description: 'Try a different search term to find conversations.',
    defaultLabel: undefined,
  },
  'select-conversation': {
    icon: MessageSquare,
    title: 'Select a conversation',
    description: 'Choose a conversation from the sidebar or start a new one.',
    defaultLabel: 'Start a New Conversation',
  },
};

export function ConversationEmptyState({ variant, onAction, actionLabel, searchQuery }: ConversationEmptyStateProps) {
  const cfg = config[variant];
  const Icon = cfg.icon;

  const description = variant === 'no-search-results' && searchQuery
    ? `No conversations matching "${searchQuery}". Try a different term.`
    : cfg.description;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-text-tertiary mb-4">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="text-body-lg font-semibold text-text-primary">{cfg.title}</h3>
      <p className="mt-1.5 max-w-sm text-caption text-text-tertiary text-center">{description}</p>
      {cfg.defaultLabel && onAction && (
        <div className="mt-6">
          <Button leftIcon={<Sparkles />} onClick={onAction}>
            {actionLabel || cfg.defaultLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
