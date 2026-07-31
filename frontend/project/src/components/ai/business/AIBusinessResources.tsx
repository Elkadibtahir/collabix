import { FileText } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Badge } from '../../ui/Badge';
import { type ResourceLink } from './AIBusinessTypes';

interface AIBusinessResourcesProps {
  resources: ResourceLink[];
  className?: string;
}

export function AIBusinessResources({ resources, className }: AIBusinessResourcesProps) {
  if (resources.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-text-tertiary" />
        <h3 className="text-caption font-semibold text-text-primary">Related Resources</h3>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {resources.map((res) => (
          <button
            key={res.id}
            type="button"
            className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface p-3 text-left hover:shadow-cx-sm hover:-translate-y-0.5 transition-all duration-150"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-caption font-medium text-text-primary truncate">{res.title}</p>
              <Badge variant="soft" tone="neutral" className="text-2xs mt-1">{res.type}</Badge>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
