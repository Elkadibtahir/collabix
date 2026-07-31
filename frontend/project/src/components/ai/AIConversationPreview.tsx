import { MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';

export interface AIConversationItem {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
}

export interface AIConversationPreviewProps {
  items: AIConversationItem[];
  onOpen?: (id: string) => void;
  onViewAll?: () => void;
  className?: string;
}

export function AIConversationPreview({ items, onOpen, onViewAll, className }: AIConversationPreviewProps) {
  return (
    <div className={cn('rounded-xl border border-border-subtle bg-elevated', className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <div>
          <p className="text-section font-semibold text-text-primary">Recent Conversations</p>
          <p className="mt-0.5 text-caption text-text-tertiary">Your latest AI interactions</p>
        </div>
        {onViewAll && (
          <Button size="sm" variant="ghost" onClick={onViewAll}>
            View All
          </Button>
        )}
      </div>
      <div className="px-3 py-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-text-tertiary mb-3">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="text-body font-medium text-text-primary">No conversations yet</p>
            <p className="text-caption text-text-tertiary mt-1">Start a conversation to see it here.</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen?.(item.id)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-surface-2"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium text-text-primary truncate">{item.title}</p>
                <p className="text-caption text-text-tertiary truncate">{item.preview}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-2xs text-text-tertiary">{item.timestamp}</span>
                <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
