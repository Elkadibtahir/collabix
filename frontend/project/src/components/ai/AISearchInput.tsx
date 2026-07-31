import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface AISearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
}

export const AISearchInput = forwardRef<HTMLInputElement, AISearchInputProps>(
  ({ containerClassName, className, id, ...props }, ref) => {
    return (
      <div className={cn('relative', containerClassName)}>
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Search className="h-4 w-4 text-text-tertiary" />
          <Sparkles className="h-3.5 w-3.5 text-accent-500" />
        </div>
        <input
          ref={ref}
          type="text"
          id={id}
          placeholder="Ask Collabix AI..."
          className={cn(
            'w-full rounded-xl border-2 border-border-subtle bg-surface-2/50 py-3 pl-12 pr-24 text-body text-text-primary placeholder:text-text-tertiary outline-none transition-all',
            'focus:border-accent-400 focus:bg-elevated focus:shadow-[0_0_0_4px_rgb(var(--accent-500)/0.1)]',
            className,
          )}
          {...props}
        />
        <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md border border-border-subtle bg-surface-2 px-2 py-1 text-2xs font-medium text-text-tertiary">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    );
  },
);
AISearchInput.displayName = 'AISearchInput';
