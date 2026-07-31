import { Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface ConversationFollowUpProps {
  questions: string[];
  onSelect: (question: string) => void;
  className?: string;
}

export function ConversationFollowUp({ questions, onSelect, className }: ConversationFollowUpProps) {
  if (questions.length === 0) return null;

  return (
    <div className={cn('mt-4', className)}>
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="h-3 w-3 text-accent-500" />
        <p className="text-2xs font-medium text-text-tertiary">Suggested follow-ups</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect(q)}
            className="rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-caption text-text-secondary hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 dark:hover:bg-accent-100/10 dark:hover:text-accent-300 dark:hover:border-accent-700 transition-all"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
