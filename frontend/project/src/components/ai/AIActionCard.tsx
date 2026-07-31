import { type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface AIActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export function AIActionCard({ icon, title, description, onClick, className }: AIActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      className={cn(
        'group relative flex flex-col items-start gap-3 rounded-xl border border-border-subtle bg-elevated p-5 text-left transition-all duration-150 hover:shadow-cx-md hover:border-accent-200 dark:hover:border-accent-100',
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 transition-colors group-hover:bg-accent-100 dark:group-hover:bg-accent-100/60 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-caption text-text-tertiary">{description}</p>
      </div>
      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary opacity-0 -translate-x-2 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0" />
    </button>
  );
}
