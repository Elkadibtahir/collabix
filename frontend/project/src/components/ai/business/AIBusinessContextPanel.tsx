import { useState } from 'react';
import { cn } from '../../../lib/cn';
import { Button } from '../../ui/Button';
import { type ContextOption } from './AIBusinessTypes';

interface AIBusinessContextPanelProps {
  options: ContextOption[];
  onAnalyze: () => void;
  analyzeLabel?: string;
  inputPlaceholder?: string;
}

export function AIBusinessContextPanel({ options, onAnalyze, analyzeLabel = 'Analyze', inputPlaceholder }: AIBusinessContextPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn('rounded-xl border border-border-subtle bg-elevated dark:bg-surface overflow-hidden transition-all')}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 bg-surface-2 hover:bg-surface transition-colors"
      >
        <p className="text-caption font-semibold text-text-primary">Context</p>
        <svg
          className={cn('h-4 w-4 text-text-tertiary transition-transform', open && 'rotate-180')}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="p-5 space-y-4">
          {options.map((opt) => (
            <div key={opt.id}>
              <label className="block text-2xs font-medium text-text-tertiary mb-1.5">{opt.label}</label>
              <select
                aria-label={opt.label}
                className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-caption text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors appearance-none"
              >
                <option value="">{opt.placeholder}</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
              </select>
            </div>
          ))}

          {inputPlaceholder && (
            <div>
              <label className="block text-2xs font-medium text-text-tertiary mb-1.5">Question</label>
              <textarea
                placeholder={inputPlaceholder}
                rows={3}
                className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-caption text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
          )}

          <Button fullWidth onClick={onAnalyze}>{analyzeLabel}</Button>
        </div>
      )}
    </div>
  );
}
