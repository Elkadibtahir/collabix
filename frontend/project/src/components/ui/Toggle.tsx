import { type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
}

const sizeMap = {
  sm: { track: 'h-4 w-7', thumb: 'h-3 w-3 peer-checked:translate-x-3' },
  md: { track: 'h-5 w-9', thumb: 'h-4 w-4 peer-checked:translate-x-4' },
};

export function Toggle({ label, description, size = 'md', className, id, checked, ...props }: ToggleProps) {
  const inputId = id || props.name;
  const s = sizeMap[size];
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <label
        htmlFor={inputId}
        className="relative inline-flex cursor-pointer items-center"
      >
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            'rounded-full bg-border-default transition-colors duration-150 ease-cx peer-checked:bg-accent-600 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas',
            s.track,
          )}
        />
        <span
          className={cn(
            'absolute left-0.5 rounded-full bg-white shadow-cx-sm transition-transform duration-150 ease-cx',
            s.thumb,
          )}
        />
      </label>
      {(label || description) && (
        <div className="min-w-0">
          {label && <p className="text-body text-text-primary">{label}</p>}
          {description && <p className="text-caption text-text-tertiary">{description}</p>}
        </div>
      )}
    </div>
  );
}
