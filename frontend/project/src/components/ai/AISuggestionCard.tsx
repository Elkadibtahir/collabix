import { type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface AISuggestionCardProps {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
  className?: string;
}

export function AISuggestionCard({ icon, title, onClick, className }: AISuggestionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border-subtle bg-elevated px-4 py-3 text-left transition-all duration-150 hover:shadow-cx-md hover:border-accent-200 dark:hover:border-accent-100',
        className,
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-secondary group-hover:bg-accent-50 group-hover:text-accent-600 dark:group-hover:bg-accent-100 dark:group-hover:text-accent-300 transition-colors [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <span className="flex-1 text-body font-medium text-text-primary">{title}</span>
      <ArrowRight className="h-4 w-4 text-text-tertiary opacity-0 -translate-x-2 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0" />
    </button>
  );
}
