import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  containerClassName?: string;
  leftIcon?: ReactNode;
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ onClear, containerClassName, className, leftIcon, value, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className={cn('relative w-full', containerClassName)}>
        {leftIcon ?? (
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        )}
        <input
          ref={ref}
          type="search"
          id={inputId}
          value={value}
          className={cn(
            'cx-input h-9 pl-9 pr-9',
            className,
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  },
);
Search.displayName = 'Search';
