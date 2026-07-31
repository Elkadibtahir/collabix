import { Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { type FollowUpAction } from './AIBusinessTypes';

interface AIBusinessFollowUpProps {
  actions: FollowUpAction[];
  className?: string;
}

export function AIBusinessFollowUp({ actions, className }: AIBusinessFollowUpProps) {
  if (actions.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent-500" />
        <h3 className="text-caption font-semibold text-text-primary">Suggested Follow-up Actions</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="rounded-lg border border-border-subtle bg-surface px-3.5 py-2 text-caption text-text-secondary hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 dark:hover:bg-accent-100/10 dark:hover:text-accent-300 dark:hover:border-accent-700 transition-all"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
